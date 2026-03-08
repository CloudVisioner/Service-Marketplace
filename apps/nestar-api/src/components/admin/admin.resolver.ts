import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ObjectId } from 'mongoose';
import { AdminService } from './admin.service';
import { ArticleService } from './article/article.service';
import { DisputeService } from './dispute/dispute.service';
import { AuditService } from './audit/audit.service';
import { PlatformSettingsService } from './platform/platform.service';
import { ServiceRequestService } from '../service-request/service-request.service';
import { QuoteService } from '../quote/quote.service';
import { OrderService } from '../order/order.service';
import { AuthService } from '../auth/auth.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AuthUser } from '../auth/decorators/authUser.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../libs/enums/user.enum';
import {
	GetAllUsersInput,
	GetAllOrganizationsInput,
	RejectOrganizationInput,
	UpdateOrganizationInput,
	GetAllServiceRequestsInput,
	FlagServiceRequestInput,
	GetAllQuotesInput,
	FlagQuoteInput,
	GetAllOrdersInput,
	ChangeOrderStatusInput,
	AddOrderAdminNotesInput,
	GetAllArticlesInput,
	CreateArticleInput,
	UpdateArticleInput,
	GetAllDisputesInput,
	ChangeDisputeStatusInput,
	AddDisputeAdminNotesInput,
	ResolveDisputeInput,
	GetAuditLogsInput,
	GetAllAdminsInput,
	InviteAdminInput,
	UpdatePlatformSettingsInput,
	AdminLoginInput,
	AdminSignupInput,
	UpdateAdminProfileInput,
	UploadAdminProfileImageInput,
} from '../../libs/dto/admin/admin.input';
import {
	GetAllUsersResponse,
	GetAllOrganizationsResponse,
	AdminOrganization,
	GetAllServiceRequestsResponse,
	GetAllQuotesResponse,
	GetAllOrdersResponse,
	GetAllArticlesResponse,
	Article,
	GetAllDisputesResponse,
	Dispute,
	GetAuditLogsResponse,
	GetAllAdminsResponse,
	InviteAdminResponse,
	PlatformSettings,
	DashboardStatistics,
	AdminLoginResponse,
	SuccessResponse,
	AdminProfile,
	UploadAdminProfileImageResponse,
} from '../../libs/dto/admin/admin.output';
import { User } from '../../libs/dto/user/user';
import { ServiceRequest } from '../../libs/dto/service-request/service-request';
import { Quote } from '../../libs/dto/quote/quote';
import { Order } from '../../libs/dto/order/order';
import { shapeIntoMongoObjectId } from '../../libs/config';

@Resolver()
export class AdminResolver {
	constructor(
		private readonly adminService: AdminService,
		private readonly articleService: ArticleService,
		private readonly disputeService: DisputeService,
		private readonly auditService: AuditService,
		private readonly platformSettingsService: PlatformSettingsService,
		private readonly serviceRequestService: ServiceRequestService,
		private readonly quoteService: QuoteService,
		private readonly orderService: OrderService,
		private readonly authService: AuthService,
	) {}

	// ============================================================================
	// AUTHENTICATION
	// ============================================================================

	@Mutation(() => AdminLoginResponse)
	public async adminLogin(@Args('input') input: AdminLoginInput): Promise<AdminLoginResponse> {
		console.log('Mutation: adminLogin');
		const user = await this.authService.adminLogin(input.userEmail, input.password);
		const token = await this.authService.createUserToken(user);
		return {
			token,
			user: {
				_id: user._id,
				userNick: user.userNick,
				userEmail: user.userEmail,
				role: user.userRole,
				status: user.userStatus,
				createdAt: user.createdAt,
			},
		};
	}

	@Mutation(() => AdminLoginResponse)
	public async adminSignup(@Args('input') input: AdminSignupInput): Promise<AdminLoginResponse> {
		console.log('Mutation: adminSignup');
		const user = await this.authService.adminSignup(input.userNick, input.userEmail, input.password);
		const token = await this.authService.createUserToken(user);
		return {
			token,
			user: {
				_id: user._id,
				userNick: user.userNick,
				userEmail: user.userEmail,
				role: user.userRole,
				status: user.userStatus,
				createdAt: user.createdAt,
			},
		};
	}

	// ============================================================================
	// USER MANAGEMENT
	// ============================================================================

	@UseGuards(AuthGuard, AdminGuard)
	@Query(() => GetAllUsersResponse)
	public async getAllUsers(@Args('input') input: GetAllUsersInput): Promise<GetAllUsersResponse> {
		console.log('Query: getAllUsers');
		return await this.adminService.getAllUsers(input);
	}

