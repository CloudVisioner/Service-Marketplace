import { Schema } from 'mongoose';
import { OrganizationType, OrganizationStatus } from '../libs/enums/organization.enum';

const OrganizationSchema = new Schema(
	{
		orgType: {
			type: String,
			enum: OrganizationType,
			required: true,
		},

		orgStatus: {
			type: String,
			enum: OrganizationStatus,
			default: OrganizationStatus.ACTIVE,
			required: true,
		},

		orgCountry: {
			type: String,
			required: true,
		},

		orgCity: {
			type: String,
			required: true,
		},


		orgTotalProjects: {
			type: Number,
			default: 0,
			required: true,
		},

		orgResponseTimeAvg: {
			type: Number,
			default: 0,
			required: true,
		},

		orgVerified: {
			type: Boolean,
			default: false,
			required: true,
		},

		orgSkills: {
			type: String,
			required: true,
		},

		orgOwnerUserId: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: 'User',
		},

		orgName: {
			type: String,
			required: true,
			index: { unique: true },
		},

		orgDescription: {
			type: String,
			required: true,
		},

		orgAverageRating: {
			type: Number,
			default: 0,
			required: true,
		},

		orgTotalLikes: {
			type: Number,
			default: 0,
			required: true,
		},

		orgTotalViews: {
			type: Number,
			default: 0,
			required: true,
		},

		orgLogoImages: {
			type: [String],
			required: true,
		},

		orgTaxId: {
			type: String,
			required: true,
			index: { unique: true },
		},

		orgWebsiteUrl: {
			type: String,
			required: true,
			index: { unique: true },
		},

		deletedAt: {
			type: Date,
		},
	},
	{ timestamps: true, collection: 'organizations' },
);

// Compound text index for search functionality
OrganizationSchema.index(
	{ orgName: 'text', orgDescription: 'text', orgCountry: 'text', orgCity: 'text' },
	{ name: 'org_search_text_index' }
);

export default OrganizationSchema;
