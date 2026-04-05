import { gql } from 'graphql-tag';

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

export const GET_PUBLISHED_ARTICLES = gql`
  query GetPublishedArticles($input: GetAllArticlesInput!) {
    getPublishedArticles(input: $input) {
      list {
        _id
        title
        slug
        shortDescription
        body
        thumbnail
        articleCoverImage
        tags
        status
        publishedAt
        createdAt
        updatedAt
      }
      metaCounter {
        total
      }
    }
  }
`;

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
        articleCoverImage
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
      articleCoverImage
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
      articleCoverImage
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
      shortDescription
      body
      thumbnail
      articleCoverImage
      tags
      status
      publishedAt
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_ARTICLE = gql`
  mutation UpdateArticle($input: UpdateArticleInput!) {
    updateArticle(input: $input) {
      _id
      title
      slug
      shortDescription
      body
      thumbnail
      articleCoverImage
      tags
      status
      publishedAt
      createdAt
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

export const GET_CS_CENTER_CONTENT = gql`
  query GetCSCenterContent {
    getCSCenterContent {
      _id
      heroTitle
      heroDescription
      heroImage
      quickAccessCards {
        title
        description
        icon
        link
        color
      }
      contactMethods {
        type
        label
        value
        availability
        icon
      }
      faqs {
        _id
        question
        answer
        category
        order
        createdAt
        updatedAt
      }
      updatedAt
      updatedBy
    }
  }
`;

export const UPDATE_CS_CENTER_CONTENT = gql`
  mutation UpdateCSCenterContent($input: UpdateCSCenterContentInput!) {
    updateCSCenterContent(input: $input) {
      _id
      heroTitle
      heroDescription
      heroImage
      quickAccessCards {
        title
        description
        icon
        link
        color
      }
      contactMethods {
        type
        label
        value
        availability
        icon
      }
      faqs {
        _id
        question
        answer
        category
        order
        createdAt
        updatedAt
      }
      updatedAt
      updatedBy
    }
  }
`;

export const CREATE_CS_FAQ = gql`
  mutation CreateCSFAQ($input: CreateCSFAQInput!) {
    createCSFAQ(input: $input) {
      _id
      question
      answer
      category
      order
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_CS_FAQ = gql`
  mutation UpdateCSFAQ($input: UpdateCSFAQInput!) {
    updateCSFAQ(input: $input) {
      _id
      question
      answer
      category
      order
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_CS_FAQ = gql`
  mutation DeleteCSFAQ($faqId: String!) {
    deleteCSFAQ(faqId: $faqId) {
      _id
      question
      answer
      category
      order
      createdAt
      updatedAt
    }
  }
`;
