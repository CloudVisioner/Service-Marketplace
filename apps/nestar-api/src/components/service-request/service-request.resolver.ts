import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ServiceRequestService } from './service-request.service';
import { ServiceRequest, ServiceRequests } from '../../libs/dto/service-request/service-request';
import { ServiceRequestInput, ServiceRequestInquiry } from '../../libs/dto/service-request/service-request.input';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuthUser } from '../auth/decorators/authUser.decorator';
import { UserRole } from '../../libs/enums/user.enum';
import { ServiceRequestStatus } from '../../libs/enums/service-request.enum';
import { ObjectId } from 'mongoose';
import { shapeIntoMongoObjectId } from '../../libs/config';

@Resolver()
export class ServiceRequestResolver {
	constructor(
		private readonly serviceRequestService: ServiceRequestService,
	) {}

	@Roles(UserRole.BUYER)
	@UseGuards(AuthGuard, RolesGuard)
	@Mutation(() => ServiceRequest)
	public async createServiceRequest(
		@Args('input') input: ServiceRequestInput,
		@AuthUser('_id') userId: ObjectId,
	): Promise<ServiceRequest> {
		console.log('Mutation: createServiceRequest');
		return await this.serviceRequestService.createServiceRequest(userId, input);
	}

	@Roles(UserRole.BUYER)
	@UseGuards(AuthGuard, RolesGuard)
	@Query(() => ServiceRequests)
	public async getMyServiceRequests(
		@Args('input') input: ServiceRequestInquiry,
		@AuthUser('_id') userId: ObjectId,
	): Promise<ServiceRequests> {
		console.log('Query: getMyServiceRequests');
		return await this.serviceRequestService.getMyServiceRequests(userId, input);
	}

	@UseGuards(AuthGuard)
	@Query(() => ServiceRequest)
	public async getServiceRequest(
		@Args('requestId') requestId: string,
		@AuthUser('_id') userId: ObjectId | null,
	): Promise<ServiceRequest> {
		console.log('Query: getServiceRequest');
		const requestIdObj = shapeIntoMongoObjectId(requestId);
		return await this.serviceRequestService.getServiceRequest(userId, requestIdObj);
	}

	@UseGuards(AuthGuard)
	@Query(() => ServiceRequests)
	public async getServiceRequests(@Args('input') input: ServiceRequestInquiry): Promise<ServiceRequests> {
		console.log('Query: getServiceRequests');
		return await this.serviceRequestService.getAllServiceRequests(input);
	}

	@Roles(UserRole.BUYER)
	@UseGuards(AuthGuard, RolesGuard)
	@Mutation(() => ServiceRequest)
	public async updateServiceRequestStatus(
		@Args('requestId') requestId: string,
		@Args('status', { type: () => ServiceRequestStatus }) status: ServiceRequestStatus,
	): Promise<ServiceRequest> {
		console.log('Mutation: updateServiceRequestStatus');
		const requestIdObj = shapeIntoMongoObjectId(requestId);
		return await this.serviceRequestService.updateServiceRequestStatus(requestIdObj, status);
	}

}
