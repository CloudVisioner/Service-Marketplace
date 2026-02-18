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
	orgWebsiteUrl?: string;

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
	orgName: string;

	@Field(() => String, { nullable: true })
	orgDescription?: string;

	@Field(() => String, { nullable: true })
	orgIndustry?: string;

	@Field(() => Int)
	orgAverageRating: number;

	@Field(() => Int)
	orgTotalLikes: number;

	@Field(() => Int)
	orgTotalViews: number;

	@Field(() => [String])
	orgLogoImages: string[];

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
	startingRate?: number;

	@Field(() => Int, { nullable: true })
	establishmentYear?: number;

	@Field(() => Int, { nullable: true })
	orgTeamSize?: number;

	@Field(() => [String], { nullable: true })
	orgSpecialities?: string[];

	@Field(() => [String], { nullable: true })
	industries?: string[];

	@Field(() => Number, { nullable: true })
	minProjectSize?: number;

	@Field(() => String, { nullable: true })
	bio?: string;

	@Field(() => String, { nullable: true })
	avatar?: string;

	@Field(() => [String], { nullable: true })
	badges?: string[];

	@Field(() => String, { nullable: true })
	color?: string;

	@Field(() => String, { nullable: true })
	location?: string;

	@Field(() => String, { nullable: true })
	flag?: string;

	@Field(() => Int, { nullable: true })
	reviewsCount?: number;

	@Field(() => String, { nullable: true })
	email?: string;

	@Field(() => String, { nullable: true })
	phone?: string;

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
