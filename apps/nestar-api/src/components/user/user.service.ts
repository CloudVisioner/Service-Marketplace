import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { User, Users } from '../../libs/dto/user/user';
import { LoginInput, UserInput, UsersInquiry } from '../../libs/dto/user/user.input';
import { UserStatus, UserRole, UserAuthType } from '../../libs/enums/user.enum';
import { Direction, Message } from '../../libs/enums/common.enum';
import { AuthService } from '../auth/auth.service';
import { UserUpdate } from '../../libs/dto/user/user.update';
import { T } from '../../libs/types/common';
import { LikeService } from '../like/like.service';
import { shapeIntoMongoObjectId } from '../../libs/config';

@Injectable()
export class UserService {
	constructor(
		@InjectModel('User') private readonly userModel: Model<User>,
		@InjectModel('Follow') private readonly followModel: Model<any>,
		@InjectModel('ServiceRequest') private readonly serviceRequestModel: Model<any>,
		@InjectModel('Quote') private readonly quoteModel: Model<any>,
		@InjectModel('Organization') private readonly organizationModel: Model<any>,
		private authService: AuthService,
		private likeService: LikeService,
	) {}

	public async signup(input: UserInput): Promise<User> {
		// Validate that either email or phone is provided
		if (!input.userEmail && !input.userPhone) {
			throw new BadRequestException('Either email or phone number is required');
		}

		// Check for duplicate userNick
		const existingNick = await this.userModel.findOne({ userNick: input.userNick }).exec();
		if (existingNick) {
			throw new BadRequestException('Username already exists. Please choose a different username.');
		}

		// Check for duplicate email if provided
		if (input.userEmail) {
			const existingEmail = await this.userModel.findOne({ userEmail: input.userEmail }).exec();
			if (existingEmail) {
				throw new BadRequestException('Email already registered. Please use a different email or login.');
			}
		}

		// Check for duplicate phone if provided
		if (input.userPhone) {
			const existingPhone = await this.userModel.findOne({ userPhone: input.userPhone }).exec();
			if (existingPhone) {
				throw new BadRequestException('Phone number already registered. Please use a different phone or login.');
			}
		}

		// Set default auth type if not provided
		if (!input.userAuthType) {
			input.userAuthType = input.userEmail ? UserAuthType.EMAIL : UserAuthType.PHONE;
		}

		// Convert organizationId string to ObjectId if provided
		const signupData: any = { ...input };
		if (input.userOrganizationId) {
			signupData.userOrganizationId = shapeIntoMongoObjectId(input.userOrganizationId);
		}

		signupData.userPassword = await this.authService.hashPassword(input.userPassword);
		
		try {
			const createdUser = await this.userModel.create(signupData);
			
			// Fetch full user data with organization populated - using lean() to get plain object
			const fullUser = await this.userModel
				.aggregate([
					{ $match: { _id: createdUser._id } },
					{
						$lookup: {
							from: 'organizations',
							localField: 'userOrganizationId',
							foreignField: '_id',
							as: 'userOrganization',
						},
					},
					{
						$unwind: { path: '$userOrganization', preserveNullAndEmptyArrays: true },
					},
				])
				.exec();

			if (!fullUser.length) {
				throw new InternalServerErrorException(Message.CREATE_FAILED);
			}

			const result = fullUser[0];
			result.accessToken = await this.authService.createUserToken(result);
			return result;
		} catch (err) {
			console.log('Error, Service.model:', err.message);
			// If it's a validation error we already handled, re-throw it
			if (err instanceof BadRequestException) {
				throw err;
			}
			// Otherwise it might be a duplicate key error from MongoDB
			throw new BadRequestException(Message.USED_USER_NICK_OR_EMAIL);
		}
	}

