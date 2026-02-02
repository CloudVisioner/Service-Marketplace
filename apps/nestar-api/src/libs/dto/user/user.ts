import { Field, Int, ObjectType } from '@nestjs/graphql';
import mongoose from 'mongoose';
import { UserRole, UserStatus } from '../../enums/user.enum';
import { MeLiked } from '../like/like';
import { MeFollowed } from '../follow/follow';
import { TotalCounter } from '../common/common';

@ObjectType()
export class User {
	@Field(() => String)
	_id: mongoose.ObjectId;

	@Field(() => UserRole)
	userRole: UserRole;

	@Field(() => UserStatus)
	userStatus: UserStatus;

	@Field(() => String)
	userEmail: string;

	@Field(() => String)
	userNick: string;

	userPassword: string;

	@Field(() => String, { nullable: true })
	userFullName?: string;

	@Field(() => Date, { nullable: true })
	deletedAt?: Date;

	@Field(() => Date, { nullable: true })
	createdAt: Date;

	@Field(() => Date, { nullable: true })
	updatedAt: Date;

	@Field(() => String, { nullable: true })
	accessToken?: string;

	// ** from aggregation **/
	@Field(() => [MeLiked], { nullable: true })
	meLiked?: MeLiked[];

	@Field(() => [MeFollowed], { nullable: true })
	meFollowed?: MeFollowed[];
}

@ObjectType()
export class Users {
	@Field(() => [User])
	list: User[];

	@Field(() => [TotalCounter], { nullable: true })
	metaCounter: TotalCounter[];
}
