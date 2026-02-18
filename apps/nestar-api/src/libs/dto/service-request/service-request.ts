import { Field, Int, ObjectType } from '@nestjs/graphql';
import mongoose from 'mongoose';
import { ServiceRequestStatus, Urgency } from '../../enums/service-request.enum';
import { Organization } from '../organization/organization';
import { User } from '../user/user';
import { Quote } from '../quote/quote';
import { TotalCounter } from '../common/common';

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

	@Field(() => String)
	reqCategory: string;

	@Field(() => String, { nullable: true })
	reqSubCategory?: string;

	@Field(() => Number)
	reqBudgetMin: number;

	@Field(() => Number, { nullable: true })
	reqBudgetMax?: number;

	@Field(() => Date)
	reqDeadline: Date;

	@Field(() => Urgency)
	reqUrgency: Urgency;

	@Field(() => [String])
	reqSkillsNeeded: string[];

	@Field(() => [String])
	reqAttachments: string[];

	@Field(() => Int)
	reqTotalLikes: number;

	@Field(() => Int)
	reqTotalViews: number;

	@Field(() => Int)
	reqTotalQuotes: number;

	@Field(() => Int)
	reqNewQuotesCount: number;

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
}

@ObjectType()
export class ServiceRequestMeta {
	@Field(() => Int)
	total: number;

	@Field(() => Int)
	open: number;

	@Field(() => Int)
	inProgress: number;

	@Field(() => Int)
	closed: number;

	@Field(() => Int)
	draft: number;
}

@ObjectType()
export class ServiceRequests {
	@Field(() => [ServiceRequest])
	list: ServiceRequest[];

	@Field(() => [TotalCounter], { nullable: true })
	metaCounter: TotalCounter[];
}

@ObjectType()
export class BuyerServiceRequests {
	@Field(() => [ServiceRequest])
	list: ServiceRequest[];

	@Field(() => ServiceRequestMeta)
	metaCounter: ServiceRequestMeta;
}

@ObjectType()
export class BuyerDashboardStats {
	@Field(() => Int)
	activeRequests: number;

	@Field(() => Int)
	totalQuotes: number;

	@Field(() => Int)
	newQuotes: number;

	@Field(() => Int)
	activeOrders: number;

	@Field(() => Int)
	unreadNotifications: number;
}
