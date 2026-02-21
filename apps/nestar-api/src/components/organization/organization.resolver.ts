import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards, BadRequestException } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { Organization, Organizations } from '../../libs/dto/organization/organization';
import { BuyerOrganizationInput, OrganizationInput, OrganizationInquiry, ProviderCategoryInput, ProviderOrganizationInput, ProviderSortInput, UpdateProviderOrganizationInput } from '../../libs/dto/organization/organization.input';
import { OrganizationUpdate } from '../../libs/dto/organization/organization.update';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuthUser } from '../auth/decorators/authUser.decorator';
import { UserRole } from '../../libs/enums/user.enum';
import { ObjectId } from 'mongoose';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { LikeService } from '../like/like.service';
import { LikeGroup } from '../../libs/enums/like.enum';

@Resolver()
export class OrganizationResolver {
	constructor(
		private readonly organizationService: OrganizationService,
		private readonly likeService: LikeService,
	) {}

	@Roles(UserRole.PROVIDER, UserRole.BUYER)
	@UseGuards(AuthGuard, RolesGuard)
	@Mutation(() => Organization)
	public async createOrganization(
		@Args('input') input: OrganizationInput,
		@AuthUser('_id') userId: ObjectId,
	): Promise<Organization> {
		console.log('Mutation: createOrganization');
		console.log('Authenticated user ID from decorator:', userId);
		console.log('Authenticated user ID type:', typeof userId);
		
		if (!userId) {
			throw new BadRequestException('User ID not found in authentication token. Please login again.');
		}
		
		return await this.organizationService.createOrganization(userId, input);
	}

	@UseGuards(AuthGuard)
	@Query(() => Organization)
	public async getOrganization(
		@Args('orgId') orgId: string,
		@AuthUser('_id') userId: ObjectId,
		@AuthUser('userRole') userRole: string,
	): Promise<Organization> {
		console.log('Query: getOrganization');
		const orgIdObj = shapeIntoMongoObjectId(orgId);
		return await this.organizationService.getOrganization(orgIdObj, userId, userRole);
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

	@Roles(UserRole.PROVIDER, UserRole.BUYER, UserRole.ADMIN)
	@UseGuards(AuthGuard, RolesGuard)
	@Mutation(() => Organization)
	public async updateOrganization(
		@Args('input') input: OrganizationUpdate,
		@AuthUser('_id') userId: ObjectId,
		@AuthUser('userRole') userRole: string,
	): Promise<Organization> {
		console.log('Mutation: updateOrganization');
		
		if (!input.orgId) {
			throw new BadRequestException('Organization ID is required.');
		}
		
		if (!userId) {
			throw new BadRequestException('User ID not found in authentication token. Please login again.');
		}
		
		return await this.organizationService.updateOrganization(userId, userRole, input);
	}

	@UseGuards(AuthGuard)
	@Mutation(() => Organization)
	public async likeTargetOrganization(
		@Args('orgId') orgId: string,
		@AuthUser('_id') userId: ObjectId,
	): Promise<Organization> {
		console.log('Mutation: likeTargetOrganization');
		const orgIdObj = shapeIntoMongoObjectId(orgId);
		return await this.organizationService.likeTargetOrganization(userId, orgIdObj);
	}

	// 1. Get Providers By Category (Public - No Auth Required)
	@Query(() => Organizations)
	public async getProvidersByCategory(@Args('input') input: ProviderCategoryInput): Promise<Organizations> {
		console.log('Query: getProvidersByCategory');
		return await this.organizationService.getProvidersByCategory(input);
	}

	// 2. Get Provider Detail (Public - No Auth Required, but shows contact info if logged in)
	@Query(() => Organization)
	public async getProviderDetail(
		@Args('orgId') orgId: string,
		@AuthUser('_id') userId?: ObjectId | null,
	): Promise<Organization> {
		console.log('Query: getProviderDetail');
		const orgIdObj = shapeIntoMongoObjectId(orgId, 'orgId');
		return await this.organizationService.getProviderDetail(orgIdObj, userId);
	}

	// 3. Get Providers Sorted (Public - No Auth Required)
	@Query(() => Organizations)
	public async getProvidersSorted(@Args('input') input: ProviderSortInput): Promise<Organizations> {
		console.log('Query: getProvidersSorted');
		return await this.organizationService.getProvidersSorted(input);
	}

	// =========================================================================
	// BUYER-SPECIFIC ORGANIZATION APIs
	// =========================================================================

	// 4. Create or Update Buyer Organization (auto-sets orgType=BUYER)
	@Roles(UserRole.BUYER)
	@UseGuards(AuthGuard, RolesGuard)
	@Mutation(() => Organization)
	public async createOrUpdateBuyerOrganization(
		@Args('input') input: BuyerOrganizationInput,
		@AuthUser('_id') userId: ObjectId,
	): Promise<Organization> {
		console.log('Mutation: createOrUpdateBuyerOrganization');

		if (!userId) {
			throw new BadRequestException('User ID not found in authentication token. Please login again.');
		}

		return await this.organizationService.createOrUpdateBuyerOrganization(userId, input);
	}

	// 5. Get Buyer Organization (no orgId needed — uses auth context)
	@Roles(UserRole.BUYER)
	@UseGuards(AuthGuard, RolesGuard)
	@Query(() => Organization, { nullable: true })
	public async getBuyerOrganization(
		@AuthUser('_id') userId: ObjectId,
	): Promise<Organization | null> {
		console.log('Query: getBuyerOrganization');
		return await this.organizationService.getBuyerOrganization(userId);
	}

	// =========================================================================
	// PROVIDER-SPECIFIC ORGANIZATION PROFILE APIs
	// =========================================================================

	/**
	 * Get provider organization (no orgId needed — uses auth context).
	 * Returns null if provider has no organization yet.
	 */
	@Roles(UserRole.PROVIDER)
	@UseGuards(AuthGuard, RolesGuard)
	@Query(() => Organization, { nullable: true })
	public async getProviderOrganization(
		@AuthUser('_id') userId: ObjectId,
	): Promise<Organization | null> {
		console.log('Query: getProviderOrganization');
		return await this.organizationService.getProviderOrganization(userId);
	}

	/**
	 * Create provider organization profile.
	 * Auto-sets orgType=SERVICE_PROVIDER and orgStatus=ACTIVE.
	 */
	@Roles(UserRole.PROVIDER)
	@UseGuards(AuthGuard, RolesGuard)
	@Mutation(() => Organization)
	public async createProviderOrgProf(
		@Args('input') input: ProviderOrganizationInput,
		@AuthUser('_id') userId: ObjectId,
	): Promise<Organization> {
		console.log('Mutation: createProviderOrgProf');
		return await this.organizationService.createProviderOrgProf(userId, input);
	}

	/**
	 * Update provider organization profile.
	 * Only allows updating specific provider fields.
	 */
	@Roles(UserRole.PROVIDER)
	@UseGuards(AuthGuard, RolesGuard)
	@Mutation(() => Organization)
	public async updateProviderOrgProf(
		@Args('input') input: UpdateProviderOrganizationInput,
		@AuthUser('_id') userId: ObjectId,
	): Promise<Organization> {
		console.log('Mutation: updateProviderOrgProf');
		return await this.organizationService.updateProviderOrgProf(userId, input);
	}
}
