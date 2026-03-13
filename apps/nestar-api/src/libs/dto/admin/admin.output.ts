import { Field, Int, ObjectType } from '@nestjs/graphql';
import mongoose from 'mongoose';
import { UserRole, UserStatus } from '../../enums/user.enum';
import { OrganizationStatus } from '../../enums/organization.enum';
import { ServiceRequestStatus } from '../../enums/service-request.enum';
import { QuoteStatus } from '../../enums/quote.enum';
import { OrderStatus } from '../../enums/order.enum';
import { ArticleStatus, DisputeType, DisputeStatus, AuditAction, AuditTargetType } from '../../enums/admin.enum';
import { TotalCounter } from '../common/common';
import { User } from '../user/user';
import { Organization } from '../organization/organization';
import { ServiceRequest } from '../service-request/service-request';
import { Quote } from '../quote/quote';
import { Order } from '../order/order';

// ============================================================================
// USER MANAGEMENT OUTPUTS
// ============================================================================

@ObjectType()
export class GetAllUsersResponse {
	@Field(() => [User])
	list: User[];

	@Field(() => [TotalCounter], { nullable: true })
	metaCounter: TotalCounter[];
}

// ============================================================================
// ORGANIZATION MANAGEMENT OUTPUTS
// ============================================================================

@ObjectType()
export class AdminOrganization {
	@Field(() => String)
	_id: mongoose.ObjectId;

	@Field(() => String)
	organizationName: string;

	@Field(() => String, { nullable: true })
	organizationType?: string; // 'BUYER' | 'PROVIDER'

	@Field(() => OrganizationStatus, { nullable: true })
	organizationStatus?: OrganizationStatus;

	@Field(() => String, { nullable: true })
	organizationCountry?: string;

	@Field(() => String, { nullable: true })
	organizationIndustry?: string;

	@Field(() => String, { nullable: true })
	organizationDescription?: string;

	@Field(() => String, { nullable: true })
	organizationImage?: string;

	@Field(() => String, { nullable: true })
	organizationWebsite?: string;

	@Field(() => Date)
	createdAt: Date;

	@Field(() => Date)
	updatedAt: Date;

	@Field(() => Int, { nullable: true })
	memberCount?: number;

	@Field(() => Int, { nullable: true })
	requestCount?: number; // For buyer orgs

	@Field(() => Int, { nullable: true })
	quoteCount?: number; // For provider orgs

	@Field(() => Int, { nullable: true })
	orderCount?: number; // For provider orgs

	@Field(() => Boolean, { nullable: true })
	isFlagged?: boolean;
}

@ObjectType()
export class GetAllOrganizationsResponse {
	@Field(() => [AdminOrganization])
	list: AdminOrganization[];

	@Field(() => [TotalCounter], { nullable: true })
	metaCounter: TotalCounter[];
}

// ============================================================================
// SERVICE REQUEST MANAGEMENT OUTPUTS
// ============================================================================

@ObjectType()
export class GetAllServiceRequestsResponse {
	@Field(() => [ServiceRequest])
	list: ServiceRequest[];

	@Field(() => [TotalCounter], { nullable: true })
	metaCounter: TotalCounter[];
}

// ============================================================================
// QUOTE MANAGEMENT OUTPUTS
// ============================================================================

@ObjectType()
export class GetAllQuotesResponse {
	@Field(() => [Quote])
	list: Quote[];

	@Field(() => [TotalCounter], { nullable: true })
	metaCounter: TotalCounter[];
}

// ============================================================================
// ORDER MANAGEMENT OUTPUTS
// ============================================================================

@ObjectType()
export class GetAllOrdersResponse {
	@Field(() => [Order])
	list: Order[];

	@Field(() => [TotalCounter], { nullable: true })
	metaCounter: TotalCounter[];
}

// ============================================================================
// ARTICLE MANAGEMENT OUTPUTS
// ============================================================================

@ObjectType()
export class Article {
	@Field(() => String)
	_id: mongoose.ObjectId;

	@Field(() => String)
	title: string;

	@Field(() => String)
	slug: string;

	@Field(() => String, { nullable: true })
	shortDescription?: string;

	@Field(() => String)
	body: string; // HTML content

	@Field(() => String, { nullable: true })
	thumbnail?: string;

	@Field(() => String, { nullable: true })
	articleCoverImage?: string;

	@Field(() => [String])
	tags: string[];

	@Field(() => ArticleStatus)
	status: ArticleStatus;

	@Field(() => Date, { nullable: true })
	publishedAt?: Date;

	@Field(() => Date)
	createdAt: Date;

