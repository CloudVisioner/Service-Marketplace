import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { GetAllUsersResponse, GetAllOrganizationsResponse, AdminOrganization, DashboardStatistics, StatisticTrend, GetAllAdminsResponse, AdminUser, InviteAdminResponse, AdminProfile, UploadAdminProfileImageResponse } from '../../libs/dto/admin/admin.output';
import { GetAllUsersInput, GetAllOrganizationsInput, RejectOrganizationInput, UpdateOrganizationInput, GetAllAdminsInput, InviteAdminInput, UpdateAdminProfileInput, UploadAdminProfileImageInput } from '../../libs/dto/admin/admin.input';
import { User, Users } from '../../libs/dto/user/user';
import { Organization } from '../../libs/dto/organization/organization';
import { UserStatus, UserRole } from '../../libs/enums/user.enum';
import { OrganizationStatus } from '../../libs/enums/organization.enum';
import { ServiceRequestStatus } from '../../libs/enums/service-request.enum';
import { QuoteStatus } from '../../libs/enums/quote.enum';
import { OrderStatus } from '../../libs/enums/order.enum';
import { Message } from '../../libs/enums/common.enum';
import { T } from '../../libs/types/common';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { AuditService } from './audit/audit.service';
import { AuditAction, AuditTargetType } from '../../libs/enums/admin.enum';

@Injectable()
export class AdminService {
	constructor(
		@InjectModel('User') private userModel: Model<User>,
		@InjectModel('Organization') private organizationModel: Model<Organization>,
		@InjectModel('ServiceRequest') private serviceRequestModel: Model<any>,
		@InjectModel('Quote') private quoteModel: Model<any>,
		@InjectModel('Order') private orderModel: Model<any>,
		private auditService: AuditService,
	) {}

	// ============================================================================
	// USER MANAGEMENT
	// ============================================================================

