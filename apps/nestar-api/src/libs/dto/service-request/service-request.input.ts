import { Field, InputType, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, MaxLength, Min } from 'class-validator';
import { ServiceRequestStatus, Urgency } from '../../enums/service-request.enum';
import { ObjectId } from 'mongoose';

@InputType()
export class ServiceRequestInput {
	@IsNotEmpty()
	@Field(() => String)
	reqTitle: string;

	@IsNotEmpty()
	@MaxLength(2000)
	@Field(() => String)
	reqDescription: string;

	@IsNotEmpty()
	@Field(() => String)
	reqBuyerOrgId: ObjectId;

	@IsNotEmpty()
	@Field(() => String)
	reqCategory: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	reqSubCategory?: string;

	@IsNotEmpty()
	@Field(() => String)
	reqBudgetRange: string; // e.g., "$3,500", "$1,200", "Contact to discuss"

	@IsNotEmpty()
	@Field(() => Date)
	reqDeadline: Date;

	@IsOptional()
	@Field(() => Urgency, { nullable: true, defaultValue: Urgency.NORMAL })
	reqUrgency?: Urgency;

	@IsOptional()
	@Field(() => [String], { nullable: true })
	reqSkillsNeeded?: string[];

	@IsOptional()
	@Field(() => [String], { nullable: true })
	reqAttachments?: string[];

	@IsOptional()
	@Field(() => ServiceRequestStatus, { nullable: true, defaultValue: ServiceRequestStatus.DRAFT })
	reqStatus?: ServiceRequestStatus;
}

@InputType()
export class ServiceRequestSearch {
	@IsOptional()
	@Field(() => String, { nullable: true })
	reqBuyerOrgId?: ObjectId;

	@IsOptional()
	@Field(() => ServiceRequestStatus, { nullable: true })
	reqStatus?: ServiceRequestStatus;

	@IsOptional()
	@Field(() => String, { nullable: true })
	reqCategory?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	reqSubCategory?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	text?: string;

	@IsOptional()
	@Field(() => Boolean, { nullable: true })
	isFlagged?: boolean;
}

@InputType()
export class ServiceRequestInquiry {
	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	page: number;

	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	limit: number;

	@IsOptional()
	@Field(() => String, { nullable: true })
	sort?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	sortOrder?: string; // "asc" or "desc"

	@IsNotEmpty()
	@Field(() => ServiceRequestSearch)
	search: ServiceRequestSearch;
}

@InputType()
export class BuyerServiceRequestFilterInput {
	@IsOptional()
	@Field(() => ServiceRequestStatus, { nullable: true })
	status?: ServiceRequestStatus;

	@IsOptional()
	@Field(() => String, { nullable: true })
	category?: string;

	@IsOptional()
	@Min(1)
	@Field(() => Int, { nullable: true, defaultValue: 1 })
	page?: number;

	@IsOptional()
	@Min(1)
	@Field(() => Int, { nullable: true, defaultValue: 10 })
	limit?: number;

	@IsOptional()
	@Field(() => String, { nullable: true })
	sortBy?: string; // "createdAt", "deadline", "budgetRange"

	@IsOptional()
	@Field(() => String, { nullable: true })
	sortOrder?: string; // "asc" or "desc"

	@IsOptional()
	@Field(() => String, { nullable: true })
	search?: string; // search term for title/description
}
