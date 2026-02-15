import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { OrganizationType, OrganizationStatus } from '../../enums/organization.enum';
import { Category, SubCategory } from '../../enums/category.enum';
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

	// Provider marketplace fields
	@IsOptional()
	@Field(() => Category, { nullable: true })
	categoryId?: Category;

	@IsOptional()
	@Field(() => SubCategory, { nullable: true })
	subCategory?: SubCategory;

	@IsOptional()
	@Field(() => String, { nullable: true })
	serviceTitle?: string;

	@IsOptional()
	@Field(() => Number, { nullable: true })
	startingRate?: number;

	@IsOptional()
	@Field(() => Number, { nullable: true })
	establishmentYear?: number;

	@IsOptional()
	@Field(() => Number, { nullable: true })
	teamSize?: number;

	@IsOptional()
	@Field(() => [String], { nullable: true })
	industries?: string[];

	@IsOptional()
	@Field(() => Number, { nullable: true })
	minProjectSize?: number;

	@IsOptional()
	@Field(() => String, { nullable: true })
	bio?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	avatar?: string;

	@IsOptional()
	@Field(() => [String], { nullable: true })
	badges?: string[];

	@IsOptional()
	@Field(() => String, { nullable: true })
	color?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	location?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	flag?: string;

	@IsOptional()
	@Field(() => Number, { nullable: true })
	reviewsCount?: number;

	@IsOptional()
	@Field(() => String, { nullable: true })
	email?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	phone?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	linkedIn?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	twitter?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	github?: string;

	deleteAt?: Date;
}