	@UseGuards(AuthGuard, AdminGuard)
	@Query(() => User)
	public async getUserById(@Args('userId') userId: string): Promise<User> {
		console.log('Query: getUserById');
		return await this.adminService.getUserById(userId);
	}

	@UseGuards(AuthGuard, AdminGuard)
	@Mutation(() => User)
	public async suspendUser(
		@Args('userId') userId: string,
		@AuthUser('_id') adminId: ObjectId,
	): Promise<User> {
		console.log('Mutation: suspendUser');
		return await this.adminService.suspendUser(userId, adminId);
	}

	@UseGuards(AuthGuard, AdminGuard)
	@Mutation(() => User)
	public async activateUser(
		@Args('userId') userId: string,
		@AuthUser('_id') adminId: ObjectId,
	): Promise<User> {
		console.log('Mutation: activateUser');
		return await this.adminService.activateUser(userId, adminId);
	}

	@UseGuards(AuthGuard, AdminGuard)
	@Mutation(() => SuccessResponse)
	public async resetUserPassword(@Args('userId') userId: string): Promise<SuccessResponse> {
		console.log('Mutation: resetUserPassword');
		const result = await this.adminService.resetUserPassword(userId);
		return { success: result.success };
	}

	// ============================================================================
	// ORGANIZATION MANAGEMENT
	// ============================================================================

	@UseGuards(AuthGuard, AdminGuard)
	@Query(() => GetAllOrganizationsResponse)
	public async getAllOrganizations(@Args('input') input: GetAllOrganizationsInput): Promise<GetAllOrganizationsResponse> {
		console.log('Query: getAllOrganizations');
		return await this.adminService.getAllOrganizations(input);
	}

	@UseGuards(AuthGuard, AdminGuard)
	@Query(() => AdminOrganization)
	public async getOrganizationById(@Args('organizationId') organizationId: string): Promise<any> {
		console.log('Query: getOrganizationById');
		return await this.adminService.getOrganizationById(organizationId);
	}

	@UseGuards(AuthGuard, AdminGuard)
	@Mutation(() => AdminOrganization)
	public async approveOrganization(
		@Args('organizationId') organizationId: string,
		@AuthUser('_id') adminId: ObjectId,
	): Promise<any> {
		console.log('Mutation: approveOrganization');
		return await this.adminService.approveOrganization(organizationId, adminId);
	}

	@UseGuards(AuthGuard, AdminGuard)
	@Mutation(() => AdminOrganization)
	public async rejectOrganization(
		@Args('input') input: RejectOrganizationInput,
		@AuthUser('_id') adminId: ObjectId,
	): Promise<any> {
		console.log('Mutation: rejectOrganization');
		return await this.adminService.rejectOrganization(input, adminId);
	}

	@UseGuards(AuthGuard, AdminGuard)
	@Mutation(() => AdminOrganization)
	public async suspendOrganization(
		@Args('organizationId') organizationId: string,
		@AuthUser('_id') adminId: ObjectId,
	): Promise<any> {
		console.log('Mutation: suspendOrganization');
		return await this.adminService.suspendOrganization(organizationId, adminId);
	}

	@UseGuards(AuthGuard, AdminGuard)
	@Mutation(() => AdminOrganization)
	public async updateOrganization(
		@Args('input') input: UpdateOrganizationInput,
		@AuthUser('_id') adminId: ObjectId,
	): Promise<any> {
		console.log('Mutation: updateOrganization');
		return await this.adminService.updateOrganization(input, adminId);
	}

	// ============================================================================
	// SERVICE REQUEST MANAGEMENT
	// ============================================================================

	@UseGuards(AuthGuard, AdminGuard)
	@Query(() => GetAllServiceRequestsResponse)
	public async getAllServiceRequests(@Args('input') input: GetAllServiceRequestsInput): Promise<GetAllServiceRequestsResponse> {
		console.log('Query: getAllServiceRequests');
		// Convert admin input to service request inquiry format
		const serviceRequestInquiry: any = {
			page: input.page,
			limit: input.limit,
			search: {
				reqStatus: input.search?.reqStatus,
				reqBuyerOrgId: input.search?.buyerOrgId,
				text: input.search?.reqTitle,
				isFlagged: input.search?.isFlagged,
			},
		};
		return await this.serviceRequestService.getAllServiceRequests(serviceRequestInquiry);
	}

