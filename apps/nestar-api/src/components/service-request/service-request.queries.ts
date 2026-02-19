import { gql } from 'graphql-tag';

// ============================================================================
// CREATE SERVICE REQUEST (Post a New Job/Request)
// ============================================================================
// Mutation: createServiceRequest
// Input: ServiceRequestInput
// Role: BUYER only
export const CREATE_SERVICE_REQUEST = gql`
  mutation CreateServiceRequest($input: ServiceRequestInput!) {
    createServiceRequest(input: $input) {
      _id
      reqTitle
      reqDescription
      reqBuyerOrgId
      reqCategory
      reqSubCategory
      reqBudgetRange
      reqDeadline
      reqUrgency
      reqSkillsNeeded
      reqStatus
      reqTotalLikes
      reqTotalViews
      reqTotalQuotes
      reqCreatedByUserId
      createdAt
      updatedAt
    }
  }
`;

// ============================================================================
// GET BUYER SERVICE REQUESTS (List - for "My Service Requests" page)
// ============================================================================
// Query: getBuyerServiceRequests
// Returns list of buyer's service requests with status counters
// Role: BUYER only
export const GET_BUYER_SERVICE_REQUESTS = gql`
  query GetBuyerServiceRequests($input: BuyerServiceRequestFilterInput) {
    getBuyerServiceRequests(input: $input) {
      list {
        _id
        reqTitle
        reqDescription
        reqBuyerOrgId
        reqCategory
        reqSubCategory
        reqBudgetRange
        reqDeadline
        reqUrgency
        reqSkillsNeeded
        reqAttachments
        reqStatus
        reqTotalLikes
        reqTotalViews
        reqTotalQuotes
        reqNewQuotesCount
        reqCreatedByUserId
        createdAt
        updatedAt
      }
      metaCounter {
        total
        open
        inProgress
        closed
        draft
      }
    }
  }
`;

// ============================================================================
// GET SERVICE REQUEST (Single - by ID)
// ============================================================================
// Query: getServiceRequest
// Returns full details of a single service request
export const GET_SERVICE_REQUEST = gql`
  query GetServiceRequest($requestId: String!) {
    getServiceRequest(requestId: $requestId) {
      _id
      reqTitle
      reqDescription
      reqBuyerOrgId
      reqCategory
      reqSubCategory
      reqBudgetRange
      reqDeadline
      reqUrgency
      reqSkillsNeeded
      reqAttachments
      reqStatus
      reqTotalLikes
      reqTotalViews
      reqTotalQuotes
      reqNewQuotesCount
      reqCreatedByUserId
      createdAt
      updatedAt
      reqBuyerOrgData {
        _id
        organizationName
        organizationIndustry
        organizationLocation
      }
      reqCreatedByUserData {
        _id
        userName
        userEmail
      }
      quotes {
        _id
        quotePrice
        quoteDescription
        quoteStatus
        createdAt
      }
    }
  }
`;

// ============================================================================
// GET MY SERVICE REQUESTS (Alternative - with pagination)
// ============================================================================
// Query: getMyServiceRequests
// Returns paginated list of buyer's service requests
// Role: BUYER only
export const GET_MY_SERVICE_REQUESTS = gql`
  query GetMyServiceRequests($input: ServiceRequestInquiry!) {
    getMyServiceRequests(input: $input) {
      list {
        _id
        reqTitle
        reqDescription
        reqBuyerOrgId
        reqCategory
        reqSubCategory
        reqBudgetRange
        reqDeadline
        reqUrgency
        reqSkillsNeeded
        reqAttachments
        reqStatus
        reqTotalLikes
        reqTotalViews
        reqTotalQuotes
        reqNewQuotesCount
        reqCreatedByUserId
        createdAt
        updatedAt
        reqBuyerOrgData {
          _id
          organizationName
        }
      }
      metaCounter {
        total
      }
    }
  }
`;

// ============================================================================
// FRONTEND USAGE EXAMPLES
// ============================================================================

