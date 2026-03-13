import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Article, GetAllArticlesResponse } from '../../../libs/dto/admin/admin.output';
import { GetAllArticlesInput, CreateArticleInput, UpdateArticleInput } from '../../../libs/dto/admin/admin.input';
import { ArticleStatus } from '../../../libs/enums/admin.enum';
import { Message } from '../../../libs/enums/common.enum';
import { T } from '../../../libs/types/common';
import { shapeIntoMongoObjectId } from '../../../libs/config';

@Injectable()
export class ArticleService {
	constructor(
		@InjectModel('Article') private articleModel: Model<Article>,
	) {}

	/**
	 * Generate URL-friendly slug from title
	 */
	private generateSlug(title: string): string {
		return title
			.toLowerCase()
			.trim()
			.replace(/[^\w\s-]/g, '')
			.replace(/[\s_-]+/g, '-')
			.replace(/^-+|-+$/g, '');
	}

	/**
	 * Ensure slug uniqueness by appending number if needed
	 */
	private async ensureUniqueSlug(slug: string, excludeId?: ObjectId): Promise<string> {
		let uniqueSlug = slug;
		let counter = 1;

		while (true) {
			const existing = await this.articleModel.findOne({
				slug: uniqueSlug,
				...(excludeId && { _id: { $ne: excludeId } }),
			}).exec();

			if (!existing) {
				return uniqueSlug;
			}

			uniqueSlug = `${slug}-${counter}`;
			counter++;
		}
	}

