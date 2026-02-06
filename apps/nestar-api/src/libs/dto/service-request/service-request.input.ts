import { Field, InputType, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, Min } from 'class-validator';
import { ServiceRequestStatus } from '../../enums/service-request.enum';
import { ObjectId } from 'mongoose';

@InputType()
export class ServiceRequestInput {
	@IsNotEmpty()
	@Field(() => String)
	reqTitle: string;

	@IsNotEmpty()
	@Field(() => String)
	reqDescription: string;

	@IsNotEmpty()
	@Field(() => String)
	reqBuyerOrgId: ObjectId;

	@IsNotEmpty()
	@Field(() => Number)
	reqBudgetMin: number;

	@IsNotEmpty()
	@Field(() => Number)
	reqBudgetMax: number;

	@IsNotEmpty()
	@Field(() => Date)
	reqDeadline: Date;

	@IsNotEmpty()
	@Field(() => [String])
	reqSkillsNeeded: string[];
}

@InputType()
class ServiceRequestSearch {
	@IsOptional()
	@Field(() => String, { nullable: true })
	reqBuyerOrgId?: ObjectId;

	@IsOptional()
	@Field(() => ServiceRequestStatus, { nullable: true })
	reqStatus?: ServiceRequestStatus;

	@IsOptional()
	@Field(() => String, { nullable: true })
	text?: string;
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

	@IsNotEmpty()
	@Field(() => ServiceRequestSearch)
	search: ServiceRequestSearch;
}