/**
 * CREATE SERVICE REQUEST - Frontend Input:
 * 
 * const variables = {
 *   input: {
 *     // REQUIRED FIELDS:
 *     reqTitle: "Need HR Consultant for Employee Training",
 *     reqDescription: "We need an experienced HR consultant...",
 *     reqBuyerOrgId: "69970318229d239324d2afaa",
 *     reqCategory: "BUSINESS_SERVICES",
 *     reqBudgetRange: "$3,500",
 *     reqDeadline: "2024-12-31T23:59:59.000Z",
 *     
 *     // OPTIONAL FIELDS:
 *     reqSubCategory: "HR_AND_OPERATIONS",
 *     reqUrgency: "URGENT",
 *     reqSkillsNeeded: ["HR Management", "Training", "Recruitment"],
 *     reqStatus: "DRAFT"
 *   }
 * };
 */

/**
 * GET BUYER SERVICE REQUESTS - Frontend Usage (Recommended for "My Service Requests" page):
 * 
 * // Returns list with status counters (total, open, inProgress, closed, draft)
 * // Uses authenticated buyer's ID automatically - no need to pass userId
 * 
 * const { data, loading, error } = await client.query({
 *   query: GET_BUYER_SERVICE_REQUESTS,
 *   variables: {
 *     input: {
 *       // OPTIONAL FILTERS (all fields are optional):
 *       status: "OPEN",              // Filter by status: "DRAFT" | "PUBLISHED" | "OPEN" | "IN_PROGRESS" | "CLOSED" | "CANCELLED"
 *       category: "BUSINESS_SERVICES", // Filter by category
 *       page: 1,                      // Page number (default: 1)
 *       limit: 10,                    // Items per page (default: 10)
 *       sortBy: "createdAt",          // Sort field: "createdAt" | "deadline" | "budgetRange"
 *       sortOrder: "desc",            // Sort order: "asc" | "desc"
 *       search: "HR consultant"      // Search in title/description
 *     }
 *   },
 *   context: {
 *     headers: {
 *       authorization: `Bearer ${token}`
 *     }
 *   }
 * });
 * 
 * // Example Response:
 * // {
 * //   data: {
 * //     getBuyerServiceRequests: {
 * //       list: [
 * //         {
 * //           _id: "69970318229d239324d2afaa",
 * //           reqTitle: "Need HR Consultant",
 * //           reqDescription: "Looking for HR consultant...",
 * //           reqStatus: "OPEN",                    // Status
 * //           reqBudgetRange: "$3,500",
 * //           reqDeadline: "2024-12-31T23:59:59.000Z",
 * //           reqUrgency: "URGENT",
 * //           reqTotalQuotes: 5,
 * //           reqNewQuotesCount: 2,
 * //           createdAt: "2024-01-15T10:30:00.000Z",  // Date when posted
 * //           updatedAt: "2024-01-20T14:45:00.000Z",  // Last update date
 * //           ...
 * //         }
 * //       ],
 * //       metaCounter: {
 * //         total: 10,      // Total requests
 * //         open: 5,        // Open requests
 * //         inProgress: 2,   // In progress requests
 * //         closed: 2,       // Closed requests
 * //         draft: 1        // Draft requests
 * //       }
 * //     }
 * //   }
 * // }
 */

/**
 * GET SERVICE REQUEST (Single) - Frontend Usage:
 * 
 * // Get full details of a specific service request by ID
 * 
 * const { data, loading, error } = await client.query({
 *   query: GET_SERVICE_REQUEST,
 *   variables: {
 *     requestId: "69970318229d239324d2afaa"  // REQUIRED - Service Request ID
 *   },
 *   context: {
 *     headers: {
 *       authorization: `Bearer ${token}`
 *     }
 *   }
 * });
 * 
 * // Response includes:
 * // - Full service request details
 * // - Buyer organization data
 * // - Creator user data
 * // - All quotes for this request
 * // - createdAt (date when posted)
 * // - updatedAt (last update date)
 */

/**
 * GET MY SERVICE REQUESTS (Alternative with pagination) - Frontend Usage:
 * 
 * const { data, loading, error } = await client.query({
 *   query: GET_MY_SERVICE_REQUESTS,
 *   variables: {
 *     input: {
 *       page: 1,        // REQUIRED
 *       limit: 10,      // REQUIRED
 *       sort: "createdAt",
 *       sortOrder: "desc",
 *       search: {
 *         reqStatus: "OPEN",  // OPTIONAL - Filter by status
 *         text: "HR"          // OPTIONAL - Search in title/description
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
