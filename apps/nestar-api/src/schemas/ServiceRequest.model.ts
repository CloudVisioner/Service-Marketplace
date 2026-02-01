import { Schema } from 'mongoose';
import { ServiceRequestStatus } from '../libs/enums/service-request.enum';

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
			required: true,
		},

		reqBudgetMin: {
			type: Number,
			required: true,
		},

		reqBudgetMax: {
			type: Number,
			required: true,
		},

		reqDeadline: {
			type: Date,
			required: true,
		},

		reqSkillsNeeded: {
			type: [String],
			required: true,
		},

		reqTotalLikes: {
			type: Number,
			default: 0,
			required: true,
		},

		reqTotalViews: {
			type: Number,
			default: 0,
			required: true,
		},

		reqTotalQuotes: {
			type: Number,
			default: 0,
			required: true,
		},

		reqCreatedByUserId: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: 'User',
		},
	},
	{ timestamps: true, collection: 'serviceRequests' },
);

export default ServiceRequestSchema;
