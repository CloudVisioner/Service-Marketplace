import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Like, MeLiked } from '../../libs/dto/like/like';
import { LikeInput } from '../../libs/dto/like/like.input';
import { T } from '../../libs/types/common';
import { Message } from '../../libs/enums/common.enum';
import { LikeGroup } from '../../libs/enums/like.enum';
import { shapeIntoMongoObjectId } from '../../libs/config';

@Injectable()
export class LikeService {
	constructor(
		@InjectModel('Like') private readonly likeModel: Model<Like>,
		@InjectModel('Organization') private readonly organizationModel: Model<any>,
		@InjectModel('ServiceRequest') private readonly serviceRequestModel: Model<any>,
		@InjectModel('Quote') private readonly quoteModel: Model<any>,
		@InjectModel('User') private readonly userModel: Model<any>,
	) {}

	public async toggleLike(input: LikeInput): Promise<number> {
		// Ensure ObjectIds are properly converted
		const userIdObj = shapeIntoMongoObjectId(input.userId);
		const likeRefIdObj = shapeIntoMongoObjectId(input.likeRefId);
		
		console.log('toggleLike - Input:', {
			userId: userIdObj?.toString(),
			likeRefId: likeRefIdObj?.toString(),
			likeGroup: input.likeGroup
		});
		
		const search: T = { 
			userId: userIdObj, 
			likeRefId: likeRefIdObj 
		};
		
		// Check if like already exists
		const exist = await this.likeModel.findOne(search).exec();
		let modifier = 1;

		if (exist) {
			console.log('Like exists, removing...');
			// Like exists, remove it
			await this.likeModel.findOneAndDelete(search).exec();
			modifier = -1;
		} else {
			console.log('Like does not exist, creating...');
			// Like doesn't exist, create it
			try {
				const likeData = {
					userId: userIdObj,
					likeRefId: likeRefIdObj,
					likeGroup: input.likeGroup,
				};
				const created = await this.likeModel.create(likeData);
				console.log('Like created successfully:', created._id.toString());
			} catch (err: any) {
				console.error('Error creating like:', err.message, err.code);
				console.error('Error details:', JSON.stringify(err));
				
				// Handle duplicate key error (race condition or index issue)
				if (err.code === 11000) {
					// Check if error mentions old index (memberId instead of userId)
					if (err.message && err.message.includes('memberId')) {
						console.error('⚠️ DATABASE INDEX MISMATCH DETECTED! Attempting automatic fix...');
						console.error('The database has an old index with wrong field name (memberId instead of userId).');
						
						try {
							// Get the collection directly to fix the index
							const collection = this.likeModel.collection;
							
							// Step 1: Try to drop the old incorrect index
							try {
								await collection.dropIndex('memberId_1_likeRefId_1');
								console.log('✅ Dropped old index: memberId_1_likeRefId_1');
							} catch (dropErr: any) {
								if (dropErr.code === 27 || dropErr.message?.includes('index not found')) {
									console.log('ℹ️  Old index not found (may have been already dropped)');
								} else {
									console.error('⚠️  Could not drop old index:', dropErr.message);
								}
							}
							
							// Step 2: Clean up null documents
							const nullCleanup = await this.likeModel.deleteMany({
								$or: [
									{ userId: null },
									{ likeRefId: null },
									{ userId: { $exists: false } },
									{ likeRefId: { $exists: false } },
									{ memberId: { $exists: true } }
								]
							}).exec();
							console.log(`✅ Cleaned up ${nullCleanup.deletedCount} documents with null values or old field names`);
							
							// Step 3: Ensure the correct index exists
							const indexes = await collection.indexes();
							const correctIndex = indexes.find(
								(idx: any) => idx.key.userId === 1 && idx.key.likeRefId === 1
							);
							
							if (!correctIndex) {
								console.log('⚠️  Correct index not found. Creating it now...');
								await collection.createIndex(
									{ userId: 1, likeRefId: 1 },
									{ unique: true, name: 'userId_1_likeRefId_1' }
								);
								console.log('✅ Created correct index: userId_1_likeRefId_1');
							} else {
								console.log(`✅ Correct index exists: ${correctIndex.name}`);
							}
							
							console.log('✅ Index fix complete! Retrying like operation...');
							
							// Retry the like operation after fixing the index
							try {
								const retryCreated = await this.likeModel.create({
									userId: userIdObj,
									likeRefId: likeRefIdObj,
									likeGroup: input.likeGroup,
								});
								console.log('✅ Like created successfully after index fix:', retryCreated._id.toString());
								modifier = 1;
							} catch (retryErr: any) {
								if (retryErr.code === 11000) {
									// Still duplicate after fix, check if it exists
									const existing = await this.likeModel.findOne(search).exec();
									if (existing) {
										await this.likeModel.findByIdAndDelete(existing._id).exec();
										modifier = -1;
									} else {
										modifier = -1;
									}
								} else {
									throw new BadRequestException(retryErr.message || Message.CREATE_FAILED);
								}
							}
						} catch (fixErr: any) {
							console.error('❌ Error during automatic index fix:', fixErr.message);
							throw new BadRequestException(
								'Database index mismatch detected. Automatic fix failed. ' +
								'Please contact the administrator to run: db.likes.dropIndex("memberId_1_likeRefId_1")'
							);
						}
					} else {
						console.log('Duplicate key error, attempting to delete existing like...');
						// Duplicate key means like exists, try to delete it
						const deleteResult = await this.likeModel.deleteOne(search).exec();
						if (deleteResult.deletedCount > 0) {
							console.log('Deleted existing like');
							modifier = -1;
						} else {
							// If delete failed, check again if it exists
							const recheck = await this.likeModel.findOne(search).exec();
							if (recheck) {
								await this.likeModel.findByIdAndDelete(recheck._id).exec();
								modifier = -1;
							} else {
								// Like was already deleted, try creating again
								try {
									const retryCreated = await this.likeModel.create({
										userId: userIdObj,
										likeRefId: likeRefIdObj,
										likeGroup: input.likeGroup,
									});
									console.log('Like created on retry:', retryCreated._id.toString());
									modifier = 1;
								} catch (retryErr: any) {
									console.error('Retry create failed:', retryErr.message);
									if (retryErr.code === 11000) {
										if (retryErr.message && retryErr.message.includes('memberId')) {
											throw new BadRequestException(
												'Database index mismatch detected. Please contact the administrator to run: db.likes.dropIndex("memberId_1_likeRefId_1")'
											);
										}
										// Still duplicate, treat as existing
										modifier = -1;
									} else {
										throw new BadRequestException(retryErr.message || Message.CREATE_FAILED);
									}
								}
							}
						}
					}
				} else {
					throw new BadRequestException(err.message || Message.CREATE_FAILED);
				}
			}
		}

		console.log('Modifier:', modifier);

		// Auto-update total likes count based on likeGroup
		await this.updateTotalLikesCount(input.likeGroup, likeRefIdObj, modifier);

		return modifier;
	}

