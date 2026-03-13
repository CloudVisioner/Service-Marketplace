import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class ChatMessageInput {
	@Field(() => String)
	@IsNotEmpty()
	@IsString()
	message: string;
}
