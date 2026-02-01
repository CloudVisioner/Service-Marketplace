import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';
import { QuoteStatus } from '../../enums/quote.enum';
import { ObjectId } from 'mongoose';

@InputType()
export class QuoteInput {
	@IsNotEmpty()
	@Field(() => String)
	quoteProviderOrgId: ObjectId;

	@IsNotEmpty()
	@Field(() => String)
	quoteServiceReqId: ObjectId;

	@IsNotEmpty()
	@Field(() => String)
	quoteCreatedByUserId: ObjectId;

	@IsNotEmpty()
	@Field(() => String)
	quoteMessage: string;

	@IsNotEmpty()
	@Field(() => QuoteStatus)
	quoteStatus: QuoteStatus;

	@IsNotEmpty()
	@Field(() => Number)
	quoteAmount: number;

	@IsNotEmpty()
	@Field(() => Date)
	quoteValidUntil: Date;
}
