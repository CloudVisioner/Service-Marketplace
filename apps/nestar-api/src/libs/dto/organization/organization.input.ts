import { Field, InputType, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, MaxLength, Min } from 'class-validator';
import { OrganizationType, OrganizationStatus } from '../../enums/organization.enum';
import { Category, SubCategory } from '../../enums/category.enum';

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
	orgName: string;

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
	@Field(() => String, { nullable: true })
	orgIndustry?: string;

	@IsOptional()
	@Field(() => [String], { nullable: true })
	orgSkills?: string[];

	@IsOptional()
	@Field(() => String, { nullable: true })
	orgTaxId?: string;

	@IsOptional()
	@Field(() => [String], { nullable: true })
	orgLogoImages?: string[];

	@IsOptional()
	@Min(0)
	@Field(() => Int, { nullable: true })
	orgTeamSize?: number;

	@IsOptional()
	@Field(() => [String], { nullable: true })
	orgSpecialities?: string[];
}

@InputType()
export class BuyerOrganizationInput {
	@IsNotEmpty()
	@Field(() => String)
	orgName: string;

	@IsNotEmpty()
	@Field(() => String)
	orgIndustry: string;

	@IsNotEmpty()
	@Field(() => String)
	location: string;

	@IsNotEmpty()
	@MaxLength(2000)
	@Field(() => String)
	orgDescription: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	orgWebsiteUrl?: string;

	@IsOptional()
	@Field(() => [String], { nullable: true })
	orgLogoImages?: string[];
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

@InputType()
export class ProviderCategoryInput {
	@IsNotEmpty()
	@Field(() => Category)
	categoryId: Category;

	@IsOptional()
	@Min(1)
	@Field(() => Int, { nullable: true })
	page?: number;

	@IsOptional()
	@Min(1)
	@Field(() => Int, { nullable: true })
	limit?: number;

	@IsOptional()
	@Field(() => SubCategory, { nullable: true })
	subCategory?: SubCategory;

	@IsOptional()
	@Field(() => String, { nullable: true })
	location?: string;

	@IsOptional()
	@Field(() => Number, { nullable: true })
	minBudget?: number;

	@IsOptional()
	@Field(() => Number, { nullable: true })
	maxBudget?: number;
}

@InputType()
export class ProviderSortInput {
	@IsNotEmpty()
	@Field(() => String)
	sortBy: string; // 'rating', 'projects', 'responseTime', 'startingRate'

	@IsOptional()
	@Field(() => Category, { nullable: true })
	categoryId?: Category;

	@IsOptional()
	@Field(() => SubCategory, { nullable: true })
	subCategory?: SubCategory;

	@IsOptional()
	@Field(() => String, { nullable: true })
	location?: string;

	@IsOptional()
	@Min(1)
	@Field(() => Int, { nullable: true })
	page?: number;

	@IsOptional()
	@Min(1)
	@Field(() => Int, { nullable: true })
	limit?: number;

	@IsOptional()
	@Field(() => String, { nullable: true })
	searchQuery?: string;

	@IsOptional()
	@Field(() => Number, { nullable: true })
	minBudget?: number;

	@IsOptional()
	@Field(() => Number, { nullable: true })
	maxBudget?: number;
}
