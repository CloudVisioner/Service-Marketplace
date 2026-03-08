import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminResolver } from './admin.resolver';
import { AdminService } from './admin.service';
import { ArticleModule } from './article/article.module';
import { DisputeModule } from './dispute/dispute.module';
import { AuditModule } from './audit/audit.module';
import { PlatformModule } from './platform/platform.module';
import UserSchema from '../../schemas/User.model';
import OrganizationSchema from '../../schemas/Organization.model';
import ServiceRequestSchema from '../../schemas/ServiceRequest.model';
import QuoteSchema from '../../schemas/Quote.model';
import OrderSchema from '../../schemas/Order.model';
import { AuthModule } from '../auth/auth.module';
import { ServiceRequestModule } from '../service-request/service-request.module';
import { QuoteModule } from '../quote/quote.module';
import { OrderModule } from '../order/order.module';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: 'User', schema: UserSchema },
			{ name: 'Organization', schema: OrganizationSchema },
			{ name: 'ServiceRequest', schema: ServiceRequestSchema },
			{ name: 'Quote', schema: QuoteSchema },
			{ name: 'Order', schema: OrderSchema },
		]),
		AuthModule,
		ArticleModule,
		DisputeModule,
		AuditModule,
		PlatformModule,
		ServiceRequestModule,
		QuoteModule,
		OrderModule,
	],
	providers: [AdminResolver, AdminService],
	exports: [AdminService],
})
export class AdminModule {}
