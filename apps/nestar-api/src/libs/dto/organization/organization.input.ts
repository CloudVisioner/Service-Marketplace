import { Field, InputType, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, MaxLength, Min, Max } from 'class-validator';
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
	organizationName: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	orgCountry?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	orgCity?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	organizationWebsiteUrl?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	organizationDescription?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	organizationIndustry?: string;

	@IsOptional()
	@Field(() => [String], { nullable: true })
	orgSkills?: string[];

	@IsOptional()
	@Field(() => String, { nullable: true })
	orgTaxId?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	organizationImage?: string; // Single image URL (string, not array)

	@IsOptional()
	@Min(0)
	@Field(() => Int, { nullable: true })
	organizationTeamSize?: number;

	@IsOptional()
	@Field(() => [String], { nullable: true })
	organizationSpecialties?: string[];

	@IsOptional()
	@Field(() => Number, { nullable: true })
	organizationHourlyRate?: number;

	@IsOptional()
	@Field(() => String, { nullable: true })
	organizationLocation?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	organizationContactEmail?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	organizationPhoneNumber?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	budgetRange?: string;
}

@InputType()
export class BuyerOrganizationInput {
	// REQUIRED FIELDS (Buyer-specific only)
	@IsNotEmpty()
	@Field(() => String)
	organizationName: string;

	@IsNotEmpty()
	@Field(() => String)
	organizationIndustry: string;

	/** GraphQL: nullable. Send at least one of organizationLocation / organizationCountry on create (validated in service). */
	@IsOptional()
	@Field(() => String, { nullable: true })
	organizationLocation?: string;

	/** GraphQL: nullable. Can mirror organizationLocation for a single "Location" UI field. */
	@IsOptional()
	@Field(() => String, { nullable: true })
	organizationCountry?: string;

	@IsNotEmpty()
	@MaxLength(2000)
	@Field(() => String)
	organizationDescription: string;

	// OPTIONAL FIELDS (Buyer-specific only)
	@IsOptional()
	@Field(() => String, { nullable: true })
	budgetRange?: string;

	// These fields are ignored (set automatically by backend)
	// Added here to prevent GraphQL validation errors when frontend sends them
	@IsOptional()
	@Field(() => Date, { nullable: true })
	deletedAt?: Date;

	@IsOptional()
	@Field(() => Date, { nullable: true })
	updatedAt?: Date;

	@IsOptional()
	@Field(() => String, { nullable: true })
	orgOwnerUserId?: string;

	@IsOptional()
	@Field(() => Date, { nullable: true })
	createdAt?: Date;

	// OPTIONAL FIELDS (Buyer-specific only)
	@IsOptional()
	@Field(() => String, { nullable: true })
	organizationImage?: string; // Single image URL (string, not array) - NEW: Now supported for buyers
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

/**
 * Input for creating a provider organization profile.
 * Provider-specific fields only.
 */
@InputType()
export class ProviderOrganizationInput {
	@IsNotEmpty()
	@Field(() => String)
	organizationName: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	organizationDescription?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	organizationContactEmail?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	organizationCountry?: string;

	@IsOptional()
	@Field(() => [Category], { nullable: true })
	organizationCategories?: Category[]; // Array of categories

	@IsOptional()
	@Field(() => [SubCategory], { nullable: true })
	organizationSubCategories?: SubCategory[]; // Array of subcategories

	@IsOptional()
	@Field(() => String, { nullable: true })
	organizationImage?: string; // Single image URL (string, not array)

	@IsOptional()
	@Field(() => String, { nullable: true })
	budgetRange?: string;
}

/**
 * Input for updating a provider organization profile.
 * Provider-specific fields only.
 */
@InputType()
export class UpdateProviderOrganizationInput {
	@IsNotEmpty()
	@Field(() => String)
	organizationId: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	organizationName?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	organizationDescription?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	organizationContactEmail?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	organizationCountry?: string;

	@IsOptional()
	@Field(() => [Category], { nullable: true })
	organizationCategories?: Category[]; // Array of categories

	@IsOptional()
	@Field(() => [SubCategory], { nullable: true })
	organizationSubCategories?: SubCategory[]; // Array of subcategories

	@IsOptional()
	@Field(() => String, { nullable: true })
	organizationImage?: string; // Single image URL (string, not array)

	@IsOptional()
	@Field(() => String, { nullable: true })
	budgetRange?: string;
}

/**
 * Input for rating an organization.
 */
@InputType()
export class RateOrganizationInput {
	@IsNotEmpty()
	@Field(() => String)
	orgId: string;

	@IsNotEmpty()
	@Min(1)
	@Max(5)
	@Field(() => Int)
	rating: number; // Rating from 1 to 5
}
