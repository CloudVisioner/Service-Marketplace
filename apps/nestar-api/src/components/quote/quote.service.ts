import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Quote } from '../../libs/dto/quote/quote';
import { QuoteInput } from '../../libs/dto/quote/quote.input';
import { QuoteStatus } from '../../libs/enums/quote.enum';
import { ServiceRequestStatus } from '../../libs/enums/service-request.enum';
import { OrderStatus } from '../../libs/enums/order.enum';
import { Message } from '../../libs/enums/common.enum';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { NotificationService } from '../notification/notification.service';
import { NotificationType } from '../../libs/enums/notification.enum';
import { Order } from '../../libs/dto/order/order';
import { AcceptQuoteResponse } from '../../libs/dto/quote/accept-quote-response';
import { ServiceRequest } from '../../libs/dto/service-request/service-request';
import { UserRole } from '../../libs/enums/user.enum';

@Injectable()
export class QuoteService {
	constructor(
		@InjectModel('Quote') private quoteModel: Model<Quote>,
		@InjectModel('ServiceRequest') private serviceRequestModel: Model<any>,
		@InjectModel('Organization') private organizationModel: Model<any>,
		@InjectModel('User') private userModel: Model<any>,
		@InjectModel('Order') private orderModel: Model<Order>,
		private notificationService: NotificationService,
	) {}

	public async createQuote(orgId: ObjectId, userId: ObjectId, input: QuoteInput): Promise<Quote> {
		try {
			// Rule: Only PROVIDER users can create quotes
			const user = await this.userModel.findById(userId).exec();
			if (!user) {
				throw new BadRequestException('User not found.');
			}

			if (user.userRole !== 'PROVIDER') {
				throw new BadRequestException('Only PROVIDER users can create quotes.');
			}

			// Verify organization exists and user owns it
			const org = await this.organizationModel
				.findOne({
					_id: orgId,
					orgOwnerUserId: userId,
				})
				.exec();

			if (!org) {
				throw new BadRequestException('Organization not found or you are not the owner.');
			}

			// Rule: Must own SERVICE_PROVIDER org
			if (org.orgType !== 'SERVICE_PROVIDER') {
				throw new BadRequestException('Only SERVICE_PROVIDER organizations can send quotes.');
			}

			// Verify service request exists
			const serviceRequest = await this.serviceRequestModel
				.findById(input.quoteServiceReqId)
				.exec();

			if (!serviceRequest) {
				throw new BadRequestException('Service request not found.');
			}

			// Verify service request is open for quotes
			if (serviceRequest.reqStatus !== ServiceRequestStatus.OPEN) {
				throw new BadRequestException(`Service request is not open for quotes. Current status: ${serviceRequest.reqStatus}. Only OPEN service requests can receive quotes.`);
			}

			// Check if quote already exists from this organization
			const existingQuote = await this.quoteModel
				.findOne({
					quoteServiceReqId: input.quoteServiceReqId,
					quoteProviderOrgId: orgId,
					quoteStatus: { $in: [QuoteStatus.PENDING, QuoteStatus.ACCEPTED] },
				})
				.exec();

			if (existingQuote) {
				throw new BadRequestException('You have already submitted a quote for this request');
			}

			const quoteData = {
				...input,
				quoteProviderOrgId: orgId,
				quoteCreatedByUserId: userId,
				quoteStatus: QuoteStatus.PENDING,
				quoteTotalLikes: 0,
			};

			const result = await this.quoteModel.create(quoteData);

			// Update service request quote count
			await this.serviceRequestModel.findByIdAndUpdate(input.quoteServiceReqId, {
				$inc: { reqTotalQuotes: 1 },
			});

			// Denormalized counter on user (provider) — kept in sync for admin/raw DB views
			await this.userModel.findByIdAndUpdate(userId, { $inc: { userTotalQuotes: 1 } }).exec();

			// Create notification for buyer - QUOTE_SENT
			await this.notificationService.createNotification({
				type: NotificationType.QUOTE_SENT,
				message: `A new quote has been submitted for your service request: ${serviceRequest.reqTitle}`,
				relatedQuoteId: result._id,
				senderUserId: userId,
				receiverUserId: serviceRequest.reqCreatedByUserId,
			});

			return result;
		} catch (err) {
			console.log('Error, QuoteService.createQuote:', err.message);
			if (err instanceof BadRequestException) throw err;
			throw new BadRequestException(Message.CREATE_FAILED);
		}
	}

