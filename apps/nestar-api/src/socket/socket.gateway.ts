import { Logger } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class SocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer()
	server: Server;

	private logger: Logger = new Logger('SocketGateway');
	private summaryClient: number = 0;
	private userSockets: Map<string, string> = new Map(); // userId -> socketId

	public afterInit(server: Server) {
		this.logger.log(`WebSocket Server Initialized`);
	}

	handleConnection(client: Socket, ...args: any[]) {
		this.summaryClient++;
		this.logger.log(`Client connected: ${client.id}, total: ${this.summaryClient}`);
	}

	handleDisconnect(client: Socket) {
		this.summaryClient--;
		// Remove user from map if disconnected
		for (const [userId, socketId] of this.userSockets.entries()) {
			if (socketId === client.id) {
				this.userSockets.delete(userId);
				break;
			}
		}
		this.logger.log(`Client disconnected: ${client.id}, total: ${this.summaryClient}`);
	}

	@SubscribeMessage('join')
	handleJoin(client: Socket, userId: string) {
		this.userSockets.set(userId, client.id);
		client.join(`user:${userId}`);
		this.logger.log(`User ${userId} joined room: user:${userId}`);
	}

	@SubscribeMessage('message')
	handleMessage(client: Socket, payload: any): string {
		return 'Hello world!';
	}

	public emitNotification(userId: string, notification: any) {
		this.server.to(`user:${userId}`).emit('notification', notification);
		this.logger.log(`Notification sent to user: ${userId}`);
	}
}