	@UseGuards(AuthGuard, AdminGuard)
	@Query(() => ServiceRequest)
	public async getServiceRequestById(@Args('requestId') requestId: string): Promise<ServiceRequest> {
		console.log('Query: getServiceRequestById');
		return await this.serviceRequestService.getServiceRequestByIdForAdmin(requestId);
	}

	@UseGuards(AuthGuard, AdminGuard)
	@Mutation(() => ServiceRequest)
	public async closeServiceRequest(
		@Args('requestId') requestId: string,
		@AuthUser('_id') adminId: ObjectId,
	): Promise<ServiceRequest> {
		console.log('Mutation: closeServiceRequest');
		return await this.serviceRequestService.closeServiceRequestForAdmin(requestId, adminId);
	}

	@UseGuards(AuthGuard, AdminGuard)
	@Mutation(() => ServiceRequest)
	public async flagServiceRequest(
		@Args('input') input: FlagServiceRequestInput,
		@AuthUser('_id') adminId: ObjectId,
	): Promise<ServiceRequest> {
		console.log('Mutation: flagServiceRequest');
		return await this.serviceRequestService.flagServiceRequestForAdmin(input.requestId, input.reason, adminId);
	}

	@UseGuards(AuthGuard, AdminGuard)
	@Mutation(() => SuccessResponse)
	public async deleteServiceRequest(@Args('requestId') requestId: string): Promise<SuccessResponse> {
		console.log('Mutation: deleteServiceRequest');
		const result = await this.serviceRequestService.deleteServiceRequestForAdmin(requestId);
		return { success: result };
	}

	// ============================================================================
	// QUOTE MANAGEMENT
	// ============================================================================

	@UseGuards(AuthGuard, AdminGuard)
	@Query(() => GetAllQuotesResponse)
	public async getAllQuotes(@Args('input') input: GetAllQuotesInput): Promise<GetAllQuotesResponse> {
		console.log('Query: getAllQuotes');
		return await this.quoteService.getAllQuotesForAdmin(input);
	}

	@UseGuards(AuthGuard, AdminGuard)
	@Query(() => Quote)
	public async getQuoteById(@Args('quoteId') quoteId: string): Promise<Quote> {
		console.log('Query: getQuoteById');
		return await this.quoteService.getQuoteByIdForAdmin(quoteId);
	}

	@UseGuards(AuthGuard, AdminGuard)
	@Mutation(() => Quote)
	public async flagQuote(
		@Args('input') input: FlagQuoteInput,
		@AuthUser('_id') adminId: ObjectId,
	): Promise<Quote> {
		console.log('Mutation: flagQuote');
		return await this.quoteService.flagQuoteForAdmin(input.quoteId, input.reason, adminId);
	}

	@UseGuards(AuthGuard, AdminGuard)
	@Mutation(() => SuccessResponse)
	public async hardDeleteQuote(@Args('quoteId') quoteId: string): Promise<SuccessResponse> {
		console.log('Mutation: hardDeleteQuote');
		const result = await this.quoteService.hardDeleteQuoteForAdmin(quoteId);
		return { success: result };
	}

	// ============================================================================
	// ORDER MANAGEMENT
	// ============================================================================

	@UseGuards(AuthGuard, AdminGuard)
	@Query(() => GetAllOrdersResponse)
	public async getAllOrders(@Args('input') input: GetAllOrdersInput): Promise<GetAllOrdersResponse> {
		console.log('Query: getAllOrders');
		return await this.orderService.getAllOrdersForAdmin(input);
	}

	@UseGuards(AuthGuard, AdminGuard)
	@Query(() => Order)
	public async getOrderById(@Args('orderId') orderId: string): Promise<Order> {
		console.log('Query: getOrderById');
		return await this.orderService.getOrderByIdForAdmin(orderId);
	}

	@UseGuards(AuthGuard, AdminGuard)
	@Mutation(() => Order)
	public async changeOrderStatus(
		@Args('input') input: ChangeOrderStatusInput,
		@AuthUser('_id') adminId: ObjectId,
	): Promise<Order> {
		console.log('Mutation: changeOrderStatus');
		return await this.orderService.changeOrderStatusForAdmin(
			input.orderId,
			input.orderStatus,
			input.adminNotes,
			adminId,
		);
	}

	@UseGuards(AuthGuard, AdminGuard)
	@Mutation(() => Order)
	public async addOrderAdminNotes(
		@Args('input') input: AddOrderAdminNotesInput,
		@AuthUser('_id') adminId: ObjectId,
	): Promise<Order> {
		console.log('Mutation: addOrderAdminNotes');
		return await this.orderService.addOrderAdminNotesForAdmin(input.orderId, input.adminNotes, adminId);
	}

