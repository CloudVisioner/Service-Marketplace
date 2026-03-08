import { gql } from 'graphql-tag';

/**
 * GraphQL Queries and Mutations for Admin Dashboard
 * Ready-to-use queries for frontend GraphQL client
 * 
 * All operations require authentication with ADMIN, SUPER_ADMIN, or CONTENT_ADMIN role.
 * Some operations (admin management, platform settings) require SUPER_ADMIN role.
 * 
 * Note: Install graphql-tag if using in frontend:
 * npm install graphql-tag
 * 
 * Or use with Apollo Client:
 * import { gql } from '@apollo/client';
 */

// ============================================================================
// AUTHENTICATION
// ============================================================================

export const ADMIN_LOGIN = gql`
  mutation AdminLogin($input: AdminLoginInput!) {
    adminLogin(input: $input) {
      token
      user {
        _id
        userNick
        userEmail
        role
        status
        createdAt
      }
    }
  }
`;

export const ADMIN_SIGNUP = gql`
  mutation AdminSignup($input: AdminSignupInput!) {
    adminSignup(input: $input) {
      token
      user {
        _id
        userNick
        userEmail
        role
        status
        createdAt
      }
    }
  }
`;

// ============================================================================
// USER MANAGEMENT
// ============================================================================

export const GET_ALL_USERS = gql`
  query GetAllUsers($input: GetAllUsersInput!) {
    getAllUsers(input: $input) {
      list {
        _id
        userNick
        userEmail
        userPhone
        userDescription
        userRole
        userStatus
        userImage
        createdAt
        updatedAt
      }
      metaCounter {
        total
      }
    }
  }
`;

export const GET_USER_BY_ID = gql`
  query GetUserById($userId: String!) {
    getUserById(userId: $userId) {
      _id
      userNick
      userEmail
      userPhone
      userDescription
      userRole
      userStatus
      userImage
      createdAt
      updatedAt
    }
  }
`;

export const SUSPEND_USER = gql`
  mutation SuspendUser($userId: String!) {
    suspendUser(userId: $userId) {
      _id
      userStatus
    }
  }
`;

export const ACTIVATE_USER = gql`
  mutation ActivateUser($userId: String!) {
    activateUser(userId: $userId) {
      _id
      userStatus
    }
  }
`;

export const RESET_USER_PASSWORD = gql`
  mutation ResetUserPassword($userId: String!) {
    resetUserPassword(userId: $userId) {
      success
    }
  }
`;

// ============================================================================
// ORGANIZATION MANAGEMENT
// ============================================================================

export const GET_ALL_ORGANIZATIONS = gql`
  query GetAllOrganizations($input: GetAllOrganizationsInput!) {
    getAllOrganizations(input: $input) {
      list {
        _id
        organizationName
        organizationType
        organizationStatus
        organizationCountry
        organizationIndustry
        organizationDescription
        organizationImage
        organizationWebsite
        createdAt
        updatedAt
        memberCount
        requestCount
        quoteCount
        orderCount
      }
      metaCounter {
        total
      }
    }
  }
`;

export const GET_ORGANIZATION_BY_ID = gql`
  query GetOrganizationById($organizationId: String!) {
    getOrganizationById(organizationId: $organizationId) {
      _id
      organizationName
      organizationType
      organizationStatus
      organizationCountry
      organizationIndustry
      organizationDescription
      organizationImage
      organizationWebsite
      createdAt
      updatedAt
      memberCount
    }
  }
`;

export const APPROVE_ORGANIZATION = gql`
  mutation ApproveOrganization($organizationId: String!) {
    approveOrganization(organizationId: $organizationId) {
      _id
      organizationStatus
    }
  }
`;

export const REJECT_ORGANIZATION = gql`
  mutation RejectOrganization($input: RejectOrganizationInput!) {
    rejectOrganization(input: $input) {
      _id
      organizationStatus
    }
  }
`;

export const SUSPEND_ORGANIZATION = gql`
  mutation SuspendOrganization($organizationId: String!) {
    suspendOrganization(organizationId: $organizationId) {
      _id
      organizationStatus
    }
  }
`;

export const UPDATE_ORGANIZATION = gql`
  mutation UpdateOrganization($input: UpdateOrganizationInput!) {
    updateOrganization(input: $input) {
      _id
      organizationName
      organizationDescription
      organizationWebsite
      organizationIndustry
    }
  }
`;

// ============================================================================
// SERVICE REQUEST MANAGEMENT
// ============================================================================

export const GET_ALL_SERVICE_REQUESTS = gql`
  query GetAllServiceRequests($input: GetAllServiceRequestsInput!) {
    getAllServiceRequests(input: $input) {
      list {
        _id
        reqTitle
        reqDescription
        reqStatus
        reqBuyerOrgId
        reqTotalQuotes
        reqNewQuotesCount
        reqDeadline
        createdAt
        updatedAt
        reqBuyerOrgData {
          _id
          organizationName
          organizationImage
        }
      }
      metaCounter {
        total
      }
    }
  }
`;