	public async acceptQuote(quoteId: ObjectId, buyerId: ObjectId): Promise<AcceptQuoteResponse> {
		const quoteIdObj = shapeIntoMongoObjectId(quoteId);

		// Get quote
		const quote = await this.quoteModel
			.findOne({ _id: quoteIdObj })
			.exec();

		if (!quote) {
			throw new InternalServerErrorException(Message.NO_DATA_FOUND);
		}

		// Verify buyer owns the service request
		const serviceRequest = await this.serviceRequestModel.findById(quote.quoteServiceReqId).exec();
		if (!serviceRequest || serviceRequest.reqCreatedByUserId.toString() !== buyerId.toString()) {
			throw new BadRequestException('You can only accept quotes for your own service requests');
		}

		// Only OPEN service requests can accept quotes (lifecycle rule)
		if (serviceRequest.reqStatus !== ServiceRequestStatus.OPEN) {
			throw new BadRequestException(
				`Cannot accept quote. Service request is ${serviceRequest.reqStatus}. Only OPEN service requests can accept quotes.`,
			);
		}

		// Check if quote is still pending
		if (quote.quoteStatus !== QuoteStatus.PENDING) {
			throw new BadRequestException('Quote is not in pending status');
		}

		// Update quote status to ACCEPTED
		const acceptedQuote = await this.quoteModel
			.findByIdAndUpdate(
				quoteIdObj,
				{ quoteStatus: QuoteStatus.ACCEPTED },
				{ new: true },
			)
			.exec();

		if (!acceptedQuote) {
			throw new InternalServerErrorException(Message.UPDATE_FAILED);
		}

		// Reject all other quotes for this service request (lock other quotes)
		await this.quoteModel.updateMany(
			{
				quoteServiceReqId: quote.quoteServiceReqId,
				_id: { $ne: quoteIdObj },
				quoteStatus: QuoteStatus.PENDING,
			},
			{ quoteStatus: QuoteStatus.REJECTED },
		);

		// Update service request status to ACTIVE (automatic transition when quote is accepted)
		const updatedServiceRequest = await this.serviceRequestModel
			.findByIdAndUpdate(
				quote.quoteServiceReqId,
				{ reqStatus: ServiceRequestStatus.ACTIVE },
				{ new: true },
			)
			.exec();

		if (!updatedServiceRequest) {
			throw new InternalServerErrorException(Message.UPDATE_FAILED);
		}

		// Create new Order/Project linking buyer → accepted provider → accepted quote
		const newOrder = await this.orderModel.create({
			orderBuyerOrgId: serviceRequest.reqBuyerOrgId,
			orderProviderOrgId: quote.quoteProviderOrgId,
			orderServiceReqId: quote.quoteServiceReqId,
			orderQuoteId: quoteIdObj,
			orderCreatedByUserId: buyerId,
			orderStatus: OrderStatus.NEW,
			orderAmount: quote.quoteAmount,
		});

		// Create notification for provider - QUOTE_ACCEPTED
		await this.notificationService.createNotification({
			type: NotificationType.QUOTE_ACCEPTED,
			message: `Your quote was accepted! Order #${newOrder._id.toString().slice(-6)}`,
			relatedQuoteId: quoteIdObj,
			senderUserId: buyerId,
			receiverUserId: quote.quoteCreatedByUserId,
		});

		return {
			quote: acceptedQuote,
			serviceRequest: updatedServiceRequest,
			order: newOrder,
		};
	}

	public async rejectQuote(quoteId: ObjectId, buyerId: ObjectId): Promise<Quote> {
		const quoteIdObj = shapeIntoMongoObjectId(quoteId);

		const quote = await this.quoteModel.findById(quoteIdObj).exec();

		if (!quote) {
			throw new InternalServerErrorException(Message.NO_DATA_FOUND);
		}

		// Verify buyer owns the service request
		const serviceRequest = await this.serviceRequestModel.findById(quote.quoteServiceReqId).exec();
		if (!serviceRequest || serviceRequest.reqCreatedByUserId.toString() !== buyerId.toString()) {
			throw new BadRequestException('You can only reject quotes for your own service requests');
		}

		// Block rejecting ACCEPTED quotes - use cancelOrder() API instead
		if (quote.quoteStatus === QuoteStatus.ACCEPTED) {
			throw new BadRequestException(
				'Cannot reject an accepted quote. This quote has already been accepted and an order has been created. Use the cancelOrder API if you need to cancel the order.',
			);
		}

		// Only allow rejecting PENDING quotes
		if (quote.quoteStatus !== QuoteStatus.PENDING) {
			throw new BadRequestException(
				`Cannot reject quote. Quote status is ${quote.quoteStatus}. Only PENDING quotes can be rejected.`,
			);
		}

		// Update quote status to REJECTED
		const result = await this.quoteModel
			.findByIdAndUpdate(
				quoteIdObj,
				{ quoteStatus: QuoteStatus.REJECTED },
				{ new: true },
			)
			.exec();

		if (!result) {
			throw new InternalServerErrorException(Message.UPDATE_FAILED);
		}

		// Note: QUOTE_REJECTED notification removed for MVP - only QUOTE_SENT and QUOTE_ACCEPTED

		return result;
	}

