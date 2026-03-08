import { Schema } from 'mongoose';
import { ArticleStatus } from '../libs/enums/admin.enum';

const ArticleSchema = new Schema(
	{
		title: {
			type: String,
			required: true,
			trim: true,
		},
		slug: {
			type: String,
			required: true,
			unique: true,
			trim: true,
			lowercase: true,
		},
		shortDescription: {
			type: String,
			required: false,
			trim: true,
		},
		body: {
			type: String,
			required: true, // HTML content from Tiptap
		},
		thumbnail: {
			type: String,
			required: false,
		},
		tags: {
			type: [String],
			default: [],
		},
		status: {
			type: String,
			enum: ArticleStatus,
			default: ArticleStatus.DRAFT,
			required: true,
		},
		publishedAt: {
			type: Date,
			required: false,
		},
		createdBy: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: 'User',
		},
		updatedBy: {
			type: Schema.Types.ObjectId,
			required: false,
			ref: 'User',
		},
	},
	{ timestamps: true, collection: 'articles' },
);

// Indexes
ArticleSchema.index({ slug: 1 }, { unique: true });
ArticleSchema.index({ status: 1 });
ArticleSchema.index({ createdAt: -1 });
ArticleSchema.index({ publishedAt: -1 });
ArticleSchema.index({ tags: 1 });

export default ArticleSchema;
