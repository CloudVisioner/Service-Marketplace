import { Field, InputType, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, Min, Max, IsEmail, IsEnum, IsDateString } from 'class-validator';
import { UserRole, UserStatus } from '../../enums/user.enum';
import { OrganizationStatus } from '../../enums/organization.enum';
import { ServiceRequestStatus } from '../../enums/service-request.enum';
import { QuoteStatus } from '../../enums/quote.enum';
import { OrderStatus } from '../../enums/order.enum';
import { ArticleStatus } from '../../enums/admin.enum';
import { DisputeType, DisputeStatus } from '../../enums/admin.enum';

// ============================================================================
// USER MANAGEMENT INPUTS
// ============================================================================

@InputType()
export class GetAllUsersSearch {
	@IsOptional()
	@Field(() => String, { nullable: true })
	userNick?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	userEmail?: string;

	@IsOptional()
	@IsEnum(UserRole)
	@Field(() => UserRole, { nullable: true })
	userRole?: UserRole;

	@IsOptional()
	@IsEnum(UserStatus)
	@Field(() => UserStatus, { nullable: true })
	userStatus?: UserStatus;

	@IsOptional()
	@IsDateString()
	@Field(() => Date, { nullable: true })
	createdAtFrom?: Date;

	@IsOptional()
	@IsDateString()
	@Field(() => Date, { nullable: true })
	createdAtTo?: Date;
}

@InputType()
export class GetAllUsersInput {
	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	page: number;

	@IsNotEmpty()
	@Min(1)
	@Max(100)
	@Field(() => Int)
	limit: number;

	@IsOptional()
	@Field(() => GetAllUsersSearch, { nullable: true })
	search?: GetAllUsersSearch;
}

// ============================================================================
// ORGANIZATION MANAGEMENT INPUTS
// ============================================================================

@InputType()
export class GetAllOrganizationsSearch {
	@IsOptional()
	@Field(() => String, { nullable: true })
	organizationName?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	organizationType?: 'BUYER' | 'PROVIDER';

	@IsOptional()
	@IsEnum(OrganizationStatus)
	@Field(() => OrganizationStatus, { nullable: true })
	organizationStatus?: OrganizationStatus;

	@IsOptional()
	@Field(() => Boolean, { nullable: true })
	isFlagged?: boolean;

	@IsOptional()
	@Field(() => String, { nullable: true })
	organizationCountry?: string;

	@IsOptional()
	@IsDateString()
	@Field(() => Date, { nullable: true })
	createdAtFrom?: Date;

	@IsOptional()
	@IsDateString()
	@Field(() => Date, { nullable: true })
	createdAtTo?: Date;
}

@InputType()
export class GetAllOrganizationsInput {
	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	page: number;

	@IsNotEmpty()
	@Min(1)
	@Max(100)
	@Field(() => Int)
	limit: number;

	@IsOptional()
	@Field(() => GetAllOrganizationsSearch, { nullable: true })
	search?: GetAllOrganizationsSearch;
}

@InputType()
export class RejectOrganizationInput {
	@IsNotEmpty()
	@Field(() => String)
	organizationId: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	reason?: string;
}

@InputType()
export class UpdateOrganizationInput {
	@IsNotEmpty()
	@Field(() => String)
	organizationId: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	organizationName?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	organizationDescription?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	organizationWebsite?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	organizationIndustry?: string;
}

// ============================================================================
// SERVICE REQUEST MANAGEMENT INPUTS
// ============================================================================

@InputType()
export class GetAllServiceRequestsSearch {
	@IsOptional()
	@Field(() => String, { nullable: true })
	reqTitle?: string;

	@IsOptional()
	@IsEnum(ServiceRequestStatus)
	@Field(() => ServiceRequestStatus, { nullable: true })
	reqStatus?: ServiceRequestStatus;

	@IsOptional()
	@Field(() => Boolean, { nullable: true })
	isFlagged?: boolean;

	@IsOptional()
	@Field(() => String, { nullable: true })
	buyerOrgId?: string;

	@IsOptional()
	@IsDateString()
	@Field(() => Date, { nullable: true })
	createdAtFrom?: Date;

	@IsOptional()
	@IsDateString()
	@Field(() => Date, { nullable: true })
	createdAtTo?: Date;
}

@InputType()
export class GetAllServiceRequestsInput {
	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	page: number;

	@IsNotEmpty()
	@Min(1)
	@Max(100)
	@Field(() => Int)
	limit: number;

