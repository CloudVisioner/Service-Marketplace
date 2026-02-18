import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, MaxLength } from 'class-validator';
import { ServiceRequestStatus, Urgency } from '../../enums/service-request.enum';
import { ObjectId } from 'mongoose';

@InputType()
export class ServiceRequestUpdate {
	@IsNotEmpty()
	@Field(() => String)
	_id: ObjectId;

	@IsOptional()
	@Field(() => String, { nullable: true })
	reqTitle?: string;

	@IsOptional()
	@MaxLength(2000)
	@Field(() => String, { nullable: true })
	reqDescription?: string;

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
	@Field(() => Number, { nullable: true })
	reqBudgetMin?: number;

	@IsOptional()
	@Field(() => Number, { nullable: true })
	reqBudgetMax?: number;

	@IsOptional()
	@Field(() => Date, { nullable: true })
	reqDeadline?: Date;

	@IsOptional()
	@Field(() => Urgency, { nullable: true })
	reqUrgency?: Urgency;

	@IsOptional()
	@Field(() => [String], { nullable: true })
	reqSkillsNeeded?: string[];

	@IsOptional()
	@Field(() => [String], { nullable: true })
	reqAttachments?: string[];
}
