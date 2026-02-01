import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';
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
	@Field(() => ServiceRequestStatus)
	reqStatus: ServiceRequestStatus;

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

	@IsNotEmpty()
	@Field(() => String)
	reqCreatedByUserId: ObjectId;
}
