import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import QuoteSchema from '../../schemas/Quote.model';
import ServiceRequestSchema from '../../schemas/ServiceRequest.model';
import OrganizationSchema from '../../schemas/Organization.model';
import UserSchema from '../../schemas/User.model';
import { QuoteService } from './quote.service';
import { QuoteResolver } from './quote.resolver';
import { AuthModule } from '../auth/auth.module';
import { OrganizationModule } from '../organization/organization.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: 'Quote',
				schema: QuoteSchema,
			},
			{
				name: 'ServiceRequest',
				schema: ServiceRequestSchema,
			},
			{
				name: 'Organization',
				schema: OrganizationSchema,
			},
			{
				name: 'User',
				schema: UserSchema,
			},
		]),
		AuthModule,
		OrganizationModule,
		NotificationModule,
	],
	providers: [QuoteResolver, QuoteService],
	exports: [QuoteService],
})
export class QuoteModule {}
