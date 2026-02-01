import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { OrganizationType, OrganizationStatus } from '../../enums/organization.enum';
import { ObjectId } from 'mongoose';

@InputType()
export class OrganizationUpdate {
	@IsNotEmpty()
	@Field(() => String)
	_id: ObjectId;

	@IsOptional()
	@Field(() => OrganizationType, { nullable: true })
	orgType?: OrganizationType;

	@IsOptional()
	@Field(() => OrganizationStatus, { nullable: true })
	orgStatus?: OrganizationStatus;

	@IsOptional()
	@Field(() => String, { nullable: true })
	orgCountry?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	orgCity?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	orgWebsiteUrl?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	orgName?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	orgDescription?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	orgSkills?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	orgTaxId?: string;

	@IsOptional()
	@Field(() => [String], { nullable: true })
	orgLogoImages?: string[];

	deleteAt?: Date;
}
