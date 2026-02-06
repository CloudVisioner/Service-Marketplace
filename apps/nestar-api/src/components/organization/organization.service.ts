import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Organization, Organizations } from '../../libs/dto/organization/organization';
import { OrganizationInput, OrganizationInquiry } from '../../libs/dto/organization/organization.input';
import { Message } from '../../libs/enums/common.enum';
import { T } from '../../libs/types/common';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { LikeService } from '../like/like.service';
import { LikeInput } from '../../libs/dto/like/like.input';
import { LikeGroup } from '../../libs/enums/like.enum';
import { OrganizationStatus } from '../../libs/enums/organization.enum';
import { UserRole } from '../../libs/enums/user.enum';

@Injectable()
export class OrganizationService {
	constructor(
		@InjectModel('Organization') private organizationModel: Model<Organization>,
		@InjectModel('User') private userModel: Model<any>,
		private likeService: LikeService,
	) {}

	public async createOrganization(userId: ObjectId, input: OrganizationInput): Promise<Organization> {
		// Ensure userId is properly converted to ObjectId
		const userIdObj = shapeIntoMongoObjectId(userId);
		
		console.log('Creating organization - userId type:', typeof userId);
		console.log('Creating organization - userId value:', userId);
		console.log('Creating organization - userIdObj:', userIdObj?.toString());

		// Verify the user exists in the database
		const creator = await this.userModel.findById(userIdObj).exec();
		if (!creator) {
			console.error('User lookup failed - userId:', userIdObj?.toString());
			console.error('User lookup failed - userId type:', typeof userIdObj);
			// Try to find user by other means for debugging
			const allUsers = await this.userModel.find({ userRole: 'PROVIDER' }).limit(5).select('_id userNick userRole').exec();
			console.error('Available provider users:', allUsers.map(u => ({ id: u._id.toString(), nick: u.userNick })));
			throw new BadRequestException(`User not found in database. The authentication token contains user ID ${userIdObj?.toString()}, but this user does not exist. Please log out and log back in with the correct account.`);
		}

		console.log('User found:', creator._id.toString(), creator.userNick, creator.userRole);

		// Validate orgType matches user role
		// Rule: User.role = PROVIDER → owns SERVICE_PROVIDER org
		// Rule: User.role = BUYER → owns BUYER org
		// Rule: User.role = ADMIN → owns PLATFORM_ADMIN org
		if (creator.userRole === 'PROVIDER' && input.orgType !== 'SERVICE_PROVIDER') {
			throw new BadRequestException('PROVIDER users can only create SERVICE_PROVIDER organizations.');
		}
		if (creator.userRole === 'BUYER' && input.orgType !== 'BUYER') {
			throw new BadRequestException('BUYER users can only create BUYER organizations.');
		}
		if (creator.userRole === 'ADMIN' && input.orgType !== 'PLATFORM_ADMIN') {
			throw new BadRequestException('ADMIN users can only create PLATFORM_ADMIN organizations.');
		}

		// Check for duplicate organization name
		const existingName = await this.organizationModel.findOne({ orgName: input.orgName }).exec();
		if (existingName) {
			throw new BadRequestException('Organization with this name already exists. Please choose a different name.');
		}

		// Check for duplicate tax ID
		const existingTaxId = await this.organizationModel.findOne({ orgTaxId: input.orgTaxId }).exec();
		if (existingTaxId) {
			throw new BadRequestException('Organization with this tax ID already exists. Tax ID must be unique.');
		}

		// Check for duplicate website URL
		const existingWebsite = await this.organizationModel.findOne({ orgWebsiteUrl: input.orgWebsiteUrl }).exec();
		if (existingWebsite) {
			throw new BadRequestException('Organization with this website URL already exists. Website URL must be unique.');
		}

		try {
			// Remove orgOwnerUserId from input if it exists (it's set automatically from authenticated user)
			const { orgOwnerUserId, ...cleanInput } = input as any;
			
			const orgData = {
				...cleanInput,
				orgOwnerUserId: userIdObj, // Ensure we use the authenticated user's ID
			};

			console.log('Organization data with owner ID:', { ...orgData, orgOwnerUserId: userIdObj.toString() });

			const result = await this.organizationModel.create(orgData);

			// Increment userOrgCount for the creator
			await this.userModel.findByIdAndUpdate(
				userIdObj,
				{ $inc: { userOrgCount: 1 } },
				{ new: true }
			).exec();

			console.log('Organization created successfully. Owner ID:', result.orgOwnerUserId?.toString());

			return result;
		} catch (err) {
			console.log('Error, OrganizationService.createOrganization:', err.message);
			// Check for MongoDB duplicate key errors
			if (err.code === 11000) {
				const field = Object.keys(err.keyPattern)[0];
				if (field === 'orgName') {
					throw new BadRequestException('Organization with this name already exists.');
				} else if (field === 'orgTaxId') {
					throw new BadRequestException('Organization with this tax ID already exists.');
				} else if (field === 'orgWebsiteUrl') {
					throw new BadRequestException('Organization with this website URL already exists.');
				}
			}
			throw new BadRequestException(err.message || Message.CREATE_FAILED);
		}
	}

