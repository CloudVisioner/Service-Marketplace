import { Schema } from 'mongoose';

const PlatformSettingsSchema = new Schema(
	{
		siteName: {
			type: String,
			required: true,
			default: 'SMEConnect',
			trim: true,
		},
		supportEmail: {
			type: String,
			required: true,
			default: 'support@smeconnect.com',
			trim: true,
		},
		quoteRulesText: {
			type: String,
			required: false,
			trim: true,
		},
		termsLink: {
			type: String,
			required: false,
			trim: true,
		},
		privacyLink: {
			type: String,
			required: false,
			trim: true,
		},
		updatedBy: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: 'User',
		},
	},
	{ timestamps: true, collection: 'platformSettings' },
);

// Note: MongoDB doesn't allow custom indexes on _id field
// The singleton pattern is enforced at the application level

export default PlatformSettingsSchema;
