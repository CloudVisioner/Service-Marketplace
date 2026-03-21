import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { HydratedDocument, Model, ObjectId } from 'mongoose';
import { CSCenterContent, CSFAQ } from '../../../libs/dto/admin/admin.output';
import {
	CreateCSFAQInput,
	UpdateCSCenterContentInput,
	UpdateCSFAQInput,
} from '../../../libs/dto/admin/admin.input';
import { Message } from '../../../libs/enums/common.enum';

type CSCenterContentDocument = HydratedDocument<CSCenterContent>;
type CSFAQDocument = HydratedDocument<CSFAQ>;

@Injectable()
export class CustomerSupportService {
	constructor(
		@InjectModel('CSCenterContent') private csCenterModel: Model<CSCenterContent>,
		@InjectModel('CSFAQ') private csFaqModel: Model<CSFAQ>,
	) {}

	/**
	 * Get CS Center content with FAQs (creates default if none exist)
	 */
	public async getCSCenterContent(): Promise<CSCenterContentDocument> {
		let content = (await this.csCenterModel.findOne().exec()) as CSCenterContentDocument | null;

		if (!content) {
			content = await this.initializeCSCenterContent();
		}

		const faqs = (await this.csFaqModel
			.find()
			.sort({ order: 1, createdAt: 1 })
			.exec()) as CSFAQDocument[];

		// Attach FAQs to the content object (not stored in the same collection)
		const contentObject = content.toObject() as any;
		contentObject.faqs = faqs;

		return contentObject as CSCenterContentDocument;
	}

	/**
	 * Initialize default CS Center content
	 */
	public async initializeCSCenterContent(adminId?: ObjectId): Promise<CSCenterContentDocument> {
		const defaultContent: Partial<CSCenterContent> = {
			heroTitle: 'Customer Support Center',
			heroDescription: 'Get help, find answers, and manage your B2B experience.',
			heroImage: '',
			quickAccessCards: [],
			contactMethods: [],
			updatedBy: adminId,
		};

		const content = (await this.csCenterModel.create(defaultContent)) as CSCenterContentDocument;
		return content;
	}

	/**
	 * Update CS Center content (hero, cards, contact methods)
	 */
	public async updateCSCenterContent(
		input: UpdateCSCenterContentInput,
		adminId: ObjectId,
	): Promise<CSCenterContentDocument> {
		let content = (await this.csCenterModel.findOne().exec()) as CSCenterContentDocument | null;

		if (!content) {
			content = await this.initializeCSCenterContent(adminId);
		}

		const updateData: any = {
			updatedBy: adminId,
		};

		if (input.heroTitle !== undefined) {
			updateData.heroTitle = input.heroTitle;
		}

		if (input.heroDescription !== undefined) {
			updateData.heroDescription = input.heroDescription;
		}

		if (input.heroImage !== undefined) {
			updateData.heroImage = input.heroImage;
		}

		if (input.quickAccessCards !== undefined) {
			updateData.quickAccessCards = input.quickAccessCards;
		}

		if (input.contactMethods !== undefined) {
			updateData.contactMethods = input.contactMethods;
		}

		const result = (await this.csCenterModel
			.findByIdAndUpdate(content._id, updateData, { new: true })
			.exec()) as CSCenterContentDocument | null;

		if (!result) {
			throw new InternalServerErrorException(Message.UPDATE_FAILED);
		}

		// Attach FAQs for convenience
		const faqs = (await this.csFaqModel
			.find()
			.sort({ order: 1, createdAt: 1 })
			.exec()) as CSFAQDocument[];

		const resultObject = result.toObject() as any;
		resultObject.faqs = faqs;

		return resultObject as CSCenterContentDocument;
	}

	/**
	 * Create FAQ
	 */
	public async createCSFAQ(input: CreateCSFAQInput): Promise<CSFAQDocument> {
		const faq = (await this.csFaqModel.create({
			question: input.question,
			answer: input.answer,
			category: input.category,
			order: input.order,
		})) as CSFAQDocument;

		return faq;
	}

	/**
	 * Update FAQ
	 */
	public async updateCSFAQ(input: UpdateCSFAQInput): Promise<CSFAQDocument> {
		const updateData: any = {};

		if (input.question !== undefined) {
			updateData.question = input.question;
		}

		if (input.answer !== undefined) {
			updateData.answer = input.answer;
		}

		if (input.category !== undefined) {
			updateData.category = input.category;
		}

		if (input.order !== undefined) {
			updateData.order = input.order;
		}

		const result = (await this.csFaqModel
			.findByIdAndUpdate(input.faqId, updateData, { new: true })
			.exec()) as CSFAQDocument | null;

		if (!result) {
			throw new NotFoundException(Message.NO_DATA_FOUND);
		}

		return result;
	}

	/**
	 * Delete FAQ
	 */
	public async deleteCSFAQ(faqId: string): Promise<CSFAQDocument> {
		const result = (await this.csFaqModel.findByIdAndDelete(faqId).exec()) as CSFAQDocument | null;

		if (!result) {
			throw new NotFoundException(Message.NO_DATA_FOUND);
		}

		return result;
	}
}

