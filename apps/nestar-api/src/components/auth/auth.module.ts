import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import {JwtModule} from '@nestjs/jwt'
import {HttpModule} from '@nestjs/axios'
import { MongooseModule } from '@nestjs/mongoose';
import UserSchema from '../../schemas/User.model';

@Module({
	imports: [
		HttpModule,
		JwtModule.register({
			secret: `${process.env.SECRET_TOKEN}`,
			signOptions: {expiresIn: '30d'},

		}),
		MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
	],
	providers: [AuthService],
	exports: [AuthService],
})
export class AuthModule {}
