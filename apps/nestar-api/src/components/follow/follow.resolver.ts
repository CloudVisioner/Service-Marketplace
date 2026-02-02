import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { FollowService } from './follow.service';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AuthUser } from '../auth/decorators/authUser.decorator';
import { Follower, Followers, Followings } from '../../libs/dto/follow/follow';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { ObjectId } from 'mongoose';
import { FollowInquiry } from '../../libs/dto/follow/follow.input';
import { WithoutGuard } from '../auth/guards/without.guard';

@Resolver()
export class FollowResolver {
	constructor(private readonly followService: FollowService) {}

	@UseGuards(AuthGuard)
	@Mutation((returns) => Follower)
	public async subscribe(@Args('input') input: string, @AuthUser('_id') userId: ObjectId): Promise<Follower> {
		console.log('Mutation: subscribe');
		const followingId = shapeIntoMongoObjectId(input);
		return await this.followService.subscribe(userId, followingId);
	}

	@UseGuards(AuthGuard)
	@Mutation((returns) => Follower)
	public async unsubscribe(@Args('input') input: string, @AuthUser('_id') userId: ObjectId): Promise<Follower> {
		console.log('Mutation: unsubscribe');
		const followingId = shapeIntoMongoObjectId(input);
		return await this.followService.unsubscribe(userId, followingId);
	}

	@UseGuards(WithoutGuard)
	@Query((returns) => Followings)
	public async getMemberFollowings(
		@Args('input') input: FollowInquiry,
		@AuthUser('_id') userId: ObjectId,
	): Promise<Followings> {
		console.log('Query: getMemberFollowings');
		const { followerUserId } = input.search;
		if (followerUserId) {
			input.search.followerUserId = shapeIntoMongoObjectId(followerUserId);
		}
		return await this.followService.getMemberFollowings(userId, input);
	}

		@UseGuards(WithoutGuard)
	@Query((returns) => Followers)
	public async getMemberFollowers(
		@Args('input') input: FollowInquiry,
		@AuthUser('_id') userId: ObjectId,
	): Promise<Followers> {
		console.log('Query: getMemberFollowers');
		const { followedOrgId } = input.search;
		if (followedOrgId) {
			input.search.followedOrgId = shapeIntoMongoObjectId(followedOrgId);
		}
		return await this.followService.getMemberFollowers(userId, input);
	}
}
