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

	@Field(() => String, { nullable: true })
	reqTitle?: string; // Can be null for old records

	@Field(() => String, { nullable: true })
	reqDescription?: string; // Can be null for old records

	@Field(() => String, { nullable: true })
	reqBuyerOrgId?: mongoose.ObjectId; // Can be null for old records

	@Field(() => ServiceRequestStatus, { nullable: true })
	reqStatus?: ServiceRequestStatus; // Can be null for old records

	@Field(() => String, { nullable: true })
	reqCategory?: string; // Can be null for old records

	@Field(() => String, { nullable: true })
	reqSubCategory?: string;

	@Field(() => String, { nullable: true })
	reqBudgetRange?: string; // e.g., "$3,500", "$1,200", "Contact to discuss" - Can be null for old records

	@Field(() => Date, { nullable: true })
	reqDeadline?: Date; // Can be null for old records

	@Field(() => Urgency, { nullable: true })
	reqUrgency?: Urgency; // Can be null for old records

	@Field(() => [String], { nullable: true })
	reqSkillsNeeded?: string[]; // Can be null for old records

	@Field(() => [String], { nullable: true })
	reqAttachments?: string[]; // Can be null for old records

	@Field(() => Int, { nullable: true })
	reqTotalLikes?: number; // Can be null for old records

	@Field(() => Int, { nullable: true })
	reqTotalViews?: number; // Can be null for old records

	@Field(() => Int, { nullable: true })
	reqTotalQuotes?: number; // Can be null for old records

	@Field(() => Int, { nullable: true })
	reqNewQuotesCount?: number; // Can be null for old records

	@Field(() => String, { nullable: true })
	reqCreatedByUserId?: mongoose.ObjectId; // Can be null for old records

	@Field(() => Boolean, { nullable: true })
	isFlagged?: boolean;

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
