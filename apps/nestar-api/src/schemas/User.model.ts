import { Schema } from 'mongoose';
import { UserRole, UserStatus, UserAuthType } from '../libs/enums/user.enum';

const UserSchema = new Schema(
	{
		// Account & Identity
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

		userAuthType: {
			type: String,
			enum: UserAuthType,
			default: UserAuthType.EMAIL,
			required: true,
		},

		userEmail: {
			type: String,
			index: { unique: true, sparse: true },
		},

		userPhone: {
			type: String,
			index: { unique: true, sparse: true },
		},

		userPassword: {
			type: String,
			select: false,
			required: true,
		},

		userNick: {
			type: String,
			required: true,
			unique: true,
			index: true,
		},

		userImage: {
			type: String,
			default: '',
		},

		// Business-related info
		userOrganizationId: {
			type: Schema.Types.ObjectId,
			ref: 'Organization',
			index: true,
		},

		userDescription: {
			type: String,
		},

		userLanguages: {
			type: [String],
			default: ['en'],
		},

		// Activity stats (auto-managed)
		userTotalServiceRequests: {
			type: Number,
			default: 0,
			required: true,
		},

		userTotalQuotes: {
			type: Number,
			default: 0,
			required: true,
		},

		userOrgCount: {
			type: Number,
			default: 0,
			required: true,
		},

		deletedAt: {
			type: Date,
		},
	},
	{ timestamps: true, collection: 'users' },
);

// Compound indexes for search
UserSchema.index({ userNick: 'text', userDescription: 'text' });

export default UserSchema;
