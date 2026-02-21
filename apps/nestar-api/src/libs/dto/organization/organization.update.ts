import { Field, InputType, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, Min } from 'class-validator';

@InputType()
export class OrganizationUpdate {
	@IsNotEmpty()
	@Field(() => String)
	orgId: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	organizationName?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	organizationIndustry?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	organizationLocation?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	organizationDescription?: string;

	@IsOptional()
	@Field(() => [String], { nullable: true })
	organizationSpecialties?: string[];

	@IsOptional()
	@Field(() => Number, { nullable: true })
	organizationHourlyRate?: number;

	@IsOptional()
	@Min(0)
	@Field(() => Int, { nullable: true })
	organizationTeamSize?: number;

	@IsOptional()
	@Field(() => String, { nullable: true })
	organizationWebsiteUrl?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	organizationContactEmail?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	organizationPhoneNumber?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	organizationImage?: string; // Single image URL (string, not array)

	@IsOptional()
	@Field(() => [String], { nullable: true })
	categoryId?: string[]; // Array of categories

	@IsOptional()
	@Field(() => [String], { nullable: true })
	subCategory?: string[]; // Array of subcategories

	@IsOptional()
	@Field(() => Number, { nullable: true })
	minProjectSize?: number;

	@IsOptional()
	@Field(() => String, { nullable: true })
	orgCountry?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	orgCity?: string;

	@IsOptional()
	@Field(() => [String], { nullable: true })
	orgSkills?: string[]; // Array of skills

	@IsOptional()
	@Field(() => String, { nullable: true })
	orgTaxId?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	budgetRange?: string;
}