	/**
	 * Get all published articles (public - no auth required)
	 */
	public async getPublishedArticles(input: GetAllArticlesInput): Promise<GetAllArticlesResponse> {
		const match: T = {
			status: ArticleStatus.PUBLISHED,
		};

		if (input.search) {
			if (input.search.title) {
				match.title = { $regex: input.search.title, $options: 'i' };
			}
			if (input.search.slug) {
				match.slug = input.search.slug;
			}
			if (input.search.tags && input.search.tags.length > 0) {
				match.tags = { $in: input.search.tags };
			}
			if (input.search.createdAtFrom || input.search.createdAtTo) {
				match.createdAt = {};
				if (input.search.createdAtFrom) {
					match.createdAt.$gte = new Date(input.search.createdAtFrom);
				}
				if (input.search.createdAtTo) {
					match.createdAt.$lte = new Date(input.search.createdAtTo);
				}
			}
		}

		const result = await this.articleModel
			.aggregate([
				{ $match: match },
				{ $sort: { publishedAt: -1, createdAt: -1 } },
				{
					$facet: {
						list: [
							{ $skip: (input.page - 1) * input.limit },
							{ $limit: input.limit },
						],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();

		if (!result.length) {
			return { list: [], metaCounter: [{ total: 0 }] };
		}

		return result[0];
	}

	/**
	 * Get all articles with pagination and filtering (admin only)
	 */
	public async getAllArticles(input: GetAllArticlesInput): Promise<GetAllArticlesResponse> {
		const match: T = {};

		if (input.search) {
			if (input.search.title) {
				match.title = { $regex: input.search.title, $options: 'i' };
			}
			if (input.search.slug) {
				match.slug = input.search.slug;
			}
			if (input.search.status) {
				match.status = input.search.status;
			}
			if (input.search.tags && input.search.tags.length > 0) {
				match.tags = { $in: input.search.tags };
			}
			if (input.search.createdAtFrom || input.search.createdAtTo) {
				match.createdAt = {};
				if (input.search.createdAtFrom) {
					match.createdAt.$gte = new Date(input.search.createdAtFrom);
				}
				if (input.search.createdAtTo) {
					match.createdAt.$lte = new Date(input.search.createdAtTo);
				}
			}
		}

		const result = await this.articleModel
			.aggregate([
				{ $match: match },
				{ $sort: { createdAt: -1 } },
				{
					$facet: {
						list: [
							{ $skip: (input.page - 1) * input.limit },
							{ $limit: input.limit },
						],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();

		if (!result.length) {
			return { list: [], metaCounter: [{ total: 0 }] };
		}

		return result[0];
	}

	/**
	 * Get article by ID
	 */
	public async getArticleById(articleId: string): Promise<Article> {
		const articleIdObj = shapeIntoMongoObjectId(articleId);
		const article = await this.articleModel.findById(articleIdObj).exec();

		if (!article) {
			throw new NotFoundException('Article not found.');
		}

		return article;
	}

	/**
	 * Get article by slug (public - only published)
	 */
	public async getArticleBySlug(slug: string): Promise<Article> {
		const article = await this.articleModel.findOne({
			slug,
			status: ArticleStatus.PUBLISHED,
		}).exec();

		if (!article) {
			throw new NotFoundException('Article not found or not published.');
		}

		return article;
	}

	/**
	 * Create new article
	 */
	public async createArticle(input: CreateArticleInput, userId: ObjectId): Promise<Article> {
		try {
			// Generate slug if not provided or ensure uniqueness
			let slug = input.slug || this.generateSlug(input.title);
			slug = await this.ensureUniqueSlug(slug);

		// Set publishedAt if status is PUBLISHED
		let publishedAt: Date | undefined;
		if (input.status === ArticleStatus.PUBLISHED) {
			if (input.publishedAt) {
				const date = new Date(input.publishedAt);
				publishedAt = isNaN(date.getTime()) ? new Date() : date;
			} else {
				publishedAt = new Date();
			}
		}

			const articleData: any = {
				title: input.title,
				slug,
				shortDescription: input.shortDescription,
				body: input.body,
				thumbnail: input.thumbnail,
				articleCoverImage: input.articleCoverImage,
				tags: input.tags || [],
				status: input.status,
				publishedAt,
				createdBy: userId,
			};

			const result = await this.articleModel.create(articleData);
			return result;
		} catch (err) {
			console.error('Error creating article:', err.message);
			if (err.code === 11000) {
				throw new BadRequestException('Article with this slug already exists.');
			}
			throw new InternalServerErrorException(Message.CREATE_FAILED);
		}
	}

	/**
	 * Update article
	 */
	public async updateArticle(input: UpdateArticleInput, userId: ObjectId): Promise<Article> {
		const articleIdObj = shapeIntoMongoObjectId(input.articleId);
		const existingArticle = await this.articleModel.findById(articleIdObj).exec();

		if (!existingArticle) {
			throw new NotFoundException('Article not found.');
		}

		try {
			const updateData: any = {
				updatedBy: userId,
			};

			if (input.title) {
				updateData.title = input.title;
				// Regenerate slug if title changed and slug not provided
				if (!input.slug) {
					updateData.slug = await this.ensureUniqueSlug(
						this.generateSlug(input.title),
						articleIdObj,
					);
				}
			}

			if (input.slug) {
				updateData.slug = await this.ensureUniqueSlug(input.slug, articleIdObj);
			}

			if (input.shortDescription !== undefined) {
				updateData.shortDescription = input.shortDescription;
			}

			if (input.body !== undefined) {
				updateData.body = input.body;
			}

			if (input.thumbnail !== undefined) {
				updateData.thumbnail = input.thumbnail;
			}

			if (input.articleCoverImage !== undefined) {
				updateData.articleCoverImage = input.articleCoverImage;
			}

			if (input.tags !== undefined) {
				updateData.tags = input.tags;
			}

			if (input.status !== undefined) {
				updateData.status = input.status;
				// Set publishedAt when status changes to PUBLISHED
				if (input.status === ArticleStatus.PUBLISHED && !existingArticle.publishedAt) {
					if (input.publishedAt) {
						const date = new Date(input.publishedAt);
						updateData.publishedAt = isNaN(date.getTime()) ? new Date() : date;
					} else {
						updateData.publishedAt = new Date();
					}
				}
			}

		if (input.publishedAt !== undefined) {
			const date = new Date(input.publishedAt);
			updateData.publishedAt = isNaN(date.getTime()) ? new Date() : date;
		}

			const result = await this.articleModel.findByIdAndUpdate(
				articleIdObj,
				updateData,
				{ new: true },
			).exec();

			if (!result) {
				throw new InternalServerErrorException(Message.UPDATE_FAILED);
			}

			return result;
		} catch (err) {
			console.error('Error updating article:', err.message);
			if (err.code === 11000) {
				throw new BadRequestException('Article with this slug already exists.');
			}
			throw new InternalServerErrorException(Message.UPDATE_FAILED);
		}
	}

	/**
	 * Delete article
	 */
	public async deleteArticle(articleId: string, userId: ObjectId): Promise<boolean> {
		const articleIdObj = shapeIntoMongoObjectId(articleId);
		const article = await this.articleModel.findById(articleIdObj).exec();

		if (!article) {
			throw new NotFoundException('Article not found.');
		}

		const result = await this.articleModel.findByIdAndDelete(articleIdObj).exec();
		return !!result;
	}

	/**
	 * Publish article
	 */
	public async publishArticle(articleId: string, userId: ObjectId): Promise<Article> {
		const articleIdObj = shapeIntoMongoObjectId(articleId);
		const article = await this.articleModel.findById(articleIdObj).exec();

		if (!article) {
			throw new NotFoundException('Article not found.');
		}

		const result = await this.articleModel.findByIdAndUpdate(
			articleIdObj,
			{
				status: ArticleStatus.PUBLISHED,
				publishedAt: article.publishedAt || new Date(),
				updatedBy: userId,
			},
			{ new: true },
		).exec();

		if (!result) {
			throw new InternalServerErrorException(Message.UPDATE_FAILED);
		}

		return result;
	}

	/**
	 * Unpublish article (set to DRAFT)
	 */
	public async unpublishArticle(articleId: string, userId: ObjectId): Promise<Article> {
		const articleIdObj = shapeIntoMongoObjectId(articleId);
		const article = await this.articleModel.findById(articleIdObj).exec();

		if (!article) {
			throw new NotFoundException('Article not found.');
		}

		const result = await this.articleModel.findByIdAndUpdate(
			articleIdObj,
			{
				status: ArticleStatus.DRAFT,
				updatedBy: userId,
			},
			{ new: true },
		).exec();

		if (!result) {
			throw new InternalServerErrorException(Message.UPDATE_FAILED);
		}

		return result;
	}
}
