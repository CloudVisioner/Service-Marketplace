import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { LikeModule } from './like/like.module';
import { ViewModule } from './view/view.module';
import { FollowModule } from './follow/follow.module';
import { OrganizationModule } from './organization/organization.module';
import { QuoteModule } from './quote/quote.module';
import { ServiceRequestModule } from './service-request/service-request.module';
import { NotificationModule } from './notification/notification.module';
import { OrderModule } from './order/order.module';

@Module({
	imports: [
		UserModule,
		AuthModule,
		LikeModule,
		ViewModule,
		FollowModule,
		OrganizationModule,
		QuoteModule,
		ServiceRequestModule,
		NotificationModule,
		OrderModule,
	],
	providers: [],
})
export class ComponentsModule {}
