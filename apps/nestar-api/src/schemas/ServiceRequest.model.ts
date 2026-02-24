import { Schema } from 'mongoose';
import { ServiceRequestStatus, Urgency } from '../libs/enums/service-request.enum';

const ServiceRequestSchema = new Schema(
	{
		reqTitle: {
			type: String,
			required: true,
		},

		reqDescription: {
			type: String,
			required: true,
		},

		reqBuyerOrgId: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: 'Organization',
		},

		reqStatus: {
			type: String,
			enum: ServiceRequestStatus,
			default: ServiceRequestStatus.DRAFT,
			required: true,
		},

		reqCategory: {
			type: String,
			required: true,
		},

		reqSubCategory: {
			type: String,
			required: false,
		},

		reqBudgetRange: {
			type: String,
			required: true,
		},

		reqDeadline: {
			type: Date,
			required: true,
		},

		reqUrgency: {
			type: String,
			enum: Urgency,
			default: Urgency.NORMAL,
			required: true,
		},

		reqSkillsNeeded: {
			type: [String],
			default: [],
		},

		reqAttachments: {
			type: [String],
			default: [],
		},

		reqTotalLikes: {
			type: Number,
			default: 0,
		},

		reqTotalViews: {
			type: Number,
			default: 0,
		},

		reqTotalQuotes: {
			type: Number,
			default: 0,
		},

		reqNewQuotesCount: {
			type: Number,
			default: 0,
		},

		reqCreatedByUserId: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: 'User',
		},
	},
	{ timestamps: true, collection: 'serviceRequests' },
);

// Index for buyer queries
ServiceRequestSchema.index({ reqCreatedByUserId: 1, reqStatus: 1 });
ServiceRequestSchema.index({ reqBuyerOrgId: 1, reqStatus: 1 });
ServiceRequestSchema.index({ reqCategory: 1, reqStatus: 1 });

export default ServiceRequestSchema;
