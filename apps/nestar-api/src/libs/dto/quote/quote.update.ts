import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { QuoteStatus } from '../../enums/quote.enum';
import { ObjectId } from 'mongoose';

@InputType()
export class QuoteUpdate {
	@IsNotEmpty()
	@Field(() => String)
	_id: ObjectId;

	@IsOptional()
	@Field(() => String, { nullable: true })
	quoteMessage?: string;

	@IsOptional()
	@Field(() => QuoteStatus, { nullable: true })
	quoteStatus?: QuoteStatus;

	@IsOptional()
	@Field(() => Number, { nullable: true })
	quoteAmount?: number;

	@IsOptional()
	@Field(() => Date, { nullable: true })
	quoteValidUntil?: Date;
}
