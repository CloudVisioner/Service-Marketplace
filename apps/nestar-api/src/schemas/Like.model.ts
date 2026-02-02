import { Schema } from 'mongoose';
import { LikeGroup } from '../libs/enums/like.enum';

const LikeSchema = new Schema(
	{
		likeGroup: {
			type: String,
			enum: LikeGroup,
			required: true,
		},

		likeRefId: {
			type: Schema.Types.ObjectId,
			required: true,
		},
		
		userId: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: 'User',
		},
	},
	{ timestamps: true, collection: 'likes' },
);

LikeSchema.index({ userId: 1, likeRefId: 1 }, { unique: true });

export default LikeSchema;
