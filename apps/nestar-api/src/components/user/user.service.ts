import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { User, Users, SignupResponse } from '../../libs/dto/user/user';
import { LoginInput, UserInput, UsersInquiry, SignupInput, ChangePasswordInput, UpdateProviderProfileInput } from '../../libs/dto/user/user.input';
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

	public async signup(input: SignupInput): Promise<SignupResponse> {
		// Map SignupInput to UserInput format
		// Default role to BUYER if not provided
		const userInput: UserInput = {
			userEmail: input.userEmail,
			userNick: input.userNick,
			userPassword: input.userPassword,
			userRole: input.userRole || UserRole.BUYER,
			userAuthType: UserAuthType.EMAIL,
		};

		// Check for duplicate email
		const existingEmail = await this.userModel.findOne({ userEmail: userInput.userEmail }).exec();
		if (existingEmail) {
			throw new BadRequestException('Email already registered. Please use a different email or login.');
		}

		// Check for duplicate user nick
		const existingNick = await this.userModel.findOne({ userNick: userInput.userNick }).exec();
		if (existingNick) {
			throw new BadRequestException('User nick already exists. Please use a different user nick.');
		}

		// Convert to signup data
		const signupData: any = { ...userInput };
		signupData.userPassword = await this.authService.hashPassword(userInput.userPassword);
		
		try {
			console.log('Creating user with data:', { userEmail: signupData.userEmail, userNick: signupData.userNick, userRole: signupData.userRole });
			const createdUser = await this.userModel.create(signupData);
			console.log('User created successfully:', createdUser._id);
			
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

			// If aggregation fails, fetch user directly as fallback
			let user;
			if (!fullUser.length) {
				console.warn('Aggregation returned empty, fetching user directly');
				const directUser = await this.userModel.findById(createdUser._id).exec();
				if (!directUser) {
				throw new InternalServerErrorException(Message.CREATE_FAILED);
			}
				user = directUser.toObject();
				user.userOrganization = null;
			} else {
				user = fullUser[0];
			}

			const accessToken = await this.authService.createUserToken(user);
			
			return {
				accessToken,
				user,
			};
		} catch (err) {
			console.log('Error, Service.model:', err.message);
			// If it's a validation error we already handled, re-throw it
			if (err instanceof BadRequestException) {
				throw err;
			}
			// Check for MongoDB duplicate key error
			if (err.code === 11000 || err.message?.includes('duplicate key')) {
				const field = err.keyPattern ? Object.keys(err.keyPattern)[0] : 'field';
				throw new BadRequestException(`${field} already exists. Please use a different value.`);
			}
			// Otherwise it might be a validation error from MongoDB schema
			if (err.message) {
				throw new BadRequestException(err.message);
			}
			// Fallback to generic error
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

	/**
	 * Changes user password after verifying current password.
	 * Security: Verifies current password before allowing change.
	 */
	public async changeMyPassword(userId: ObjectId, input: ChangePasswordInput): Promise<void> {
		const { currentPassword, newPassword } = input;

		// Get user with password field
		const userWithPassword = await this.userModel
			.findById(userId)
			.select('+userPassword')
			.exec();

		if (!userWithPassword || userWithPassword.userStatus !== UserStatus.ACTIVE) {
			throw new BadRequestException('User not found or inactive.');
		}

		// Verify current password
		const isMatch = await this.authService.comparePassword(
			currentPassword,
			userWithPassword.userPassword,
		);
		if (!isMatch) {
			throw new BadRequestException('Current password is incorrect.');
		}

		// Hash new password
		const hashedNewPassword = await this.authService.hashPassword(newPassword);

		// Update password
		await this.userModel
			.findByIdAndUpdate(userId, { userPassword: hashedNewPassword })
			.exec();
	}

	/**
	 * Update provider user profile.
	 * Only allows updating provider-specific user fields.
	 */
	public async updateProviderProfile(userId: ObjectId, input: UpdateProviderProfileInput): Promise<User> {
		const userIdObj = shapeIntoMongoObjectId(userId);

		// Verify user exists and is a PROVIDER
		const user = await this.userModel.findById(userIdObj).exec();
		if (!user) {
			throw new BadRequestException('User not found.');
		}
		if (user.userRole !== UserRole.PROVIDER) {
			throw new BadRequestException('Only PROVIDER users can update provider profiles.');
		}

		// Build update object with only provided fields
		const updateData: T = {};

		if (input.providerFullName !== undefined) {
			// Map providerFullName to userDescription
			updateData.userDescription = input.providerFullName;
		}
		if (input.providerDisplayName !== undefined) {
			// Check for duplicate userNick if display name is being changed
			if (input.providerDisplayName !== user.userNick) {
				const existingNick = await this.userModel
					.findOne({
						userNick: input.providerDisplayName,
						_id: { $ne: userIdObj },
					})
					.exec();
				if (existingNick) {
					throw new BadRequestException('Display name already exists. Please choose a different name.');
				}
			}
			updateData.userNick = input.providerDisplayName;
		}
		if (input.providerEmail !== undefined) {
			// Check for duplicate email if email is being changed
			if (input.providerEmail !== user.userEmail) {
				const existingEmail = await this.userModel
					.findOne({
						userEmail: input.providerEmail,
						_id: { $ne: userIdObj },
					})
					.exec();
				if (existingEmail) {
					throw new BadRequestException('Email already registered. Please use a different email.');
				}
			}
			updateData.userEmail = input.providerEmail;
		}
		if (input.providerPhone !== undefined) {
			// Check for duplicate phone if phone is being changed
			if (input.providerPhone !== user.userPhone) {
				const existingPhone = await this.userModel
					.findOne({
						userPhone: input.providerPhone,
						_id: { $ne: userIdObj },
					})
					.exec();
				if (existingPhone) {
					throw new BadRequestException('Phone number already registered. Please use a different phone number.');
				}
			}
			updateData.userPhone = input.providerPhone;
		}

		// If no fields to update, return the existing user
		if (Object.keys(updateData).length === 0) {
			return user;
		}

		const updatedUser = await this.userModel
			.findByIdAndUpdate(userIdObj, updateData, { new: true })
			.exec();

		if (!updatedUser) {
			throw new InternalServerErrorException(Message.UPDATE_FAILED);
		}

		return updatedUser;
	}

	/**
	 * Get current user's profile (for providers).
	 * Returns the authenticated user's profile data.
	 */
	public async getMyProfile(userId: ObjectId): Promise<User> {
		const userIdObj = shapeIntoMongoObjectId(userId);

		const user = await this.userModel.findById(userIdObj).exec();
		if (!user) {
			throw new BadRequestException('User not found.');
		}

		// Get actual counts from database
		const serviceRequestCount = await this.serviceRequestModel.countDocuments({
			reqCreatedByUserId: userIdObj,
		}).exec();

		const quoteCount = await this.quoteModel.countDocuments({
			quoteCreatedByUserId: userIdObj,
		}).exec();

		const orgCount = await this.organizationModel.countDocuments({
			orgOwnerUserId: userIdObj,
		}).exec();

		const result = await this.userModel
			.aggregate([
				{ $match: { _id: userIdObj } },
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
							{ $limit: 1 },
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

		if (!result.length) {
			throw new InternalServerErrorException(Message.NO_DATA_FOUND);
		}

		return result[0];
	}
}