	public async login(input: LoginInput): Promise<User> {
		const { userNick, userPassword } = input;
		
		// First find user with password to verify
		const userWithPassword = await this.userModel
			.findOne({ userNick: userNick })
			.select('+userPassword')
			.exec();

		if (!userWithPassword || userWithPassword.userStatus === UserStatus.DELETE) {
			throw new InternalServerErrorException(Message.NO_USER_NICK);
		} else if (userWithPassword.userStatus === UserStatus.BLOCK) {
			throw new InternalServerErrorException(Message.BLOCKED_USER);
		}

		const isMatch = await this.authService.comparePassword(userPassword, userWithPassword.userPassword);
		if (!isMatch) throw new InternalServerErrorException(Message.WRONG_PASSWORD);

		// Fetch full user data with organization populated
		const fullUser = await this.userModel
			.aggregate([
				{ $match: { _id: userWithPassword._id } },
				{
					$lookup: {
						from: 'organizations',
						localField: 'userOrganizationId',
						foreignField: '_id',
						as: 'userOrganization',
					},
				},
				{
					$unwind: { path: '$userOrganization', preserveNullAndEmptyArrays: true },
				},
			])
			.exec();

		if (!fullUser.length) {
			throw new InternalServerErrorException(Message.NO_USER_NICK);
		}

		const result = fullUser[0];
		result.accessToken = await this.authService.createUserToken(result);
		return result;
	}

	public async updateUser(userId: ObjectId, input: UserUpdate): Promise<User> {
		// Convert organizationId string to ObjectId if provided
		const updateData: any = { ...input };
		if (input.userOrganizationId) {
			updateData.userOrganizationId = shapeIntoMongoObjectId(input.userOrganizationId);
		}

		// Update the user
		await this.userModel
			.findOneAndUpdate(
				{
					_id: userId,
					userStatus: UserStatus.ACTIVE,
				},
				updateData,
				{ new: true },
			)
			.exec();
		
		// Fetch full user data with organization populated
		const fullUser = await this.userModel
			.aggregate([
				{ $match: { _id: userId, userStatus: UserStatus.ACTIVE } },
				{
					$lookup: {
						from: 'organizations',
						localField: 'userOrganizationId',
						foreignField: '_id',
						as: 'userOrganization',
					},
				},
				{
					$unwind: { path: '$userOrganization', preserveNullAndEmptyArrays: true },
				},
			])
			.exec();

		if (!fullUser.length) throw new InternalServerErrorException(Message.UPDATE_FAILED);

		const result = fullUser[0];
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

		// Get actual counts from database
		const serviceRequestCount = await this.serviceRequestModel.countDocuments({
			reqCreatedByUserId: targetId,
		}).exec();

		const quoteCount = await this.quoteModel.countDocuments({
			quoteCreatedByUserId: targetId,
		}).exec();

		const orgCount = await this.organizationModel.countDocuments({
			orgOwnerUserId: targetId,
		}).exec();

		const targetUser = await this.userModel
			.aggregate([
				{ $match: search },
				{
					$lookup: {
						from: 'organizations',
						let: { userId: '$_id' },
						pipeline: [
							{
								$match: {
									$expr: {
										$eq: ['$orgOwnerUserId', '$$userId'],
									},
								},
							},
							{ $limit: 1 }, // Get first organization owned by user
						],
						as: 'userOrganization',
					},
				},
				{
					$unwind: { path: '$userOrganization', preserveNullAndEmptyArrays: true },
				},
				{
					$addFields: {
						userTotalServiceRequests: serviceRequestCount || 0,
						userTotalQuotes: quoteCount || 0,
						userOrgCount: orgCount || 0,
					},
				},
			])
			.exec();

		if (!targetUser.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		const result = targetUser[0];

		// Users cannot be viewed, liked, or followed - removed
		return result;
	}

	// Removed: likeTargetUser - Users cannot be liked, only SERVICE_PROVIDER organizations can be liked
	// Removed: checkSubscription - Users cannot be followed, only organizations can be followed

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
						list: [
							{ $skip: (input.page - 1) * input.limit },
							{ $limit: input.limit },
							{
								$lookup: {
									from: 'serviceRequests',
									localField: '_id',
									foreignField: 'reqCreatedByUserId',
									as: 'serviceRequests',
								},
							},
							{
								$lookup: {
									from: 'quotes',
									localField: '_id',
									foreignField: 'quoteCreatedByUserId',
									as: 'quotes',
								},
							},
							{
								$lookup: {
									from: 'organizations',
									localField: '_id',
									foreignField: 'orgOwnerUserId',
									as: 'organizations',
								},
							},
							{
								$addFields: {
									userTotalServiceRequests: { $size: { $ifNull: ['$serviceRequests', []] } },
									userTotalQuotes: { $size: { $ifNull: ['$quotes', []] } },
									userOrgCount: { $size: { $ifNull: ['$organizations', []] } },
								},
							},
							{
								$project: {
									serviceRequests: 0,
									quotes: 0,
									organizations: 0,
								},
							},
						],
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