	@Field(() => Date)
	updatedAt: Date;

	@Field(() => String)
	createdBy: mongoose.ObjectId;

	@Field(() => String, { nullable: true })
	updatedBy?: mongoose.ObjectId;
}

@ObjectType()
export class GetAllArticlesResponse {
	@Field(() => [Article])
	list: Article[];

	@Field(() => [TotalCounter], { nullable: true })
	metaCounter: TotalCounter[];
}

// ============================================================================
// DISPUTE MANAGEMENT OUTPUTS
// ============================================================================

@ObjectType()
export class Dispute {
	@Field(() => String)
	_id: mongoose.ObjectId;

	@Field(() => DisputeType)
	disputeType: DisputeType;

	@Field(() => DisputeStatus)
	disputeStatus: DisputeStatus;

	@Field(() => String, { nullable: true })
	orderId?: mongoose.ObjectId;

	@Field(() => String, { nullable: true })
	userId?: mongoose.ObjectId;

	@Field(() => String, { nullable: true })
	requestId?: mongoose.ObjectId;

	@Field(() => String, { nullable: true })
	quoteId?: mongoose.ObjectId;

	@Field(() => String)
	title: string;

	@Field(() => String, { nullable: true })
	description?: string;

	@Field(() => String, { nullable: true })
	reason?: string;

	@Field(() => Int, { nullable: true })
	amount?: number;

	@Field(() => String, { nullable: true })
	buyerOrg?: string;

	@Field(() => String, { nullable: true })
	providerOrg?: string;

	@Field(() => String, { nullable: true })
	userName?: string;

	@Field(() => String, { nullable: true })
	userEmail?: string;

	@Field(() => String, { nullable: true })
	adminNotes?: string;

	@Field(() => Date)
	createdAt: Date;

	@Field(() => Date)
	updatedAt: Date;

	@Field(() => Date, { nullable: true })
	resolvedAt?: Date;

	@Field(() => String, { nullable: true })
	resolvedBy?: mongoose.ObjectId;
}

@ObjectType()
export class GetAllDisputesResponse {
	@Field(() => [Dispute])
	list: Dispute[];

	@Field(() => [TotalCounter], { nullable: true })
	metaCounter: TotalCounter[];
}

// ============================================================================
// AUDIT LOG OUTPUTS
// ============================================================================

@ObjectType()
export class AuditLog {
	@Field(() => String)
	_id: mongoose.ObjectId;

	@Field(() => Date)
	timestamp: Date;

	@Field(() => String)
	adminUserId: mongoose.ObjectId;

	@Field(() => User, { nullable: true })
	adminUser?: User;

	@Field(() => AuditAction)
	action: AuditAction;

	@Field(() => AuditTargetType)
	targetType: AuditTargetType;

	@Field(() => String)
	targetId: mongoose.ObjectId;

	@Field(() => String)
	targetName: string;

	@Field(() => String)
	details: string;

	@Field(() => String, { nullable: true })
	metadata?: string; // JSON string
}

@ObjectType()
export class GetAuditLogsResponse {
	@Field(() => [AuditLog])
	list: AuditLog[];

	@Field(() => [TotalCounter], { nullable: true })
	metaCounter: TotalCounter[];
}

// ============================================================================
// ADMIN MANAGEMENT OUTPUTS
// ============================================================================

@ObjectType()
export class AdminUser {
	@Field(() => String)
	_id: mongoose.ObjectId;

	@Field(() => String)
	userNick: string;

	@Field(() => String)
	userEmail: string;

	@Field(() => String)
	role: string; // 'ADMIN' | 'SUPER_ADMIN' | 'CONTENT_ADMIN'

	@Field(() => String)
	status: string; // 'ACTIVE' | 'SUSPENDED'

	@Field(() => Date)
	createdAt: Date;

	@Field(() => Date, { nullable: true })
	lastLogin?: Date;
}

@ObjectType()
export class GetAllAdminsResponse {
	@Field(() => [AdminUser])
	list: AdminUser[];

	@Field(() => [TotalCounter], { nullable: true })
	metaCounter: TotalCounter[];
}

@ObjectType()
export class AdminLoginResponse {
	@Field(() => String)
	token: string;

	@Field(() => AdminUser)
	user: AdminUser;
}

@ObjectType()
export class InviteAdminResponse {
	@Field(() => Boolean)
	success: boolean;

	@Field(() => Boolean)
	invitationSent: boolean;

	@Field(() => String, { nullable: true })
	adminUserId?: string;
}

// ============================================================================
// PLATFORM SETTINGS OUTPUTS
// ============================================================================

