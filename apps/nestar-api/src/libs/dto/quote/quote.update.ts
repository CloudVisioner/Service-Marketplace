import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { ObjectId } from 'mongoose';

@InputType()
export class QuoteUpdate {
	@IsNotEmpty()
	@Field(() => String)
	quoteId: ObjectId;

	@IsOptional()
	@Field(() => String, { nullable: true })
	quoteMessage?: string;

	@IsOptional()
	@Field(() => Number, { nullable: true })
	quoteAmount?: number;

	@IsOptional()
	@Field(() => Date, { nullable: true })
	quoteValidUntil?: Date;
}
