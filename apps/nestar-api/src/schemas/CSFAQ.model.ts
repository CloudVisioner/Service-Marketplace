import { Schema } from 'mongoose';

const CSFAQSchema = new Schema(
	{
		question: {
			type: String,
			required: true,
			trim: true,
		},
		answer: {
			type: String,
			required: true,
			trim: true,
		},
		category: {
			type: String,
			required: true,
			trim: true,
		},
		order: {
			type: Number,
			required: true,
			default: 0,
		},
	},
	{ timestamps: true, collection: 'csFaqs' },
);

export default CSFAQSchema;

