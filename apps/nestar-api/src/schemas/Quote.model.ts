import { Schema } from 'mongoose';
import { QuoteStatus } from '../libs/enums/quote.enum';

const QuoteSchema = new Schema(
	{
		quoteProviderOrgId: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: 'Organization',
		},

		quoteServiceReqId: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: 'ServiceRequest',
		},

		quoteCreatedByUserId: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: 'User',
		},

		quoteMessage: {
			type: String,
			required: true,
		},

		quoteStatus: {
			type: String,
			enum: QuoteStatus,
			required: true,
		},

		quoteTotalLikes: {
			type: Number,
			default: 0,
			required: true,
		},

		quoteAmount: {
			type: Number,
			required: true,
		},

		quoteValidUntil: {
			type: Date,
			required: true,
		},

		isFlagged: {
			type: Boolean,
			default: false,
			required: true,
		},

		flaggedAt: {
			type: Date,
			required: false,
		},

		flaggedBy: {
			type: Schema.Types.ObjectId,
			required: false,
			ref: 'User',
		},

		flagReason: {
			type: String,
			required: false,
		},
	},
	{ timestamps: true, collection: 'quotes' },
);

export default QuoteSchema;
