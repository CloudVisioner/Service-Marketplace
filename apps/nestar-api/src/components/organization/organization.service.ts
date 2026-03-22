import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Organization, Organizations } from '../../libs/dto/organization/organization';
import { BuyerOrganizationInput, OrganizationInput, OrganizationInquiry, ProviderCategoryInput, ProviderOrganizationInput, ProviderSortInput, UpdateProviderOrganizationInput } from '../../libs/dto/organization/organization.input';
import { OrganizationUpdate } from '../../libs/dto/organization/organization.update';
import { Message } from '../../libs/enums/common.enum';
import { T } from '../../libs/types/common';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { LikeService } from '../like/like.service';
import { LikeInput } from '../../libs/dto/like/like.input';
import { LikeGroup } from '../../libs/enums/like.enum';
import { OrganizationStatus, OrganizationType } from '../../libs/enums/organization.enum';
import { UserRole } from '../../libs/enums/user.enum';

@Injectable()
export class OrganizationService {
	constructor(
		@InjectModel('Organization') private organizationModel: Model<Organization>,
		@InjectModel('User') private userModel: Model<any>,
		@InjectModel('Rating') private ratingModel: Model<any>,
		private likeService: LikeService,
	) {}

	/**
	 * Helper method to safely get orgType from organization object
	 * Handles both Document and plain object types from MongoDB
	 * @param org - Organization document or plain object
	 * @returns OrganizationType or undefined
	 */
	private getOrgType(org: any): OrganizationType | undefined {
		// orgType is the database field name, but TypeScript types use organizationType
		// This helper safely accesses the actual DB field
		return org?.orgType as OrganizationType | undefined;
	}

	/** Drop Mongo operator keys so we never produce `{ field: x, $set: { field: x } }`-style updates. */
	private stripMongoOperatorKeys(obj: Record<string, unknown>): Record<string, unknown> {
		const out: Record<string, unknown> = {};
		for (const key of Object.keys(obj)) {
			if (!key.startsWith('$')) {
				out[key] = obj[key];
			}
		}
		return out;
	}

	/** Same field must not appear in both $set and $unset (Mongo path conflict). */
	private unsetWithoutSetOverlap(
		setDoc: Record<string, unknown>,
		unsetDoc: Record<string, string>,
	): Record<string, string> {
		const setKeys = new Set(Object.keys(setDoc));
		return Object.fromEntries(Object.entries(unsetDoc).filter(([k]) => !setKeys.has(k)));
	}

