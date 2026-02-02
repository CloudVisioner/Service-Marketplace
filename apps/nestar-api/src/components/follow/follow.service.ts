import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Follower, Followers, Following, Followings } from '../../libs/dto/follow/follow';
import { UserService } from '../user/user.service';
import { Direction, Message } from '../../libs/enums/common.enum';
import { FollowInquiry } from '../../libs/dto/follow/follow.input';
import { T } from '../../libs/types/common';
import {
	lookupAuthUserFollowed,
	lookupAuthUserLiked,
} from '../../libs/config';

@Injectable()
export class FollowService {
	constructor(
		@InjectModel('Follow') private readonly followModel: Model<Follower | Following>,
		private readonly userService: UserService,
	) {}

	public async subscribe(followerId: ObjectId, followingId: ObjectId): Promise<Follower> {
		if (followerId.toString() === followingId.toString()) {
			throw new InternalServerErrorException(Message.SELF_SUBSCRIPTION_DENIED);
		}

		// Note: Following organizations, not users. Organization validation happens in OrganizationService
		const result = await this.registerSubscription(followerId, followingId);

		return result;
	}

	private async registerSubscription(followerId: ObjectId, followingId: ObjectId): Promise<Follower> {
		try {
			return await this.followModel.create({
				followedOrgId: followingId,
				followerUserId: followerId,
			});
		} catch (err) {
			console.log('Error, Service.model:', err.message);
			throw new BadRequestException(Message.CREATE_FAILED);
		}
	}

	public async unsubscribe(followerId: ObjectId, followingId: ObjectId): Promise<Follower> {
		const result = await this.followModel.findOneAndDelete({
			followedOrgId: followingId,
			followerUserId: followerId,
		});
		if (!result) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		return result;
	}

	public async getMemberFollowings(userId: ObjectId, input: FollowInquiry): Promise<Followings> {
		const { page, limit, search } = input;
		if (!search?.followerUserId) throw new InternalServerErrorException(Message.BAD_REQUEST);
		const match: T = { followerUserId: search?.followerUserId };
		console.log('match', match);

		const result = await this.followModel
			.aggregate([
				{ $match: match },
				{ $sort: { createdAt: Direction.DESC } },
				{
					$lookup: {
						from: 'organizations',
						localField: 'followedOrgId',
						foreignField: '_id',
						as: 'followingData',
					},
				},
				{ $unwind: '$followingData' },
				{
					$facet: {
						list: [
							{ $skip: (page - 1) * limit },
							{ $limit: limit },
							lookupAuthUserLiked(userId, '$followedOrgId'),
							lookupAuthUserFollowed({ followerUserId: userId, followedOrgId: '$followedOrgId' }),
						],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();
		if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		return result[0];
	}

	public async getMemberFollowers(userId: ObjectId, input: FollowInquiry): Promise<Followers> {
		const { page, limit, search } = input;
		if (!search?.followedOrgId) throw new InternalServerErrorException(Message.BAD_REQUEST);

		const match: T = { followedOrgId: search?.followedOrgId };
		console.log('match:', match);
		const result = await this.followModel
			.aggregate([
				{ $match: match },
				{ $sort: { createdAt: Direction.DESC } },
				{
					$lookup: {
						from: 'users',
						localField: 'followerUserId',
						foreignField: '_id',
						as: 'followerData',
					},
				},
				{ $unwind: '$followerData' },
				{
					$facet: {
						list: [
							{ $skip: (page - 1) * limit },
							{ $limit: limit },
							lookupAuthUserLiked(userId, '$followerUserId'),
							lookupAuthUserFollowed({ followerUserId: userId, followedOrgId: '$followedOrgId' }),
						],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();
		if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		return result[0];
	}
}
