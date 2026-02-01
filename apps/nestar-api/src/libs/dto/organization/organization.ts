import { Field, Int, ObjectType } from '@nestjs/graphql';
import mongoose from 'mongoose';
import { OrganizationType, OrganizationStatus } from '../../enums/organization.enum';
import { User } from '../user/user';

@ObjectType()
export class Organization {
	@Field(() => String)
	_id: mongoose.ObjectId;

	@Field(() => OrganizationType)
	orgType: OrganizationType;

	@Field(() => OrganizationStatus)
	orgStatus: OrganizationStatus;

	@Field(() => String)
	orgCountry: string;

	@Field(() => String)
	orgCity: string;

	@Field(() => String)
	orgWebsiteUrl: string;

	@Field(() => Int)
	orgTotalProjects: number;

	@Field(() => Number)
	orgResponseTimeAvg: number;

	@Field(() => Boolean)
	orgVerified: boolean;

	@Field(() => String)
	orgSkills: string;

	@Field(() => String)
	orgOwnerUserId: mongoose.ObjectId;

	@Field(() => String)
	orgName: string;

	@Field(() => String)
	orgDescription: string;

	@Field(() => Int)
	orgAverageRating: number;

	@Field(() => Int)
	orgTotalLikes: number;

	@Field(() => Int)
	orgTotalViews: number;

	@Field(() => [String])
	orgLogoImages: string[];

	@Field(() => String)
	orgTaxId: string;

	@Field(() => Date, { nullable: true })
	deletedAt?: Date;

	@Field(() => Date)
	createdAt: Date;

	@Field(() => Date)
	updatedAt: Date;

	/** from aggregation **/
	@Field(() => User, { nullable: true })
	orgOwnerData?: User;
}

@ObjectType()
export class TotalCounter {
	@Field(() => Int, { nullable: true })
	total?: number;
}

@ObjectType()
export class Organizations {
	@Field(() => [Organization])
	list: Organization[];

	@Field(() => [TotalCounter], { nullable: true })
	metaCounter: TotalCounter[];
}