	/**
	 * Normalizes all array fields on an organization document.
	 * Ensures every field that GraphQL declares as [Type] is always a proper array,
	 * never null/undefined. This prevents "Cannot iterate over null" GraphQL errors
	 * that occur when MongoDB aggregation bypasses Mongoose defaults.
	 */
	private normalizeOrganizationFields(org: any): any {
		if (!org) return org;

		// Map old field names to new field names (for backward compatibility with old records)
		if (!org.organizationName && org.orgName) {
			org.organizationName = org.orgName;
		}
		if (!org.organizationIndustry && org.orgIndustry) {
			org.organizationIndustry = org.orgIndustry;
		}
		if (!org.organizationLocation && org.location) {
			org.organizationLocation = org.location;
		}
		if (!org.organizationDescription && org.orgDescription) {
			org.organizationDescription = org.orgDescription;
		}
		if (!org.organizationWebsiteUrl && org.orgWebsiteUrl) {
			org.organizationWebsiteUrl = org.orgWebsiteUrl;
		}
		// Map orgLogoImages (array) to organizationImage (string) - take first image if array exists
		if (!org.organizationImage && org.orgLogoImages) {
			if (Array.isArray(org.orgLogoImages) && org.orgLogoImages.length > 0) {
				org.organizationImage = org.orgLogoImages[0]; // Take first image as string
			} else if (typeof org.orgLogoImages === 'string') {
				org.organizationImage = org.orgLogoImages; // Already a string
			}
		}
		if (!org.organizationTeamSize && org.orgTeamSize !== undefined) {
			org.organizationTeamSize = org.orgTeamSize;
		}
		if (!org.organizationSpecialties && org.orgSpecialities) {
			org.organizationSpecialties = org.orgSpecialities;
		}
		if (!org.organizationHourlyRate && org.startingRate !== undefined) {
			org.organizationHourlyRate = org.startingRate;
		}
		if (!org.organizationEmail && org.email) {
			org.organizationEmail = org.email;
		}
		if (!org.organizationPhoneNumber && org.phone) {
			org.organizationPhoneNumber = org.phone;
		}

		// --- Non-nullable array fields (GraphQL schema: [String]!) ---
		// These MUST always be an array; GraphQL will error on null.
		const requiredArrayFields = ['orgSkills']; // organizationImage is now a string, not an array
		for (const field of requiredArrayFields) {
			if (!Array.isArray(org[field])) {
				org[field] = typeof org[field] === 'string' ? [org[field]] : [];
			}
		}

		// --- Nullable array fields (GraphQL schema: [Type] with nullable: true) ---
		// These should be a proper array or null, but never a bare string / number.
		const nullableArrayFields = ['categoryId', 'subCategory', 'industries', 'badges', 'organizationSpecialties'];
		for (const field of nullableArrayFields) {
			if (org[field] !== undefined && org[field] !== null) {
				if (typeof org[field] === 'string') {
					org[field] = [org[field]];
				} else if (!Array.isArray(org[field])) {
					org[field] = [];
				}
			} else {
				// Ensure null rather than undefined (GraphQL handles null fine for nullable fields)
				org[field] = org[field] ?? [];
			}
		}

		// Map organizationEmail to organizationContactEmail for frontend compatibility
		if (org.organizationEmail !== undefined) {
			org.organizationContactEmail = org.organizationEmail;
		}

		// Map orgType to organizationType for frontend compatibility
		if (org.orgType !== undefined && org.orgType !== null) {
			org.organizationType = org.orgType;
		} else if (org.organizationType === undefined) {
			// If neither orgType nor organizationType exists, set to null (GraphQL field is nullable)
			org.organizationType = null;
		}

		// Map orgStatus to organizationStatus for frontend compatibility
		if (org.orgStatus !== undefined && org.orgStatus !== null) {
			org.organizationStatus = org.orgStatus;
		} else if (org.organizationStatus === undefined) {
			// If neither orgStatus nor organizationStatus exists, set to null (GraphQL field is nullable)
			org.organizationStatus = null;
		}

		// Map orgCountry to organizationCountry for frontend compatibility
		if (org.orgCountry !== undefined) {
			org.organizationCountry = org.orgCountry;
		}
		// Also set orgCountry alias for backward compatibility
		if (org.organizationCountry !== undefined && org.orgCountry === undefined) {
			org.orgCountry = org.organizationCountry;
		}

		// Buyer "Location" field: keep organizationLocation and organizationCountry in sync for clients that only send/read one
		const loc = org.organizationLocation;
		const ctry = org.organizationCountry;
		const locEmpty = loc === undefined || loc === null || String(loc).trim() === '';
		const ctryEmpty = ctry === undefined || ctry === null || String(ctry).trim() === '';
		if (locEmpty && !ctryEmpty) {
			org.organizationLocation = String(ctry).trim();
		}
		if (ctryEmpty && !locEmpty) {
			org.organizationCountry = String(loc).trim();
		}

		// Ensure required non-nullable fields have values (for old records)
		if (!org.organizationName) {
			org.organizationName = org.orgName || '';
		}

		// Ensure non-nullable numeric fields have default values (prevent null errors)
		if (org.orgTotalProjects === undefined || org.orgTotalProjects === null) {
			org.orgTotalProjects = 0;
		} else {
			org.orgTotalProjects = typeof org.orgTotalProjects === 'number' ? org.orgTotalProjects : 0;
		}

		if (org.orgResponseTimeAvg === undefined || org.orgResponseTimeAvg === null) {
			org.orgResponseTimeAvg = 0;
		} else {
			org.orgResponseTimeAvg = typeof org.orgResponseTimeAvg === 'number' ? org.orgResponseTimeAvg : 0;
		}

		if (org.orgVerified === undefined || org.orgVerified === null) {
			org.orgVerified = false;
		}

		// Handle nullable rating/likes/views fields - ensure they're numbers or null
		if (org.orgAverageRating === undefined || org.orgAverageRating === null) {
			org.orgAverageRating = null;
		} else {
			org.orgAverageRating = typeof org.orgAverageRating === 'number' ? org.orgAverageRating : 0;
		}

		// Handle totalRatingValue
		if (org.totalRatingValue === undefined || org.totalRatingValue === null) {
			org.totalRatingValue = 0;
		} else {
			org.totalRatingValue = typeof org.totalRatingValue === 'number' ? org.totalRatingValue : 0;
		}

		if (org.orgTotalLikes === undefined || org.orgTotalLikes === null) {
			org.orgTotalLikes = null;
		} else {
			org.orgTotalLikes = typeof org.orgTotalLikes === 'number' ? org.orgTotalLikes : 0;
		}

		if (org.orgTotalViews === undefined || org.orgTotalViews === null) {
			org.orgTotalViews = null;
		} else {
			org.orgTotalViews = typeof org.orgTotalViews === 'number' ? org.orgTotalViews : 0;
		}

		return org;
	}

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
		const existingName = await this.organizationModel.findOne({ organizationName: input.organizationName }).exec();
		if (existingName) {
			throw new BadRequestException('Organization with this name already exists. Please choose a different name.');
		}

		// Check for duplicate tax ID (only if provided)
		if (input.orgTaxId) {
		const existingTaxId = await this.organizationModel.findOne({ orgTaxId: input.orgTaxId }).exec();
		if (existingTaxId) {
			throw new BadRequestException('Organization with this tax ID already exists. Tax ID must be unique.');
			}
		}

