import { gql } from 'graphql-tag';

/**
 * GraphQL Queries for Marketplace (Provider Organizations)
 * Ready-to-use queries for frontend GraphQL client
 * 
 * These queries are PUBLIC (no authentication required) and return
 * provider organizations that are ACTIVE and of type SERVICE_PROVIDER.
 * 
 * Note: Install graphql-tag if using in frontend:
 * npm install graphql-tag
 * 
 * Or use with Apollo Client:
 * import { gql } from '@apollo/client';
 */

// ============================================================================
// GET PROVIDERS BY CATEGORY (Public - No Auth Required)
// ============================================================================
// Query: getProvidersByCategory
// Input: ProviderCategoryInput
// Returns: List of provider organizations filtered by category
export const GET_PROVIDERS_BY_CATEGORY = gql`
  query GetProvidersByCategory($input: ProviderCategoryInput!) {
    getProvidersByCategory(input: $input) {
      list {
        _id
        organizationName
        organizationDescription
        organizationImage
        organizationCountry
        orgCountry
        orgCity
        categoryId
        subCategory
        orgAverageRating
        reviewsCount
        budgetRange
        organizationHourlyRate
        createdAt
        updatedAt
      }
      metaCounter {
        total
      }
    }
  }
`;

// ============================================================================
// GET PROVIDER DETAIL (Public - No Auth Required, but shows contact info if logged in)
// ============================================================================
// Query: getProviderDetail
// Input: orgId (String)
// Returns: Single provider organization details
// Note: Contact info (email, phone) is only shown if user is authenticated
export const GET_PROVIDER_DETAIL = gql`
  query GetProviderDetail($orgId: String!) {
    getProviderDetail(orgId: $orgId) {
      _id
      organizationName
      organizationDescription
      organizationCountry
      orgCity
      organizationImage
      organizationWebsiteUrl
      organizationHourlyRate
      organizationTeamSize
      organizationSpecialties
      categoryId
      subCategory
      orgAverageRating
      orgTotalProjects
      orgTotalLikes
      orgTotalViews
      orgResponseTimeAvg
      orgVerified
      orgSkills
      establishmentYear
      minProjectSize
      budgetRange
      bio
      avatar
      badges
      color
      organizationLocation
      flag
      reviewsCount
      myRating
      organizationContactEmail
      organizationPhoneNumber
      linkedIn
      twitter
      github
      orgOwnerData {
        _id
        userNick
        userEmail
        userPhone
        userDescription
        userRole
        userStatus
      }
      createdAt
      updatedAt
    }
  }
`;

