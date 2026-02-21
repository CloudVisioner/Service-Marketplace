import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, MaxLength } from 'class-validator';
import { ServiceRequestStatus, Urgency } from '../../enums/service-request.enum';
import { ObjectId } from 'mongoose';

/**
 * Input type for updating a service request.
 * Only editable when request status is DRAFT or OPEN.
 * All fields are optional - only provided fields will be updated.
 */
@InputType()
export class ServiceRequestUpdate {
	@IsNotEmpty()
	@Field(() => String)
	_id: ObjectId;

	// Editable fields (only when status is DRAFT or OPEN)
	@IsOptional()
	@Field(() => String, { nullable: true })
	reqTitle?: string;

	@IsOptional()
	@MaxLength(2000)
	@Field(() => String, { nullable: true })
	reqDescription?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	reqCategory?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	reqSubCategory?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	reqBudgetRange?: string; // e.g., "$3,500", "$1,200", "Contact to discuss"

	@IsOptional()
	@Field(() => Date, { nullable: true })
	reqDeadline?: Date;

	@IsOptional()
	@Field(() => Urgency, { nullable: true })
	reqUrgency?: Urgency;

	@IsOptional()
	@Field(() => [String], { nullable: true })
	reqSkillsNeeded?: string[];

	// Note: reqStatus is NOT editable via this mutation - use updateServiceRequestStatus instead
	// Note: reqAttachments can be updated but is not in the main editable fields list per requirements
	@IsOptional()
	@Field(() => [String], { nullable: true })
	reqAttachments?: string[];
}
