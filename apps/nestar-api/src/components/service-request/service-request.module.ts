import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import ServiceRequestSchema from '../../schemas/ServiceRequest.model';
import OrganizationSchema from '../../schemas/Organization.model';
import UserSchema from '../../schemas/User.model';
import { ServiceRequestService } from './service-request.service';
import { ServiceRequestResolver } from './service-request.resolver';
import { AuthModule } from '../auth/auth.module';
import { OrganizationModule } from '../organization/organization.module';

@Module({
	imports: [
		MongooseModule.forFeature([
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
	],
	providers: [ServiceRequestResolver, ServiceRequestService],
	exports: [ServiceRequestService],
})
export class ServiceRequestModule {}
