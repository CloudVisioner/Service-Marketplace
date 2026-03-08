import { Logger } from '@nestjs/common';
import { 
	OnGatewayInit, 
	SubscribeMessage, 
	WebSocketGateway, 
	WebSocketServer 
} from '@nestjs/websockets';
import { Server } from 'ws';
import * as WebSocket from 'ws';
import { AuthService } from '../components/auth/auth.service';
import * as url from 'url';
import { User } from '../libs/dto/user/user';

// Message payload interface
interface MessagePayload {
	event: string;
	text: string;
}

// Info payload interface (for connection/disconnection events)
interface InfoPayload {
	event: string;
	totalClients: number;
	userData: User | null;
	action: string;  // 'joined' or 'left'
}

// Notification payload interface
interface NotificationPayload {
	event: string;
	_id: string;
	type: string;
	message: string;
	read: boolean;
	createdAt: Date;
}

@WebSocketGateway({ 
	transports: ['websocket'],  // Use native WebSocket (not Socket.IO)
	secure: false               // Use ws:// (not wss://)
})
export class SocketGateway implements OnGatewayInit {
	private logger: Logger = new Logger('SocketGateway');
	private summaryClient: number = 0;  // Track total connected clients
	
	// Map each WebSocket connection to authenticated user (or null for guests)
	clientAuthMap: Map<WebSocket, User | null> = new Map();
	
	// Store last 5 messages for new connections (optional feature)
	messageList: MessagePayload[] = [];

	constructor(private authService: AuthService) {}

	@WebSocketServer()
	server: Server;  // WebSocket server instance

	// Called after WebSocket server initializes
	public afterInit(server: Server) {
		this.logger.verbose(`WebSocket Server Initialized total: ${this.summaryClient}`);
	}

	// Extract and verify JWT token from connection URL query params
	private async retrieveAuth(req: any): Promise<User | null> {
		try {
			const parseUrl = url.parse(req.url, true);
			const { token } = parseUrl.query;  // Token from: ws://localhost:3000?token=xxx
			
			if (!token || typeof token !== 'string') {
				return null;
			}
			
			return await this.authService.verifyUserToken(token);
		} catch (err) {
			this.logger.debug(`Token verification failed: ${err.message}`);
			return null;  // Return null if token invalid/missing (guest user)
		}
	}

	// Handle new WebSocket connection
	public async handleConnection(client: WebSocket, req: any) {
		// 1. Verify authentication token from query params
		const authUser = await this.retrieveAuth(req);
		
		// 2. Track connection
		this.summaryClient++;
		this.clientAuthMap.set(client, authUser);
		
		// 3. Log connection
		const clientNick: string = authUser?.userNick ?? 'Guest';
		this.logger.verbose(`Connection [${clientNick}] & total [${this.summaryClient}]`);
		
		// 4. Broadcast "user joined" event to all other clients
		const infoMsg: InfoPayload = {
			event: 'info',
			totalClients: this.summaryClient,
			userData: authUser,
			action: 'joined',
		};
		this.emitMessage(infoMsg);
		
		// 5. Send message history to new client (optional)
		if (this.messageList.length > 0) {
			client.send(JSON.stringify({ 
				event: 'getMessages', 
				list: this.messageList 
			}));
		}
	}

	// Handle WebSocket disconnection
	public handleDisconnect(client: WebSocket) {
		// 1. Get user data before removing
		const authUser = this.clientAuthMap.get(client);
		
		// 2. Update tracking
		this.summaryClient--;
		this.clientAuthMap.delete(client);
		
		// 3. Log disconnection
		const clientNick: string = authUser?.userNick ?? 'Guest';
		this.logger.verbose(`Disconnection [${clientNick}] & total [${this.summaryClient}]`);
		
		// 4. Broadcast "user left" event to all other clients
		const infoMsg: InfoPayload = {
			event: 'info',
			totalClients: this.summaryClient,
			userData: authUser,
			action: 'left',
		};
		this.broadcastMessage(client, infoMsg);
	}

	// Handle incoming messages from clients
	@SubscribeMessage('message')
	public async handleMessage(client: WebSocket, payload: string): Promise<void> {
		// 1. Get authenticated user who sent the message
		const authUser = this.clientAuthMap.get(client);
		
		// 2. Create message payload
		const newMessage: MessagePayload = { 
			event: 'message', 
			text: payload 
		};
		
		// 3. Log message
		const clientNick: string = authUser?.userNick ?? 'Guest';
		this.logger.verbose(`NEW MESSAGE from [${clientNick}]: ${payload}`);
		
		// 4. Broadcast to all clients (including sender)
		this.emitMessage(newMessage);
		
		// 5. Store in message history (keep last 5 messages)
		this.messageList.push(newMessage);
		if (this.messageList.length >= 5) {
			this.messageList.splice(0, this.messageList.length - 5);
		}
	}

	// Broadcast message to all clients EXCEPT sender
	private broadcastMessage(sender: WebSocket, message: InfoPayload | MessagePayload) {
		this.server.clients.forEach((client) => {
			if (client !== sender && client.readyState === WebSocket.OPEN) {
				client.send(JSON.stringify(message));
			}
		});
	}

	// Broadcast message to ALL clients (including sender)
	private emitMessage(message: InfoPayload | MessagePayload) {
		this.server.clients.forEach((client) => {
			if (client.readyState === WebSocket.OPEN) {
				client.send(JSON.stringify(message));
			}
		});
	}

	// Emit notification to specific user (by userId)
	public emitNotification(userId: string, notification: NotificationPayload) {
		let sentCount = 0;
		
		this.server.clients.forEach((client) => {
			const authUser = this.clientAuthMap.get(client);
			
			// Check if this client belongs to the target user
			if (authUser && authUser._id.toString() === userId && client.readyState === WebSocket.OPEN) {
				const notificationPayload: NotificationPayload = {
					event: 'notification',
					_id: notification._id,
					type: notification.type,
					message: notification.message,
					read: notification.read,
					createdAt: notification.createdAt,
				};
				
				client.send(JSON.stringify(notificationPayload));
				sentCount++;
			}
		});
		
		this.logger.verbose(`Notification sent to user: ${userId} (${sentCount} connection(s))`);
	}
}
