import { Field, Int, ObjectType } from '@nestjs/graphql';
import mongoose from 'mongoose';
import { ServiceRequestStatus } from '../../enums/service-request.enum';
import { Organization } from '../organization/organization';
import { User } from '../user/user';

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
}
