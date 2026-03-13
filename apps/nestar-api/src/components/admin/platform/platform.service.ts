import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { HydratedDocument, Model, ObjectId } from 'mongoose';
import { PlatformSettings } from '../../../libs/dto/admin/admin.output';
import { UpdatePlatformSettingsInput } from '../../../libs/dto/admin/admin.input';
import { Message } from '../../../libs/enums/common.enum';
import { shapeIntoMongoObjectId } from '../../../libs/config';

type PlatformSettingsDocument = HydratedDocument<PlatformSettings>;

@Injectable()
export class PlatformSettingsService {
	constructor(
		@InjectModel('PlatformSettings') private platformSettingsModel: Model<PlatformSettings>,
	) {}

	/**
	 * Get platform settings (creates default if none exist)
	 */
	public async getPlatformSettings(): Promise<PlatformSettingsDocument> {
		let settings = (await this.platformSettingsModel.findOne().exec()) as PlatformSettingsDocument | null;

		if (!settings) {
			// Create default settings
			settings = await this.initializePlatformSettings();
		}

		return settings;
	}

	/**
	 * Initialize default platform settings
	 */
	public async initializePlatformSettings(adminId?: ObjectId): Promise<PlatformSettingsDocument> {
		const defaultSettings = {
			siteName: 'SMEConnect',
			supportEmail: 'support@smeconnect.com',
			quoteRulesText: '',
			termsLink: '',
			privacyLink: '',
			updatedBy: adminId || shapeIntoMongoObjectId('000000000000000000000000'), // Dummy ID if no admin
		};

		const settings = (await this.platformSettingsModel.create(defaultSettings)) as PlatformSettingsDocument;
		return settings;
	}

	/**
	 * Update platform settings
	 */
	public async updatePlatformSettings(input: UpdatePlatformSettingsInput, adminId: ObjectId): Promise<PlatformSettingsDocument> {
		// Get or create settings
		let settings = (await this.platformSettingsModel.findOne().exec()) as PlatformSettingsDocument | null;

		if (!settings) {
			settings = await this.initializePlatformSettings(adminId);
		}

		const updateData: any = {
			updatedBy: adminId,
			siteName: input.siteName, // Required field
		};

		if (input.supportEmail !== undefined) {
			updateData.supportEmail = input.supportEmail;
		}

		if (input.quoteRulesText !== undefined) {
			updateData.quoteRulesText = input.quoteRulesText;
		}

		if (input.termsLink !== undefined) {
			updateData.termsLink = input.termsLink;
		}

		if (input.privacyLink !== undefined) {
			updateData.privacyLink = input.privacyLink;
		}

		const result = (await this.platformSettingsModel.findByIdAndUpdate(
			settings._id,
			updateData,
			{ new: true },
		).exec()) as PlatformSettingsDocument | null;

		if (!result) {
			throw new InternalServerErrorException(Message.UPDATE_FAILED);
		}

		return result;
	}
}
