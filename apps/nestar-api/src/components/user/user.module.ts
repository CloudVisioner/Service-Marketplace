import { Module } from '@nestjs/common';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';
import { MongooseModule } from '@nestjs/mongoose';
import UserSchema from '../../schemas/User.model';
import { AuthModule } from '../auth/auth.module';
import { ViewModule } from '../view/view.module';
import { LikeModule } from '../like/like.module';
import FollowSchema from '../../schemas/Follow.model';

@Module({
	imports: [
		MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
		MongooseModule.forFeature([{ name: 'Follow', schema: FollowSchema }]),
		AuthModule,
		ViewModule,
		LikeModule,
	],
	providers: [UserResolver, UserService],
	exports: [UserService],
})
export class UserModule {}