export const GET_SERVICE_REQUEST_BY_ID = gql`
  query GetServiceRequestById($requestId: String!) {
    getServiceRequestById(requestId: $requestId) {
      _id
      reqTitle
      reqDescription
      reqStatus
      reqBuyerOrgId
      reqTotalQuotes
      reqNewQuotesCount
      reqDeadline
      createdAt
      updatedAt
      reqBuyerOrgData {
        _id
        organizationName
        organizationImage
      }
    }
  }
`;

export const CLOSE_SERVICE_REQUEST = gql`
  mutation CloseServiceRequest($requestId: String!) {
    closeServiceRequest(requestId: $requestId) {
      _id
      reqStatus
    }
  }
`;

export const FLAG_SERVICE_REQUEST = gql`
  mutation FlagServiceRequest($input: FlagServiceRequestInput!) {
    flagServiceRequest(input: $input) {
      _id
    }
  }
`;

export const DELETE_SERVICE_REQUEST = gql`
  mutation DeleteServiceRequest($requestId: String!) {
    deleteServiceRequest(requestId: $requestId) {
      success
    }
  }
`;

// ============================================================================
// QUOTE MANAGEMENT
// ============================================================================

export const GET_ALL_QUOTES = gql`
  query GetAllQuotes($input: GetAllQuotesInput!) {
    getAllQuotes(input: $input) {
      list {
        _id
        quoteServiceReqId
        quoteProviderOrgId
        quoteProviderOrgData {
          _id
          organizationName
          organizationImage
        }
        quoteAmount
        quoteProposal
        quoteStatus
        createdAt
        updatedAt
      }
      metaCounter {
        total
      }
    }
  }
`;

export const GET_QUOTE_BY_ID = gql`
  query GetQuoteById($quoteId: String!) {
    getQuoteById(quoteId: $quoteId) {
      _id
      quoteServiceReqId
      quoteProviderOrgId
      quoteAmount
      quoteProposal
      quoteStatus
      createdAt
      updatedAt
    }
  }
`;

export const FLAG_QUOTE = gql`
  mutation FlagQuote($input: FlagQuoteInput!) {
    flagQuote(input: $input) {
      _id
    }
  }
`;

export const HARD_DELETE_QUOTE = gql`
  mutation HardDeleteQuote($quoteId: String!) {
    hardDeleteQuote(quoteId: $quoteId) {
      success
    }
  }
`;

// ============================================================================
// ORDER MANAGEMENT
// ============================================================================

export const GET_ALL_ORDERS = gql`
  query GetAllOrders($input: GetAllOrdersInput!) {
    getAllOrders(input: $input) {
      list {
        _id
        orderFromQuoteId
        orderBuyerOrgId
        orderProviderOrgId
        buyerOrg {
          _id
          organizationName
        }
        providerOrg {
          _id
          organizationName
        }
        orderAmount
        orderStatus
        adminNotes
        createdAt
        updatedAt
      }
      metaCounter {
        total
      }
    }
  }
`;

export const GET_ORDER_BY_ID = gql`
  query GetOrderById($orderId: String!) {
    getOrderById(orderId: $orderId) {
      _id
      orderFromQuoteId
      orderBuyerOrgId
      orderProviderOrgId
      orderAmount
      orderStatus
      adminNotes
      createdAt
      updatedAt
    }
  }
`;

export const CHANGE_ORDER_STATUS = gql`
  mutation ChangeOrderStatus($input: ChangeOrderStatusInput!) {
    changeOrderStatus(input: $input) {
      _id
      orderStatus
      adminNotes
    }
  }
`;

export const ADD_ORDER_ADMIN_NOTES = gql`
  mutation AddOrderAdminNotes($input: AddOrderAdminNotesInput!) {
    addOrderAdminNotes(input: $input) {
      _id
      adminNotes
    }
  }
`;

// ============================================================================
// ARTICLE MANAGEMENT
// ============================================================================

export const GET_ALL_ARTICLES = gql`
  query GetAllArticles($input: GetAllArticlesInput!) {
    getAllArticles(input: $input) {
      list {
        _id
        title
        slug
        shortDescription
        body
        thumbnail
        tags
        status
        publishedAt
        createdAt
        updatedAt
        createdBy
        updatedBy
      }
      metaCounter {
        total
      }
    }
  }
`;

export const GET_ARTICLE_BY_ID = gql`
  query GetArticleById($articleId: String!) {
    getArticleById(articleId: $articleId) {
      _id
      title
      slug
      shortDescription
      body
      thumbnail
      tags
      status
      publishedAt
      createdAt
      updatedAt
    }
  }
`;