// ============================================================================
// GET PROVIDERS SORTED (Public - No Auth Required)
// ============================================================================
// Query: getProvidersSorted
// Input: ProviderSortInput
// Returns: List of provider organizations with sorting options
export const GET_PROVIDERS_SORTED = gql`
  query GetProvidersSorted($input: ProviderSortInput!) {
    getProvidersSorted(input: $input) {
      list {
        _id
        organizationName
        organizationDescription
        organizationCountry
        orgCity
        organizationImage
        organizationWebsiteUrl
        organizationHourlyRate
        organizationTeamSize
        organizationSpecialties
        categoryId
        subCategory
        orgAverageRating
        orgTotalProjects
        orgTotalLikes
        orgTotalViews
        orgResponseTimeAvg
        orgVerified
        orgSkills
        establishmentYear
        minProjectSize
        budgetRange
        bio
        avatar
        badges
        color
        organizationLocation
        flag
        reviewsCount
        organizationContactEmail
        organizationPhoneNumber
        linkedIn
        twitter
        github
        orgOwnerData {
          _id
          userNick
          userEmail
          userPhone
          userDescription
          userRole
          userStatus
        }
        createdAt
        updatedAt
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
 * GET PROVIDERS BY CATEGORY - Frontend Usage:
 * 
 * const { data, loading, error } = await client.query({
 *   query: GET_PROVIDERS_BY_CATEGORY,
 *   variables: {
 *     input: {
 *       // REQUIRED:
 *       categoryId: "IT_AND_SOFTWARE",  // REQUIRED - Category enum value
 *       
 *       // OPTIONAL:
 *       page: 1,                         // OPTIONAL - Default: 1
 *       limit: 10,                       // OPTIONAL - Default: 10
 *       subCategory: "WEB_APP_DEVELOPMENT", // OPTIONAL - SubCategory enum value
 *       location: "USA",                 // OPTIONAL - Searches in orgCountry, orgCity, organizationLocation
 *       minBudget: 50,                   // OPTIONAL - Minimum hourly rate
 *       maxBudget: 200                   // OPTIONAL - Maximum hourly rate
 *     }
 *   }
 * });
 * 
 * // Available Category values:
 * // - "IT_AND_SOFTWARE"
 * // - "BUSINESS_SERVICES"
 * // - "MARKETING_AND_SALES"
 * // - "DESIGN_AND_CREATIVE"
 * 
 * // Example response:
 * // {
 * //   data: {
 * //     getProvidersByCategory: {
 * //       list: [
 * //         {
 * //           _id: "69970318229d239324d2afaa",
 * //           organizationName: "Tech Solutions Inc",
 * //           organizationDescription: "We provide...",
 * //           organizationCountry: "USA",
 * //           orgCity: "San Francisco",
 * //           organizationImage: "https://...",
 * //           categoryId: ["IT_AND_SOFTWARE"],
 * //           subCategory: ["WEB_APP_DEVELOPMENT"],
 * //           orgAverageRating: 4.5,
 * //           orgTotalProjects: 150,
 * //           ...
 * //         }
 * //       ],
 * //       metaCounter: [{ total: 25 }]
 * //     }
 * //   }
 * // }
 */

/**
 * GET PROVIDER DETAIL - Frontend Usage:
 * 
 * // Without authentication (contact info hidden):
 * const { data } = await client.query({
 *   query: GET_PROVIDER_DETAIL,
 *   variables: {
 *     orgId: "69970318229d239324d2afaa"
 *   }
 * });
 * 
 * // With authentication (contact info shown):
 * const { data } = await client.query({
 *   query: GET_PROVIDER_DETAIL,
 *   variables: {
 *     orgId: "69970318229d239324d2afaa"
 *   },
 *   context: {
 *     headers: {
 *       authorization: `Bearer ${token}`
 *     }
 *   }
 * });
 * 
 * // Note: organizationContactEmail and organizationPhoneNumber
 * // are only returned if user is authenticated
 */

/**
 * GET PROVIDERS SORTED - Frontend Usage:
 * 
 * const { data, loading, error } = await client.query({
 *   query: GET_PROVIDERS_SORTED,
 *   variables: {
 *     input: {
 *       // REQUIRED:
 *       sortBy: "rating",  // REQUIRED - Options: "rating", "projects", "responseTime", "startingRate"
 *       
 *       // OPTIONAL:
 *       page: 1,           // OPTIONAL - Default: 1
 *       limit: 10,         // OPTIONAL - Default: 10
 *       categoryId: "IT_AND_SOFTWARE",  // OPTIONAL - Filter by category
 *       subCategory: "WEB_APP_DEVELOPMENT", // OPTIONAL - Filter by subcategory
 *       location: "USA",   // OPTIONAL - Searches in orgCountry, orgCity, organizationLocation
 *       searchQuery: "web development", // OPTIONAL - Full-text search
 *       minBudget: 50,     // OPTIONAL - Minimum hourly rate
 *       maxBudget: 200      // OPTIONAL - Maximum hourly rate
 *     }
 *   }
 * });
 * 
 * // Sort options:
 * // - "rating": Sort by average rating (highest first), then by reviews count
 * // - "projects": Sort by total projects (highest first)
 * // - "responseTime": Sort by average response time (lowest first)
 * // - "startingRate": Sort by hourly rate (lowest first)
 * // - Default: Sort by average rating (highest first)
 */
