import { Injectable, InternalServerErrorException, Logger, BadRequestException } from '@nestjs/common';
import { ChatResponse } from '../../libs/dto/chat/chat.output';
import * as jwt from 'jsonwebtoken';
import { User } from '../../libs/dto/user/user';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class ChatService {
	private readonly logger = new Logger(ChatService.name);
	private readonly apiKey = process.env.CHATBASE_API_KEY || '';
	private readonly chatbotId = process.env.CHATBASE_CHATBOT_ID || 'XjMt_yb-TzrAnD8ToERXq';
	private readonly apiUrl = 'https://www.chatbase.co/api/v1/chat';
	private readonly identitySecret = 'aty7n8abhgdj3f5fmmddzumvem0f04jf';
	private readonly geminiApiKey = process.env.GEMINI_API_KEY || 'REPLACE_WITH_YOUR_GEMINI_API_KEY';
	private readonly geminiModelId = 'gemini-2.5-flash';

	private get geminiModel() {
		if (!this.geminiApiKey) {
			throw new InternalServerErrorException('GEMINI_API_KEY is not set in environment variables');
		}
		const genAI = new GoogleGenerativeAI(this.geminiApiKey);
		return genAI.getGenerativeModel({ model: this.geminiModelId });
	}

	async getChatResponse(userMessage: string, sessionId?: string): Promise<ChatResponse> {
		if (!this.apiKey) {
			this.logger.warn('CHATBASE_API_KEY is not set in environment variables');
			throw new InternalServerErrorException('Chat service is not configured. Please set CHATBASE_API_KEY.');
		}

		if (!userMessage || userMessage.trim().length === 0) {
			throw new InternalServerErrorException('Message cannot be empty');
		}

		try {
			const requestBody: any = {
				messages: [{ role: 'user', content: userMessage }],
				chatbotId: this.chatbotId,
				stream: false,
			};

			if (sessionId) {
				requestBody.sessionId = sessionId;
			}

			const response = await fetch(this.apiUrl, {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${this.apiKey}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(requestBody),
			});

			if (!response.ok) {
				const errorText = await response.text();
				this.logger.error(`Chatbase API error: ${response.status} - ${errorText}`);
				throw new InternalServerErrorException(
					`Chat service error: ${response.status} - ${errorText}`,
				);
			}

			const data = await response.json();

			const chatResponse: ChatResponse = {
				text: data.text || data.message || data.response || '',
				messageId: data.messageId || data.id || undefined,
				sessionId: data.sessionId || sessionId || undefined,
				messages: data.messages || [
					{ role: 'assistant', content: data.text || data.message || data.response || '' },
				],
			};

			return chatResponse;
		} catch (error) {
			this.logger.error(`Error calling Chatbase API: ${error.message}`, error.stack);

			if (error instanceof InternalServerErrorException) {
				throw error;
			}

			throw new InternalServerErrorException(
				`Failed to get chat response: ${error.message}`,
			);
		}
	}

	async getAiResponse(userPrompt: string): Promise<string> {
		if (!userPrompt || userPrompt.trim().length === 0) {
			throw new BadRequestException('Prompt cannot be empty');
		}

		try {
			const model = this.geminiModel;

			const chat = await model.startChat({
				history: [],
				generationConfig: { maxOutputTokens: 1000 },
			});

			const result = await chat.sendMessage(userPrompt);
			const response = await result.response;

			return response.text();
		} catch (error) {
			this.logger.error(`Error calling Gemini API: ${error.message}`, error.stack);
			throw new InternalServerErrorException(
				`Failed to get AI response: ${error.message}`,
			);
		}
	}

	async generateIdentityToken(user: User): Promise<string> {
		if (!user || !user._id) {
			throw new BadRequestException('User information is required to generate identity token');
		}

		try {
			const companyName =
				(user as any).userOrganization?.organizationName ||
				(user as any).companyName ||
				undefined;

			const payload: any = {
				user_id: user._id.toString(),
				email: user.userEmail || undefined,
				name: user.userNick || undefined,
				exp: Math.floor(Date.now() / 1000) + 60 * 60,
			};

			if (companyName) {
				payload.company = companyName;
			}

			if (user.userRole) {
				payload.role = user.userRole;
			}

			const token = jwt.sign(payload, this.identitySecret, { algorithm: 'HS256' });

			this.logger.debug(`Generated Chatbase identity token for user: ${user.userNick || user._id}`);
			return token;
		} catch (error) {
			this.logger.error(`Error generating identity token: ${error.message}`, error.stack);
			throw new InternalServerErrorException(
				`Failed to generate identity token: ${error.message}`,
			);
		}
	}
}
