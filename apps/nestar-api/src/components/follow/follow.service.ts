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
		// Only organizations can be followed, not users
		// The followingId must be an organization ID directly
		
		// Verify it's an organization (not a user)
		// Only organizations can be followed directly, not users
		const org = await this.organizationModel.findById(followingId).exec();
		if (!org) {
			// Check if it's a user ID to provide a helpful error message
			const user = await this.userModel.findById(followingId).exec();
			if (user) {
				throw new BadRequestException('Users cannot be followed. Please follow the organization directly using the organization ID.');
			}
			throw new BadRequestException('Invalid organization ID. Only organizations can be followed.');
		}

		// Rule: Only SERVICE_PROVIDER orgs can be followed/liked
		if (org.orgType !== 'SERVICE_PROVIDER') {
			throw new BadRequestException('Only SERVICE_PROVIDER organizations can be followed.');
		}
		
		const orgId = followingId;

		// Check if the follower is trying to follow their own organization
		// Get the follower's organization ID (check both userOrganizationId and orgOwnerUserId)
		const follower = await this.userModel.findById(followerId).exec();
		if (follower) {
			let followerOrgId = follower.userOrganizationId;
			
			// If userOrganizationId is not set, check if they own an organization
			if (!followerOrgId) {
				const ownedOrg = await this.organizationModel.findOne({ orgOwnerUserId: followerId }).exec();
				if (ownedOrg) {
					followerOrgId = ownedOrg._id;
				}
			}
			
			// Check if follower's organization ID matches the organization they're trying to follow
			if (followerOrgId && followerOrgId.toString() === orgId.toString()) {
			throw new InternalServerErrorException(Message.SELF_SUBSCRIPTION_DENIED);
			}
		}

		// Check if already following this organization
		// Ensure both IDs are properly converted to ObjectId for comparison
		const followerIdObj = shapeIntoMongoObjectId(followerId);
		const orgIdObj = shapeIntoMongoObjectId(orgId);
		
		console.log('Checking for existing follow:', {
			followerUserId: followerIdObj.toString(),
			followedOrgId: orgIdObj.toString()
		});
		
		const existingFollow = await this.followModel
			.findOne({
				followerUserId: followerIdObj,
				followedOrgId: orgIdObj,
			})
			.exec();

		if (existingFollow) {
			// Already following - return existing follow
			console.log('Follow already exists:', {
				followerUserId: followerId.toString(),
				followedOrgId: orgId.toString(),
				followId: existingFollow._id.toString()
			});
			return existingFollow;
		}
		
		console.log('No existing follow found, proceeding to create new follow');

		console.log('Creating new follow:', {
			followerUserId: followerId.toString(),
			followedOrgId: orgId.toString()
		});

		// Note: Only organizations can be followed. Users (buyers, admins) cannot be followed.
		const result = await this.registerSubscription(followerId, orgId);

		return result;
	}

	private async registerSubscription(followerId: ObjectId, followingId: ObjectId): Promise<Follower> {
		try {
			// Ensure both IDs are properly converted to ObjectId
			const followerIdObj = shapeIntoMongoObjectId(followerId);
			const followingIdObj = shapeIntoMongoObjectId(followingId);
			
			// Validate that IDs are not null/undefined
			if (!followerIdObj || !followingIdObj) {
				throw new BadRequestException('Invalid user ID or organization ID provided.');
			}
			
			const newFollow = await this.followModel.create({
				followedOrgId: followingIdObj,
				followerUserId: followerIdObj,
			});
			
			console.log('Follow created successfully:', {
				followerUserId: followerIdObj.toString(),
				followedOrgId: followingIdObj.toString(),
				followId: newFollow._id.toString()
			});
			
			return newFollow;
		} catch (err) {
			console.error('Error, FollowService.registerSubscription:', err.message);
			console.error('Error code:', err.code);
			console.error('Error details:', {
				followerUserId: followerId?.toString(),
				followedOrgId: followingId?.toString(),
				followerIdType: typeof followerId,
				followingIdType: typeof followingId
			});
			
			// Check for duplicate key error (MongoDB error code 11000)
			if (err.code === 11000) {
				console.error('Duplicate key error detected. Checking for existing follow...');
				
				// Check if error mentions wrong index names (index mismatch issue)
				if (err.message && (err.message.includes('followingId_1_followerId_1') || err.message.includes('followingId') || err.message.includes('followerId'))) {
					console.error('⚠️ INDEX MISMATCH DETECTED! Attempting automatic fix...');
					console.error('The database has an old index with wrong field names.');
					console.error('Error:', err.message);
					
					try {
						// Get the collection directly to fix the index
						const collection = this.followModel.collection;
						
						// Step 1: Try to drop the old incorrect index
						try {
							await collection.dropIndex('followingId_1_followerId_1');
							console.log('✅ Dropped old index: followingId_1_followerId_1');
						} catch (dropErr: any) {
							if (dropErr.code === 27 || dropErr.message?.includes('index not found')) {
								console.log('ℹ️  Old index not found (may have been already dropped)');
							} else {
								console.error('⚠️  Could not drop old index:', dropErr.message);
							}
						}
						
						// Step 2: Clean up null documents
						const nullCleanup = await this.followModel.deleteMany({
							$or: [
								{ followerUserId: null },
								{ followedOrgId: null },
								{ followerUserId: { $exists: false } },
								{ followedOrgId: { $exists: false } }
							]
						}).exec();
						console.log(`✅ Cleaned up ${nullCleanup.deletedCount} documents with null values`);
						
						// Step 3: Ensure the correct index exists
						const indexes = await collection.indexes();
						const correctIndex = indexes.find(
							(idx: any) => idx.key.followedOrgId === 1 && idx.key.followerUserId === 1
						);
						
						if (!correctIndex) {
							console.log('⚠️  Correct index not found. Creating it now...');
							await collection.createIndex(
								{ followedOrgId: 1, followerUserId: 1 },
								{ unique: true, name: 'followedOrgId_1_followerUserId_1' }
							);
							console.log('✅ Created correct index: followedOrgId_1_followerUserId_1');
						} else {
							console.log(`✅ Correct index exists: ${correctIndex.name}`);
						}
						
						console.log('✅ Index fix complete! Retrying follow operation...');
						
						// Retry the follow operation after fixing the index
						const followerIdObj = shapeIntoMongoObjectId(followerId);
						const followingIdObj = shapeIntoMongoObjectId(followingId);
						
						const newFollow = await this.followModel.create({
							followedOrgId: followingIdObj,
							followerUserId: followerIdObj,
						});
						
						console.log('✅ Follow created successfully after index fix:', {
							followerUserId: followerIdObj.toString(),
							followedOrgId: followingIdObj.toString()
						});
						
						return newFollow;
					} catch (fixErr: any) {
						console.error('❌ Error during automatic index fix:', fixErr.message);
						throw new BadRequestException(
							'Database index mismatch detected. Automatic fix failed. ' +
							'Please contact the administrator to run: db.follows.dropIndex("followingId_1_followerId_1")'
						);
					}
				}
				
				// Check if error is about null values - this indicates corrupted data
				if (err.message && err.message.includes('null')) {
					console.error('Duplicate key error with null values detected. Cleaning up corrupted data...');
					// Clean up any documents with null values
					await this.followModel.deleteMany({
						$or: [
							{ followerUserId: null },
							{ followedOrgId: null },
							{ followerUserId: { $exists: false } },
							{ followedOrgId: { $exists: false } }
						]
					}).exec();
					
					// Try creating again after cleanup
					try {
						const followerIdObj = shapeIntoMongoObjectId(followerId);
						const followingIdObj = shapeIntoMongoObjectId(followingId);
						
						const newFollow = await this.followModel.create({
							followedOrgId: followingIdObj,
							followerUserId: followerIdObj,
						});
						
						console.log('Follow created successfully after cleanup:', {
							followerUserId: followerIdObj.toString(),
							followedOrgId: followingIdObj.toString()
						});
						
						return newFollow;
					} catch (retryErr) {
						console.error('Error after cleanup:', retryErr.message);
						// Fall through to check for existing follow
					}
				}
				
				// Duplicate follow - try to find the existing follow with multiple attempts
				// Convert IDs to ensure proper comparison
				const followerIdObj = shapeIntoMongoObjectId(followerId);
				const followingIdObj = shapeIntoMongoObjectId(followingId);
				
				console.log('Searching for existing follow:', {
					followerUserId: followerIdObj.toString(),
					followedOrgId: followingIdObj.toString()
				});
				
				// Try finding with converted ObjectIds
				let existingFollow = await this.followModel
					.findOne({
						followerUserId: followerIdObj,
						followedOrgId: followingIdObj,
					})
					.exec();
				
				// If not found, try with string comparison
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
					console.log('Found existing follow after duplicate key error:', {
						followerUserId: followerId.toString(),
						followedOrgId: followingId.toString(),
						followId: existingFollow._id.toString()
					});
					return existingFollow;
				}
				
				// If duplicate key error but no follow found, there might be a race condition
				// Wait a bit and try to find again
				console.log('Follow not found immediately, waiting and retrying...');
				await new Promise(resolve => setTimeout(resolve, 200));
				
				const retryFollow = await this.followModel
					.findOne({
						followerUserId: followerIdObj,
						followedOrgId: followingIdObj,
					})
					.exec();
				
				if (retryFollow) {
					console.log('Found follow on retry');
					return retryFollow;
				}
				
				// If still not found, the unique index might be on wrong fields
				// Log detailed error for debugging
				console.error('Duplicate key error but follow not found in database');
				console.error('This might indicate an index mismatch. Error:', err.message);
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
