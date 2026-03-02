import { Schema } from 'mongoose';

const RatingSchema = new Schema(
	{
		orgId: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: 'Organization',
		},
		
		userId: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: 'User',
		},

		rating: {
			type: Number,
			required: true,
			min: 1,
			max: 5,
		},
	},
	{ timestamps: true, collection: 'ratings' },
);

// Unique index: one user can only have one rating per organization
RatingSchema.index({ userId: 1, orgId: 1 }, { unique: true });

export default RatingSchema;
