import { Field, Int, ObjectType } from '@nestjs/graphql';
import mongoose from 'mongoose';
import { ServiceRequestStatus } from '../../enums/service-request.enum';
import { Organization } from '../organization/organization';
import { User } from '../user/user';
import { Quote } from '../quote/quote';
import { TotalCounter } from '../common/common';
import { MeLiked } from '../like/like';

@ObjectType()
export class ServiceRequest {
	@Field(() => String)
	_id: mongoose.ObjectId;

	@Field(() => String)
	reqTitle: string;

	@Field(() => String)
	reqDescription: string;

	@Field(() => String)
	reqBuyerOrgId: mongoose.ObjectId;

	@Field(() => ServiceRequestStatus)
	reqStatus: ServiceRequestStatus;

	@Field(() => Number)
	reqBudgetMin: number;

	@Field(() => Number)
	reqBudgetMax: number;

	@Field(() => Date)
	reqDeadline: Date;

	@Field(() => [String])
	reqSkillsNeeded: string[];

	@Field(() => Int)
	reqTotalLikes: number;

	@Field(() => Int)
	reqTotalViews: number;

	@Field(() => Int)
	reqTotalQuotes: number;

	@Field(() => String)
	reqCreatedByUserId: mongoose.ObjectId;

	@Field(() => Date)
	createdAt: Date;

	@Field(() => Date)
	updatedAt: Date;

	/** from aggregation **/
	@Field(() => Organization, { nullable: true })
	reqBuyerOrgData?: Organization;

	@Field(() => User, { nullable: true })
	reqCreatedByUserData?: User;

	@Field(() => [Quote], { nullable: true })
	quotes?: Quote[];

	@Field(() => [MeLiked], { nullable: true })
	meLiked?: MeLiked[];
}

@ObjectType()
export class ServiceRequests {
	@Field(() => [ServiceRequest])
	list: ServiceRequest[];

	@Field(() => [TotalCounter], { nullable: true })
	metaCounter: TotalCounter[];
}
