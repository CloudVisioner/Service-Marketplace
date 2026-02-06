import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Quote } from '../../libs/dto/quote/quote';
import { QuoteInput } from '../../libs/dto/quote/quote.input';
import { QuoteStatus } from '../../libs/enums/quote.enum';
import { Message } from '../../libs/enums/common.enum';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { NotificationService } from '../notification/notification.service';
import { NotificationType, NotificationGroup } from '../../libs/enums/notification.enum';
import { LikeService } from '../like/like.service';
import { LikeInput } from '../../libs/dto/like/like.input';
import { LikeGroup } from '../../libs/enums/like.enum';

@Injectable()
export class QuoteService {
	constructor(
		@InjectModel('Quote') private quoteModel: Model<Quote>,
		@InjectModel('ServiceRequest') private serviceRequestModel: Model<any>,
		@InjectModel('Organization') private organizationModel: Model<any>,
		private notificationService: NotificationService,
		private likeService: LikeService,
	) {}

	public async createQuote(orgId: ObjectId, userId: ObjectId, input: QuoteInput): Promise<Quote> {
		try {
			// Rule: Every user MUST have 1+ orgs to use platform
			// Check if user has at least one organization
			const userOrgs = await this.organizationModel
				.find({ orgOwnerUserId: userId })
				.exec();

			if (!userOrgs || userOrgs.length === 0) {
				throw new BadRequestException('You must have at least one organization to send quotes. Please create an organization first.');
			}

			// Verify organization exists and user is part of it
			const org = await this.organizationModel
				.findOne({
					_id: orgId,
					orgOwnerUserId: userId,
				})
				.exec();

			if (!org) {
				throw new BadRequestException('Organization not found or you are not the owner');
			}

			// Verify the organization is of type SERVICE_PROVIDER
			if (org.orgType !== 'SERVICE_PROVIDER') {
				throw new BadRequestException('Only SERVICE_PROVIDER organizations can send quotes.');
			}

			// Verify service request exists and is open
			const serviceRequest = await this.serviceRequestModel
				.findOne({
					_id: input.quoteServiceReqId,
					reqStatus: 'OPEN',
				})
				.exec();

			if (!serviceRequest) {
				throw new BadRequestException('Service request not found or not open for quotes');
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

			// Create notification for buyer
			await this.notificationService.createNotification({
				notificationType: NotificationType.NEW_QUOTE,
				notificationGroup: NotificationGroup.QUOTE,
				notificationTitle: 'New Quote Received',
				notificationDesc: `A new quote has been submitted for your service request: ${serviceRequest.reqTitle}`,
				senderUserId: userId,
				receiverUserId: serviceRequest.reqCreatedByUserId,
				organizationId: orgId,
				serviceRequestId: input.quoteServiceReqId,
			});

			return result;
		} catch (err) {
			console.log('Error, QuoteService.createQuote:', err.message);
			if (err instanceof BadRequestException) throw err;
			throw new BadRequestException(Message.CREATE_FAILED);
		}
	}

	public async acceptQuote(quoteId: ObjectId, buyerId: ObjectId): Promise<Quote> {
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

		// Check if quote is still pending
		if (quote.quoteStatus !== QuoteStatus.PENDING) {
			throw new BadRequestException('Quote is not in pending status');
		}

		// Update quote status to ACCEPTED
		const result = await this.quoteModel
			.findByIdAndUpdate(
				quoteIdObj,
				{ quoteStatus: QuoteStatus.ACCEPTED },
				{ new: true },
			)
			.exec();

		if (!result) {
			throw new InternalServerErrorException(Message.UPDATE_FAILED);
		}

		// Reject all other quotes for this service request
		await this.quoteModel.updateMany(
			{
				quoteServiceReqId: quote.quoteServiceReqId,
				_id: { $ne: quoteIdObj },
				quoteStatus: QuoteStatus.PENDING,
			},
			{ quoteStatus: QuoteStatus.REJECTED },
		);

		// Update service request status to IN_PROGRESS
		await this.serviceRequestModel.findByIdAndUpdate(quote.quoteServiceReqId, {
			reqStatus: 'IN_PROGRESS',
		});

		// Create notification for provider
		await this.notificationService.createNotification({
			notificationType: NotificationType.QUOTE_ACCEPTED,
			notificationGroup: NotificationGroup.QUOTE,
			notificationTitle: 'Quote Accepted',
			notificationDesc: `Your quote has been accepted for service request: ${serviceRequest.reqTitle}`,
			senderUserId: buyerId,
			receiverUserId: quote.quoteCreatedByUserId,
			organizationId: quote.quoteProviderOrgId,
			serviceRequestId: quote.quoteServiceReqId,
		});

		return result;
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

		// Create notification for provider
		await this.notificationService.createNotification({
			notificationType: NotificationType.QUOTE_REJECTED,
			notificationGroup: NotificationGroup.QUOTE,
			notificationTitle: 'Quote Rejected',
			notificationDesc: `Your quote has been rejected for service request: ${serviceRequest.reqTitle}`,
			senderUserId: buyerId,
			receiverUserId: quote.quoteCreatedByUserId,
			organizationId: quote.quoteProviderOrgId,
			serviceRequestId: quote.quoteServiceReqId,
		});

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

		// Populate meLiked for each quote if user is authenticated
		if (userId) {
			for (const quote of result) {
				const likeInput: LikeInput = {
					userId: userId,
					likeRefId: quote._id,
					likeGroup: LikeGroup.QUOTE,
				};
				quote.meLiked = await this.likeService.checkLikeExistence(likeInput);
			}
		}

		return result;
	}

	public async getQuotesByOrganization(orgId: ObjectId): Promise<Quote[]> {
		const orgIdObj = shapeIntoMongoObjectId(orgId);

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

	public async likeTargetQuote(userId: ObjectId, quoteId: ObjectId): Promise<Quote> {
		const quote: Quote = await this.quoteModel.findOne({ _id: quoteId }).lean().exec();
		if (!quote) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		const input: LikeInput = {
			userId: userId,
			likeRefId: quoteId,
			likeGroup: LikeGroup.QUOTE,
		};

		await this.likeService.toggleLike(input);

		// Populate meLiked to show if current user liked this quote
		quote.meLiked = await this.likeService.checkLikeExistence(input);

		return quote;
	}
}
