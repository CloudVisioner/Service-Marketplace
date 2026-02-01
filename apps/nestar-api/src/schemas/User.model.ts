import { Schema } from 'mongoose';
import { UserRole, UserStatus } from '../libs/enums/user.enum';

const UserSchema = new Schema(
	{
		userRole: {
			type: String,
			enum: UserRole,
			required: true,
		},

		userStatus: {
			type: String,
			enum: UserStatus,
			default: UserStatus.ACTIVE,
			required: true,
		},

		userEmail: {
			type: String,
			index: { unique: true, sparse: true },
			required: true,
		},

		userNick: {
			type: String,
			required: true,
		},

		userPassword: {
			type: String,
			select: false,
			required: true,
		},

		userFullName: {
			type: String,
		},

		deletedAt: {
			type: Date,
		},
	},
	{ timestamps: true, collection: 'users' },
);

export default UserSchema;
