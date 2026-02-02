import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';
import { ObjectId } from 'mongoose';

@InputType()
export class QuoteInput {
	@IsNotEmpty()
	@Field(() => String)
	quoteServiceReqId: ObjectId;

	@IsNotEmpty()
	@Field(() => String)
	quoteMessage: string;

	@IsNotEmpty()
	@Field(() => Number)
	quoteAmount: number;

	@IsNotEmpty()
	@Field(() => Date)
	quoteValidUntil: Date;
}
