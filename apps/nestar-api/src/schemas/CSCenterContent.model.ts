import { Schema } from 'mongoose';

const CSQuickAccessCardSchema = new Schema(
	{
		title: {
			type: String,
			required: true,
			trim: true,
		},
		description: {
			type: String,
			required: true,
			trim: true,
		},
		icon: {
			type: String,
			required: true,
			trim: true,
		},
		link: {
			type: String,
			required: false,
			trim: true,
		},
		color: {
			type: String,
			required: true,
			trim: true,
		},
	},
	{ _id: false },
);

const CSContactMethodSchema = new Schema(
	{
		type: {
			type: String,
			required: true,
			trim: true,
		},
		label: {
			type: String,
			required: true,
			trim: true,
		},
		value: {
			type: String,
			required: true,
			trim: true,
		},
		availability: {
			type: String,
			required: true,
			trim: true,
		},
		icon: {
			type: String,
			required: true,
			trim: true,
		},
	},
	{ _id: false },
);

const CSCenterContentSchema = new Schema(
	{
		heroTitle: {
			type: String,
			required: false,
			trim: true,
		},
		heroDescription: {
			type: String,
			required: false,
			trim: true,
		},
		heroImage: {
			type: String,
			required: false,
			trim: true,
		},
		quickAccessCards: {
			type: [CSQuickAccessCardSchema],
			required: false,
			default: [],
		},
		contactMethods: {
			type: [CSContactMethodSchema],
			required: false,
			default: [],
		},
		updatedBy: {
			type: Schema.Types.ObjectId,
			required: false,
			ref: 'User',
		},
	},
	{ timestamps: true, collection: 'csCenterContent' },
);

export default CSCenterContentSchema;

