import { Body, Controller, Post, HttpCode, HttpStatus, UseGuards, Get } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatResponse, ChatIdentityTokenResponse } from '../../libs/dto/chat/chat.output';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AuthUser } from '../auth/decorators/authUser.decorator';
import { User } from '../../libs/dto/user/user';

export class ChatMessageDto {
	message: string;
	sessionId?: string;
}

@Controller()
export class ChatController {
	constructor(private readonly chatService: ChatService) {}

	@Post('chat/message')
	@HttpCode(HttpStatus.OK)
	async sendMessage(@Body() body: ChatMessageDto): Promise<ChatResponse> {
		return await this.chatService.getChatResponse(body.message, body.sessionId);
	}

	/**
	 * REST endpoint for Chatbase identity token (detailed shape)
	 */
	@Get('chat/identity-token')
	@UseGuards(AuthGuard)
	@HttpCode(HttpStatus.OK)
	async getIdentityToken(@AuthUser() user: User): Promise<ChatIdentityTokenResponse> {
		const token = await this.chatService.generateIdentityToken(user);
		return {
			token,
			expiresIn: '1h',
		};
	}

	/**
	 * REST endpoint used by frontend Chatbase widget.
	 * Returns exactly: { "token": "<jwt>" }
	 */
	@Get('chat/token')
	@UseGuards(AuthGuard)
	@HttpCode(HttpStatus.OK)
	async getToken(@AuthUser() user: User): Promise<{ token: string }> {
		const token = await this.chatService.generateIdentityToken(user);
		return { token };
	}

	/**
	 * Gemini AI chat endpoint
	 * POST /ai/chat { message: string }
	 */
	@Post('ai/chat')
	@HttpCode(HttpStatus.OK)
	async aiChat(@Body('message') message: string): Promise<{ reply: string }> {
		const reply = await this.chatService.getAiResponse(message);
		return { reply };
	}
}
