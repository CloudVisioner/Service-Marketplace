import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { BuyerServiceRequests, ServiceRequest, ServiceRequestMeta, ServiceRequests } from '../../libs/dto/service-request/service-request';
import { BuyerServiceRequestFilterInput, ServiceRequestInput, ServiceRequestInquiry } from '../../libs/dto/service-request/service-request.input';
import { ServiceRequestStatus, Urgency } from '../../libs/enums/service-request.enum';
import { Message } from '../../libs/enums/common.enum';
import { T } from '../../libs/types/common';
import { shapeIntoMongoObjectId } from '../../libs/config';

@Injectable()
export class ServiceRequestService {
	constructor(
		@InjectModel('ServiceRequest') private serviceRequestModel: Model<ServiceRequest>,
		@InjectModel('Organization') private organizationModel: Model<any>,
		@InjectModel('User') private userModel: Model<any>,
	) {}

	public async createServiceRequest(userId: ObjectId, input: ServiceRequestInput): Promise<ServiceRequest> {
		try {
			// Rule: Only BUYER users can create service requests
			const user = await this.userModel.findById(userId).exec();
			if (!user) {
				throw new BadRequestException('User not found.');
			}

			if (user.userRole !== 'BUYER') {
				throw new BadRequestException('Only BUYER users can create service requests.');
			}

			// Verify the specific buyer organization exists and user owns it
			const orgIdObj = shapeIntoMongoObjectId(input.reqBuyerOrgId);
			const org = await this.organizationModel.findById(orgIdObj).exec();

			if (!org) {
				throw new BadRequestException('Organization not found.');
			}

			// Verify user owns the SPECIFIC organization they're trying to use
			const orgOwnerId = shapeIntoMongoObjectId(org.orgOwnerUserId);
			const userIdObj = shapeIntoMongoObjectId(userId);
			if (!orgOwnerId.equals(userIdObj)) {
				throw new BadRequestException(
					'You do not own this organization. You can only create service requests for organizations you own.',
				);
			}

			// Rule: Only BUYER organizations can create service requests
			if (org.orgType !== 'BUYER') {
				throw new BadRequestException('Only BUYER organizations can create service requests.');
			}

			// Check for duplicate service request: prevent same title for any user
			// Escape special regex characters in the title
			const escapedTitle = input.reqTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
			
			// First check if the same user already has this title
			const myExistingServiceRequest = await this.serviceRequestModel
				.findOne({
					reqCreatedByUserId: userIdObj,
					reqBuyerOrgId: orgIdObj,
					reqTitle: { $regex: new RegExp(`^${escapedTitle}$`, 'i') }, // Case-insensitive exact match
					reqStatus: { $in: [ServiceRequestStatus.OPEN, ServiceRequestStatus.IN_PROGRESS] }, // Only check active requests
				})
				.exec();

			if (myExistingServiceRequest) {
				throw new BadRequestException(
					`You already have an active service request with the title "${input.reqTitle}". Please use the existing request or choose a different title.`,
				);
			}

			// Then check if any other user has created a service request with the same title
			const otherUserServiceRequest = await this.serviceRequestModel
				.findOne({
					reqTitle: { $regex: new RegExp(`^${escapedTitle}$`, 'i') }, // Case-insensitive exact match
					reqStatus: { $in: [ServiceRequestStatus.OPEN, ServiceRequestStatus.IN_PROGRESS] }, // Only check active requests
					reqCreatedByUserId: { $ne: userIdObj }, // Different user
				})
				.exec();

			if (otherUserServiceRequest) {
				throw new BadRequestException(
					`A service request with the title "${input.reqTitle}" already exists and is currently active. Please choose a different title to avoid confusion.`,
				);
			}

			const serviceRequestData = {
				reqTitle: input.reqTitle,
				reqDescription: input.reqDescription,
				reqBuyerOrgId: orgIdObj,
				reqStatus: input.reqStatus || ServiceRequestStatus.DRAFT,
				reqCategory: input.reqCategory,
				reqSubCategory: input.reqSubCategory || null,
				reqBudgetMin: input.reqBudgetMin,
				reqBudgetMax: input.reqBudgetMax || null,
				reqDeadline: input.reqDeadline,
				reqUrgency: input.reqUrgency || Urgency.NORMAL,
				reqSkillsNeeded: input.reqSkillsNeeded || [],
				reqAttachments: input.reqAttachments || [],
				reqCreatedByUserId: userIdObj,
				reqTotalLikes: 0,
				reqTotalViews: 0,
				reqTotalQuotes: 0,
				reqNewQuotesCount: 0,
			};

			const result = await this.serviceRequestModel.create(serviceRequestData);
			return result;
		} catch (err) {
			console.log('Error, ServiceRequestService.createServiceRequest:', err.message);
			if (err instanceof BadRequestException) throw err;
			throw new BadRequestException(Message.CREATE_FAILED);
		}
	}