	@IsOptional()
	@Field(() => GetAllServiceRequestsSearch, { nullable: true })
	search?: GetAllServiceRequestsSearch;
}

@InputType()
export class FlagServiceRequestInput {
	@IsNotEmpty()
	@Field(() => String)
	requestId: string;

	@IsNotEmpty()
	@Field(() => String)
	reason: string;
}

// ============================================================================
// QUOTE MANAGEMENT INPUTS
// ============================================================================

@InputType()
export class GetAllQuotesSearch {
	@IsOptional()
	@IsEnum(QuoteStatus)
	@Field(() => QuoteStatus, { nullable: true })
	quoteStatus?: QuoteStatus;

	@IsOptional()
	@Field(() => String, { nullable: true })
	providerOrgId?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	serviceRequestId?: string;

	@IsOptional()
	@Field(() => Int, { nullable: true })
	amountMin?: number;

	@IsOptional()
	@Field(() => Int, { nullable: true })
	amountMax?: number;

	@IsOptional()
	@IsDateString()
	@Field(() => Date, { nullable: true })
	createdAtFrom?: Date;

	@IsOptional()
	@IsDateString()
	@Field(() => Date, { nullable: true })
	createdAtTo?: Date;

	@IsOptional()
	@Field(() => Boolean, { nullable: true })
	isFlagged?: boolean;
}

@InputType()
export class GetAllQuotesInput {
	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	page: number;

	@IsNotEmpty()
	@Min(1)
	@Max(100)
	@Field(() => Int)
	limit: number;

	@IsOptional()
	@Field(() => GetAllQuotesSearch, { nullable: true })
	search?: GetAllQuotesSearch;
}

@InputType()
export class FlagQuoteInput {
	@IsNotEmpty()
	@Field(() => String)
	quoteId: string;

	@IsNotEmpty()
	@Field(() => String)
	reason: string;
}

// ============================================================================
// ORDER MANAGEMENT INPUTS
// ============================================================================

@InputType()
export class GetAllOrdersSearch {
	@IsOptional()
	@IsEnum(OrderStatus)
	@Field(() => OrderStatus, { nullable: true })
	orderStatus?: OrderStatus;

	@IsOptional()
	@Field(() => String, { nullable: true })
	buyerOrgId?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	providerOrgId?: string;

	@IsOptional()
	@Field(() => Int, { nullable: true })
	amountMin?: number;

	@IsOptional()
	@Field(() => Int, { nullable: true })
	amountMax?: number;

	@IsOptional()
	@IsDateString()
	@Field(() => Date, { nullable: true })
	createdAtFrom?: Date;

	@IsOptional()
	@IsDateString()
	@Field(() => Date, { nullable: true })
	createdAtTo?: Date;
}

@InputType()
export class GetAllOrdersInput {
	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	page: number;

	@IsNotEmpty()
	@Min(1)
	@Max(100)
	@Field(() => Int)
	limit: number;

	@IsOptional()
	@Field(() => GetAllOrdersSearch, { nullable: true })
	search?: GetAllOrdersSearch;
}

@InputType()
export class ChangeOrderStatusInput {
	@IsNotEmpty()
	@Field(() => String)
	orderId: string;

	@IsNotEmpty()
	@IsEnum(OrderStatus)
	@Field(() => OrderStatus)
	orderStatus: OrderStatus;

	@IsOptional()
	@Field(() => String, { nullable: true })
	adminNotes?: string;
}

@InputType()
export class AddOrderAdminNotesInput {
	@IsNotEmpty()
	@Field(() => String)
	orderId: string;

	@IsNotEmpty()
	@Field(() => String)
	adminNotes: string;
}

// ============================================================================
// ARTICLE MANAGEMENT INPUTS
// ============================================================================

@InputType()
export class GetAllArticlesSearch {
	@IsOptional()
	@Field(() => String, { nullable: true })
	title?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	slug?: string;

	@IsOptional()
	@IsEnum(ArticleStatus)
	@Field(() => ArticleStatus, { nullable: true })
	status?: ArticleStatus;

	@IsOptional()
	@Field(() => [String], { nullable: true })
	tags?: string[];

	@IsOptional()
	@IsDateString()
	@Field(() => Date, { nullable: true })
	createdAtFrom?: Date;

	@IsOptional()
	@IsDateString()
	@Field(() => Date, { nullable: true })
	createdAtTo?: Date;
}

@InputType()
export class GetAllArticlesInput {
	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	page: number;