	// ============================================================================
	// ARTICLE MANAGEMENT
	// ============================================================================

	@UseGuards(AuthGuard, AdminGuard)
	@Query(() => GetAllArticlesResponse)
	public async getAllArticles(@Args('input') input: GetAllArticlesInput): Promise<GetAllArticlesResponse> {
		console.log('Query: getAllArticles');
		return await this.articleService.getAllArticles(input);
	}

	@UseGuards(AuthGuard, AdminGuard)
	@Query(() => Article)
	public async getArticleById(@Args('articleId') articleId: string): Promise<Article> {
		console.log('Query: getArticleById');
		return await this.articleService.getArticleById(articleId);
	}

	@Query(() => Article)
	public async getArticleBySlug(@Args('slug') slug: string): Promise<Article> {
		console.log('Query: getArticleBySlug (public)');
		return await this.articleService.getArticleBySlug(slug);
	}

	@UseGuards(AuthGuard, AdminGuard)
	@Mutation(() => Article)
	public async createArticle(
		@Args('input') input: CreateArticleInput,
		@AuthUser('_id') userId: ObjectId,
	): Promise<Article> {
		console.log('Mutation: createArticle');
		return await this.articleService.createArticle(input, userId);
	}

	@UseGuards(AuthGuard, AdminGuard)
	@Mutation(() => Article)
	public async updateArticle(
		@Args('input') input: UpdateArticleInput,
		@AuthUser('_id') userId: ObjectId,
	): Promise<Article> {
		console.log('Mutation: updateArticle');
		return await this.articleService.updateArticle(input, userId);
	}

	@UseGuards(AuthGuard, AdminGuard)
	@Mutation(() => SuccessResponse)
	public async deleteArticle(
		@Args('articleId') articleId: string,
		@AuthUser('_id') userId: ObjectId,
	): Promise<SuccessResponse> {
		console.log('Mutation: deleteArticle');
		const result = await this.articleService.deleteArticle(articleId, userId);
		return { success: result };
	}

	@UseGuards(AuthGuard, AdminGuard)
	@Mutation(() => Article)
	public async publishArticle(
		@Args('articleId') articleId: string,
		@AuthUser('_id') userId: ObjectId,
	): Promise<Article> {
		console.log('Mutation: publishArticle');
		return await this.articleService.publishArticle(articleId, userId);
	}

	@UseGuards(AuthGuard, AdminGuard)
	@Mutation(() => Article)
	public async unpublishArticle(
		@Args('articleId') articleId: string,
		@AuthUser('_id') userId: ObjectId,
	): Promise<Article> {
		console.log('Mutation: unpublishArticle');
		return await this.articleService.unpublishArticle(articleId, userId);
	}

	// ============================================================================
	// DISPUTE MANAGEMENT
	// ============================================================================

	@UseGuards(AuthGuard, AdminGuard)
	@Query(() => GetAllDisputesResponse)
	public async getAllDisputes(@Args('input') input: GetAllDisputesInput): Promise<GetAllDisputesResponse> {
		console.log('Query: getAllDisputes');
		return await this.disputeService.getAllDisputes(input);
	}

	@UseGuards(AuthGuard, AdminGuard)
	@Query(() => Dispute)
	public async getDisputeById(@Args('disputeId') disputeId: string): Promise<Dispute> {
		console.log('Query: getDisputeById');
		return await this.disputeService.getDisputeById(disputeId);
	}

	@UseGuards(AuthGuard, AdminGuard)
	@Mutation(() => Dispute)
	public async changeDisputeStatus(
		@Args('input') input: ChangeDisputeStatusInput,
		@AuthUser('_id') adminId: ObjectId,
	): Promise<Dispute> {
		console.log('Mutation: changeDisputeStatus');
		return await this.disputeService.changeDisputeStatus(input, adminId);
	}

	@UseGuards(AuthGuard, AdminGuard)
	@Mutation(() => Dispute)
	public async addDisputeAdminNotes(
		@Args('input') input: AddDisputeAdminNotesInput,
		@AuthUser('_id') adminId: ObjectId,
	): Promise<Dispute> {
		console.log('Mutation: addDisputeAdminNotes');
		return await this.disputeService.addDisputeAdminNotes(input, adminId);
	}

	@UseGuards(AuthGuard, AdminGuard)
	@Mutation(() => Dispute)
	public async resolveDispute(
		@Args('input') input: ResolveDisputeInput,
		@AuthUser('_id') adminId: ObjectId,
	): Promise<Dispute> {
		console.log('Mutation: resolveDispute');
		return await this.disputeService.resolveDispute(input, adminId);
	}

