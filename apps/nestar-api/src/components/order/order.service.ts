import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Order } from '../../libs/dto/order/order';
import { OrderStatus } from '../../libs/enums/order.enum';
import { QuoteStatus } from '../../libs/enums/quote.enum';
import { ServiceRequestStatus } from '../../libs/enums/service-request.enum';
import { Message } from '../../libs/enums/common.enum';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class OrderService {
	constructor(
		@InjectModel('Order') private orderModel: Model<Order>,
		@InjectModel('Quote') private quoteModel: Model<any>,
		@InjectModel('ServiceRequest') private serviceRequestModel: Model<any>,
		@InjectModel('Organization') private organizationModel: Model<any>,
		@InjectModel('User') private userModel: Model<any>,
		private notificationService: NotificationService,
	) {}

	public async cancelOrder(orderId: ObjectId, buyerId: ObjectId): Promise<Order> {
		const orderIdObj = shapeIntoMongoObjectId(orderId);

		// Get order
		const order = await this.orderModel.findById(orderIdObj).exec();

		if (!order) {
			throw new InternalServerErrorException(Message.NO_DATA_FOUND);
		}

		// Verify buyer owns the order (check via service request ownership)
		const serviceRequest = await this.serviceRequestModel.findById(order.orderServiceReqId).exec();
		if (!serviceRequest || serviceRequest.reqCreatedByUserId.toString() !== buyerId.toString()) {
			throw new BadRequestException('You can only cancel orders for your own service requests.');
		}

		// Block cancelling already cancelled orders
		if (order.orderStatus === OrderStatus.CANCELLED) {
			throw new BadRequestException('This order has already been cancelled.');
		}

		// Block cancelling completed orders
		if (order.orderStatus === OrderStatus.COMPLETED) {
			throw new BadRequestException('Cannot cancel a completed order.');
		}

		// Update order status to CANCELLED
		const cancelledOrder = await this.orderModel
			.findByIdAndUpdate(
				orderIdObj,
				{ orderStatus: OrderStatus.CANCELLED },
				{ new: true },
			)
			.exec();

		if (!cancelledOrder) {
			throw new InternalServerErrorException(Message.UPDATE_FAILED);
		}

		// Update related quote status to CANCELLED
		await this.quoteModel
			.findByIdAndUpdate(
				order.orderQuoteId,
				{ quoteStatus: QuoteStatus.CANCELLED },
				{ new: true },
			)
			.exec();

		// Update service request status back to OPEN (so buyer can accept other quotes)
		await this.serviceRequestModel
			.findByIdAndUpdate(
				order.orderServiceReqId,
				{ reqStatus: ServiceRequestStatus.OPEN },
				{ new: true },
			)
			.exec();

		// Note: ORDER_CANCELLED notification removed for MVP - only QUOTE_SENT and QUOTE_ACCEPTED

		return cancelledOrder;
	}

	// ============================================================================
	// ADMIN METHODS
	// ============================================================================

	/**
	 * Admin: Get all orders with pagination and filtering
	 */
	public async getAllOrdersForAdmin(input: any): Promise<any> {
		const match: any = {};

		if (input.search) {
			if (input.search.orderStatus) {
				match.orderStatus = input.search.orderStatus;
			}
			if (input.search.buyerOrgId) {
				match.orderBuyerOrgId = shapeIntoMongoObjectId(input.search.buyerOrgId);
			}
			if (input.search.providerOrgId) {
				match.orderProviderOrgId = shapeIntoMongoObjectId(input.search.providerOrgId);
			}
			if (input.search.amountMin || input.search.amountMax) {
				match.orderAmount = {};
				if (input.search.amountMin) {
					match.orderAmount.$gte = input.search.amountMin;
				}
				if (input.search.amountMax) {
					match.orderAmount.$lte = input.search.amountMax;
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

		const result = await this.orderModel
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
									localField: 'orderBuyerOrgId',
									foreignField: '_id',
									as: 'buyerOrg',
								},
							},
							{
								$unwind: { path: '$buyerOrg', preserveNullAndEmptyArrays: true },
							},
							{
								$lookup: {
									from: 'organizations',
									localField: 'orderProviderOrgId',
									foreignField: '_id',
									as: 'providerOrg',
								},
							},
							{
								$unwind: { path: '$providerOrg', preserveNullAndEmptyArrays: true },
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
	 * Admin: Get order by ID
	 */
	public async getOrderByIdForAdmin(orderId: string): Promise<Order> {
		const orderIdObj = shapeIntoMongoObjectId(orderId);
		const order = await this.orderModel.findById(orderIdObj).exec();

		if (!order) {
			throw new BadRequestException('Order not found.');
		}

		return order;
	}

	/**
	 * Admin: Change order status
	 */
	public async changeOrderStatusForAdmin(orderId: string, orderStatus: OrderStatus, adminNotes: string | undefined, adminId: ObjectId): Promise<Order> {
		const orderIdObj = shapeIntoMongoObjectId(orderId);
		const order = await this.orderModel.findById(orderIdObj).exec();

		if (!order) {
			throw new BadRequestException('Order not found.');
		}

		const updateData: any = {
			orderStatus,
		};

		if (adminNotes) {
			updateData.adminNotes = adminNotes;
		}

		const result = await this.orderModel.findByIdAndUpdate(
			orderIdObj,
			updateData,
			{ new: true },
		).exec();

		if (!result) {
			throw new InternalServerErrorException(Message.UPDATE_FAILED);
		}

		return result;
	}

	/**
	 * Admin: Add admin notes to order
	 */
	public async addOrderAdminNotesForAdmin(orderId: string, adminNotes: string, adminId: ObjectId): Promise<Order> {
		const orderIdObj = shapeIntoMongoObjectId(orderId);
		const order = await this.orderModel.findById(orderIdObj).exec();

		if (!order) {
			throw new BadRequestException('Order not found.');
		}

		const existingNotes = (order as any).adminNotes || '';
		const newNotes = existingNotes
			? `${existingNotes}\n\n[${new Date().toISOString()}] ${adminNotes}`
			: adminNotes;

		const result = await this.orderModel.findByIdAndUpdate(
			orderIdObj,
			{ adminNotes: newNotes },
			{ new: true },
		).exec();

		if (!result) {
			throw new InternalServerErrorException(Message.UPDATE_FAILED);
		}

		return result;
	}
}