	@IsNotEmpty()
	@Min(1)
	@Max(100)
	@Field(() => Int)
	limit: number;

	@IsOptional()
	@Field(() => GetAllArticlesSearch, { nullable: true })
	search?: GetAllArticlesSearch;
}

@InputType()
export class CreateArticleInput {
	@IsNotEmpty()
	@Field(() => String)
	title: string;

	@IsNotEmpty()
	@Field(() => String)
	slug: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	shortDescription?: string;

	@IsNotEmpty()
	@Field(() => String)
	body: string; // HTML content

	@IsOptional()
	@Field(() => String, { nullable: true })
	thumbnail?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	articleCoverImage?: string;

	@IsOptional()
	@Field(() => [String], { nullable: true })
	tags?: string[];

	@IsNotEmpty()
	@IsEnum(ArticleStatus)
	@Field(() => ArticleStatus)
	status: ArticleStatus;

	@IsOptional()
	@Field(() => Date, { nullable: true })
	publishedAt?: Date;
}

@InputType()
export class UpdateArticleInput {
	@IsNotEmpty()
	@Field(() => String)
	articleId: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	title?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	slug?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	shortDescription?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	body?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	thumbnail?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	articleCoverImage?: string;

	@IsOptional()
	@Field(() => [String], { nullable: true })
	tags?: string[];

	@IsOptional()
	@IsEnum(ArticleStatus)
	@Field(() => ArticleStatus, { nullable: true })
	status?: ArticleStatus;

	@IsOptional()
	@Field(() => Date, { nullable: true })
	publishedAt?: Date;
}

// ============================================================================
// DISPUTE MANAGEMENT INPUTS
// ============================================================================

@InputType()
export class GetAllDisputesSearch {
	@IsOptional()
	@IsEnum(DisputeType)
	@Field(() => DisputeType, { nullable: true })
	disputeType?: DisputeType;

	@IsOptional()
	@IsEnum(DisputeStatus)
	@Field(() => DisputeStatus, { nullable: true })
	disputeStatus?: DisputeStatus;

	@IsOptional()
	@IsDateString()
	@Field(() => Date, { nullable: true })
	createdAtFrom?: Date;

	@IsOptional()
	@IsDateString()
	@Field(() => Date, { nullable: true })
	createdAtTo?: Date;
}

@InputType()
export class GetAllDisputesInput {
	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	page: number;

	@IsNotEmpty()
	@Min(1)
	@Max(100)
	@Field(() => Int)
	limit: number;

	@IsOptional()
	@Field(() => GetAllDisputesSearch, { nullable: true })
	search?: GetAllDisputesSearch;
}

@InputType()
export class ChangeDisputeStatusInput {
	@IsNotEmpty()
	@Field(() => String)
	disputeId: string;

	@IsNotEmpty()
	@IsEnum(DisputeStatus)
	@Field(() => DisputeStatus)
	disputeStatus: DisputeStatus;
}

@InputType()
export class AddDisputeAdminNotesInput {
	@IsNotEmpty()
	@Field(() => String)
	disputeId: string;

	@IsNotEmpty()
	@Field(() => String)
	adminNotes: string;
}

@InputType()
export class ResolveDisputeInput {
	@IsNotEmpty()
	@Field(() => String)
	disputeId: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	resolutionNotes?: string;
}

// ============================================================================
// AUDIT LOG INPUTS
// ============================================================================

@InputType()
export class GetAuditLogsSearch {
	@IsOptional()
	@Field(() => String, { nullable: true })
	action?: string; // AuditAction enum as string

	@IsOptional()
	@Field(() => String, { nullable: true })
	adminUserId?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	targetType?: string; // AuditTargetType enum as string

	@IsOptional()
	@Field(() => String, { nullable: true })
	targetId?: string;

	@IsOptional()
	@IsDateString()
	@Field(() => Date, { nullable: true })
	timestampFrom?: Date;

	@IsOptional()
	@IsDateString()
	@Field(() => Date, { nullable: true })
	timestampTo?: Date;
}

@InputType()
export class GetAuditLogsInput {
	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	page: number;

	@IsNotEmpty()
	@Min(1)
	@Max(100)
	@Field(() => Int)
	limit: number;

	@IsOptional()
	@Field(() => GetAuditLogsSearch, { nullable: true })
	search?: GetAuditLogsSearch;
}

@InputType()
export class CreateAuditLogInput {
	@IsNotEmpty()
	@Field(() => String)
	action: string; // AuditAction enum

