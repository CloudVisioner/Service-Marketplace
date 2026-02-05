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

	public async updateOrganization(orgId: ObjectId, userId: ObjectId, input: any): Promise<Organization> {
		const orgIdObj = shapeIntoMongoObjectId(orgId);

		// Verify user owns the organization
		const org = await this.organizationModel
			.findOne({
				_id: orgIdObj,
				orgOwnerUserId: userId,
			})
			.exec();

		if (!org) {
			throw new BadRequestException('Organization not found or you are not the owner');
		}

		const result = await this.organizationModel
			.findByIdAndUpdate(orgIdObj, input, {
				new: true,
			})
			.exec();

		if (!result) {
			throw new InternalServerErrorException(Message.UPDATE_FAILED);
		}

		return result;
	}

	public async likeTargetOrganization(userId: ObjectId, orgId: ObjectId): Promise<Organization> {
		const org: Organization = await this.organizationModel
			.findOne({ _id: orgId, orgStatus: OrganizationStatus.ACTIVE })
			.lean()
			.exec();
		if (!org) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		const input: LikeInput = {
			userId: userId,
			likeRefId: orgId,
			likeGroup: LikeGroup.ORGANIZATION,
		};

		await this.likeService.toggleLike(input);

		// Populate meLiked to show if current user liked this organization
		org.meLiked = await this.likeService.checkLikeExistence(input);

		return org;
	}
}