	public async getOrganization(orgId: ObjectId, userId?: ObjectId | null): Promise<Organization> {
		const orgIdObj = shapeIntoMongoObjectId(orgId);

		const result = await this.organizationModel
			.aggregate([
				{ $match: { _id: orgIdObj } },
				{
					$lookup: {
						from: 'users',
						localField: 'orgOwnerUserId',
						foreignField: '_id',
						as: 'orgOwnerData',
					},
				},
				{
					$unwind: { path: '$orgOwnerData', preserveNullAndEmptyArrays: true },
				},
			])
			.exec();

		if (!result.length) {
			throw new InternalServerErrorException(Message.NO_DATA_FOUND);
		}

		const org = result[0];

		// Populate meLiked if user is authenticated
		if (userId) {
			const likeInput: LikeInput = {
				userId: userId,
				likeRefId: orgIdObj,
				likeGroup: LikeGroup.ORGANIZATION,
			};
			org.meLiked = await this.likeService.checkLikeExistence(likeInput);
		}

		return org;
	}

	public async getOrganizations(input: OrganizationInquiry): Promise<Organizations> {
		const match: T = {};

		if (input.text) {
			match.$or = [
				{ orgName: { $regex: input.text, $options: 'i' } },
				{ orgDescription: { $regex: input.text, $options: 'i' } },
				{ orgCountry: { $regex: input.text, $options: 'i' } },
				{ orgCity: { $regex: input.text, $options: 'i' } },
			];
		}

		const sort: T = { [input?.sort ?? 'createdAt']: -1 };

		const result = await this.organizationModel
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
									from: 'users',
									localField: 'orgOwnerUserId',
									foreignField: '_id',
									as: 'orgOwnerData',
								},
							},
							{
								$unwind: { path: '$orgOwnerData', preserveNullAndEmptyArrays: true },
							},
						],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();

		if (!result.length) {
			return { list: [], metaCounter: [{ total: 0 }] };
		}

		return result[0];
	}

	public async getMyOrganizations(userId: ObjectId): Promise<Organization[]> {
		const result = await this.organizationModel
			.find({
				orgOwnerUserId: userId,
			})
			.sort({ createdAt: -1 })
			.exec();

		return result;
	}

	public async updateOrganization(orgId: ObjectId, userId: ObjectId, userRole: string, input: any): Promise<Organization> {
		const orgIdObj = shapeIntoMongoObjectId(orgId);
		const userIdObj = shapeIntoMongoObjectId(userId);

		// First, check if the organization exists
		const org = await this.organizationModel.findById(orgIdObj).exec();

		if (!org) {
			throw new BadRequestException('Organization does not exist.');
		}

		// Check if user is admin OR the organization creator/owner
		const orgOwnerId = shapeIntoMongoObjectId(org.orgOwnerUserId);
		const isAdmin = userRole === UserRole.ADMIN;
		const isOwner = orgOwnerId.equals(userIdObj);

		if (!isAdmin && !isOwner) {
			throw new BadRequestException('Only the organization creator or admin can update this organization.');
		}

		// Remove _id and orgOwnerUserId from input to prevent modification
		const { _id, orgOwnerUserId, ...updateData } = input as any;

		// If orgType is being updated, validate it matches user role
		if (updateData.orgType) {
			const user = await this.userModel.findById(userIdObj).exec();
			if (user) {
				// Rule: User.role = PROVIDER → owns SERVICE_PROVIDER org
				// Rule: User.role = BUYER → owns BUYER org
				// Rule: User.role = ADMIN → owns PLATFORM_ADMIN org
				if (user.userRole === 'PROVIDER' && updateData.orgType !== 'SERVICE_PROVIDER') {
					throw new BadRequestException('PROVIDER users can only have SERVICE_PROVIDER organizations.');
				}
				if (user.userRole === 'BUYER' && updateData.orgType !== 'BUYER') {
					throw new BadRequestException('BUYER users can only have BUYER organizations.');
				}
				if (user.userRole === 'ADMIN' && updateData.orgType !== 'PLATFORM_ADMIN') {
					throw new BadRequestException('ADMIN users can only have PLATFORM_ADMIN organizations.');
				}
			}
		}

		// Prevent updating unique fields if they conflict with existing organizations
		if (updateData.orgName && updateData.orgName !== org.orgName) {
			const existingName = await this.organizationModel
				.findOne({ orgName: updateData.orgName, _id: { $ne: orgIdObj } })
				.exec();
			if (existingName) {
				throw new BadRequestException('Organization with this name already exists. Please choose a different name.');
			}
		}

		if (updateData.orgTaxId && updateData.orgTaxId !== org.orgTaxId) {
			const existingTaxId = await this.organizationModel
				.findOne({ orgTaxId: updateData.orgTaxId, _id: { $ne: orgIdObj } })
				.exec();
			if (existingTaxId) {
				throw new BadRequestException('Organization with this tax ID already exists. Tax ID must be unique.');
			}
		}

		if (updateData.orgWebsiteUrl && updateData.orgWebsiteUrl !== org.orgWebsiteUrl) {
			const existingWebsite = await this.organizationModel
				.findOne({ orgWebsiteUrl: updateData.orgWebsiteUrl, _id: { $ne: orgIdObj } })
				.exec();
			if (existingWebsite) {
				throw new BadRequestException('Organization with this website URL already exists. Website URL must be unique.');
			}
		}

		const result = await this.organizationModel
			.findByIdAndUpdate(orgIdObj, updateData, {
				new: true,
			})
			.exec();

		if (!result) {
			throw new InternalServerErrorException(Message.UPDATE_FAILED);
		}

		return result;
	}

	public async likeTargetOrganization(userId: ObjectId, orgId: ObjectId): Promise<Organization> {
		const orgIdObj = shapeIntoMongoObjectId(orgId);
		const userIdObj = shapeIntoMongoObjectId(userId);

		// First check if organization exists and is active
		const orgCheck = await this.organizationModel
			.findOne({ _id: orgIdObj, orgStatus: OrganizationStatus.ACTIVE })
			.lean()
			.exec();
		if (!orgCheck) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		// Rule: Only SERVICE_PROVIDER orgs can be liked
		if (orgCheck.orgType !== 'SERVICE_PROVIDER') {
			throw new BadRequestException('Only SERVICE_PROVIDER organizations can be liked.');
		}

		const input: LikeInput = {
			userId: userIdObj,
			likeRefId: orgIdObj,
			likeGroup: LikeGroup.ORGANIZATION,
		};

		// Toggle the like (this updates orgTotalLikes in the database)
		await this.likeService.toggleLike(input);

		// Re-fetch the organization AFTER toggling to get updated orgTotalLikes count
		const result = await this.organizationModel
			.aggregate([
				{ $match: { _id: orgIdObj, orgStatus: OrganizationStatus.ACTIVE } },
				{
					$lookup: {
						from: 'users',
						localField: 'orgOwnerUserId',
						foreignField: '_id',
						as: 'orgOwnerData',
					},
				},
				{
					$unwind: { path: '$orgOwnerData', preserveNullAndEmptyArrays: true },
				},
			])
			.exec();

		if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		const org = result[0];

		// Populate meLiked to show if current user liked this organization
		org.meLiked = await this.likeService.checkLikeExistence(input);

		return org;
	}
}
