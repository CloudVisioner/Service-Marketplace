import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import OrderSchema from '../../schemas/Order.model';
import QuoteSchema from '../../schemas/Quote.model';
import ServiceRequestSchema from '../../schemas/ServiceRequest.model';
import OrganizationSchema from '../../schemas/Organization.model';
import UserSchema from '../../schemas/User.model';
import { OrderService } from './order.service';
import { OrderResolver } from './order.resolver';
import { AuthModule } from '../auth/auth.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: 'Order',
				schema: OrderSchema,
			},
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
		NotificationModule,
	],
	providers: [OrderResolver, OrderService],
	exports: [OrderService],
})
export class OrderModule {}