	public async getMyServiceRequests(userId: ObjectId, input: ServiceRequestInquiry): Promise<ServiceRequests> {
		const match: T = {
			reqCreatedByUserId: userId,
		};

		if (input.search.reqStatus) {
			match.reqStatus = input.search.reqStatus;
		}

		if (input.search.text) {
			match.$or = [
				{ reqTitle: { $regex: input.search.text, $options: 'i' } },
				{ reqDescription: { $regex: input.search.text, $options: 'i' } },
			];
		}

		const sort: T = { [input?.sort ?? 'createdAt']: -1 };

		const result = await this.serviceRequestModel
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
									from: 'organizations',
									localField: 'reqBuyerOrgId',
									foreignField: '_id',
									as: 'reqBuyerOrgData',
								},
							},
							{
								$unwind: { path: '$reqBuyerOrgData', preserveNullAndEmptyArrays: true },
							},
							{
								$lookup: {
									from: 'users',
									localField: 'reqCreatedByUserId',
									foreignField: '_id',
									as: 'reqCreatedByUserData',
								},
							},
							{
								$unwind: { path: '$reqCreatedByUserData', preserveNullAndEmptyArrays: true },
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

	public async getServiceRequest(userId: ObjectId | null, requestId: ObjectId): Promise<ServiceRequest> {
		const requestIdObj = shapeIntoMongoObjectId(requestId);

		const result = await this.serviceRequestModel
			.aggregate([
				{ $match: { _id: requestIdObj } },
				{
					$lookup: {
						from: 'organizations',
						localField: 'reqBuyerOrgId',
						foreignField: '_id',
						as: 'reqBuyerOrgData',
					},
				},
				{
					$unwind: { path: '$reqBuyerOrgData', preserveNullAndEmptyArrays: true },
				},
				{
					$lookup: {
						from: 'users',
						localField: 'reqCreatedByUserId',
						foreignField: '_id',
						as: 'reqCreatedByUserData',
					},
				},
				{
					$unwind: { path: '$reqCreatedByUserData', preserveNullAndEmptyArrays: true },
				},
				{
					$lookup: {
						from: 'quotes',
						localField: '_id',
						foreignField: 'quoteServiceReqId',
						as: 'quotes',
						pipeline: [
							{
								$lookup: {
									from: 'organizations',
									localField: 'quoteProviderOrgId',
									foreignField: '_id',
									as: 'quoteProviderOrgData',
								},
							},
							{
								$unwind: { path: '$quoteProviderOrgData', preserveNullAndEmptyArrays: true },
							},
							{
								$lookup: {
									from: 'users',
									localField: 'quoteCreatedByUserId',
									foreignField: '_id',
									as: 'quoteCreatedByUserData',
								},
							},
							{
								$unwind: { path: '$quoteCreatedByUserData', preserveNullAndEmptyArrays: true },
							},
							{ $sort: { createdAt: -1 } },
						],
					},
				},
			])
			.exec();

		if (!result.length) {
			throw new InternalServerErrorException(Message.NO_DATA_FOUND);
		}

		return result[0];
	}

	public async getAllServiceRequests(input: ServiceRequestInquiry): Promise<ServiceRequests> {
		const match: T = {};

		if (input.search.reqStatus) {
			match.reqStatus = input.search.reqStatus;
		}

		if (input.search.reqBuyerOrgId) {
			match.reqBuyerOrgId = shapeIntoMongoObjectId(input.search.reqBuyerOrgId);
		}

		if (input.search.text) {
			match.$or = [
				{ reqTitle: { $regex: input.search.text, $options: 'i' } },
				{ reqDescription: { $regex: input.search.text, $options: 'i' } },
			];
		}

		const sort: T = { [input?.sort ?? 'createdAt']: -1 };

		const result = await this.serviceRequestModel
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
									from: 'organizations',
									localField: 'reqBuyerOrgId',
									foreignField: '_id',
									as: 'reqBuyerOrgData',
								},
							},
							{
								$unwind: { path: '$reqBuyerOrgData', preserveNullAndEmptyArrays: true },
							},
							{
								$lookup: {
									from: 'users',
									localField: 'reqCreatedByUserId',
									foreignField: '_id',
									as: 'reqCreatedByUserData',
								},
							},
							{
								$unwind: { path: '$reqCreatedByUserData', preserveNullAndEmptyArrays: true },
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

	public async updateServiceRequestStatus(
		requestId: ObjectId,
		status: ServiceRequestStatus,
		userId: ObjectId,
		userRole: string,
	): Promise<ServiceRequest> {
		const requestIdObj = shapeIntoMongoObjectId(requestId);

		// Fetch the service request to check ownership
		const serviceRequest = await this.serviceRequestModel.findById(requestIdObj).exec();
		if (!serviceRequest) {
			throw new BadRequestException(Message.NO_DATA_FOUND);
		}

		const currentStatus = serviceRequest.reqStatus;

		// Validate status transitions based on lifecycle
		if (userRole === 'BUYER') {
			// Get the organization that owns the service request
			const buyerOrgId = shapeIntoMongoObjectId(serviceRequest.reqBuyerOrgId);
			const org = await this.organizationModel.findById(buyerOrgId).exec();

			if (!org) {
				throw new BadRequestException('Organization not found.');
			}

			// Verify user owns the organization
			const orgOwnerId = shapeIntoMongoObjectId(org.orgOwnerUserId);
			const userIdObj = shapeIntoMongoObjectId(userId);
			if (!orgOwnerId.equals(userIdObj)) {
				throw new BadRequestException('You can only update service requests from your own organization.');
			}

			// Enforce lifecycle transitions for BUYER
			// Valid transitions:
			// OPEN → IN_PROGRESS (handled automatically when quote is accepted)
			// IN_PROGRESS → CLOSED (buyer marks work as done)
			// OPEN → CANCELLED (buyer cancels before accepting quote)
			// IN_PROGRESS → CANCELLED (buyer cancels during work)

			if (currentStatus === status) {
				throw new BadRequestException(`Service request is already ${status}.`);
			}

			// Prevent invalid transitions
			if (currentStatus === ServiceRequestStatus.CLOSED) {
				throw new BadRequestException('Cannot change status of a CLOSED service request. Contact admin to reopen.');
			}

			if (currentStatus === ServiceRequestStatus.CANCELLED) {
				throw new BadRequestException('Cannot change status of a CANCELLED service request.');
			}

			// Only allow specific transitions
			const allowedTransitions: Record<ServiceRequestStatus, ServiceRequestStatus[]> = {
				[ServiceRequestStatus.DRAFT]: [ServiceRequestStatus.PUBLISHED, ServiceRequestStatus.OPEN, ServiceRequestStatus.CANCELLED],
				[ServiceRequestStatus.PUBLISHED]: [ServiceRequestStatus.OPEN, ServiceRequestStatus.CANCELLED],
				[ServiceRequestStatus.OPEN]: [ServiceRequestStatus.CANCELLED],
				[ServiceRequestStatus.IN_PROGRESS]: [ServiceRequestStatus.CLOSED, ServiceRequestStatus.CANCELLED],
				[ServiceRequestStatus.CLOSED]: [], // No transitions allowed for buyer
				[ServiceRequestStatus.CANCELLED]: [], // No transitions allowed
			};

			const allowed = allowedTransitions[currentStatus] || [];
			if (!allowed.includes(status)) {
				throw new BadRequestException(
					`Invalid status transition from ${currentStatus} to ${status}. Allowed transitions: ${allowed.join(', ')}`,
				);
			}
		}

		// ADMIN can update any service request and reopen CLOSED → OPEN
		if (userRole === 'ADMIN') {
			// Admin can make any transition, including reopening CLOSED requests
			// No validation needed for admin
		}

		const result = await this.serviceRequestModel
			.findByIdAndUpdate(
				requestIdObj,
				{ reqStatus: status },
				{
					new: true,
				},
			)
			.exec();

		if (!result) {
			throw new InternalServerErrorException(Message.UPDATE_FAILED);
		}

		return result;
	}

	// =========================================================================
	// BUYER-SPECIFIC SERVICE REQUEST APIs
	// =========================================================================

	/**
	 * Get buyer's service requests with per-status meta counters.
	 * Supports filtering by status, category, search term, sorting, and pagination.
	 */
	public async getBuyerServiceRequests(
		userId: ObjectId,
		input: BuyerServiceRequestFilterInput,
	): Promise<BuyerServiceRequests> {
		const userIdObj = shapeIntoMongoObjectId(userId);
		const page = input.page || 1;
		const limit = input.limit || 10;
		const skip = (page - 1) * limit;

		// Build match filter for the list query
		const match: T = { reqCreatedByUserId: userIdObj };
		if (input.status) match.reqStatus = input.status;
		if (input.category) match.reqCategory = input.category;
		if (input.search) {
			match.$or = [
				{ reqTitle: { $regex: input.search, $options: 'i' } },
				{ reqDescription: { $regex: input.search, $options: 'i' } },
			];
		}

		// Build sort
		const sortField = input.sortBy || 'createdAt';
		const sortDir = input.sortOrder === 'asc' ? 1 : -1;
		const sort: T = { [sortField]: sortDir };

		// Run two aggregations in parallel:
		// 1) Paginated list + total count for current filter
		// 2) Per-status counts (always unfiltered by status for the meta)
		const [listResult, metaResult] = await Promise.all([
			this.serviceRequestModel
				.aggregate([
					{ $match: match },
					{ $sort: sort },
					{
						$facet: {
							list: [
								{ $skip: skip },
								{ $limit: limit },
								{
									$lookup: {
										from: 'organizations',
										localField: 'reqBuyerOrgId',
										foreignField: '_id',
										as: 'reqBuyerOrgData',
									},
								},
								{ $unwind: { path: '$reqBuyerOrgData', preserveNullAndEmptyArrays: true } },
								{
									$lookup: {
										from: 'users',
										localField: 'reqCreatedByUserId',
										foreignField: '_id',
										as: 'reqCreatedByUserData',
									},
								},
								{ $unwind: { path: '$reqCreatedByUserData', preserveNullAndEmptyArrays: true } },
							],
							total: [{ $count: 'count' }],
						},
					},
				])
				.exec(),
			// Per-status counts (unfiltered by status/category/search — shows all of the user's requests)
			this.serviceRequestModel
				.aggregate([
					{ $match: { reqCreatedByUserId: userIdObj } },
					{
						$group: {
							_id: '$reqStatus',
							count: { $sum: 1 },
						},
					},
				])
				.exec(),
		]);

		// Parse list
		const list = listResult.length ? listResult[0].list : [];
		const totalFiltered = listResult.length && listResult[0].total.length ? listResult[0].total[0].count : 0;

		// Parse per-status counts
		const statusCounts: Record<string, number> = {};
		for (const item of metaResult) {
			statusCounts[item._id] = item.count;
		}

		const metaCounter: ServiceRequestMeta = {
			total: Object.values(statusCounts).reduce((a: number, b: number) => a + b, 0),
			open: (statusCounts[ServiceRequestStatus.OPEN] || 0) + (statusCounts[ServiceRequestStatus.PUBLISHED] || 0),
			inProgress: statusCounts[ServiceRequestStatus.IN_PROGRESS] || 0,
			closed: statusCounts[ServiceRequestStatus.CLOSED] || 0,
			draft: statusCounts[ServiceRequestStatus.DRAFT] || 0,
		};

		return { list, metaCounter };
	}

	/**
	 * Get buyer dashboard statistics.
	 * Returns summary counts for active requests, quotes, orders, etc.
	 */
	public async getBuyerDashboardStats(userId: ObjectId): Promise<{
		activeRequests: number;
		totalQuotes: number;
		newQuotes: number;
		activeOrders: number;
		unreadNotifications: number;
	}> {
		const userIdObj = shapeIntoMongoObjectId(userId);

		// Count active service requests (OPEN, PUBLISHED, IN_PROGRESS)
		const activeRequests = await this.serviceRequestModel
			.countDocuments({
				reqCreatedByUserId: userIdObj,
				reqStatus: { $in: [ServiceRequestStatus.OPEN, ServiceRequestStatus.PUBLISHED, ServiceRequestStatus.IN_PROGRESS] },
			})
			.exec();

		// Sum up total quotes and new quotes across all buyer's service requests
		const quotesAgg = await this.serviceRequestModel
			.aggregate([
				{ $match: { reqCreatedByUserId: userIdObj } },
				{
					$group: {
						_id: null,
						totalQuotes: { $sum: '$reqTotalQuotes' },
						newQuotes: { $sum: '$reqNewQuotesCount' },
					},
				},
			])
			.exec();

		const totalQuotes = quotesAgg.length ? quotesAgg[0].totalQuotes : 0;
		const newQuotes = quotesAgg.length ? quotesAgg[0].newQuotes : 0;

		// Count active orders (IN_PROGRESS requests where a quote was accepted)
		const activeOrders = await this.serviceRequestModel
			.countDocuments({
				reqCreatedByUserId: userIdObj,
				reqStatus: ServiceRequestStatus.IN_PROGRESS,
			})
			.exec();

		// Notifications count — placeholder (returns 0 until notification system is integrated)
		const unreadNotifications = 0;

		return {
			activeRequests,
			totalQuotes,
			newQuotes,
			activeOrders,
			unreadNotifications,
		};
	}
}
