import { Schema } from 'mongoose';
import { DisputeType, DisputeStatus } from '../libs/enums/admin.enum';

const DisputeSchema = new Schema(
	{
		disputeType: {
			type: String,
			enum: DisputeType,
			required: true,
		},
		disputeStatus: {
			type: String,
			enum: DisputeStatus,
			default: DisputeStatus.OPEN,
			required: true,
		},
		orderId: {
			type: Schema.Types.ObjectId,
			required: false,
			ref: 'Order',
		},
		userId: {
			type: Schema.Types.ObjectId,
			required: false,
			ref: 'User',
		},
		requestId: {
			type: Schema.Types.ObjectId,
			required: false,
			ref: 'ServiceRequest',
		},
		quoteId: {
			type: Schema.Types.ObjectId,
			required: false,
			ref: 'Quote',
		},
		title: {
			type: String,
			required: true,
			trim: true,
		},
		description: {
			type: String,
			required: false,
			trim: true,
		},
		reason: {
			type: String,
			required: false, // For flagged items
			trim: true,
		},
		amount: {
			type: Number,
			required: false, // For order disputes
		},
		buyerOrg: {
			type: String,
			required: false,
		},
		providerOrg: {
			type: String,
			required: false,
		},
		userName: {
			type: String,
			required: false,
		},
		userEmail: {
			type: String,
			required: false,
		},
		adminNotes: {
			type: String,
			required: false,
			trim: true,
		},
		resolvedAt: {
			type: Date,
			required: false,
		},
		resolvedBy: {
			type: Schema.Types.ObjectId,
			required: false,
			ref: 'User',
		},
	},
	{ timestamps: true, collection: 'disputes' },
);

// Indexes
DisputeSchema.index({ disputeType: 1, disputeStatus: 1 });
DisputeSchema.index({ createdAt: -1 });
DisputeSchema.index({ orderId: 1 });
DisputeSchema.index({ userId: 1 });

export default DisputeSchema;