	private async updateTotalLikesCount(likeGroup: LikeGroup, likeRefId: any, modifier: number): Promise<void> {
		try {
			// Recalculate from actual likes to ensure accuracy
			const actualCount = await this.getTotalLikesCount(likeGroup, likeRefId);
			console.log(`Updating total likes count for ${likeGroup}: ${actualCount}`);
			
			switch (likeGroup) {
				case LikeGroup.ORGANIZATION:
					const orgUpdate = await this.organizationModel.findByIdAndUpdate(likeRefId, {
						$set: { orgTotalLikes: actualCount },
					}, { new: true }).exec();
					console.log('Organization updated:', orgUpdate?._id?.toString(), 'orgTotalLikes:', orgUpdate?.orgTotalLikes);
					break;
				case LikeGroup.SERVICE_REQUEST:
					await this.serviceRequestModel.findByIdAndUpdate(likeRefId, {
						$set: { reqTotalLikes: actualCount },
					});
					break;
				case LikeGroup.QUOTE:
					await this.quoteModel.findByIdAndUpdate(likeRefId, {
						$set: { quoteTotalLikes: actualCount },
					});
					break;
				case LikeGroup.USER:
					await this.userModel.findByIdAndUpdate(likeRefId, {
						$set: { userTotalLikes: actualCount },
					});
					break;
			}
		} catch (err: any) {
			console.error('Error updating total likes count:', err.message);
			console.error('Error stack:', err.stack);
			// Don't throw error, just log it - the like was already toggled
		}
	}

	public async checkLikeExistence(input: LikeInput): Promise<MeLiked[]> {
		const userIdObj = shapeIntoMongoObjectId(input.userId);
		const likeRefIdObj = shapeIntoMongoObjectId(input.likeRefId);
		const result = await this.likeModel.findOne({ 
			userId: userIdObj, 
			likeRefId: likeRefIdObj 
		}).exec();
		return result ? [{ userId: userIdObj, likeRefId: likeRefIdObj, myFavorite: true }] : [];
	}

	public async getTotalLikesCount(likeGroup: LikeGroup, likeRefId: any): Promise<number> {
		const count = await this.likeModel.countDocuments({
			likeGroup: likeGroup,
			likeRefId: likeRefId,
		}).exec();
		return count;
	}
}
