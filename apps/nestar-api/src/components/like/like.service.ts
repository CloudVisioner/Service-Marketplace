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
	) {}

	public async toggleLike(input: LikeInput): Promise<number> {
		// Only ORGANIZATION likes are allowed
		if (input.likeGroup !== LikeGroup.ORGANIZATION) {
			throw new BadRequestException('Only SERVICE_PROVIDER organizations can be liked.');
		}

		const userIdObj = shapeIntoMongoObjectId(input.userId);
		const likeRefIdObj = shapeIntoMongoObjectId(input.likeRefId);

		// Verify it's an organization and it's a SERVICE_PROVIDER
		const org = await this.organizationModel.findById(likeRefIdObj).exec();
		if (!org) {
			throw new BadRequestException('Organization not found.');
		}

		// Rule: Only SERVICE_PROVIDER organizations can be liked
		if (org.orgType !== 'SERVICE_PROVIDER') {
			throw new BadRequestException('Only SERVICE_PROVIDER organizations can be liked.');
		}

		const search: T = { userId: userIdObj, likeRefId: likeRefIdObj };
		
		const exist = await this.likeModel.findOne(search).exec();
		let modifier = 1;

		if (exist) {
			await this.likeModel.findOneAndDelete(search).exec();
			modifier = -1;
		} else {
			try {
				await this.likeModel.create({
					userId: userIdObj,
					likeRefId: likeRefIdObj,
					likeGroup: LikeGroup.ORGANIZATION,
				});
			} catch (err: any) {
				if (err.code === 11000) {
					const existing = await this.likeModel.findOne(search).exec();
					if (existing) {
						await this.likeModel.findByIdAndDelete(existing._id).exec();
						modifier = -1;
					}
				} else {
					throw new BadRequestException(err.message || Message.CREATE_FAILED);
				}
			}
		}

		await this.updateTotalLikesCount(LikeGroup.ORGANIZATION, likeRefIdObj, modifier);
		return modifier;
	}

	private async updateTotalLikesCount(likeGroup: LikeGroup, likeRefId: any, modifier: number): Promise<void> {
		try {
			const actualCount = await this.getTotalLikesCount(likeGroup, likeRefId);
			
			// Only ORGANIZATION likes are supported
			if (likeGroup === LikeGroup.ORGANIZATION) {
				await this.organizationModel.findByIdAndUpdate(likeRefId, {
					$set: { orgTotalLikes: actualCount },
				});
			}
		} catch (err) {
			// Don't throw error - the like was already toggled
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