export const GET_ARTICLE_BY_SLUG = gql`
  query GetArticleBySlug($slug: String!) {
    getArticleBySlug(slug: $slug) {
      _id
      title
      slug
      shortDescription
      body
      thumbnail
      tags
      status
      publishedAt
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_ARTICLE = gql`
  mutation CreateArticle($input: CreateArticleInput!) {
    createArticle(input: $input) {
      _id
      title
      slug
      status
      createdAt
    }
  }
`;

export const UPDATE_ARTICLE = gql`
  mutation UpdateArticle($input: UpdateArticleInput!) {
    updateArticle(input: $input) {
      _id
      title
      slug
      status
      updatedAt
    }
  }
`;

export const DELETE_ARTICLE = gql`
  mutation DeleteArticle($articleId: String!) {
    deleteArticle(articleId: $articleId) {
      success
    }
  }
`;

export const PUBLISH_ARTICLE = gql`
  mutation PublishArticle($articleId: String!) {
    publishArticle(articleId: $articleId) {
      _id
      status
      publishedAt
    }
  }
`;

export const UNPUBLISH_ARTICLE = gql`
  mutation UnpublishArticle($articleId: String!) {
    unpublishArticle(articleId: $articleId) {
      _id
      status
    }
  }
`;

// ============================================================================
// DISPUTE MANAGEMENT
// ============================================================================

export const GET_ALL_DISPUTES = gql`
  query GetAllDisputes($input: GetAllDisputesInput!) {
    getAllDisputes(input: $input) {
      list {
        _id
        disputeType
        disputeStatus
        orderId
        userId
        requestId
        quoteId
        title
        description
        reason
        amount
        buyerOrg
        providerOrg
        userName
        userEmail
        adminNotes
        createdAt
        updatedAt
        resolvedAt
        resolvedBy
      }
      metaCounter {
        total
      }
    }
  }
`;

export const GET_DISPUTE_BY_ID = gql`
  query GetDisputeById($disputeId: String!) {
    getDisputeById(disputeId: $disputeId) {
      _id
      disputeType
      disputeStatus
      title
      description
      reason
      adminNotes
      createdAt
      resolvedAt
    }
  }
`;

export const CHANGE_DISPUTE_STATUS = gql`
  mutation ChangeDisputeStatus($input: ChangeDisputeStatusInput!) {
    changeDisputeStatus(input: $input) {
      _id
      disputeStatus
    }
  }
`;

export const ADD_DISPUTE_ADMIN_NOTES = gql`
  mutation AddDisputeAdminNotes($input: AddDisputeAdminNotesInput!) {
    addDisputeAdminNotes(input: $input) {
      _id
      adminNotes
    }
  }
`;

export const RESOLVE_DISPUTE = gql`
  mutation ResolveDispute($input: ResolveDisputeInput!) {
    resolveDispute(input: $input) {
      _id
      disputeStatus
      resolvedAt
    }
  }
`;

// ============================================================================
// AUDIT LOGS
// ============================================================================

export const GET_AUDIT_LOGS = gql`
  query GetAuditLogs($input: GetAuditLogsInput!) {
    getAuditLogs(input: $input) {
      list {
        _id
        timestamp
        adminUserId
        adminUser {
          _id
          userNick
          userEmail
        }
        action
        targetType
        targetId
        targetName
        details
        metadata
        createdAt
      }
      metaCounter {
        total
      }
    }
  }
`;

// ============================================================================
// ADMIN MANAGEMENT
// ============================================================================

export const GET_ALL_ADMINS = gql`
  query GetAllAdmins($input: GetAllAdminsInput) {
    getAllAdmins(input: $input) {
      list {
        _id
        userNick
        userEmail
        role
        status
        createdAt
        lastLogin
      }
      metaCounter {
        total
      }
    }
  }
`;

export const INVITE_ADMIN = gql`
  mutation InviteAdmin($input: InviteAdminInput!) {
    inviteAdmin(input: $input) {
      success
      invitationSent
      adminUserId
    }
  }
`;

export const REMOVE_ADMIN = gql`
  mutation RemoveAdmin($adminUserId: String!) {
    removeAdmin(adminUserId: $adminUserId) {
      success
    }
  }
`;

// ============================================================================
// DASHBOARD STATISTICS
// ============================================================================

export const GET_DASHBOARD_STATISTICS = gql`
  query GetDashboardStatistics {
    getDashboardStatistics {
      totalBuyers {
        current
        previous
        change
      }
      totalProviders {
        current
        previous
        change
      }
      activeRequests {
        current
        previous
        change
      }
      openQuotes {
        current
        previous
        change
      }
      activeOrders {
        current
        previous
        change
      }
      recentServiceRequests {
        _id
        reqTitle
        reqStatus
        createdAt
      }
      recentOrders {
        _id
        orderAmount
        orderStatus
        createdAt
      }
      recentArticles {
        _id
        title
        status
        createdAt
      }
    }
  }
