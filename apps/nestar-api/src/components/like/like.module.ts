import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LikeService } from './like.service';
import LikeSchema from '../../schemas/Like.model';
import OrganizationSchema from '../../schemas/Organization.model';
import ServiceRequestSchema from '../../schemas/ServiceRequest.model';
import QuoteSchema from '../../schemas/Quote.model';
import UserSchema from '../../schemas/User.model';

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: 'Like',
				schema: LikeSchema,
			},
			{
				name: 'Organization',
				schema: OrganizationSchema,
			},
			{
				name: 'ServiceRequest',
				schema: ServiceRequestSchema,
			},
			{
				name: 'Quote',
				schema: QuoteSchema,
			},
			{
				name: 'User',
				schema: UserSchema,
			},
		]),
	],
    providers: [LikeService], // resolver bohsqa resolverlar uchun hizmatga keladi
    exports: [LikeService],
})
export class LikeModule {}
