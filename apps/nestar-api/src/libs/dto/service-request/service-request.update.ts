import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { ServiceRequestStatus } from '../../enums/service-request.enum';
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
	@Field(() => String, { nullable: true })
	reqDescription?: string;

	@IsOptional()
	@Field(() => ServiceRequestStatus, { nullable: true })
	reqStatus?: ServiceRequestStatus;

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
	@Field(() => [String], { nullable: true })
	reqSkillsNeeded?: string[];
}
