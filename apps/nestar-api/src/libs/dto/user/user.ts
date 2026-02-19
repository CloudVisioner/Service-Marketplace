import { Field, Int, ObjectType } from '@nestjs/graphql';
import mongoose from 'mongoose';
import { UserRole, UserStatus, UserAuthType } from '../../enums/user.enum';
import { TotalCounter } from '../common/common';
import { Organization } from '../organization/organization';

@ObjectType()
export class User {
	// Account & Identity
	@Field(() => String)
	_id: mongoose.ObjectId;

	@Field(() => UserRole)
	userRole: UserRole;

	@Field(() => UserStatus)
	userStatus: UserStatus;

	@Field(() => UserAuthType)
	userAuthType: UserAuthType;

	@Field(() => String, { nullable: true })
	userEmail?: string;

	@Field(() => String, { nullable: true })
	userPhone?: string;

	userPassword: string;

	@Field(() => String)
	userNick: string;

	@Field(() => String, { nullable: true })
	userImage?: string;

	// Business-related info
	@Field(() => String, { nullable: true })
	userOrganizationId?: mongoose.ObjectId;

	@Field(() => Organization, { nullable: true })
	userOrganization?: Organization;

	@Field(() => String, { nullable: true })
	userDescription?: string;

	@Field(() => [String], { nullable: true })
	userLanguages?: string[];

	// Activity stats (auto-managed)
	@Field(() => Int)
	userTotalServiceRequests: number;

	@Field(() => Int)
	userTotalQuotes: number;

	@Field(() => Int)
	userOrgCount: number;

	@Field(() => Date, { nullable: true })
	deletedAt?: Date;

	@Field(() => Date, { nullable: true })
	createdAt: Date;

	@Field(() => Date, { nullable: true })
	updatedAt: Date;

	@Field(() => String, { nullable: true })
	accessToken?: string;
}

@ObjectType()
export class SignupResponse {
	@Field(() => String)
	accessToken: string;

	@Field(() => User)
	user: User;
}

@ObjectType()
export class Users {
	@Field(() => [User])
	list: User[];

	@Field(() => [TotalCounter], { nullable: true })
	metaCounter: TotalCounter[];
}
