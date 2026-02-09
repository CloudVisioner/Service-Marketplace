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
import { NotificationType, NotificationGroup } from '../../libs/enums/notification.enum';

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

		// Get quote for notification
		const quote = await this.quoteModel.findById(order.orderQuoteId).exec();

		// Create notification for provider
		if (quote) {
			await this.notificationService.createNotification({
				notificationType: NotificationType.ORDER_CANCELLED,
				notificationGroup: NotificationGroup.ORDER,
				notificationTitle: 'Order Cancelled',
				notificationDesc: `The order for service request: ${serviceRequest.reqTitle} has been cancelled by the buyer.`,
				senderUserId: buyerId,
				receiverUserId: quote.quoteCreatedByUserId,
				organizationId: order.orderProviderOrgId,
				serviceRequestId: order.orderServiceReqId,
			});
		}

		return cancelledOrder;
	}
}
