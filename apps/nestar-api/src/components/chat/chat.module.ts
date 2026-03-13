import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ChatResolver } from './chat.resolver';
import { AuthModule } from '../auth/auth.module';

@Module({
	imports: [AuthModule],
	providers: [ChatService, ChatResolver],
	controllers: [ChatController],
	exports: [ChatService],
})
export class ChatModule {}
