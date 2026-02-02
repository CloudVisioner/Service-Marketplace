import { Field, ObjectType } from '@nestjs/graphql';
import { LikeGroup } from '../../enums/like.enum';
import { ObjectId } from 'mongoose';

@ObjectType()
export class MeLiked {
  @Field(() => String, { nullable: true })
  userId?: ObjectId;

  @Field(() => String, { nullable: true })
  likeRefId?: ObjectId;

  @Field(() => Boolean, { nullable: true })
  myFavorite?: boolean;
}

@ObjectType()
export class Like {
	@Field(() => String)
	_id: ObjectId;

	@Field(() => LikeGroup)
	likeGroup: LikeGroup;

	@Field(() => String)
	likeRefId: ObjectId;

	@Field(() => String)
	userId: ObjectId;

	@Field(() => Date)
	createdAt: Date;

	@Field(() => Date)
	updatedAt: Date;
}


