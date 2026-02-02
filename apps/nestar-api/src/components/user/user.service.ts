import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { User, Users } from '../../libs/dto/user/user';
import { LoginInput, UserInput, UsersInquiry } from '../../libs/dto/user/user.input';
import { UserStatus, UserRole } from '../../libs/enums/user.enum';
import { Direction, Message } from '../../libs/enums/common.enum';
import { AuthService } from '../auth/auth.service';
import { UserUpdate } from '../../libs/dto/user/user.update';
import { T } from '../../libs/types/common';
import { ViewService } from '../view/view.service';
import { ViewGroup } from '../../libs/enums/view.enum';
import { LikeInput } from '../../libs/dto/like/like.input';
import { LikeGroup } from '../../libs/enums/like.enum';
import { LikeService } from '../like/like.service';
import { MeFollowed } from '../../libs/dto/follow/follow';
import { lookupAuthUserLiked } from '../../libs/config';

@Injectable()
export class UserService {
	constructor(
		@InjectModel('User') private readonly userModel: Model<User>,
		@InjectModel('Follow') private readonly followModel: Model<any>,
		private authService: AuthService,
		private viewService: ViewService,
		private likeService: LikeService,
	) {}

	public async signup(input: UserInput): Promise<User> {
		input.userPassword = await this.authService.hashPassword(input.userPassword);
		try {
			const result = await this.userModel.create(input);
			result.accessToken = await this.authService.createUserToken(result);
			return result;
		} catch (err) {
			console.log('Error, Service.model:', err.message);
			throw new BadRequestException(Message.USED_USER_NICK_OR_EMAIL);
		}
	}

	public async login(input: LoginInput): Promise<User> {
		const { userNick, userPassword } = input;
		const response: User = await this.userModel
			.findOne({ userNick: userNick })
			.select('+userPassword')
			.exec();

		if (!response || response.userStatus === UserStatus.DELETE) {
			throw new InternalServerErrorException(Message.NO_USER_NICK);
		} else if (response.userStatus === UserStatus.BLOCK) {
			throw new InternalServerErrorException(Message.BLOCKED_USER);
		}

		const isMatch = await this.authService.comparePassword(userPassword, response.userPassword);
		if (!isMatch) throw new InternalServerErrorException(Message.WRONG_PASSWORD);

		response.accessToken = await this.authService.createUserToken(response);
		return response;
	}

	public async updateUser(userId: ObjectId, input: UserUpdate): Promise<User> {
		const result: User = await this.userModel
			.findOneAndUpdate(
				{
					_id: userId,
					userStatus: UserStatus.ACTIVE,
				},
				input,
				{ new: true },
			)
			.exec();
		if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);

		result.accessToken = await this.authService.createUserToken(result);
		return result;
	}

	public async getUser(userId: ObjectId, targetId: ObjectId): Promise<User> {
		const search: T = {
			_id: targetId,
			userStatus: {
				$in: [UserStatus.ACTIVE, UserStatus.BLOCK],
			},
		};
		const targetUser = await this.userModel.findOne(search).lean().exec();
		if (!targetUser) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		if (userId) {
			const viewInput = { userId: userId, viewRefId: targetId, viewGroup: ViewGroup.USER };
			const newView = await this.viewService.recordView(viewInput);
			if (newView) {
				// Note: User model doesn't have userViews field, so we skip increment
			}
			// meLiked
			const likeInput = { userId: userId, likeRefId: targetId, likeGroup: LikeGroup.USER };
			targetUser.meLiked = await this.likeService.checkLikeExistence(likeInput);

			targetUser.meFollowed = await this.checkSubscription(userId, targetId);
		}
		return targetUser;
	}

	private async checkSubscription(followerId: ObjectId, followingId: ObjectId): Promise<MeFollowed[]> {
		const result = await this.followModel.findOne({ followedOrgId: followingId, followerUserId: followerId }).exec();
		return result ? [{ followerUserId: followerId, followedOrgId: followingId, myFollowing: true }] : [];
	}

	public async likeTargetUser(userId: ObjectId, likeRefId: ObjectId): Promise<User> {
		const target: User = await this.userModel.findOne({ _id: likeRefId, userStatus: UserStatus.ACTIVE }).exec();
		if (!target) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		const input: LikeInput = {
			userId: userId,
			likeRefId: likeRefId,
			likeGroup: LikeGroup.USER,
		};

		await this.likeService.toggleLike(input);
		return target;
	}

	public async getAllUsersByAdmin(input: UsersInquiry): Promise<Users> {
		const { userStatus, userRole, text } = input.search;
		const match: T = {};
		const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC };

		if (userStatus) match.userStatus = userStatus;
		if (userRole) match.userRole = userRole;
		if (text) match.userNick = { $regex: new RegExp(text, 'i') };
		console.log('match:', match);

		const result = await this.userModel
			.aggregate([
				{ $match: match },
				{ $sort: sort },
				{
					$facet: {
						list: [{ $skip: (input.page - 1) * input.limit }, { $limit: input.limit }],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();
		if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		return result[0];
	}

	public async updateUserByAdmin(input: UserUpdate): Promise<User> {
		const result: User = await this.userModel.findOneAndUpdate({ _id: input._id }, input, { new: true }).exec();
		if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);
		return result;
	}
}
