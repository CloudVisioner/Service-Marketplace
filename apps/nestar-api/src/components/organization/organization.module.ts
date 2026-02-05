import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import OrganizationSchema from '../../schemas/Organization.model';
import UserSchema from '../../schemas/User.model';
import { OrganizationService } from './organization.service';
import { OrganizationResolver } from './organization.resolver';
import { AuthModule } from '../auth/auth.module';
import { LikeModule } from '../like/like.module';

@Module({
	imports: [
		MongooseModule.forFeature([
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
		LikeModule,
	],
	providers: [OrganizationResolver, OrganizationService],
	exports: [OrganizationService],
})
export class OrganizationModule {}
