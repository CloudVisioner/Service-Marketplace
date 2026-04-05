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

interface MessagePayload {
	event: string;
	text: string;
}

interface InfoPayload {
	event: string;
	totalClients: number;
	userData: User | null;
	action: string;
}

interface NotificationPayload {
	event?: string;
	_id: string;
	type: string;
	message: string;
	read: boolean;
	createdAt: Date;
}

@WebSocketGateway({
	transports: ['websocket'],
	secure: false
})
export class SocketGateway implements OnGatewayInit {
	private logger: Logger = new Logger('SocketGateway');
	private summaryClient: number = 0;

	clientAuthMap: Map<WebSocket, User | null> = new Map();
	messageList: MessagePayload[] = [];

	constructor(private authService: AuthService) {}

	@WebSocketServer()
	server: Server;

	public afterInit(server: Server) {
		this.logger.verbose(`WebSocket Server Initialized total: ${this.summaryClient}`);
	}

	private async retrieveAuth(req: any): Promise<User | null> {
		try {
			const parseUrl = url.parse(req.url, true);
			const { token } = parseUrl.query;

			if (!token || typeof token !== 'string') {
				return null;
			}

			return await this.authService.verifyUserToken(token);
		} catch (err) {
			this.logger.debug(`Token verification failed: ${err.message}`);
			return null;
		}
	}

	public async handleConnection(client: WebSocket, req: any) {
		const authUser = await this.retrieveAuth(req);

		this.summaryClient++;
		this.clientAuthMap.set(client, authUser);

		const clientNick: string = authUser?.userNick ?? 'Guest';
		this.logger.verbose(`Connection [${clientNick}] & total [${this.summaryClient}]`);

		const infoMsg: InfoPayload = {
			event: 'info',
			totalClients: this.summaryClient,
			userData: authUser,
			action: 'joined',
		};
		this.emitMessage(infoMsg);

		if (this.messageList.length > 0) {
			client.send(JSON.stringify({
				event: 'getMessages',
				list: this.messageList
			}));
		}
	}

	public handleDisconnect(client: WebSocket) {
		const authUser = this.clientAuthMap.get(client);

		this.summaryClient--;
		this.clientAuthMap.delete(client);

		const clientNick: string = authUser?.userNick ?? 'Guest';
		this.logger.verbose(`Disconnection [${clientNick}] & total [${this.summaryClient}]`);

		const infoMsg: InfoPayload = {
			event: 'info',
			totalClients: this.summaryClient,
			userData: authUser,
			action: 'left',
		};
		this.broadcastMessage(client, infoMsg);
	}

	@SubscribeMessage('message')
	public async handleMessage(client: WebSocket, payload: string): Promise<void> {
		const authUser = this.clientAuthMap.get(client);

		const newMessage: MessagePayload = {
			event: 'message',
			text: payload
		};

		const clientNick: string = authUser?.userNick ?? 'Guest';
		this.logger.verbose(`NEW MESSAGE from [${clientNick}]: ${payload}`);

		this.emitMessage(newMessage);

		this.messageList.push(newMessage);
		if (this.messageList.length >= 5) {
			this.messageList.splice(0, this.messageList.length - 5);
		}
	}

	private broadcastMessage(sender: WebSocket, message: InfoPayload | MessagePayload) {
		this.server.clients.forEach((client) => {
			if (client !== sender && client.readyState === WebSocket.OPEN) {
				client.send(JSON.stringify(message));
			}
		});
	}

	private emitMessage(message: InfoPayload | MessagePayload) {
		this.server.clients.forEach((client) => {
			if (client.readyState === WebSocket.OPEN) {
				client.send(JSON.stringify(message));
			}
		});
	}

	public emitNotification(userId: string, notification: NotificationPayload) {
		let sentCount = 0;

		this.server.clients.forEach((client) => {
			const authUser = this.clientAuthMap.get(client);

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
