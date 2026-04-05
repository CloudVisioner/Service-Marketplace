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
	shapeIntoMongoObjectId,
} from '../../libs/config';
import { OrganizationService } from '../organization/organization.service';

@Injectable()
export class FollowService {
	constructor(
		@InjectModel('Follow') private readonly followModel: Model<Follower | Following>,
		@InjectModel('User') private readonly userModel: Model<any>,
		@InjectModel('Organization') private readonly organizationModel: Model<any>,
		private readonly userService: UserService,
		private readonly organizationService: OrganizationService,
	) {}

	public async subscribe(followerId: ObjectId, followingId: ObjectId): Promise<Follower> {
		const org = await this.organizationModel.findById(followingId).exec();
		if (!org) {
			const user = await this.userModel.findById(followingId).exec();
			if (user) {
				throw new BadRequestException('Users cannot be followed. Please follow the organization directly using the organization ID.');
			}
			throw new BadRequestException('Invalid organization ID. Only organizations can be followed.');
		}

		if (org.orgType !== 'SERVICE_PROVIDER') {
			throw new BadRequestException('Only SERVICE_PROVIDER organizations can be followed.');
		}

		const orgId = followingId;

		const follower = await this.userModel.findById(followerId).exec();
		if (follower) {
			let followerOrgId = follower.userOrganizationId;

			if (!followerOrgId) {
				const ownedOrg = await this.organizationModel.findOne({ orgOwnerUserId: followerId }).exec();
				if (ownedOrg) {
					followerOrgId = ownedOrg._id;
				}
			}

			if (followerOrgId && followerOrgId.toString() === orgId.toString()) {
				throw new InternalServerErrorException(Message.SELF_SUBSCRIPTION_DENIED);
			}
		}

		const followerIdObj = shapeIntoMongoObjectId(followerId);
		const orgIdObj = shapeIntoMongoObjectId(orgId);

		const existingFollow = await this.followModel
			.findOne({
				followerUserId: followerIdObj,
				followedOrgId: orgIdObj,
			})
			.exec();

		if (existingFollow) {
			return existingFollow;
		}

		const result = await this.registerSubscription(followerId, orgId);
		return result;
	}

	private async registerSubscription(followerId: ObjectId, followingId: ObjectId): Promise<Follower> {
		try {
			const followerIdObj = shapeIntoMongoObjectId(followerId);
			const followingIdObj = shapeIntoMongoObjectId(followingId);

			if (!followerIdObj || !followingIdObj) {
				throw new BadRequestException('Invalid user ID or organization ID provided.');
			}

			const newFollow = await this.followModel.create({
				followedOrgId: followingIdObj,
				followerUserId: followerIdObj,
			});

			return newFollow;
		} catch (err) {
			console.error('Error, FollowService.registerSubscription:', err.message);

			if (err.code === 11000) {
				if (err.message && (err.message.includes('followingId_1_followerId_1') || err.message.includes('followingId') || err.message.includes('followerId'))) {
					try {
						const collection = this.followModel.collection;

						try {
							await collection.dropIndex('followingId_1_followerId_1');
						} catch (dropErr: any) {
							if (dropErr.code !== 27 && !dropErr.message?.includes('index not found')) {
								console.error('Could not drop old index:', dropErr.message);
							}
						}

						await this.followModel.deleteMany({
							$or: [
								{ followerUserId: null },
								{ followedOrgId: null },
								{ followerUserId: { $exists: false } },
								{ followedOrgId: { $exists: false } }
							]
						}).exec();

						const indexes = await collection.indexes();
						const correctIndex = indexes.find(
							(idx: any) => idx.key.followedOrgId === 1 && idx.key.followerUserId === 1
						);

						if (!correctIndex) {
							await collection.createIndex(
								{ followedOrgId: 1, followerUserId: 1 },
								{ unique: true, name: 'followedOrgId_1_followerUserId_1' }
							);
						}

						const followerIdObj = shapeIntoMongoObjectId(followerId);
						const followingIdObj = shapeIntoMongoObjectId(followingId);

						const newFollow = await this.followModel.create({
							followedOrgId: followingIdObj,
							followerUserId: followerIdObj,
						});

						return newFollow;
					} catch (fixErr: any) {
						console.error('Error during automatic index fix:', fixErr.message);
						throw new BadRequestException(
							'Database index mismatch detected. Please contact the administrator to run: db.follows.dropIndex("followingId_1_followerId_1")'
						);
					}
				}

				if (err.message && err.message.includes('null')) {
					await this.followModel.deleteMany({
						$or: [
							{ followerUserId: null },
							{ followedOrgId: null },
							{ followerUserId: { $exists: false } },
							{ followedOrgId: { $exists: false } }
						]
					}).exec();

					try {
						const followerIdObj = shapeIntoMongoObjectId(followerId);
						const followingIdObj = shapeIntoMongoObjectId(followingId);

						const newFollow = await this.followModel.create({
							followedOrgId: followingIdObj,
							followerUserId: followerIdObj,
						});

						return newFollow;
					} catch (retryErr) {
						console.error('Error after cleanup:', retryErr.message);
					}
				}

				const followerIdObj = shapeIntoMongoObjectId(followerId);
				const followingIdObj = shapeIntoMongoObjectId(followingId);

				let existingFollow = await this.followModel
					.findOne({
						followerUserId: followerIdObj,
						followedOrgId: followingIdObj,
					})
					.exec();

				if (!existingFollow) {
					existingFollow = await this.followModel
						.findOne({
							$expr: {
								$and: [
									{ $eq: [{ $toString: '$followerUserId' }, followerIdObj.toString()] },
									{ $eq: [{ $toString: '$followedOrgId' }, followingIdObj.toString()] }
								]
							}
						})
						.exec();
				}

				if (existingFollow) {
					return existingFollow;
				}

				await new Promise(resolve => setTimeout(resolve, 200));

				const retryFollow = await this.followModel
					.findOne({
						followerUserId: followerIdObj,
						followedOrgId: followingIdObj,
					})
					.exec();

				if (retryFollow) {
					return retryFollow;
				}

				throw new BadRequestException('Unable to create follow. The organization may already be followed, or there may be a database issue. Please try again.');
			}

			throw new BadRequestException(err.message || Message.CREATE_FAILED);
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
