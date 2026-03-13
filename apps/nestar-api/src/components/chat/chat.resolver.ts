import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { ChatService } from './chat.service';
import { ChatMessageInput } from '../../libs/dto/chat/chat.input';
import { ChatResponse, ChatIdentityTokenResponse } from '../../libs/dto/chat/chat.output';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AuthUser } from '../auth/decorators/authUser.decorator';
import { User } from '../../libs/dto/user/user';

@Resolver(() => ChatResponse)
export class ChatResolver {
	constructor(private readonly chatService: ChatService) {}

	@Mutation(() => ChatResponse)
	async sendChatMessage(
		@Args('input') input: ChatMessageInput,
		@Args('sessionId', { nullable: true }) sessionId?: string,
	): Promise<ChatResponse> {
		return await this.chatService.getChatResponse(input.message, sessionId);
	}

	@Query(() => ChatIdentityTokenResponse)
	@UseGuards(AuthGuard)
	async getChatIdentityToken(@AuthUser() user: User): Promise<ChatIdentityTokenResponse> {
		const token = await this.chatService.generateIdentityToken(user);
		return {
			token,
			expiresIn: '1h',
		};
	}
}
