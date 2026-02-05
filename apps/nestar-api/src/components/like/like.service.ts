import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Like, MeLiked } from '../../libs/dto/like/like';
import { LikeInput } from '../../libs/dto/like/like.input';
import { T } from '../../libs/types/common';
import { Message } from '../../libs/enums/common.enum';
import { LikeGroup } from '../../libs/enums/like.enum';

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
		console.log('EXECUTED');
		const search: T = { userId: input.userId, likeRefId: input.likeRefId },
			exist = await this.likeModel.findOne(search).exec();
		let modifier = 1;

		if (exist) {
			await this.likeModel.findOneAndDelete(search).exec();
			modifier = -1;
		} else {
			try {
				await this.likeModel.create(input);
			} catch (err) {
				console.log('Error Service.model:', err.message);
				throw new BadRequestException(Message.CREATE_FAILED);
			}
		}
		console.log(`- Like modifier ${modifier} -`);

		// Auto-update total likes count based on likeGroup
		await this.updateTotalLikesCount(input.likeGroup, input.likeRefId, modifier);

		return modifier;
	}

	private async updateTotalLikesCount(likeGroup: LikeGroup, likeRefId: any, modifier: number): Promise<void> {
		try {
			// Recalculate from actual likes to ensure accuracy
			const actualCount = await this.getTotalLikesCount(likeGroup, likeRefId);
			
			switch (likeGroup) {
				case LikeGroup.ORGANIZATION:
					await this.organizationModel.findByIdAndUpdate(likeRefId, {
						$set: { orgTotalLikes: actualCount },
					});
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
		} catch (err) {
			console.log('Error updating total likes count:', err.message);
			// Don't throw error, just log it - the like was already toggled
		}
	}

	public async checkLikeExistence(input: LikeInput): Promise<MeLiked[]> {
		const { userId, likeRefId } = input;
		const result = await this.likeModel.findOne({ userId: userId, likeRefId: likeRefId }).exec();
		return result ? [{ userId: userId, likeRefId: likeRefId, myFavorite: true }] : [];
	}

	public async getTotalLikesCount(likeGroup: LikeGroup, likeRefId: any): Promise<number> {
		const count = await this.likeModel.countDocuments({
			likeGroup: likeGroup,
			likeRefId: likeRefId,
		}).exec();
		return count;
	}
}