	@IsNotEmpty()
	@Field(() => String)
	targetType: string; // AuditTargetType enum

	@IsNotEmpty()
	@Field(() => String)
	targetId: string;

	@IsNotEmpty()
	@Field(() => String)
	targetName: string;

	@IsNotEmpty()
	@Field(() => String)
	details: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	metadata?: string; // JSON string
}

// ============================================================================
// ADMIN MANAGEMENT INPUTS
// ============================================================================

@InputType()
export class GetAllAdminsSearch {
	@IsOptional()
	@Field(() => String, { nullable: true })
	userNick?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	userEmail?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	role?: 'ADMIN' | 'SUPER_ADMIN' | 'CONTENT_ADMIN';
}

@InputType()
export class GetAllAdminsInput {
	@IsOptional()
	@Min(1)
	@Field(() => Int, { nullable: true })
	page?: number;

	@IsOptional()
	@Min(1)
	@Max(100)
	@Field(() => Int, { nullable: true })
	limit?: number;

	@IsOptional()
	@Field(() => GetAllAdminsSearch, { nullable: true })
	search?: GetAllAdminsSearch;
}

@InputType()
export class InviteAdminInput {
	@IsNotEmpty()
	@IsEmail()
	@Field(() => String)
	userEmail: string;

	@IsNotEmpty()
	@Field(() => String)
	role: 'ADMIN' | 'CONTENT_ADMIN'; // SUPER_ADMIN cannot be assigned via invite
}

// ============================================================================
// PLATFORM SETTINGS INPUTS
// ============================================================================

@InputType()
export class UpdatePlatformSettingsInput {
	@IsNotEmpty()
	@Field(() => String)
	siteName: string;

	@IsOptional()
	@IsEmail()
	@Field(() => String, { nullable: true })
	supportEmail?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	quoteRulesText?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	termsLink?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	privacyLink?: string;
}

// ============================================================================
// CUSTOMER SUPPORT CENTER INPUTS
// ============================================================================

@InputType()
export class CSQuickAccessCardInput {
	@IsNotEmpty()
	@Field(() => String)
	title: string;

	@IsNotEmpty()
	@Field(() => String)
	description: string;

	@IsNotEmpty()
	@Field(() => String)
	icon: string;

	@IsNotEmpty()
	@Field(() => String)
	link: string;

	@IsNotEmpty()
	@Field(() => String)
	color: string;
}

@InputType()
export class CSContactMethodInput {
	@IsNotEmpty()
	@Field(() => String)
	type: string;

	@IsNotEmpty()
	@Field(() => String)
	label: string;

	@IsNotEmpty()
	@Field(() => String)
	value: string;

	@IsNotEmpty()
	@Field(() => String)
	availability: string;

	@IsNotEmpty()
	@Field(() => String)
	icon: string;
}

@InputType()
export class UpdateCSCenterContentInput {
	@IsOptional()
	@Field(() => String, { nullable: true })
	heroTitle?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	heroDescription?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	heroImage?: string;

	@IsOptional()
	@Field(() => [CSQuickAccessCardInput], { nullable: true })
	quickAccessCards?: CSQuickAccessCardInput[];

	@IsOptional()
	@Field(() => [CSContactMethodInput], { nullable: true })
	contactMethods?: CSContactMethodInput[];
}

@InputType()
export class CreateCSFAQInput {
	@IsNotEmpty()
	@Field(() => String)
	question: string;

	@IsNotEmpty()
	@Field(() => String)
	answer: string;

	@IsNotEmpty()
	@Field(() => String)
	category: string;

	@IsNotEmpty()
	@Field(() => Int)
	order: number;
}

@InputType()
export class UpdateCSFAQInput {
	@IsNotEmpty()
	@Field(() => String)
	faqId: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	question?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	answer?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	category?: string;

	@IsOptional()
	@Field(() => Int, { nullable: true })
	order?: number;
}

// ============================================================================
// ADMIN AUTH INPUTS
// ============================================================================

@InputType()
export class AdminLoginInput {
	@IsNotEmpty()
	@IsEmail()
	@Field(() => String)
	userEmail: string;

	@IsNotEmpty()
	@Field(() => String)
	password: string;
}

@InputType()
export class AdminSignupInput {
	@IsNotEmpty()
	@Field(() => String)
	userNick: string;

	@IsNotEmpty()
	@IsEmail()
	@Field(() => String)
	userEmail: string;

	@IsNotEmpty()
	@Field(() => String)
	password: string;
}
