import { Schema } from 'mongoose';

const FollowSchema = new Schema(
	{
		followedOrgId: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: 'Organization',
		},

		followerUserId: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: 'User',
		},
	},
	{ timestamps: true, collection: "follows"},
);

FollowSchema.index({ followedOrgId: 1, followerUserId: 1 }, { unique: true });

export default FollowSchema;
