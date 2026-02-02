import { Field, ObjectType } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';
import { User } from '../user/user';
import { Organization } from '../organization/organization';
import { MeLiked } from '../like/like';
import { TotalCounter } from '../common/common';

@ObjectType()
export class MeFollowed {
	@Field(() => String)
	followedOrgId: ObjectId;

	@Field(() => String)
	followerUserId: ObjectId;

	@Field(() => Boolean)
	myFollowing: boolean;
}

@ObjectType()
export class Follower {
	@Field(() => String)
	_id: ObjectId;

	@Field(() => String)
	followedOrgId: ObjectId;

	@Field(() => String)
	followerUserId: ObjectId;

	@Field(() => Date)
	createdAt: Date;

	@Field(() => Date)
	updatedAt: Date;

	/** from aggregation **/

	@Field(() => [MeLiked], { nullable: true })
	meLiked?: MeLiked[];

	@Field(() => [MeFollowed], { nullable: true })
	meFollowed?: MeFollowed[];

	@Field(() => User, { nullable: true })
	followerData?: User;
}

@ObjectType()
export class Following {
	@Field(() => String)
	_id: ObjectId;

	@Field(() => String)
	followedOrgId: ObjectId;

	@Field(() => String)
	followerUserId: ObjectId;

	@Field(() => Date)
	createdAt: Date;

	@Field(() => Date)
	updatedAt: Date;

	/** from aggregation **/

	@Field(() => [MeLiked], { nullable: true })
	meLiked?: MeLiked[];

	@Field(() => [MeFollowed], { nullable: true })
	meFollowed?: MeFollowed[];

	@Field(() => Organization, { nullable: true })
	followedOrgData?: Organization;
}

@ObjectType()
export class Followings {
	@Field(() => [Following])
	list: Following[];

	@Field(() => [TotalCounter], { nullable: true })
	metaCounter: TotalCounter[];
}

@ObjectType()
export class Followers {
	@Field(() => [Follower])
	list: Follower[];

	@Field(() => [TotalCounter], { nullable: true })
	metaCounter: TotalCounter[];
}
