import { Field, InputType, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, Length, Min } from 'class-validator';
import { OrganizationType, OrganizationStatus } from '../../enums/organization.enum';
import { ObjectId } from 'mongoose';

@InputType()
export class OrganizationInput {
	@IsNotEmpty()
	@Field(() => OrganizationType)
	orgType: OrganizationType;

	@IsNotEmpty()
	@Field(() => OrganizationStatus)
	orgStatus: OrganizationStatus;

	@IsNotEmpty()
	@Field(() => String)
	orgCountry: string;

	@IsNotEmpty()
	@Field(() => String)
	orgCity: string;

	@IsNotEmpty()
	@Field(() => String)
	orgWebsiteUrl: string;

	@IsNotEmpty()
	@Field(() => String)
	orgName: string;

	@IsNotEmpty()
	@Field(() => String)
	orgDescription: string;

	@IsNotEmpty()
	@Field(() => String)
	orgSkills: string;

	@IsNotEmpty()
	@Field(() => String)
	orgTaxId: string;

	@IsNotEmpty()
	@Field(() => String)
	orgOwnerUserId: ObjectId;

	@IsNotEmpty()
	@Field(() => [String])
	orgLogoImages: string[];
}

@InputType()
export class OrganizationInquiry {
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
	text?: string;
}
