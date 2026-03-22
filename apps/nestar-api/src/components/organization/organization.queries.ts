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
      organizationType
      organizationStatus
      orgOwnerUserId
      organizationName
      organizationIndustry
      organizationLocation
      organizationCountry
      organizationDescription
      budgetRange
      organizationImage
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
      organizationType
      organizationStatus
      orgOwnerUserId
      organizationName
      organizationIndustry
      organizationLocation
      organizationCountry
      organizationDescription
      budgetRange
      organizationImage
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

// ============================================================================
// CREATE PROVIDER ORGANIZATION PROFILE
// ============================================================================
// Mutation: createProviderOrgProf
// Input: ProviderOrganizationInput
// Role: PROVIDER only
export const CREATE_PROVIDER_ORG_PROF = gql`
  mutation CreateProviderOrgProf($input: ProviderOrganizationInput!) {
    createProviderOrgProf(input: $input) {
      _id
      orgType
      orgStatus
      organizationName
      organizationDescription
      organizationContactEmail
      organizationCountry
      categoryId
      subCategory
      orgOwnerUserId
      createdAt
      updatedAt
    }
  }
`;

// ============================================================================
// UPDATE PROVIDER ORGANIZATION PROFILE
// ============================================================================
// Mutation: updateProviderOrgProf
// Input: UpdateProviderOrganizationInput
// Role: PROVIDER only
export const UPDATE_PROVIDER_ORG_PROF = gql`
  mutation UpdateProviderOrgProf($input: UpdateProviderOrganizationInput!) {
    updateProviderOrgProf(input: $input) {
      _id
      orgType
      orgStatus
      organizationName
      organizationDescription
      organizationContactEmail
      organizationCountry
      orgCountry
      categoryId
      subCategory
      organizationImage
      budgetRange
      orgOwnerUserId
      createdAt
      updatedAt
    }
  }
`;

// ============================================================================
// GET PROVIDER ORGANIZATION (Authenticated - Provider Only)
// ============================================================================
// Query: getProviderOrganization
// Input: None (uses authenticated user from token)
// Returns: Provider's own organization profile
export const GET_PROVIDER_ORGANIZATION = gql`
  query GetProviderOrganization {
    getProviderOrganization {
      _id
      orgType
      orgStatus
      organizationName
      organizationDescription
      organizationContactEmail
      organizationCountry
      orgCountry
      categoryId
      subCategory
      organizationImage
      budgetRange
      orgAverageRating
      reviewsCount
      orgOwnerUserId
      createdAt
      updatedAt
    }
  }
`;

// ============================================================================
// RATE ORGANIZATION
// ============================================================================
// Mutation: rateOrganization
// Input: RateOrganizationInput (orgId, rating)
// Returns: Updated organization with new averageRating and reviewCount
export const RATE_ORGANIZATION = gql`
  mutation RateOrganization($input: RateOrganizationInput!) {
    rateOrganization(input: $input) {
      _id
      orgAverageRating
      reviewsCount
      totalRatingValue
    }
  }
`;

// ============================================================================
// UPDATE PROVIDER USER PROFILE
// ============================================================================
// Mutation: updateProviderProfile
// Input: UpdateProviderProfileInput
// Role: PROVIDER only
export const UPDATE_PROVIDER_PROFILE = gql`
  mutation UpdateProviderProfile($input: UpdateProviderProfileInput!) {
    updateProviderProfile(input: $input) {
      _id
      userNick
      userEmail
      userPhone
      userDescription
      userRole
      userStatus
      createdAt
      updatedAt
    }
  }
`;

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