	/**
	 * Get all users with pagination and filtering
	 */
	public async getAllUsers(input: GetAllUsersInput): Promise<GetAllUsersResponse> {
		const match: T = {};

		if (input.search) {
			if (input.search.userNick) {
				match.userNick = { $regex: input.search.userNick, $options: 'i' };
			}
			if (input.search.userEmail) {
				match.userEmail = { $regex: input.search.userEmail, $options: 'i' };
			}
			if (input.search.userRole) {
				match.userRole = input.search.userRole;
			}
			if (input.search.userStatus) {
				match.userStatus = input.search.userStatus;
			}
			if (input.search.createdAtFrom || input.search.createdAtTo) {
				match.createdAt = {};
				if (input.search.createdAtFrom) {
					match.createdAt.$gte = new Date(input.search.createdAtFrom);
				}
				if (input.search.createdAtTo) {
					match.createdAt.$lte = new Date(input.search.createdAtTo);
				}
			}
		}

		const result = await this.userModel
			.aggregate([
				{ $match: match },
				{ $sort: { createdAt: -1 } },
				{
					$facet: {
						list: [
							{ $skip: (input.page - 1) * input.limit },
							{ $limit: input.limit },
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

	/**
	 * Get user by ID
	 */
	public async getUserById(userId: string): Promise<User> {
		const userIdObj = shapeIntoMongoObjectId(userId);
		const user = await this.userModel.findById(userIdObj).exec();

		if (!user) {
			throw new NotFoundException('User not found.');
		}

		return user;
	}

	/**
	 * Suspend user
	 */
	public async suspendUser(userId: string, adminId: ObjectId): Promise<User> {
		const userIdObj = shapeIntoMongoObjectId(userId);
		const user = await this.userModel.findById(userIdObj).exec();

		if (!user) {
			throw new NotFoundException('User not found.');
		}

		if (user.userStatus === UserStatus.SUSPENDED) {
			throw new BadRequestException('User is already suspended.');
		}

		const result = await this.userModel.findByIdAndUpdate(
			userIdObj,
			{ userStatus: UserStatus.SUSPENDED },
			{ new: true },
		).exec();

		if (!result) {
			throw new InternalServerErrorException(Message.UPDATE_FAILED);
		}

		// Log audit action
		await this.auditService.logAction(
			AuditAction.USER_SUSPENDED,
			AuditTargetType.USER,
			userIdObj,
			user.userNick,
			`User suspended by admin`,
			adminId,
		);

		return result;
	}

	/**
	 * Activate user
	 */
	public async activateUser(userId: string, adminId: ObjectId): Promise<User> {
		const userIdObj = shapeIntoMongoObjectId(userId);
		const user = await this.userModel.findById(userIdObj).exec();

		if (!user) {
			throw new NotFoundException('User not found.');
		}

		if (user.userStatus === UserStatus.ACTIVE) {
			throw new BadRequestException('User is already active.');
		}

		const result = await this.userModel.findByIdAndUpdate(
			userIdObj,
			{ userStatus: UserStatus.ACTIVE },
			{ new: true },
		).exec();

		if (!result) {
			throw new InternalServerErrorException(Message.UPDATE_FAILED);
		}

		// Log audit action
		await this.auditService.logAction(
			AuditAction.USER_ACTIVATED,
			AuditTargetType.USER,
			userIdObj,
			user.userNick,
			`User activated by admin`,
			adminId,
		);

		return result;
	}

	/**
	 * Reset user password (generates reset link)
	 */
	public async resetUserPassword(userId: string): Promise<{ success: boolean; resetLink?: string }> {
		const userIdObj = shapeIntoMongoObjectId(userId);
		const user = await this.userModel.findById(userIdObj).exec();

		if (!user) {
			throw new NotFoundException('User not found.');
		}

		// TODO: Generate password reset token and link
		// For now, return success without link
		return {
			success: true,
			// resetLink: `https://app.smeconnect.com/reset-password?token=${token}`
		};
	}

	// ============================================================================
	// ORGANIZATION MANAGEMENT
	// ============================================================================

	/**
	 * Get all organizations with pagination and filtering
	 */
	public async getAllOrganizations(input: GetAllOrganizationsInput): Promise<GetAllOrganizationsResponse> {
		const match: T = {};

		if (input.search) {
			if (input.search.organizationName) {
				match.organizationName = { $regex: input.search.organizationName, $options: 'i' };
			}
			if (input.search.organizationType) {
				match.orgType = input.search.organizationType;
			}
			if (input.search.organizationStatus) {
				match.orgStatus = input.search.organizationStatus;
			}
			if (input.search.isFlagged !== undefined && input.search.isFlagged !== null) {
				match.isFlagged = input.search.isFlagged;
			}
			if (input.search.organizationCountry) {
				match.orgCountry = { $regex: input.search.organizationCountry, $options: 'i' };
			}
			if (input.search.createdAtFrom || input.search.createdAtTo) {
				match.createdAt = {};
				if (input.search.createdAtFrom) {
					match.createdAt.$gte = new Date(input.search.createdAtFrom);
				}
				if (input.search.createdAtTo) {
					match.createdAt.$lte = new Date(input.search.createdAtTo);
				}
			}
		}

		const result = await this.organizationModel
			.aggregate([
				{ $match: match },
				{ $sort: { createdAt: -1 } },
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
									as: 'members',
								},
							},
							{
								$addFields: {
									memberCount: { $size: { $ifNull: ['$members', []] } },
									organizationType: '$orgType',
									organizationStatus: '$orgStatus',
									isFlagged: { $ifNull: ['$isFlagged', false] },
								},
							},
							{
								$project: {
									members: 0,
								},
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

	/**
	 * Get organization by ID
	 */
	public async getOrganizationById(organizationId: string): Promise<AdminOrganization> {
		const orgIdObj = shapeIntoMongoObjectId(organizationId);
		const org = await this.organizationModel.findById(orgIdObj).exec();

		if (!org) {
			throw new NotFoundException('Organization not found.');
		}

		// Get member count
		const memberCount = await this.userModel.countDocuments({ _id: org.orgOwnerUserId }).exec();

		return {
			...org.toObject(),
			organizationType: (org as any).orgType,
			organizationStatus: (org as any).orgStatus,
			memberCount,
		} as AdminOrganization;
	}

	/**
	 * Approve organization
	 */
	public async approveOrganization(organizationId: string, adminId: ObjectId): Promise<AdminOrganization> {
		const orgIdObj = shapeIntoMongoObjectId(organizationId);
		const org = await this.organizationModel.findById(orgIdObj).exec();

		if (!org) {
			throw new NotFoundException('Organization not found.');
		}

		const result = await this.organizationModel.findByIdAndUpdate(
			orgIdObj,
			{ orgStatus: OrganizationStatus.APPROVED },
			{ new: true },
		).exec();

		if (!result) {
			throw new InternalServerErrorException(Message.UPDATE_FAILED);
		}

		// Log audit action
		await this.auditService.logAction(
			AuditAction.ORG_APPROVED,
			AuditTargetType.ORGANIZATION,
			orgIdObj,
			org.organizationName,
			`Organization approved by admin`,
			adminId,
		);

		const memberCount = await this.userModel.countDocuments({ _id: org.orgOwnerUserId }).exec();

		return {
			...result.toObject(),
			organizationType: (result as any).orgType,
			organizationStatus: (result as any).orgStatus,
			memberCount,
		} as AdminOrganization;
	}

	/**
	 * Reject organization
	 */
	public async rejectOrganization(input: RejectOrganizationInput, adminId: ObjectId): Promise<AdminOrganization> {
		const orgIdObj = shapeIntoMongoObjectId(input.organizationId);
		const org = await this.organizationModel.findById(orgIdObj).exec();

		if (!org) {
			throw new NotFoundException('Organization not found.');
		}

		const result = await this.organizationModel.findByIdAndUpdate(
			orgIdObj,
			{ orgStatus: OrganizationStatus.REJECTED },
			{ new: true },
		).exec();

		if (!result) {
			throw new InternalServerErrorException(Message.UPDATE_FAILED);
		}

		// Log audit action
		await this.auditService.logAction(
			AuditAction.ORG_REJECTED,
			AuditTargetType.ORGANIZATION,
			orgIdObj,
			org.organizationName,
			`Organization rejected by admin${input.reason ? `: ${input.reason}` : ''}`,
			adminId,
		);

		const memberCount = await this.userModel.countDocuments({ _id: org.orgOwnerUserId }).exec();

		return {
			...result.toObject(),
			organizationType: (result as any).orgType,
			organizationStatus: (result as any).orgStatus,
			memberCount,
		} as AdminOrganization;
	}

	/**
	 * Suspend organization
	 */
	public async suspendOrganization(organizationId: string, adminId: ObjectId): Promise<AdminOrganization> {
		const orgIdObj = shapeIntoMongoObjectId(organizationId);
		const org = await this.organizationModel.findById(orgIdObj).exec();

		if (!org) {
			throw new NotFoundException('Organization not found.');
		}

		const result = await this.organizationModel.findByIdAndUpdate(
			orgIdObj,
			{ orgStatus: OrganizationStatus.SUSPENDED },
			{ new: true },
		).exec();

		if (!result) {
			throw new InternalServerErrorException(Message.UPDATE_FAILED);
		}

		// Log audit action
		await this.auditService.logAction(
			AuditAction.ORG_SUSPENDED,
			AuditTargetType.ORGANIZATION,
			orgIdObj,
			org.organizationName,
			`Organization suspended by admin`,
			adminId,
		);

		const memberCount = await this.userModel.countDocuments({ _id: org.orgOwnerUserId }).exec();

		return {
			...result.toObject(),
			organizationType: (result as any).orgType,
			organizationStatus: (result as any).orgStatus,
			memberCount,
		} as AdminOrganization;
	}

	/**
	 * Update organization
	 */
	public async updateOrganization(input: UpdateOrganizationInput, adminId: ObjectId): Promise<AdminOrganization> {
		const orgIdObj = shapeIntoMongoObjectId(input.organizationId);
		const org = await this.organizationModel.findById(orgIdObj).exec();

		if (!org) {
			throw new NotFoundException('Organization not found.');
		}

		const updateData: any = {};

		if (input.organizationName) {
			updateData.organizationName = input.organizationName;
		}
		if (input.organizationDescription !== undefined) {
			updateData.organizationDescription = input.organizationDescription;
		}
		if (input.organizationWebsite) {
			updateData.organizationWebsiteUrl = input.organizationWebsite;
		}
		if (input.organizationIndustry) {
			updateData.organizationIndustry = input.organizationIndustry;
		}

		const result = await this.organizationModel.findByIdAndUpdate(
			orgIdObj,
			updateData,
			{ new: true },
		).exec();

		if (!result) {
			throw new InternalServerErrorException(Message.UPDATE_FAILED);
		}

		const memberCount = await this.userModel.countDocuments({ _id: org.orgOwnerUserId }).exec();

		return {
			...result.toObject(),
			organizationType: (result as any).orgType,
			organizationStatus: (result as any).orgStatus,
			memberCount,
		} as AdminOrganization;
	}

	// ============================================================================
	// ADMIN MANAGEMENT
	// ============================================================================

	/**
	 * Get all admins
	 */
	public async getAllAdmins(input: GetAllAdminsInput): Promise<GetAllAdminsResponse> {
		const match: T = {
			userRole: { $in: [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.CONTENT_ADMIN] },
		};

		if (input.search) {
			if (input.search.userNick) {
				match.userNick = { $regex: input.search.userNick, $options: 'i' };
			}
			if (input.search.userEmail) {
				match.userEmail = { $regex: input.search.userEmail, $options: 'i' };
			}
			if (input.search.role) {
				match.userRole = input.search.role;
			}
		}

		const page = input.page || 1;
		const limit = input.limit || 20;

		const result = await this.userModel
			.aggregate([
				{ $match: match },
				{ $sort: { createdAt: -1 } },
				{
					$facet: {
						list: [
							{ $skip: (page - 1) * limit },
							{ $limit: limit },
							{
								$project: {
									_id: 1,
									userNick: 1,
									userEmail: 1,
									role: '$userRole',
									status: '$userStatus',
									createdAt: 1,
									// lastLogin would need to be tracked separately
								},
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

	/**
	 * Invite admin
	 */
	public async inviteAdmin(input: InviteAdminInput, adminId: ObjectId): Promise<InviteAdminResponse> {
		// Check if user with email already exists
		const existingUser = await this.userModel.findOne({ userEmail: input.userEmail }).exec();

		if (existingUser) {
			// If user exists, update their role
			if (![UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.CONTENT_ADMIN].includes(existingUser.userRole as UserRole)) {
				await this.userModel.findByIdAndUpdate(
					existingUser._id,
					{ userRole: input.role },
				).exec();
			}

			return {
				success: true,
				invitationSent: false,
				adminUserId: existingUser._id.toString(),
			};
		}

		// TODO: Send invitation email
		// For now, create user directly (in production, send email with invitation link)
		const newAdmin = await this.userModel.create({
			userEmail: input.userEmail,
			userNick: input.userEmail.split('@')[0],
			userRole: input.role,
			userStatus: UserStatus.ACTIVE,
			// Password would be set via invitation link
		});

		return {
			success: true,
			invitationSent: true,
			adminUserId: newAdmin._id.toString(),
		};
	}

	/**
	 * Remove admin (only SUPER_ADMIN can do this)
	 */
	public async removeAdmin(adminUserId: string, adminId: ObjectId): Promise<boolean> {
		const adminUserIdObj = shapeIntoMongoObjectId(adminUserId);
		const admin = await this.userModel.findById(adminUserIdObj).exec();

		if (!admin) {
			throw new NotFoundException('Admin not found.');
		}

		// Cannot remove SUPER_ADMIN
		if (admin.userRole === UserRole.SUPER_ADMIN) {
			throw new BadRequestException('Cannot remove super admin.');
		}

		// Change role back to BUYER or PROVIDER (default to BUYER)
		await this.userModel.findByIdAndUpdate(
			adminUserIdObj,
			{ userRole: UserRole.BUYER },
		).exec();

		return true;
	}

	// ============================================================================
	// DASHBOARD STATISTICS
	// ============================================================================

	/**
	 * Get dashboard statistics with trends
	 */
	public async getDashboardStatistics(): Promise<DashboardStatistics> {
		const now = new Date();
		const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
		const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

		// Total buyers (current and previous week)
		const totalBuyersCurrent = await this.userModel.countDocuments({
			userRole: UserRole.BUYER,
			createdAt: { $lte: now },
		}).exec();

		const totalBuyersPrevious = await this.userModel.countDocuments({
			userRole: UserRole.BUYER,
			createdAt: { $lte: oneWeekAgo },
		}).exec();

		// Total providers
		const totalProvidersCurrent = await this.userModel.countDocuments({
			userRole: UserRole.PROVIDER,
			createdAt: { $lte: now },
		}).exec();

		const totalProvidersPrevious = await this.userModel.countDocuments({
			userRole: UserRole.PROVIDER,
			createdAt: { $lte: oneWeekAgo },
		}).exec();

		// Active requests
		const activeRequestsCurrent = await this.serviceRequestModel.countDocuments({
			reqStatus: { $in: [ServiceRequestStatus.OPEN, ServiceRequestStatus.ACTIVE] },
			createdAt: { $lte: now },
		}).exec();

		const activeRequestsPrevious = await this.serviceRequestModel.countDocuments({
			reqStatus: { $in: [ServiceRequestStatus.OPEN, ServiceRequestStatus.ACTIVE] },
			createdAt: { $lte: oneWeekAgo },
		}).exec();

		// Open quotes
		const openQuotesCurrent = await this.quoteModel.countDocuments({
			quoteStatus: QuoteStatus.PENDING,
			createdAt: { $lte: now },
		}).exec();

		const openQuotesPrevious = await this.quoteModel.countDocuments({
			quoteStatus: QuoteStatus.PENDING,
			createdAt: { $lte: oneWeekAgo },
		}).exec();

		// Active orders
		const activeOrdersCurrent = await this.orderModel.countDocuments({
			orderStatus: { $in: [OrderStatus.NEW, OrderStatus.IN_PROGRESS, OrderStatus.ACTIVE] },
			createdAt: { $lte: now },
		}).exec();

		const activeOrdersPrevious = await this.orderModel.countDocuments({
			orderStatus: { $in: [OrderStatus.NEW, OrderStatus.IN_PROGRESS, OrderStatus.ACTIVE] },
			createdAt: { $lte: oneWeekAgo },
		}).exec();

		// Helper to calculate percentage change
		const calculateChange = (current: number, previous: number): number => {
			if (previous === 0) return current > 0 ? 100 : 0;
			return Math.round(((current - previous) / previous) * 100);
		};

		// Recent activity
		const recentServiceRequests = await this.serviceRequestModel
			.find()
			.sort({ createdAt: -1 })
			.limit(5)
			.lean()
			.exec();

		const recentOrders = await this.orderModel
			.find()
			.sort({ createdAt: -1 })
			.limit(5)
			.lean()
			.exec();

		return {
			totalBuyers: {
				current: totalBuyersCurrent,
				previous: totalBuyersPrevious,
				change: calculateChange(totalBuyersCurrent, totalBuyersPrevious),
			},
			totalProviders: {
				current: totalProvidersCurrent,
				previous: totalProvidersPrevious,
				change: calculateChange(totalProvidersCurrent, totalProvidersPrevious),
			},
			activeRequests: {
				current: activeRequestsCurrent,
				previous: activeRequestsPrevious,
				change: calculateChange(activeRequestsCurrent, activeRequestsPrevious),
			},
			openQuotes: {
				current: openQuotesCurrent,
				previous: openQuotesPrevious,
				change: calculateChange(openQuotesCurrent, openQuotesPrevious),
			},
			activeOrders: {
				current: activeOrdersCurrent,
				previous: activeOrdersPrevious,
				change: calculateChange(activeOrdersCurrent, activeOrdersPrevious),
			},
			recentServiceRequests: recentServiceRequests as any,
			recentOrders: recentOrders as any,
		};
	}

	// ============================================================================
	// ADMIN PROFILE MANAGEMENT
	// ============================================================================

	/**
	 * Get current admin profile
	 */
	public async getMyAdminProfile(adminId: ObjectId): Promise<AdminProfile> {
		const user = await this.userModel.findById(adminId).exec();

		if (!user) {
			throw new NotFoundException('Admin profile not found.');
		}

		// Verify user is an admin
		const adminRoles = [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.CONTENT_ADMIN];
		if (!adminRoles.includes(user.userRole as UserRole)) {
			throw new BadRequestException('User is not an admin.');
		}

		return {
			_id: user._id,
			userNick: user.userNick,
			userEmail: user.userEmail,
			userPhone: user.userPhone,
			userDescription: user.userDescription,
			userImage: user.userImage,
			userRole: user.userRole as UserRole,
			userStatus: user.userStatus as UserStatus,
			createdAt: user.createdAt,
			updatedAt: user.updatedAt,
		} as AdminProfile;
	}

	/**
	 * Update admin profile
	 */
	public async updateAdminProfile(input: UpdateAdminProfileInput, adminId: ObjectId): Promise<AdminProfile> {
		const user = await this.userModel.findById(adminId).exec();

		if (!user) {
			throw new NotFoundException('Admin profile not found.');
		}

		const updateData: any = {};

		if (input.userNick !== undefined) {
			updateData.userNick = input.userNick;
		}
		if (input.userPhone !== undefined) {
			updateData.userPhone = input.userPhone;
		}
		if (input.userDescription !== undefined) {
			updateData.userDescription = input.userDescription;
		}
		if (input.userImage !== undefined) {
			updateData.userImage = input.userImage;
		}

		const result = await this.userModel.findByIdAndUpdate(
			adminId,
			updateData,
			{ new: true },
		).exec();

		if (!result) {
			throw new InternalServerErrorException(Message.UPDATE_FAILED);
		}

		return {
			_id: result._id,
			userNick: result.userNick,
			userEmail: result.userEmail,
			userPhone: result.userPhone,
			userDescription: result.userDescription,
			userImage: result.userImage,
			userRole: result.userRole as UserRole,
			userStatus: result.userStatus as UserStatus,
			createdAt: result.createdAt,
			updatedAt: result.updatedAt,
		} as AdminProfile;
	}

	/**
	 * Upload admin profile image
	 */
	public async uploadAdminProfileImage(input: UploadAdminProfileImageInput, adminId: ObjectId): Promise<UploadAdminProfileImageResponse> {
		// TODO: Implement actual image upload to cloud storage (S3, Cloudinary, etc.)
		// For now, if base64 is provided, we'll just return it as the URL
		// In production, you should:
		// 1. Validate image format (JPEG, PNG, WebP)
		// 2. Validate image size (max 5MB)
		// 3. Upload to cloud storage
		// 4. Get public URL
		// 5. Update user's userImage field

		const imageUrl = input.image; // In production, this would be the cloud storage URL

		// Update user's image
		await this.userModel.findByIdAndUpdate(
			adminId,
			{ userImage: imageUrl },
			{ new: true },
		).exec();

		return {
			imageUrl,
			success: true,
		};
	}
}
