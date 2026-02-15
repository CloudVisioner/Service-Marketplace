import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional } from 'class-validator';

@InputType()
export class OrganizationUpdate {
	@IsNotEmpty()
	@Field(() => String)
	orgId: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	orgName?: string;

	@IsOptional()
	@Field(() => [String], { nullable: true })
	categoryId?: string[]; // Array of categories

	@IsOptional()
	@Field(() => [String], { nullable: true })
	subCategory?: string[]; // Array of subcategories

	@IsOptional()
	@Field(() => Number, { nullable: true })
	startingRate?: number;

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
	@Field(() => String, { nullable: true })
	orgWebsiteUrl?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	orgDescription?: string;

	@IsOptional()
	@Field(() => [String], { nullable: true })
	orgSkills?: string[]; // Array of skills

	@IsOptional()
	@Field(() => String, { nullable: true })
	orgTaxId?: string;

	@IsOptional()
	@Field(() => [String], { nullable: true })
	orgLogoImages?: string[];
}
