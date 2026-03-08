import { Module } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { AuthModule } from '../components/auth/auth.module';

@Module({
	imports: [AuthModule],              // Required for token verification
	providers: [SocketGateway],         // Register WebSocket gateway
	exports: [SocketGateway],            // Export for other modules (NotificationModule)
})
export class SocketModule {}
