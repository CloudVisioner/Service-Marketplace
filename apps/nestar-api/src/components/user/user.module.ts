import { Module } from '@nestjs/common';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';
import { MongooseModule } from '@nestjs/mongoose';
import UserSchema from '../../schemas/User.model';
import ServiceRequestSchema from '../../schemas/ServiceRequest.model';
import QuoteSchema from '../../schemas/Quote.model';
import OrganizationSchema from '../../schemas/Organization.model';
import { AuthModule } from '../auth/auth.module';
import { LikeModule } from '../like/like.module';
import FollowSchema from '../../schemas/Follow.model';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: 'User', schema: UserSchema },
			{ name: 'Follow', schema: FollowSchema },
			{ name: 'ServiceRequest', schema: ServiceRequestSchema },
			{ name: 'Quote', schema: QuoteSchema },
			{ name: 'Organization', schema: OrganizationSchema },
		]),
		AuthModule,
		LikeModule,
	],
	providers: [UserResolver, UserService],
	exports: [UserService],
})
export class UserModule {}
