import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import CSCenterContentSchema from '../../../schemas/CSCenterContent.model';
import CSFAQSchema from '../../../schemas/CSFAQ.model';
import { CustomerSupportService } from './customer-support.service';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: 'CSCenterContent', schema: CSCenterContentSchema },
			{ name: 'CSFAQ', schema: CSFAQSchema },
		]),
	],
	providers: [CustomerSupportService],
	exports: [CustomerSupportService],
})
export class CustomerSupportModule {}

