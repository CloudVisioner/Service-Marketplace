import { gql } from 'graphql-tag';

/**
 * GraphQL Queries for Organization Create and Update
 * Ready-to-use queries for frontend GraphQL client
 * 

* IMPORTANT: Use the NEW field names (organizationName, organizationIndustry, etc.)
 * DO NOT use old field names (orgName, orgIndustry, etc.) - they no longer exist!
 * 
 * Note: Install graphql-tag if using in frontend:
 * npm install graphql-tag
 * 
 * Or use with Apollo Client:
 * import { gql } from '@apollo/client';
 */

// ============================================================================
// CREATE BUYER ORGANIZATION (Buyer-specific, minimal fields)
// ============================================================================
// Mutation: createOrUpdateBuyerOrganization
// Input: BuyerOrganizationInput
export const CREATE_BUYER_ORGANIZATION = gql`
  mutation CreateOrUpdateBuyerOrganization($input: BuyerOrganizationInput!) {
    createOrUpdateBuyerOrganization(input: $input) {
      _id
      orgType
      orgOwnerUserId
      organizationName
      organizationIndustry
      organizationLocation
      organizationDescription
      budgetRange
      createdAt
      updatedAt
    }
  }
`;

// ============================================================================
// GET BUYER ORGANIZATION (Query - no input needed, uses auth context)
// ============================================================================
// Query: getBuyerOrganization
// Returns full buyer organization information
export const GET_BUYER_ORGANIZATION = gql`
  query GetBuyerOrganization {
    getBuyerOrganization {
      _id
      orgType
      orgStatus
      orgOwnerUserId
      organizationName
      organizationIndustry
      organizationLocation
      organizationDescription
      budgetRange
      createdAt
      updatedAt
    }
  }
`;

// ============================================================================
// UPDATE ORGANIZATION (for general organizations)
// ============================================================================
// Mutation: updateOrganization
// Input: OrganizationUpdate (requires orgId)
export const UPDATE_ORGANIZATION = gql`
  mutation UpdateOrganization($input: OrganizationUpdate!) {
    updateOrganization(input: $input) {
      _id
      organizationName
      organizationIndustry
      organizationLocation
      organizationDescription
      organizationSpecialties
      organizationHourlyRate
      organizationTeamSize
      organizationWebsiteUrl
      organizationContactEmail
      organizationPhoneNumber
      organizationImage
      budgetRange
      orgOwnerUserId
      orgType
      orgStatus
      deletedAt
      createdAt
      updatedAt
    }
  }
`;

// ============================================================================
// FRONTEND USAGE EXAMPLES
// ============================================================================

/**
 * CREATE BUYER ORGANIZATION - Frontend Input:
 * 
 * const variables = {
 *   input: {
 *     // REQUIRED FIELDS (Buyer-specific only):
 *     organizationName: "ABC Corporation",           // REQUIRED
 *     organizationIndustry: "E-Commerce",            // REQUIRED
 *     organizationLocation: "USA",                    // REQUIRED
 *     organizationDescription: "Company description", // REQUIRED
 *     
 *     // OPTIONAL FIELDS (Buyer-specific only):
 *     budgetRange: "$1000-$10000"                     // OPTIONAL - Format: "$1000-$10000" or "1000-10000"
 *   }
 * };
 * 
 * // DO NOT SEND THESE FIELDS (they are set automatically):
 * // - deletedAt
 * // - updatedAt
 * // - orgOwnerUserId
 * // - createdAt
 * // - orgType (auto-set to "BUYER")
 */

/**
 * GET BUYER ORGANIZATION - Frontend Usage:
 * 
 * // No variables needed - uses authenticated user's ID automatically
 * const { data } = await client.query({
 *   query: GET_BUYER_ORGANIZATION,
 *   context: {
 *     headers: {
 *       authorization: `Bearer ${token}`
 *     }
 *   }
 * });
 * 
 * // Returns null if buyer has no organization yet
 * // Returns full organization data if exists
 * 
 * // Example response:
 * // {
 * //   data: {
 * //     getBuyerOrganization: {
 * //       _id: "69970318229d239324d2afaa",
 * //       orgType: "BUYER",
 * //       orgStatus: "ACTIVE",
 * //       orgOwnerUserId: "699702f1229d239324d2af96",
 * //       organizationName: "ABC Corporation",
 * //       organizationIndustry: "E-Commerce",
 * //       organizationLocation: "USA",
 * //       organizationDescription: "Company description...",
 * //       budgetRange: "$1000-$10000",
 * //       createdAt: "2024-01-15T10:30:00.000Z",
 * //       updatedAt: "2024-01-20T14:45:00.000Z"
 * //     }
 * //   }
 * // }
 * 
 * // Fields returned (full buyer organization information):
 * // - _id: Organization ID
 * // - orgType: Always "BUYER"
 * // - orgStatus: "ACTIVE" | "INACTIVE" | etc.
 * // - orgOwnerUserId: User ID who owns this organization
 * // - organizationName: Company Name
 * // - organizationIndustry: Industry/Category
 * // - organizationLocation: Location
 * // - organizationDescription: Description
 * // - budgetRange: Budget Range (optional)
 * // - createdAt: Creation timestamp
 * // - updatedAt: Last update timestamp
 */

/**
 * UPDATE BUYER ORGANIZATION - Frontend Input Example:
 * 
 * // Note: For buyers, use createOrUpdateBuyerOrganization (no orgId needed)
 * // It automatically updates if buyer already has an organization
 * 
 * const variables = {
 *   input: {
 *     // REQUIRED FIELDS (Buyer-specific only):
 *     organizationName: "Updated Name",              // REQUIRED
 *     organizationIndustry: "Updated Industry",       // REQUIRED
 *     organizationLocation: "Updated Location",       // REQUIRED
 *     organizationDescription: "Updated Desc",        // REQUIRED
 *     
 *     // OPTIONAL FIELDS (Buyer-specific only):
 *     budgetRange: "$1000-$10000"                     // OPTIONAL - Format: "$1000-$10000" or "1000-10000"
 *   }
 * };
 * 
 * // BUDGET RANGE FORMAT EXAMPLES:
 * // - "$1000-$10000"
 * // - "1000-10000"
 * // - "1000 to 10000"
 * // - Any string format you prefer (stored as String in database)
 */

