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
			required: false,
		},

		orgCity: {
			type: String,
			required: false,
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
			type: [String],
			default: [],
		},

		orgOwnerUserId: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: 'User',
		},

		organizationName: {
			type: String,
			required: true,
			unique: true,
			sparse: false,
		},

		organizationDescription: {
			type: String,
			required: false,
		},

		organizationIndustry: {
			type: String,
			required: false,
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

		organizationImage: {
			type: String,
			required: false,
		},

		orgTaxId: {
			type: String,
			required: false,
			index: { unique: true, sparse: true },
		},

		organizationWebsiteUrl: {
			type: String,
			required: false,
			unique: true,
			sparse: true,
		},

		// Provider marketplace fields
		categoryId: {
			type: [String],
			enum: ['IT_AND_SOFTWARE', 'BUSINESS_SERVICES', 'MARKETING_AND_SALES', 'DESIGN_AND_CREATIVE'],
			index: true,
			default: [],
		},

		subCategory: {
			type: [String],
			enum: [
				'WEB_APP_DEVELOPMENT',
				'DATA_AND_AI',
				'SOFTWARE_TESTING_AND_QA',
				'INFRASTRUCTURE_AND_CLOUD',
				'ADMIN_AND_VIRTUAL_SUPPORT',
				'FINANCIAL_AND_LEGAL',
				'STRATEGY_AND_CONSULTING',
				'HR_AND_OPERATIONS',
				'DIGITAL_MARKETING',
				'SOCIAL_MEDIA_MANAGEMENT',
				'CONTENT_AND_COPYWRITING',
				'SALES_AND_LEAD_GEN',
				'VISUAL_IDENTITY_AND_BRANDING',
				'UI_UX_AND_WEB_DESIGN',
				'MOTION_AND_VIDEO',
				'ILLUSTRATION_AND_PRINT',
			],
			default: [],
		},

		serviceTitle: {
			type: String,
		},

		organizationHourlyRate: {
			type: Number,
			default: 0,
		},

		establishmentYear: {
			type: Number,
		},

		organizationTeamSize: {
			type: Number,
			default: 0,
		},

		organizationSpecialties: {
			type: [String],
			default: [],
		},

		industries: {
			type: [String],
			default: [],
		},

		minProjectSize: {
			type: Number,
			default: 0,
		},

		budgetRange: {
			type: String,
		},

		bio: {
			type: String,
		},

		avatar: {
			type: String,
		},

		badges: {
			type: [String],
			default: [],
		},

		color: {
			type: String,
		},

		organizationLocation: {
			type: String,
		},

		flag: {
			type: String,
		},

		reviewsCount: {
			type: Number,
			default: 0,
			required: true,
		},

		organizationEmail: {
			type: String,
		},

		organizationPhoneNumber: {
			type: String,
		},

		socialLinks: {
			linkedIn: { type: String },
			twitter: { type: String },
			github: { type: String },
		},

		deletedAt: {
			type: Date,
		},
	},
	{ timestamps: true, collection: 'organizations' },
);

// Compound text index for search functionality
OrganizationSchema.index(
	{ organizationName: 'text', organizationDescription: 'text', orgCountry: 'text', orgCity: 'text' },
	{ name: 'org_search_text_index' }
);

// Drop old orgName index if it exists (migration helper)
// Run this once in MongoDB: db.organizations.dropIndex("orgName_1")

export default OrganizationSchema;
