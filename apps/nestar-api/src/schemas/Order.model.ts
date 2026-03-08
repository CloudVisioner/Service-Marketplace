import { Schema } from 'mongoose';
import { OrderStatus } from '../libs/enums/order.enum';

const OrderSchema = new Schema(
	{
		orderBuyerOrgId: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: 'Organization',
		},

		orderProviderOrgId: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: 'Organization',
		},

		orderServiceReqId: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: 'ServiceRequest',
		},

		orderQuoteId: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: 'Quote',
		},

		orderCreatedByUserId: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: 'User',
		},

		orderStatus: {
			type: String,
			enum: OrderStatus,
			default: OrderStatus.NEW,
			required: true,
		},

		orderAmount: {
			type: Number,
			required: true,
		},

		adminNotes: {
			type: String,
			required: false,
		},
	},
	{ timestamps: true, collection: 'orders' },
);

export default OrderSchema;
