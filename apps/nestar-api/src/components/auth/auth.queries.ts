import { gql } from 'graphql-tag';

/**
 * GraphQL Queries for Authentication
 * Signup, Login, and Logout
 * 
 * Note: Install graphql-tag if using in frontend:
 * npm install graphql-tag
 * 
 * Or use with Apollo Client:
 * import { gql } from '@apollo/client';
 */

// ============================================================================
// SIGNUP (User Registration)
// ============================================================================
export const SIGNUP = gql`
  mutation Signup($input: SignupInput!) {
    signup(input: $input) {
      accessToken
      user {
        _id
        userNick
        userEmail
        userRole
        userStatus
        userAuthType
        createdAt
      }
    }
  }
`;

// ============================================================================
// LOGIN (User Authentication)
// ============================================================================
export const LOGIN = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      _id
      userNick
      userEmail
      userRole
      userStatus
      userAuthType
      accessToken
      createdAt
    }
  }
`;

// ============================================================================
// LOGOUT (Client-side - No mutation needed)
// ============================================================================
// Logout is handled client-side by removing the token from storage
// No GraphQL mutation required

// ============================================================================
// FRONTEND USAGE EXAMPLES
// ============================================================================

/**
 * SIGNUP - Frontend Input:
 * 
 * const variables = {
 *   input: {
 *     userEmail: "user@example.com",    // REQUIRED (valid email)
 *     userNick: "johndoe",              // REQUIRED (3-12 characters)
 *     userPassword: "password123",       // REQUIRED (5-12 characters)
 *     userRole: "BUYER"                  // OPTIONAL (BUYER, PROVIDER, ADMIN) - defaults to BUYER
 *   }
 * };
 */

/**
 * LOGIN - Frontend Input:
 * 
 * const variables = {
 *   input: {
 *     userNick: "johndoe",              // REQUIRED (3-12 characters)
 *     userPassword: "password123"       // REQUIRED (5-12 characters)
 *   }
 * };
 */

/**
 * LOGOUT - Frontend Implementation:
 * 
 * // Simply remove the token from storage
 * localStorage.removeItem('accessToken');
 * // or
 * sessionStorage.removeItem('accessToken');
 * // Clear Apollo Client cache if using Apollo
 * client.clearStore();
 */
