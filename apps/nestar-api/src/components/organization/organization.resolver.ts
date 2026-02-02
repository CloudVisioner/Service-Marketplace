import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { Organization, Organizations } from '../../libs/dto/organization/organization';
import { OrganizationInput, OrganizationInquiry } from '../../libs/dto/organization/organization.input';
import { OrganizationUpdate } from '../../libs/dto/organization/organization.update';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuthUser } from '../auth/decorators/authUser.decorator';
import { UserRole } from '../../libs/enums/user.enum';
import { ObjectId } from 'mongoose';
import { shapeIntoMongoObjectId } from '../../libs/config';

@Resolver()
export class OrganizationResolver {
	constructor(private readonly organizationService: OrganizationService) {}

	@Roles(UserRole.PROVIDER, UserRole.BUYER)
	@UseGuards(AuthGuard, RolesGuard)
	@Mutation(() => Organization)
	public async createOrganization(
		@Args('input') input: OrganizationInput,
		@AuthUser('_id') userId: ObjectId,
	): Promise<Organization> {
		console.log('Mutation: createOrganization');
		return await this.organizationService.createOrganization(userId, input);
	}

	@UseGuards(AuthGuard)
	@Query(() => Organization)
	public async getOrganization(@Args('orgId') orgId: string): Promise<Organization> {
		console.log('Query: getOrganization');
		const orgIdObj = shapeIntoMongoObjectId(orgId);
		return await this.organizationService.getOrganization(orgIdObj);
	}

	@UseGuards(AuthGuard)
	@Query(() => Organizations)
	public async getOrganizations(@Args('input') input: OrganizationInquiry): Promise<Organizations> {
		console.log('Query: getOrganizations');
		return await this.organizationService.getOrganizations(input);
	}

	@UseGuards(AuthGuard)
	@Query(() => [Organization])
	public async getMyOrganizations(@AuthUser('_id') userId: ObjectId): Promise<Organization[]> {
		console.log('Query: getMyOrganizations');
		return await this.organizationService.getMyOrganizations(userId);
	}

	@Roles(UserRole.PROVIDER, UserRole.BUYER)
	@UseGuards(AuthGuard, RolesGuard)
	@Mutation(() => Organization)
	public async updateOrganization(
		@Args('input') input: OrganizationUpdate,
		@AuthUser('_id') userId: ObjectId,
	): Promise<Organization> {
		console.log('Mutation: updateOrganization');
		const orgIdObj = shapeIntoMongoObjectId(input._id);
		return await this.organizationService.updateOrganization(orgIdObj, userId, input);
	}
}