`;

// ============================================================================
// PLATFORM SETTINGS
// ============================================================================

export const GET_PLATFORM_SETTINGS = gql`
  query GetPlatformSettings {
    getPlatformSettings {
      _id
      siteName
      supportEmail
      quoteRulesText
      termsLink
      privacyLink
      updatedAt
      updatedBy
    }
  }
`;

export const UPDATE_PLATFORM_SETTINGS = gql`
  mutation UpdatePlatformSettings($input: UpdatePlatformSettingsInput!) {
    updatePlatformSettings(input: $input) {
      _id
      siteName
      supportEmail
      quoteRulesText
      termsLink
      privacyLink
      updatedAt
    }
  }
`;

// ============================================================================
// FRONTEND USAGE EXAMPLES
// ============================================================================

/**
 * ADMIN LOGIN - Frontend Usage:
 * 
 * const [adminLogin, { data, loading, error }] = useMutation(ADMIN_LOGIN);
 * 
 * await adminLogin({
 *   variables: {
 *     input: {
 *       userEmail: "admin@example.com",
 *       password: "password123"
 *     }
 *   }
 * });
 * 
 * // Store token: localStorage.setItem('adminToken', data.adminLogin.token);
 */

/**
 * GET ALL USERS - Frontend Usage:
 * 
 * const { data, loading, error } = useQuery(GET_ALL_USERS, {
 *   variables: {
 *     input: {
 *       page: 1,
 *       limit: 20,
 *       search: {
 *         userRole: "BUYER",        // Optional
 *         userStatus: "ACTIVE",     // Optional
 *         userNick: "john",         // Optional - search by nickname
 *         userEmail: "john@",       // Optional - search by email
 *         createdAtFrom: "2024-01-01T00:00:00Z",  // Optional
 *         createdAtTo: "2024-12-31T23:59:59Z"     // Optional
 *       }
 *     }
 *   },
 *   context: {
 *     headers: {
 *       authorization: `Bearer ${token}`
 *     }
 *   }
 * });
 */

/**
 * SUSPEND USER - Frontend Usage:
 * 
 * const [suspendUser, { data }] = useMutation(SUSPEND_USER);
 * 
 * await suspendUser({
 *   variables: {
 *     userId: "69970318229d239324d2afaa"
 *   },
 *   context: {
 *     headers: {
 *       authorization: `Bearer ${token}`
 *     }
 *   }
 * });
 */

/**
 * GET ALL ARTICLES - Frontend Usage:
 * 
 * const { data } = useQuery(GET_ALL_ARTICLES, {
 *   variables: {
 *     input: {
 *       page: 1,
 *       limit: 20,
 *       search: {
 *         status: "PUBLISHED",      // Optional: DRAFT, PUBLISHED, ARCHIVED
 *         title: "guide",           // Optional - search by title
 *         tags: ["tutorial"],       // Optional - filter by tags
 *         createdAtFrom: "2024-01-01T00:00:00Z",
 *         createdAtTo: "2024-12-31T23:59:59Z"
 *       }
 *     }
 *   },
 *   context: {
 *     headers: {
 *       authorization: `Bearer ${token}`
 *     }
 *   }
 * });
 */

/**
 * CREATE ARTICLE - Frontend Usage:
 * 
 * const [createArticle, { data }] = useMutation(CREATE_ARTICLE);
 * 
 * await createArticle({
 *   variables: {
 *     input: {
 *       title: "Getting Started Guide",
 *       slug: "getting-started-guide",  // Auto-generated if not provided
 *       shortDescription: "Learn how to get started...",
 *       body: "<p>HTML content from Tiptap editor</p>",
 *       thumbnail: "https://example.com/image.jpg",
 *       tags: ["tutorial", "guide"],
 *       status: "DRAFT",  // or "PUBLISHED"
 *       publishedAt: "2024-01-15T10:00:00Z"  // Optional, auto-set if PUBLISHED
 *     }
 *   },
 *   context: {
 *     headers: {
 *       authorization: `Bearer ${token}`
 *     }
 *   }
 * });
 */

/**
 * GET DASHBOARD STATISTICS - Frontend Usage:
 * 
 * const { data, loading } = useQuery(GET_DASHBOARD_STATISTICS, {
 *   context: {
 *     headers: {
 *       authorization: `Bearer ${token}`
 *     }
 *   },
 *   pollInterval: 30000  // Refresh every 30 seconds
 * });
 * 
 * // Access data:
 * // data.getDashboardStatistics.totalBuyers.current
 * // data.getDashboardStatistics.totalBuyers.change (percentage)
 */