/**
 * CREATE PROVIDER ORGANIZATION PROFILE - Frontend Usage:
 * 
 * const { data, loading, error } = await client.mutate({
 *   mutation: CREATE_PROVIDER_ORG_PROF,
 *   variables: {
 *     input: {
 *       // REQUIRED FIELDS:
 *       organizationName: "Tech Solutions Inc",        // REQUIRED
 *       
 *       // OPTIONAL FIELDS:
 *       organizationDescription: "We provide...",      // OPTIONAL
 *       organizationContactEmail: "contact@tech.com", // OPTIONAL
 *       organizationCountry: "USA",                    // OPTIONAL
 *       organizationCategories: [                     // OPTIONAL - Array of Category enum
 *         "IT_AND_SOFTWARE",
 *         "BUSINESS_SERVICES"
 *       ],
 *       organizationSubCategories: [                   // OPTIONAL - Array of SubCategory enum
 *         "WEB_APP_DEVELOPMENT",
 *         "DATA_AND_AI"
 *       ]
 *     }
 *   },
 *   context: {
 *     headers: {
 *       authorization: `Bearer ${token}`
 *     }
 *   }
 * });
 * 
 * // Note: orgType is auto-set to "SERVICE_PROVIDER"
 * // Note: orgStatus is auto-set to "ACTIVE"
 * // Note: Only one provider organization per user (will error if already exists)
 * 
 * // Available Category values:
 * // - "IT_AND_SOFTWARE"
 * // - "BUSINESS_SERVICES"
 * // - "MARKETING_AND_SALES"
 * // - "DESIGN_AND_CREATIVE"
 * 
 * // Available SubCategory values (examples):
 * // IT_AND_SOFTWARE: "WEB_APP_DEVELOPMENT", "DATA_AND_AI", "SOFTWARE_TESTING_AND_QA", "INFRASTRUCTURE_AND_CLOUD"
 * // BUSINESS_SERVICES: "ADMIN_AND_VIRTUAL_SUPPORT", "FINANCIAL_AND_LEGAL", "STRATEGY_AND_CONSULTING", "HR_AND_OPERATIONS"
 * // MARKETING_AND_SALES: "DIGITAL_MARKETING", "SOCIAL_MEDIA_MANAGEMENT", "CONTENT_AND_COPYWRITING", "SALES_AND_LEAD_GEN"
 * // DESIGN_AND_CREATIVE: "VISUAL_IDENTITY_AND_BRANDING", "UI_UX_AND_WEB_DESIGN", "MOTION_AND_VIDEO", "ILLUSTRATION_AND_PRINT"
 */

/**
 * UPDATE PROVIDER ORGANIZATION PROFILE - Frontend Usage:
 * 
 * const { data, loading, error } = await client.mutate({
 *   mutation: UPDATE_PROVIDER_ORG_PROF,
 *   variables: {
 *     input: {
 *       // REQUIRED:
 *       orgId: "69970318229d239324d2afaa",             // REQUIRED - Organization ID
 *       
 *       // OPTIONAL (only provided fields will be updated):
 *       organizationName: "Updated Name",              // OPTIONAL
 *       organizationDescription: "Updated desc...",   // OPTIONAL
 *       organizationContactEmail: "new@email.com",    // OPTIONAL
 *       organizationCountry: "Canada",                 // OPTIONAL
 *       organizationCategories: [                     // OPTIONAL - Replaces entire array
 *         "DESIGN_AND_CREATIVE"
 *       ],
 *       organizationSubCategories: [                   // OPTIONAL - Replaces entire array
 *         "UI_UX_AND_WEB_DESIGN",
 *         "VISUAL_IDENTITY_AND_BRANDING"
 *       ]
 *     }
 *   },
 *   context: {
 *     headers: {
 *       authorization: `Bearer ${token}`
 *     }
 *   }
 * });
 * 
 * // Example: Update only name and categories
 * const { data } = await client.mutate({
 *   mutation: UPDATE_PROVIDER_ORG_PROF,
 *   variables: {
 *     input: {
 *       orgId: "69970318229d239324d2afaa",
 *       organizationName: "New Company Name",
 *       organizationCategories: ["IT_AND_SOFTWARE"]
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
 * UPDATE PROVIDER USER PROFILE - Frontend Usage:
 * 
 * const { data, loading, error } = await client.mutate({
 *   mutation: UPDATE_PROVIDER_PROFILE,
 *   variables: {
 *     input: {
 *       // ALL FIELDS ARE OPTIONAL (only provided fields will be updated):
 *       providerFullName: "John Doe",                  // OPTIONAL - Maps to userDescription
 *       providerDisplayName: "johndoe",                 // OPTIONAL - Maps to userNick (must be unique)
 *       providerEmail: "john@example.com",             // OPTIONAL - Maps to userEmail (must be unique)
 *       providerPhone: "+1234567890"                   // OPTIONAL - Maps to userPhone (must be unique)
 *     }
 *   },
 *   context: {
 *     headers: {
 *       authorization: `Bearer ${token}`
 *     }
 *   }
 * });
 * 
 * // Example: Update only display name
 * const { data } = await client.mutate({
 *   mutation: UPDATE_PROVIDER_PROFILE,
 *   variables: {
 *     input: {
 *       providerDisplayName: "newdisplayname"
 *     }
 *   },
 *   context: {
 *     headers: {
 *       authorization: `Bearer ${token}`
 *     }
 *   }
 * });
 * 
 * // Field Mappings:
 * // - providerFullName → userDescription (stored in database)
 * // - providerDisplayName → userNick (stored in database, must be unique)
 * // - providerEmail → userEmail (stored in database, must be unique)
 * // - providerPhone → userPhone (stored in database, must be unique)
 */