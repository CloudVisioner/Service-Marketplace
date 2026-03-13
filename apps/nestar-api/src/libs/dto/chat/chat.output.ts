import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ChatMessage {
	@Field(() => String, { nullable: true })
	role?: string;

	@Field(() => String, { nullable: true })
	content?: string;
}

@ObjectType()
export class ChatResponse {
	@Field(() => String, { nullable: true })
	text?: string;

	@Field(() => String, { nullable: true })
	messageId?: string;

	@Field(() => String, { nullable: true })
	sessionId?: string;

	@Field(() => [ChatMessage], { nullable: true })
	messages?: ChatMessage[];

	@Field(() => String, { nullable: true })
	error?: string;
}

@ObjectType()
export class ChatIdentityTokenResponse {
	@Field(() => String)
	token: string;

	@Field(() => String, { nullable: true })
	expiresIn?: string;
}