		// Check for duplicate website URL (only if provided)
		if (input.organizationWebsiteUrl) {
		const existingWebsite = await this.organizationModel.findOne({ organizationWebsiteUrl: input.organizationWebsiteUrl }).exec();
		if (existingWebsite) {
			throw new BadRequestException('Organization with this website URL already exists. Website URL must be unique.');
			}
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

			// Normalize subCategory to array
			return this.normalizeOrganizationFields(result.toObject());
		} catch (err) {
			console.log('Error, OrganizationService.createOrganization:', err.message);
			// Check for MongoDB duplicate key errors
			if (err.code === 11000) {
				const field = Object.keys(err.keyPattern)[0];
				if (field === 'organizationName') {
					throw new BadRequestException('Organization with this name already exists.');
				} else if (field === 'orgTaxId') {
					throw new BadRequestException('Organization with this tax ID already exists.');
				} else if (field === 'organizationWebsiteUrl') {
					throw new BadRequestException('Organization with this website URL already exists.');
				}
			}
			throw new BadRequestException(err.message || Message.CREATE_FAILED);
		}
	}

	public async getOrganization(orgId: ObjectId, userId?: ObjectId | null, userRole?: string): Promise<Organization> {
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

		// Check access level: Admin gets full access, Owner gets full access, Others get public data only
		const userIdObj = userId ? shapeIntoMongoObjectId(userId) : null;
		const orgOwnerId = shapeIntoMongoObjectId(org.orgOwnerUserId);
		const isAdmin = userRole === UserRole.ADMIN;
		const isOwner = userIdObj && orgOwnerId.equals(userIdObj);

		// If user is not admin and not owner, hide sensitive fields
		if (!isAdmin && !isOwner) {
			// Hide sensitive fields for public access
			org.orgTaxId = null;
			org.deletedAt = null;
		}

		// Populate meLiked if user is authenticated
		if (userId) {
			const likeInput: LikeInput = {
				userId: userId,
				likeRefId: orgIdObj,
				likeGroup: LikeGroup.ORGANIZATION,
			};
			org.meLiked = await this.likeService.checkLikeExistence(likeInput);
		}

		// Normalize subCategory to array
		return this.normalizeOrganizationFields(org);
	}

	public async getOrganizations(input: OrganizationInquiry): Promise<Organizations> {
		const match: T = {};

		if (input.text) {
			match.$or = [
				{ organizationName: { $regex: input.text, $options: 'i' } },
				{ organizationDescription: { $regex: input.text, $options: 'i' } },
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

		const organizations = result[0];
		// Normalize subCategory for each organization in the list
		if (organizations.list) {
			organizations.list = organizations.list.map((org: any) => this.normalizeOrganizationFields(org));
		}

		return organizations;
	}

	public async getMyOrganizations(userId: ObjectId): Promise<Organization[]> {
		const result = await this.organizationModel
			.find({
				orgOwnerUserId: userId,
			})
			.sort({ createdAt: -1 })
			.exec();

		// Normalize subCategory for each organization
		return result.map((org: any) => this.normalizeOrganizationFields(org));
	}

	public async updateOrganization(userId: ObjectId, userRole: string, input: OrganizationUpdate): Promise<Organization> {
		if (!input.orgId) {
			throw new BadRequestException('Organization ID is required.');
		}

		const orgIdObj = shapeIntoMongoObjectId(input.orgId);
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

		// Remove orgId and orgOwnerUserId from input to prevent modification
		const { orgId, orgOwnerUserId, organizationContactEmail, organizationImage, ...updateData } = input as any;
		
		// Map organizationContactEmail to organizationEmail for database
		if (organizationContactEmail !== undefined) {
			updateData.organizationEmail = organizationContactEmail;
		}

		// Handle organizationImage: convert array to string if frontend sends array
		if (organizationImage !== undefined) {
			if (Array.isArray(organizationImage)) {
				// Frontend sent array, take first element
				updateData.organizationImage = organizationImage.length > 0 ? organizationImage[0] : null;
			} else if (typeof organizationImage === 'string') {
				// Frontend sent string (correct format)
				updateData.organizationImage = organizationImage;
			} else {
				// Invalid type, set to null
				updateData.organizationImage = null;
			}
		}

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
		if (updateData.organizationName && updateData.organizationName !== org.organizationName) {
			const existingName = await this.organizationModel
				.findOne({ organizationName: updateData.organizationName, _id: { $ne: orgIdObj } })
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

		if (updateData.organizationWebsiteUrl && updateData.organizationWebsiteUrl !== org.organizationWebsiteUrl) {
			const existingWebsite = await this.organizationModel
				.findOne({ organizationWebsiteUrl: updateData.organizationWebsiteUrl, _id: { $ne: orgIdObj } })
				.exec();
			if (existingWebsite) {
				throw new BadRequestException('Organization with this website URL already exists. Website URL must be unique.');
			}
		}

		const cleanedUpdate = this.stripMongoOperatorKeys(updateData as Record<string, unknown>);

		const result = await this.organizationModel
			.findByIdAndUpdate(orgIdObj, cleanedUpdate, {
				new: true,
			})
			.exec();

		if (!result) {
			throw new InternalServerErrorException(Message.UPDATE_FAILED);
		}

		// Normalize subCategory to array
		return this.normalizeOrganizationFields(result.toObject());
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
		const orgType = this.getOrgType(orgCheck);
		if (orgType !== OrganizationType.SERVICE_PROVIDER) {
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

		// Normalize subCategory to array
		return this.normalizeOrganizationFields(org);
	}

	// 1. Get Providers By Category
	public async getProvidersByCategory(input: ProviderCategoryInput): Promise<Organizations> {
		const page = input.page || 1;
		const limit = input.limit || 10;
		const skip = (page - 1) * limit;

		const match: T = {
			orgType: 'SERVICE_PROVIDER',
			orgStatus: OrganizationStatus.ACTIVE,
			categoryId: input.categoryId,
			deletedAt: null,
		};

		if (input.subCategory) {
			match.subCategory = input.subCategory;
		}

		if (input.location) {
			match.$or = [
				{ orgCountry: { $regex: input.location, $options: 'i' } },
				{ orgCity: { $regex: input.location, $options: 'i' } },
				{ organizationLocation: { $regex: input.location, $options: 'i' } },
			];
		}

		if (input.minBudget !== undefined || input.maxBudget !== undefined) {
			match.organizationHourlyRate = {};
			if (input.minBudget !== undefined) {
				match.organizationHourlyRate.$gte = input.minBudget;
			}
			if (input.maxBudget !== undefined) {
				match.organizationHourlyRate.$lte = input.maxBudget;
			}
		}

		const result = await this.organizationModel.aggregate([
			{ $match: match },
			{
				$facet: {
					list: [
						{ $sort: { orgAverageRating: -1, orgTotalProjects: -1 } },
						{ $skip: skip },
						{ $limit: limit },
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
		]).exec();

		if (!result.length) {
			return { list: [], metaCounter: [{ total: 0 }] };
		}

		const organizations = result[0];
		// Normalize subCategory for each organization in the list
		if (organizations.list) {
			organizations.list = organizations.list.map((org: any) => this.normalizeOrganizationFields(org));
		}

		return organizations;
	}

	// 2. Get Provider Detail
	public async getProviderDetail(orgId: ObjectId, userId?: ObjectId | null): Promise<Organization> {
		const orgIdObj = shapeIntoMongoObjectId(orgId);

		const result = await this.organizationModel
			.aggregate([
				{ $match: { _id: orgIdObj, orgType: 'SERVICE_PROVIDER', orgStatus: OrganizationStatus.ACTIVE } },
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
			throw new BadRequestException('Provider not found.');
		}

		const org = result[0];

		// Only show contact info (email, phone) if user is logged in
		if (!userId) {
			org.organizationEmail = null;
			org.organizationPhoneNumber = null;
			org.myRating = null;
		} else {
			// Get user's rating for this organization
			const userRating = await this.ratingModel.findOne({
				userId: shapeIntoMongoObjectId(userId),
				orgId: orgIdObj,
			}).exec();
			org.myRating = userRating ? userRating.rating : null;
		}

		// Normalize subCategory to array
		return this.normalizeOrganizationFields(org);
	}

	// 3. Get Providers Sorted
	public async getProvidersSorted(input: ProviderSortInput): Promise<Organizations> {
		const page = input.page || 1;
		const limit = input.limit || 10;
		const skip = (page - 1) * limit;

		const match: T = {
			orgType: 'SERVICE_PROVIDER',
			orgStatus: OrganizationStatus.ACTIVE,
			deletedAt: null,
		};

		if (input.categoryId) {
			match.categoryId = input.categoryId;
		}

		if (input.subCategory) {
			match.subCategory = input.subCategory;
		}

		if (input.location) {
			match.$or = [
				{ orgCountry: { $regex: input.location, $options: 'i' } },
				{ orgCity: { $regex: input.location, $options: 'i' } },
				{ organizationLocation: { $regex: input.location, $options: 'i' } },
			];
		}

		if (input.searchQuery) {
			match.$text = { $search: input.searchQuery };
		}

		if (input.minBudget !== undefined || input.maxBudget !== undefined) {
			match.organizationHourlyRate = {};
			if (input.minBudget !== undefined) {
				match.organizationHourlyRate.$gte = input.minBudget;
			}
			if (input.maxBudget !== undefined) {
				match.organizationHourlyRate.$lte = input.maxBudget;
			}
		}

		// Determine sort order
		let sortOrder: T = {};
		switch (input.sortBy) {
			case 'rating':
				sortOrder = { orgAverageRating: -1, reviewsCount: -1 };
				break;
			case 'projects':
				sortOrder = { orgTotalProjects: -1 };
				break;
			case 'responseTime':
				sortOrder = { orgResponseTimeAvg: 1 };
				break;
			case 'startingRate':
				sortOrder = { organizationHourlyRate: 1 };
				break;
			default:
				sortOrder = { orgAverageRating: -1 };
		}

		const result = await this.organizationModel.aggregate([
			{ $match: match },
			{
				$facet: {
					list: [
						{ $sort: sortOrder },
						{ $skip: skip },
						{ $limit: limit },
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
		]).exec();

		if (!result.length) {
			return { list: [], metaCounter: [{ total: 0 }] };
		}

		const organizations = result[0];
		// Normalize subCategory for each organization in the list
		if (organizations.list) {
			organizations.list = organizations.list.map((org: any) => this.normalizeOrganizationFields(org));
		}

		return organizations;
	}

	// =========================================================================
	// BUYER-SPECIFIC ORGANIZATION APIS
	// =========================================================================

	/**
	 * Creates or updates a BUYER organization.
	 * - If the user already has a BUYER org, updates it.
	 * - If not, creates a new BUYER org.
	 * - Auto-sets orgType=BUYER and orgStatus=ACTIVE.
	 */
	public async createOrUpdateBuyerOrganization(
		userId: ObjectId,
		input: BuyerOrganizationInput,
	): Promise<Organization> {
		const userIdObj = shapeIntoMongoObjectId(userId);

		// Strip out fields that shouldn't be in the input (set by backend)
		const cleanInput = { ...input } as any;
		delete cleanInput.deletedAt;
		delete cleanInput.updatedAt;
		delete cleanInput.orgOwnerUserId;
		delete cleanInput.createdAt;

		// Verify the user exists and is a BUYER
		const user = await this.userModel.findById(userIdObj).exec();
		if (!user) {
			throw new BadRequestException('User not found.');
		}
		if (user.userRole !== 'BUYER') {
			throw new BadRequestException('Only BUYER users can use this endpoint.');
		}

		const trimStr = (v: unknown) => (typeof v === 'string' ? v.trim() : '');
		const hasBuyerLocation =
			cleanInput.organizationLocation !== undefined && trimStr(cleanInput.organizationLocation) !== '';
		const hasBuyerCountry =
			cleanInput.organizationCountry !== undefined && trimStr(cleanInput.organizationCountry) !== '';

		// Fields to explicitly unset for buyer organizations (provider-specific fields)
		// These fields should NOT exist in buyer organizations
		const fieldsToUnset = [
			'orgTotalProjects',
			'orgResponseTimeAvg',
			'orgVerified',
			'orgSkills',
			'orgAverageRating',
			'orgTotalLikes',
			'orgTotalViews',
			// organizationImage: do not unset — buyer orgs persist a logo URL; $unset + $set caused Mongo path conflicts
			'categoryId',
			'subCategory',
			'organizationHourlyRate',
			'organizationTeamSize',
			'organizationSpecialties',
			'industries',
			'minProjectSize',
			'badges',
			'reviewsCount',
			'organizationWebsiteUrl',
			'organizationEmail',
			'organizationPhoneNumber',
			// orgCountry: do not unset — buyers may set organizationCountry / orgCountry
			'orgCity',
			'orgTaxId',
			'serviceTitle',
			'establishmentYear',
			'bio',
			'avatar',
			'color',
			'flag',
			'socialLinks',
		];

		// Check if the user already has a BUYER organization
		const existingOrg = await this.organizationModel
			.findOne({ orgOwnerUserId: userIdObj, orgType: 'BUYER' })
			.exec();

		if (existingOrg) {
			// UPDATE existing buyer organization - only buyer-relevant fields
			const updateData: any = {};
			if (cleanInput.organizationName) updateData.organizationName = cleanInput.organizationName;
			if (cleanInput.organizationIndustry !== undefined) updateData.organizationIndustry = cleanInput.organizationIndustry;
			if (cleanInput.organizationLocation !== undefined) {
				updateData.organizationLocation = cleanInput.organizationLocation;
			}
			if (cleanInput.organizationCountry !== undefined) {
				updateData.orgCountry = cleanInput.organizationCountry;
				// If the client only sends organizationCountry, keep a single location line in sync
				if (cleanInput.organizationLocation === undefined) {
					updateData.organizationLocation = cleanInput.organizationCountry;
				}
			}
			if (cleanInput.organizationDescription !== undefined) updateData.organizationDescription = cleanInput.organizationDescription;
			if (cleanInput.budgetRange !== undefined) updateData.budgetRange = cleanInput.budgetRange;
			if (cleanInput.organizationImage !== undefined) updateData.organizationImage = cleanInput.organizationImage || null; // Save organizationImage as string

			// Check for unique name conflict (if changing name)
			if (cleanInput.organizationName && cleanInput.organizationName !== existingOrg.organizationName) {
				const nameConflict = await this.organizationModel
					.findOne({ organizationName: cleanInput.organizationName, _id: { $ne: existingOrg._id } })
					.exec();
				if (nameConflict) {
					throw new BadRequestException('Organization with this name already exists.');
				}
			}

			// Always update updatedAt timestamp
			updateData.updatedAt = new Date();

			// Build unset object — never $unset a path we also $set (e.g. organizationImage)
			const unsetData = fieldsToUnset.reduce((acc, field) => ({ ...acc, [field]: '' }), {});
			const unsetFiltered = this.unsetWithoutSetOverlap(updateData as Record<string, unknown>, unsetData);

			const setPayload = this.stripMongoOperatorKeys(updateData as Record<string, unknown>) as Record<
				string,
				unknown
			>;

			const updateOp: Record<string, unknown> = { $set: setPayload };
			if (Object.keys(unsetFiltered).length > 0) {
				updateOp.$unset = unsetFiltered;
			}

			const result = await this.organizationModel
				.findByIdAndUpdate(existingOrg._id, updateOp, { new: true })
				.exec();

			if (!result) {
				throw new InternalServerErrorException(Message.UPDATE_FAILED);
			}

			return this.normalizeOrganizationFields(result.toObject());
		} else {
			// CREATE new buyer organization

			if (!hasBuyerLocation && !hasBuyerCountry) {
				throw new BadRequestException('Provide organizationLocation or organizationCountry.');
			}

			// Check for unique name
			const nameConflict = await this.organizationModel.findOne({ organizationName: cleanInput.organizationName }).exec();
			if (nameConflict) {
				throw new BadRequestException('Organization with this name already exists.');
			}

			// No website URL check needed for buyers (not a buyer field)

			let organizationLocation = '';
			let orgCountry: string | undefined;
			if (hasBuyerLocation && hasBuyerCountry) {
				organizationLocation = trimStr(cleanInput.organizationLocation);
				orgCountry = trimStr(cleanInput.organizationCountry);
			} else if (hasBuyerLocation) {
				organizationLocation = trimStr(cleanInput.organizationLocation);
			} else {
				organizationLocation = trimStr(cleanInput.organizationCountry);
				orgCountry = trimStr(cleanInput.organizationCountry);
			}

			// Clean buyer organization data - only essential fields
			// Structured in proper order: _id, orgType, orgOwnerUserId, organization fields, budgetRange, timestamps
			const orgData: Record<string, unknown> = {
				orgType: 'BUYER',
				orgStatus: OrganizationStatus.ACTIVE,
				orgOwnerUserId: userIdObj,
				organizationName: cleanInput.organizationName,
				organizationIndustry: cleanInput.organizationIndustry,
				organizationLocation,
				organizationDescription: cleanInput.organizationDescription,
				budgetRange: cleanInput.budgetRange || undefined,
				organizationImage: cleanInput.organizationImage || null, // Save organizationImage as string
				// createdAt and updatedAt will be added automatically by Mongoose timestamps
			};
			if (orgCountry !== undefined) {
				orgData.orgCountry = orgCountry;
			}

			try {
				const result = await this.organizationModel.create(orgData);
				
				// Remove provider-specific fields from buyer organization
				const unsetData = fieldsToUnset.reduce((acc, field) => ({ ...acc, [field]: '' }), {});
				const cleanedResult = await this.organizationModel.findByIdAndUpdate(
					result._id,
					{ $unset: unsetData },
					{ new: true }
				).exec();

				// Increment userOrgCount for the creator
				await this.userModel.findByIdAndUpdate(
					userIdObj,
					{ $inc: { userOrgCount: 1 } },
					{ new: true },
				).exec();

				return this.normalizeOrganizationFields(cleanedResult.toObject());
			} catch (err) {
				console.log('Error, createOrUpdateBuyerOrganization:', err.message);
				if (err.code === 11000) {
					const field = Object.keys(err.keyPattern)[0];
					// Handle old index name (orgName) vs new field name (organizationName)
					if (field === 'orgName' || field === 'organizationName') {
						throw new BadRequestException('Organization with this name already exists. Please choose a different name.');
					} else if (field === 'orgTaxId') {
						throw new BadRequestException('Organization with this tax ID already exists.');
					} else if (field === 'organizationWebsiteUrl' || field === 'orgWebsiteUrl') {
						throw new BadRequestException('Organization with this website URL already exists.');
					} else {
						throw new BadRequestException(`Organization with this ${field} already exists.`);
					}
				}
				throw new BadRequestException(err.message || Message.CREATE_FAILED);
			}
		}
	}

	/**
	 * Gets the logged-in buyer's organization.
	 * Uses only the authenticated userId — no orgId argument needed.
	 * Returns null if the buyer has no organization yet.
	 */
	public async getBuyerOrganization(userId: ObjectId): Promise<Organization | null> {
		const userIdObj = shapeIntoMongoObjectId(userId);

		const result = await this.organizationModel
			.aggregate([
				{ $match: { orgOwnerUserId: userIdObj, orgType: 'BUYER' } },
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
			return null;
		}

		return this.normalizeOrganizationFields(result[0]);
	}

	/**
	 * Get provider organization for the logged-in provider.
	 * Returns null if provider has no organization yet.
	 */
	public async getProviderOrganization(userId: ObjectId): Promise<Organization | null> {
		const userIdObj = shapeIntoMongoObjectId(userId);

		// Verify user exists and is a PROVIDER
		const user = await this.userModel.findById(userIdObj).exec();
		if (!user) {
			throw new BadRequestException('User not found.');
		}
		if (user.userRole !== UserRole.PROVIDER) {
			throw new BadRequestException('Only PROVIDER users can get provider organization.');
		}

		const result = await this.organizationModel
			.aggregate([
				{
					$match: {
						orgOwnerUserId: userIdObj,
						orgType: 'SERVICE_PROVIDER',
					},
				},
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
			return null;
		}

		const org = result[0];
		// Note: myRating is not needed here since provider is viewing their own org

		return this.normalizeOrganizationFields(org);
	}

	// =========================================================================
	// PROVIDER-SPECIFIC ORGANIZATION PROFILE APIs
	// =========================================================================

	/**
	 * Create provider organization profile.
	 * Auto-sets orgType=SERVICE_PROVIDER and orgStatus=ACTIVE.
	 */
	public async createProviderOrgProf(userId: ObjectId, input: ProviderOrganizationInput): Promise<Organization> {
		const userIdObj = shapeIntoMongoObjectId(userId);

		// Verify user exists and is a PROVIDER
		const user = await this.userModel.findById(userIdObj).exec();
		if (!user) {
			throw new BadRequestException('User not found.');
		}
		if (user.userRole !== UserRole.PROVIDER) {
			throw new BadRequestException('Only PROVIDER users can create provider organization profiles.');
		}

		// Check if user already has a provider organization
		const existingOrg = await this.organizationModel
			.findOne({
				orgOwnerUserId: userIdObj,
				orgType: 'SERVICE_PROVIDER',
			})
			.exec();

		if (existingOrg) {
			throw new BadRequestException('You already have a provider organization. Use updateProviderOrgProf to update it.');
		}

		// Check for duplicate organization name
		const existingName = await this.organizationModel.findOne({ organizationName: input.organizationName }).exec();
		if (existingName) {
			throw new BadRequestException('Organization with this name already exists. Please choose a different name.');
		}

		try {
			// Only save fields that come from frontend input + required system fields
			// Explicitly set unnecessary fields to undefined so MongoDB doesn't save them with defaults
			const orgData: any = {
				orgType: 'SERVICE_PROVIDER',
				orgStatus: OrganizationStatus.ACTIVE,
				organizationName: input.organizationName,
				organizationDescription: input.organizationDescription || null,
				organizationEmail: input.organizationContactEmail || null, // Save to organizationEmail field in DB
				orgCountry: input.organizationCountry || null, // DB field is orgCountry, but API uses organizationCountry
				categoryId: input.organizationCategories || [],
				subCategory: input.organizationSubCategories || [],
				organizationImage: input.organizationImage || null, // Save organizationImage as string (not array)
				budgetRange: input.budgetRange || null, // Save budgetRange
				orgOwnerUserId: userIdObj,
				// Explicitly exclude unnecessary fields by setting to undefined
				// MongoDB will NOT save undefined fields, preventing default values from being applied
				orgTotalProjects: undefined,
				orgResponseTimeAvg: undefined,
				orgVerified: undefined,
				orgSkills: undefined,
				orgAverageRating: undefined,
				orgTotalLikes: undefined,
				orgTotalViews: undefined,
				organizationHourlyRate: undefined,
				organizationTeamSize: undefined,
				organizationSpecialties: undefined,
				organizationWebsiteUrl: undefined,
				organizationPhoneNumber: undefined,
				industries: undefined,
				minProjectSize: undefined,
				badges: undefined,
				reviewsCount: undefined,
				serviceTitle: undefined,
				orgTaxId: undefined,
				orgCity: undefined,
			};

			// Remove undefined fields before saving (clean object)
			Object.keys(orgData).forEach(key => {
				if (orgData[key] === undefined) {
					delete orgData[key];
				}
			});

			const result = await this.organizationModel.create(orgData);

			// Explicitly unset unnecessary fields that MongoDB created with defaults
			// These fields are not needed for provider organizations
			await this.organizationModel.findByIdAndUpdate(
				result._id,
				{
					$unset: {
						orgTotalProjects: '',
						orgResponseTimeAvg: '',
						orgVerified: '',
						orgSkills: '',
						orgAverageRating: '',
						orgTotalLikes: '',
						orgTotalViews: '',
						organizationHourlyRate: '',
						organizationTeamSize: '',
						organizationSpecialties: '',
						organizationWebsiteUrl: '',
						organizationPhoneNumber: '',
						industries: '',
						minProjectSize: '',
						badges: '',
						reviewsCount: '',
						serviceTitle: '',
						orgTaxId: '',
						orgCity: '',
					},
				},
				{ new: true }
			).exec();

			// Increment userOrgCount for the creator
			await this.userModel.findByIdAndUpdate(
				userIdObj,
				{ $inc: { userOrgCount: 1 } },
				{ new: true }
			).exec();

			// Update user's organization reference
			await this.userModel.findByIdAndUpdate(
				userIdObj,
				{ userOrganizationId: result._id },
				{ new: true }
			).exec();

			return this.normalizeOrganizationFields(result.toObject());
		} catch (err) {
			console.log('Error, OrganizationService.createProviderOrgProf:', err.message);
			if (err instanceof BadRequestException) throw err;
			throw new BadRequestException(Message.CREATE_FAILED);
		}
	}

	/**
	 * Update provider organization profile.
	 * Only allows updating specific provider fields.
	 */
	public async updateProviderOrgProf(userId: ObjectId, input: UpdateProviderOrganizationInput): Promise<Organization> {
		const userIdObj = shapeIntoMongoObjectId(userId);
		const orgIdObj = shapeIntoMongoObjectId(input.organizationId);

		// Verify user exists and is a PROVIDER
		const user = await this.userModel.findById(userIdObj).exec();
		if (!user) {
			throw new BadRequestException('User not found.');
		}
		if (user.userRole !== UserRole.PROVIDER) {
			throw new BadRequestException('Only PROVIDER users can update provider organization profiles.');
		}

		// Fetch the organization
		const org = await this.organizationModel.findById(orgIdObj).exec();
		if (!org) {
			throw new BadRequestException('Organization not found.');
		}

		// Verify user owns this organization
		const orgOwnerId = shapeIntoMongoObjectId(org.orgOwnerUserId);
		if (!orgOwnerId.equals(userIdObj)) {
			throw new BadRequestException('You can only update your own organization.');
		}

		// Verify it's a SERVICE_PROVIDER organization
		const orgType = this.getOrgType(org);
		if (orgType !== OrganizationType.SERVICE_PROVIDER) {
			throw new BadRequestException('This is not a provider organization.');
		}

		// Check for duplicate organization name (if name is being changed)
		if (input.organizationName && input.organizationName !== org.organizationName) {
			const existingName = await this.organizationModel
				.findOne({
					organizationName: input.organizationName,
					_id: { $ne: orgIdObj },
				})
				.exec();
			if (existingName) {
				throw new BadRequestException('Organization with this name already exists. Please choose a different name.');
			}
		}

		try {
			// Build update object with only provided fields
			const updateData: T = {};

			if (input.organizationName !== undefined) {
				updateData.organizationName = input.organizationName;
			}
			if (input.organizationDescription !== undefined) {
				updateData.organizationDescription = input.organizationDescription;
			}
			if (input.organizationContactEmail !== undefined) {
				updateData.organizationEmail = input.organizationContactEmail; // Save to organizationEmail field in DB
			}
			if (input.organizationCountry !== undefined) {
				updateData.orgCountry = input.organizationCountry;
			}
			if (input.organizationCategories !== undefined) {
				updateData.categoryId = input.organizationCategories;
			}
			if (input.organizationSubCategories !== undefined) {
				updateData.subCategory = input.organizationSubCategories;
			}
			if (input.organizationImage !== undefined) {
				updateData.organizationImage = input.organizationImage;
			}
			if (input.budgetRange !== undefined) {
				updateData.budgetRange = input.budgetRange;
			}

			const cleanedProviderUpdate = this.stripMongoOperatorKeys(updateData as Record<string, unknown>);

			// If no fields to update, return the existing organization
			if (Object.keys(cleanedProviderUpdate).length === 0) {
				return this.normalizeOrganizationFields(org.toObject());
			}

			const updatedOrg = await this.organizationModel
				.findByIdAndUpdate(orgIdObj, cleanedProviderUpdate, { new: true })
				.exec();

			if (!updatedOrg) {
				throw new InternalServerErrorException(Message.UPDATE_FAILED);
			}

			return this.normalizeOrganizationFields(updatedOrg.toObject());
		} catch (err) {
			console.log('Error, OrganizationService.updateProviderOrgProf:', err.message);
			if (err instanceof BadRequestException) throw err;
			throw new BadRequestException(Message.UPDATE_FAILED);
		}
	}

	/**
	 * Rate an organization (toggle-based).
	 * - If user hasn't rated: Add new rating
	 * - If user rated with same value: Remove rating (toggle off)
	 * - If user rated with different value: Update rating
	 * Updates totalRatingValue, reviewCount, and recalculates averageRating.
	 */
	public async rateOrganization(userId: ObjectId, orgId: string, rating: number): Promise<Organization> {
		const userIdObj = shapeIntoMongoObjectId(userId);
		const orgIdObj = shapeIntoMongoObjectId(orgId);

		// Validate rating is between 1 and 5
		if (rating < 1 || rating > 5) {
			throw new BadRequestException('Rating must be between 1 and 5.');
		}

		// Find the organization
		const org = await this.organizationModel.findById(orgIdObj).exec();
		if (!org) {
			throw new BadRequestException('Organization not found.');
		}

		try {
			// Check if user already rated this organization
			const existingRating = await this.ratingModel.findOne({
				userId: userIdObj,
				orgId: orgIdObj,
			}).exec();

			// Get current organization values
			const currentTotalRatingValue = org.totalRatingValue || 0;
			const currentReviewCount = org.reviewsCount || 0;

			let newTotalRatingValue: number;
			let newReviewCount: number;
			let newAverageRating: number;

			if (existingRating) {
				// User already rated
				if (existingRating.rating === rating) {
					// Same rating = toggle off (remove rating)
					newTotalRatingValue = currentTotalRatingValue - existingRating.rating;
					newReviewCount = currentReviewCount - 1;
					
					// Delete the rating
					await this.ratingModel.findByIdAndDelete(existingRating._id).exec();
				} else {
					// Different rating = update rating
					newTotalRatingValue = currentTotalRatingValue - existingRating.rating + rating;
					newReviewCount = currentReviewCount; // Count stays the same
					
					// Update the rating
					existingRating.rating = rating;
					await existingRating.save();
				}
			} else {
				// User hasn't rated yet = add new rating
				newTotalRatingValue = currentTotalRatingValue + rating;
				newReviewCount = currentReviewCount + 1;
				
				// Create new rating
				await this.ratingModel.create({
					userId: userIdObj,
					orgId: orgIdObj,
					rating: rating,
				});
			}

			// Calculate average (avoid division by zero)
			if (newReviewCount > 0) {
				newAverageRating = Math.round((newTotalRatingValue / newReviewCount) * 10) / 10;
			} else {
				newAverageRating = 0;
			}

			// Update the organization
			const updatedOrg = await this.organizationModel
				.findByIdAndUpdate(
					orgIdObj,
					{
						$set: {
							totalRatingValue: newTotalRatingValue,
							reviewsCount: newReviewCount,
							orgAverageRating: newAverageRating,
						},
					},
					{ new: true }
				)
				.exec();

			if (!updatedOrg) {
				throw new InternalServerErrorException(Message.UPDATE_FAILED);
			}

			return this.normalizeOrganizationFields(updatedOrg.toObject());
		} catch (err) {
			console.log('Error, OrganizationService.rateOrganization:', err.message);
			if (err instanceof BadRequestException) throw err;
			throw new BadRequestException(Message.UPDATE_FAILED);
		}
	}
}
