import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FollowResolver } from './follow.resolver';
import { FollowService } from './follow.service';
import FollowSchema from '../../schemas/Follow.model';
import UserSchema from '../../schemas/User.model';
import OrganizationSchema from '../../schemas/Organization.model';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { OrganizationModule } from '../organization/organization.module';

@Module({
    imports: [
        MongooseModule.forFeature([
			{
				name: 'Follow',
				schema: FollowSchema,
			},
			{
				name: 'User',
				schema: UserSchema,
			},
			{
				name: 'Organization',
				schema: OrganizationSchema,
			},
		]),
        AuthModule,
        UserModule,
        OrganizationModule
    ],
    providers: [FollowResolver, FollowService],
    exports: [FollowService]
})
export class FollowModule {}