	public async getQuotesByRequest(requestId: ObjectId, userId?: ObjectId | null): Promise<Quote[]> {
		const requestIdObj = shapeIntoMongoObjectId(requestId);

		const result = await this.quoteModel
			.aggregate([
				{ $match: { quoteServiceReqId: requestIdObj } },
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
			])
			.exec();

		return result;
	}

	public async getQuotesByOrganization(orgId: ObjectId, userId: ObjectId, userRole: string): Promise<Quote[]> {
		const orgIdObj = shapeIntoMongoObjectId(orgId);
		const userIdObj = shapeIntoMongoObjectId(userId);

		// Verify organization exists
		const org = await this.organizationModel.findById(orgIdObj).exec();
		if (!org) {
			throw new BadRequestException('Organization not found.');
		}

		// Check access: Admin can see all, Owner can see their own org's quotes
		const orgOwnerId = shapeIntoMongoObjectId(org.orgOwnerUserId);
		const isAdmin = userRole === UserRole.ADMIN;
		const isOwner = orgOwnerId.equals(userIdObj);

		if (!isAdmin && !isOwner) {
			throw new BadRequestException('You can only view quotes for organizations you own. Access denied.');
		}

		const result = await this.quoteModel
			.aggregate([
				{ $match: { quoteProviderOrgId: orgIdObj } },
				{
					$lookup: {
						from: 'serviceRequests',
						localField: 'quoteServiceReqId',
						foreignField: '_id',
						as: 'quoteServiceReqData',
					},
				},
				{
					$unwind: { path: '$quoteServiceReqData', preserveNullAndEmptyArrays: true },
				},
				{ $sort: { createdAt: -1 } },
			])
			.exec();

		return result;
	}

	public async updateQuote(quoteId: ObjectId, userId: ObjectId, input: any): Promise<Quote> {
		const quoteIdObj = shapeIntoMongoObjectId(quoteId);

		// Get quote
		const quote = await this.quoteModel.findById(quoteIdObj).exec();
		if (!quote) {
			throw new BadRequestException('Quote not found.');
		}

		// Verify user is the creator of the quote
		if (quote.quoteCreatedByUserId.toString() !== userId.toString()) {
			throw new BadRequestException('You can only update quotes you created.');
		}

		// Only allow updating PENDING quotes
		if (quote.quoteStatus !== QuoteStatus.PENDING) {
			throw new BadRequestException(`Cannot update quote. Quote status is ${quote.quoteStatus}. Only PENDING quotes can be updated.`);
		}

		// Build update object with only provided fields
		const updateData: any = {};
		if (input.quoteMessage !== undefined) {
			updateData.quoteMessage = input.quoteMessage;
		}
		if (input.quoteAmount !== undefined) {
			updateData.quoteAmount = input.quoteAmount;
		}
		if (input.quoteValidUntil !== undefined) {
			updateData.quoteValidUntil = input.quoteValidUntil;
		}

		// Check if there's anything to update
		if (Object.keys(updateData).length === 0) {
			throw new BadRequestException('No fields provided to update.');
		}

		const result = await this.quoteModel
			.findByIdAndUpdate(quoteIdObj, updateData, { new: true })
			.exec();

		if (!result) {
			throw new InternalServerErrorException(Message.UPDATE_FAILED);
		}

		return result;
	}