	// ============================================================================
	// AUDIT LOGS
	// ============================================================================

	@UseGuards(AuthGuard, AdminGuard)
	@Query(() => GetAuditLogsResponse)
	public async getAuditLogs(@Args('input') input: GetAuditLogsInput): Promise<GetAuditLogsResponse> {
		console.log('Query: getAuditLogs');
		return await this.auditService.getAuditLogs(input);
	}

	// ============================================================================
	// ADMIN MANAGEMENT
	// ============================================================================

	@UseGuards(AuthGuard, AdminGuard)
	@Query(() => GetAllAdminsResponse)
	public async getAllAdmins(@Args('input') input: GetAllAdminsInput): Promise<GetAllAdminsResponse> {
		console.log('Query: getAllAdmins');
		return await this.adminService.getAllAdmins(input);
	}

	@Roles(UserRole.SUPER_ADMIN)
	@UseGuards(AuthGuard, AdminGuard)
	@Mutation(() => InviteAdminResponse)
	public async inviteAdmin(
		@Args('input') input: InviteAdminInput,
		@AuthUser('_id') adminId: ObjectId,
	): Promise<InviteAdminResponse> {
		console.log('Mutation: inviteAdmin');
		return await this.adminService.inviteAdmin(input, adminId);
	}

	@Roles(UserRole.SUPER_ADMIN)
	@UseGuards(AuthGuard, AdminGuard)
	@Mutation(() => SuccessResponse)
	public async removeAdmin(
		@Args('adminUserId') adminUserId: string,
		@AuthUser('_id') adminId: ObjectId,
	): Promise<SuccessResponse> {
		console.log('Mutation: removeAdmin');
		const result = await this.adminService.removeAdmin(adminUserId, adminId);
		return { success: result };
	}

	// ============================================================================
	// DASHBOARD STATISTICS
	// ============================================================================

	@UseGuards(AuthGuard, AdminGuard)
	@Query(() => DashboardStatistics)
	public async getDashboardStatistics(): Promise<DashboardStatistics> {
		console.log('Query: getDashboardStatistics');
		return await this.adminService.getDashboardStatistics();
	}

	// ============================================================================
	// PLATFORM SETTINGS
	// ============================================================================

	@UseGuards(AuthGuard, AdminGuard)
	@Query(() => PlatformSettings)
	public async getPlatformSettings(): Promise<PlatformSettings> {
		console.log('Query: getPlatformSettings');
		return await this.platformSettingsService.getPlatformSettings();
	}

	@Roles(UserRole.SUPER_ADMIN)
	@UseGuards(AuthGuard, AdminGuard)
	@Mutation(() => PlatformSettings)
	public async updatePlatformSettings(
		@Args('input') input: UpdatePlatformSettingsInput,
		@AuthUser('_id') adminId: ObjectId,
	): Promise<PlatformSettings> {
		console.log('Mutation: updatePlatformSettings');
		return await this.platformSettingsService.updatePlatformSettings(input, adminId);
	}

	// ============================================================================
	// ADMIN PROFILE MANAGEMENT
	// ============================================================================

	@UseGuards(AuthGuard, AdminGuard)
	@Query(() => AdminProfile)
	public async getMyAdminProfile(@AuthUser('_id') adminId: ObjectId): Promise<AdminProfile> {
		console.log('Query: getMyAdminProfile');
		return await this.adminService.getMyAdminProfile(adminId);
	}

	@UseGuards(AuthGuard, AdminGuard)
	@Mutation(() => AdminProfile)
	public async updateAdminProfile(
		@Args('input', { type: () => UpdateAdminProfileInput }) input: UpdateAdminProfileInput,
		@AuthUser('_id') adminId: ObjectId,
	): Promise<AdminProfile> {
		console.log('Mutation: updateAdminProfile');
		return await this.adminService.updateAdminProfile(input, adminId);
	}

	@UseGuards(AuthGuard, AdminGuard)
	@Mutation(() => UploadAdminProfileImageResponse)
	public async uploadAdminProfileImage(
		@Args('input', { type: () => UploadAdminProfileImageInput }) input: UploadAdminProfileImageInput,
		@AuthUser('_id') adminId: ObjectId,
	): Promise<UploadAdminProfileImageResponse> {
		console.log('Mutation: uploadAdminProfileImage');
		return await this.adminService.uploadAdminProfileImage(input, adminId);
	}
}
