import { Field, Int, ObjectType } from '@nestjs/graphql';
import mongoose from 'mongoose';
import { OrganizationType, OrganizationStatus } from '../../enums/organization.enum';
import { Category, SubCategory } from '../../enums/category.enum';
import { User } from '../user/user';
import { TotalCounter } from '../common/common';
import { MeLiked } from '../like/like';

@ObjectType()
export class Organization {
	@Field(() => String)
	_id: mongoose.ObjectId;

	@Field(() => OrganizationType)
	orgType: OrganizationType;

	@Field(() => OrganizationStatus)
	orgStatus: OrganizationStatus;

	@Field(() => String, { nullable: true })
	orgCountry?: string;

	@Field(() => String, { nullable: true })
	orgCity?: string;

	@Field(() => String, { nullable: true })
	organizationWebsiteUrl?: string;

	@Field(() => Int)
	orgTotalProjects: number;

	@Field(() => Number)
	orgResponseTimeAvg: number;

	@Field(() => Boolean)
	orgVerified: boolean;

	@Field(() => [String])
	orgSkills: string[];

	@Field(() => String)
	orgOwnerUserId: mongoose.ObjectId;

	@Field(() => String)
	organizationName: string;

	@Field(() => String, { nullable: true })
	organizationDescription?: string;

	@Field(() => String, { nullable: true })
	organizationIndustry?: string;

	@Field(() => Int)
	orgAverageRating: number;

	@Field(() => Int)
	orgTotalLikes: number;

	@Field(() => Int)
	orgTotalViews: number;

	@Field(() => [String])
	organizationImage: string[];

	@Field(() => String, { nullable: true })
	orgTaxId?: string;

	// Provider marketplace fields
	@Field(() => [Category], { nullable: true })
	categoryId?: Category[]; // Array of categories

	@Field(() => [SubCategory], { nullable: true })
	subCategory?: SubCategory[]; // Array of subcategories

	@Field(() => String, { nullable: true })
	serviceTitle?: string;

	@Field(() => Number, { nullable: true })
	organizationHourlyRate?: number;

	@Field(() => Int, { nullable: true })
	establishmentYear?: number;

	@Field(() => Int, { nullable: true })
	organizationTeamSize?: number;

	@Field(() => [String], { nullable: true })
	organizationSpecialties?: string[];

	@Field(() => [String], { nullable: true })
	industries?: string[];

	@Field(() => Number, { nullable: true })
	minProjectSize?: number;

	@Field(() => String, { nullable: true })
	budgetRange?: string;

	@Field(() => String, { nullable: true })
	bio?: string;

	@Field(() => String, { nullable: true })
	avatar?: string;

	@Field(() => [String], { nullable: true })
	badges?: string[];

	@Field(() => String, { nullable: true })
	color?: string;

	@Field(() => String, { nullable: true })
	organizationLocation?: string;

	@Field(() => String, { nullable: true })
	flag?: string;

	@Field(() => Int, { nullable: true })
	reviewsCount?: number;

	@Field(() => String, { nullable: true })
	organizationEmail?: string;

	@Field(() => String, { nullable: true })
	organizationContactEmail?: string; // Alias for organizationEmail

	@Field(() => String, { nullable: true })
	organizationPhoneNumber?: string;

	@Field(() => String, { nullable: true })
	linkedIn?: string;

	@Field(() => String, { nullable: true })
	twitter?: string;

	@Field(() => String, { nullable: true })
	github?: string;

	@Field(() => Date, { nullable: true })
	deletedAt?: Date;

	@Field(() => Date)
	createdAt: Date;

	@Field(() => Date)
	updatedAt: Date;

	/** from aggregation **/
	@Field(() => User, { nullable: true })
	orgOwnerData?: User;

	@Field(() => [MeLiked], { nullable: true })
	meLiked?: MeLiked[];
}

@ObjectType()
export class Organizations {
	@Field(() => [Organization])
	list: Organization[];

	@Field(() => [TotalCounter], { nullable: true })
	metaCounter: TotalCounter[];
}
