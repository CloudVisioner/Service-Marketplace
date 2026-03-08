import { Field, Int, ObjectType } from '@nestjs/graphql';
import mongoose from 'mongoose';
import { QuoteStatus } from '../../enums/quote.enum';
import { Organization } from '../organization/organization';
import { ServiceRequest } from '../service-request/service-request';
import { User } from '../user/user';

@ObjectType()
export class Quote {
	@Field(() => String)
	_id: mongoose.ObjectId;

	@Field(() => String)
	quoteProviderOrgId: mongoose.ObjectId;

	@Field(() => String)
	quoteServiceReqId: mongoose.ObjectId;

	@Field(() => String)
	quoteCreatedByUserId: mongoose.ObjectId;

	@Field(() => String)
	quoteMessage: string;

	@Field(() => QuoteStatus)
	quoteStatus: QuoteStatus;

	@Field(() => Int)
	quoteTotalLikes: number;

	@Field(() => Number)
	quoteAmount: number;

	@Field(() => Date)
	quoteValidUntil: Date;

	@Field(() => Boolean, { nullable: true })
	isFlagged?: boolean;

	@Field(() => Date)
	createdAt: Date;

	@Field(() => Date)
	updatedAt: Date;

	/** from aggregation **/
	@Field(() => Organization, { nullable: true })
	quoteProviderOrgData?: Organization;

	@Field(() => ServiceRequest, { nullable: true })
	quoteServiceReqData?: ServiceRequest;

	@Field(() => User, { nullable: true })
	quoteCreatedByUserData?: User;
}