	public async deleteQuote(quoteId: ObjectId, userId: ObjectId): Promise<Quote> {
		const quoteIdObj = shapeIntoMongoObjectId(quoteId);

		// Get quote
		const quote = await this.quoteModel.findById(quoteIdObj).exec();
		if (!quote) {
			throw new BadRequestException('Quote not found.');
		}

		// Verify user is the creator of the quote
		if (quote.quoteCreatedByUserId.toString() !== userId.toString()) {
			throw new BadRequestException('You can only delete quotes you created.');
		}

		// Only allow deleting PENDING quotes
		if (quote.quoteStatus !== QuoteStatus.PENDING) {
			throw new BadRequestException(`Cannot delete quote. Quote status is ${quote.quoteStatus}. Only PENDING quotes can be deleted.`);
		}

		// Delete the quote
		const result = await this.quoteModel.findByIdAndDelete(quoteIdObj).exec();

		if (!result) {
			throw new InternalServerErrorException(Message.REMOVE_FAILED);
		}

		// Update service request quote count
		await this.serviceRequestModel.findByIdAndUpdate(quote.quoteServiceReqId, {
			$inc: { reqTotalQuotes: -1 },
		});

		await this.userModel.updateOne(
			{ _id: quote.quoteCreatedByUserId, userTotalQuotes: { $gt: 0 } },
			{ $inc: { userTotalQuotes: -1 } },
		).exec();

		return result;
	}

	public async getProvidersQuote(requestId: ObjectId, buyerId: ObjectId): Promise<Quote[]> {
		const requestIdObj = shapeIntoMongoObjectId(requestId);

		// Verify service request exists
		const serviceRequest = await this.serviceRequestModel.findById(requestIdObj).exec();
		if (!serviceRequest) {
			throw new BadRequestException('Service request not found.');
		}

		// Verify buyer owns the service request
		if (serviceRequest.reqCreatedByUserId.toString() !== buyerId.toString()) {
			throw new BadRequestException('You can only view quotes for your own service requests.');
		}

		// Get all quotes for this service request with provider and user data
		const result = await this.quoteModel
			.aggregate([
				{ $match: { quoteServiceReqId: requestIdObj } },
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
			])
			.exec();

		return result;
	}

	// ============================================================================
	// ADMIN METHODS
	// ============================================================================

	/**
	 * Admin: Get all quotes with pagination and filtering
	 */
	public async getAllQuotesForAdmin(input: any): Promise<any> {
		const match: any = {};

		if (input.search) {
			if (input.search.quoteStatus) {
				match.quoteStatus = input.search.quoteStatus;
			}
			if (input.search.providerOrgId) {
				match.quoteProviderOrgId = shapeIntoMongoObjectId(input.search.providerOrgId);
			}
			if (input.search.serviceRequestId) {
				match.quoteServiceReqId = shapeIntoMongoObjectId(input.search.serviceRequestId);
			}
			if (input.search.isFlagged !== undefined && input.search.isFlagged !== null) {
				match.isFlagged = input.search.isFlagged;
			}
			if (input.search.amountMin || input.search.amountMax) {
				match.quoteAmount = {};
				if (input.search.amountMin) {
					match.quoteAmount.$gte = input.search.amountMin;
				}
				if (input.search.amountMax) {
					match.quoteAmount.$lte = input.search.amountMax;
				}
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

		const result = await this.quoteModel
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
									from: 'organizations',
									localField: 'quoteProviderOrgId',
									foreignField: '_id',
									as: 'quoteProviderOrgData',
								},
							},
							{
								$unwind: { path: '$quoteProviderOrgData', preserveNullAndEmptyArrays: true },
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
	 * Admin: Get quote by ID
	 */
	public async getQuoteByIdForAdmin(quoteId: string): Promise<Quote> {
		const quoteIdObj = shapeIntoMongoObjectId(quoteId);
		const quote = await this.quoteModel.findById(quoteIdObj).exec();

		if (!quote) {
			throw new BadRequestException('Quote not found.');
		}

		return quote;
	}

	/**
	 * Admin: Flag quote (creates dispute)
	 */
	public async flagQuoteForAdmin(quoteId: string, reason: string, adminId: ObjectId): Promise<Quote> {
		const quoteIdObj = shapeIntoMongoObjectId(quoteId);
		const quote = await this.quoteModel.findById(quoteIdObj).exec();

		if (!quote) {
			throw new BadRequestException('Quote not found.');
		}

		// Set isFlagged to true and store flag details
		const result = await this.quoteModel.findByIdAndUpdate(
			quoteIdObj,
			{
				isFlagged: true,
				flaggedAt: new Date(),
				flaggedBy: adminId,
				flagReason: reason,
			},
			{ new: true },
		).exec();

		if (!result) {
			throw new InternalServerErrorException(Message.UPDATE_FAILED);
		}

		return result;
	}

	/**
	 * Admin: Hard delete quote
	 */
	public async hardDeleteQuoteForAdmin(quoteId: string): Promise<boolean> {
		const quoteIdObj = shapeIntoMongoObjectId(quoteId);
		const result = await this.quoteModel.findByIdAndDelete(quoteIdObj).exec();
		return !!result;
	}

}