@ObjectType()
export class PlatformSettings {
	@Field(() => String)
	_id: mongoose.ObjectId;

	@Field(() => String)
	siteName: string;

	@Field(() => String, { nullable: true })
	supportEmail?: string;

	@Field(() => String, { nullable: true })
	quoteRulesText?: string;

	@Field(() => String, { nullable: true })
	termsLink?: string;

	@Field(() => String, { nullable: true })
	privacyLink?: string;

	@Field(() => Date)
	updatedAt: Date;

	@Field(() => String)
	updatedBy: mongoose.ObjectId;
}

// ============================================================================
// CUSTOMER SUPPORT CENTER OUTPUTS
// ============================================================================

@ObjectType()
export class CSQuickAccessCard {
	@Field(() => String)
	title: string;

	@Field(() => String)
	description: string;

	@Field(() => String)
	icon: string;

	@Field(() => String)
	link: string;

	@Field(() => String)
	color: string;
}

@ObjectType()
export class CSContactMethod {
	@Field(() => String)
	type: string;

	@Field(() => String)
	label: string;

	@Field(() => String)
	value: string;

	@Field(() => String)
	availability: string;

	@Field(() => String)
	icon: string;
}

@ObjectType()
export class CSFAQ {
	@Field(() => String)
	_id: mongoose.ObjectId;

	@Field(() => String)
	question: string;

	@Field(() => String)
	answer: string;

	@Field(() => String)
	category: string;

	@Field(() => Int)
	order: number;

	@Field(() => Date)
	createdAt: Date;

	@Field(() => Date)
	updatedAt: Date;
}

@ObjectType()
export class CSCenterContent {
	@Field(() => String)
	_id: mongoose.ObjectId;

	@Field(() => String, { nullable: true })
	heroTitle?: string;

	@Field(() => String, { nullable: true })
	heroDescription?: string;

	@Field(() => String, { nullable: true })
	heroImage?: string;

	@Field(() => [CSQuickAccessCard], { nullable: true })
	quickAccessCards?: CSQuickAccessCard[];

	@Field(() => [CSContactMethod], { nullable: true })
	contactMethods?: CSContactMethod[];

	@Field(() => [CSFAQ], { nullable: true })
	faqs?: CSFAQ[];

	@Field(() => Date, { nullable: true })
	updatedAt?: Date;

	@Field(() => String, { nullable: true })
	updatedBy?: mongoose.ObjectId;
}

// ============================================================================
// ADMIN PROFILE OUTPUTS
// ============================================================================

@ObjectType()
export class AdminProfile {
	@Field(() => String)
	_id: mongoose.ObjectId;

	@Field(() => String)
	userNick: string;

	@Field(() => String)
	userEmail: string;

	@Field(() => String, { nullable: true })
	userPhone?: string;

	@Field(() => String, { nullable: true })
	userDescription?: string;

	@Field(() => String, { nullable: true })
	userImage?: string;

	@Field(() => UserRole)
	userRole: UserRole;

	@Field(() => UserStatus)
	userStatus: UserStatus;

	@Field(() => Date)
	createdAt: Date;

	@Field(() => Date)
	updatedAt: Date;
}

@ObjectType()
export class UploadAdminProfileImageResponse {
	@Field(() => String)
	imageUrl: string;

	@Field(() => Boolean)
	success: boolean;
}

// ============================================================================
// DASHBOARD STATISTICS OUTPUTS
// ============================================================================

@ObjectType()
export class StatisticTrend {
	@Field(() => Int)
	current: number;

	@Field(() => Int)
	previous: number;

	@Field(() => Int)
	change: number; // Percentage
}

@ObjectType()
export class DashboardStatistics {
	@Field(() => StatisticTrend)
	totalBuyers: StatisticTrend;

	@Field(() => StatisticTrend)
	totalProviders: StatisticTrend;

	@Field(() => StatisticTrend)
	activeRequests: StatisticTrend;

	@Field(() => StatisticTrend)
	openQuotes: StatisticTrend;

	@Field(() => StatisticTrend)
	activeOrders: StatisticTrend;

	@Field(() => [ServiceRequest], { nullable: true })
	recentServiceRequests?: ServiceRequest[];

	@Field(() => [Order], { nullable: true })
	recentOrders?: Order[];

	@Field(() => [Article], { nullable: true })
	recentArticles?: Article[];
}

// ============================================================================
// SUCCESS RESPONSE
// ============================================================================

@ObjectType()
export class SuccessResponse {
	@Field(() => Boolean)
	success: boolean;
}
