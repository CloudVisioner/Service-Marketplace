import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import PlatformSettingsSchema from '../../../schemas/PlatformSettings.model';
import { PlatformSettingsService } from './platform.service';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: 'PlatformSettings', schema: PlatformSettingsSchema },
		]),
	],
	providers: [PlatformSettingsService],
	exports: [PlatformSettingsService],
})
export class PlatformModule {}
