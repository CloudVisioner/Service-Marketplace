import { gql } from 'graphql-tag';

// ============================================================================
// GET MY PROFILE (Get current user's profile)
// ============================================================================
// Query: getUser
// Returns full user profile information
export const GET_MY_PROFILE = gql`
  query GetMyProfile($userId: String!) {
    getUser(userId: $userId) {
      _id
      userNick
      userEmail
      userPhone
      userImage
      userDescription
      userRole
      userStatus
      userAuthType
      userTotalServiceRequests
      userTotalQuotes
      userOrgCount
      createdAt
      updatedAt
    }
  }
`;

// ============================================================================
// UPDATE MY PROFILE (Update profile information)
// ============================================================================
// Mutation: updateUser
// Updates user profile (image, display name, email, phone, etc.)
export const UPDATE_MY_PROFILE = gql`
  mutation UpdateMyProfile($input: UserUpdate!) {
    updateUser(input: $input) {
      _id
      userNick
      userEmail
      userPhone
      userImage
      userDescription
      userRole
      userStatus
      userAuthType
      updatedAt
      accessToken
    }
  }
`;

// ============================================================================
// CHANGE MY PASSWORD (Security - Change password)
// ============================================================================
// Mutation: changeMyPassword
// Changes user password after verifying current password
export const CHANGE_MY_PASSWORD = gql`
  mutation ChangeMyPassword($input: ChangePasswordInput!) {
    changeMyPassword(input: $input)
  }
`;

// ============================================================================
// UPLOAD PROFILE IMAGE
// ============================================================================
// Mutation: imageUploader
// Uploads a single image file (for profile image)
export const UPLOAD_PROFILE_IMAGE = gql`
  mutation UploadProfileImage($file: Upload!, $target: String!) {
    imageUploader(file: $file, target: $target)
  }
`;

// ============================================================================
// FRONTEND USAGE EXAMPLES
// ============================================================================

/**
 * GET MY PROFILE - Frontend Usage:
 * 
 * // Get current user's profile information
 * const { data, loading, error } = await client.query({
 *   query: GET_MY_PROFILE,
 *   variables: {
 *     userId: currentUserId  // Your logged-in user's _id
 *   },
 *   context: {
 *     headers: {
 *       authorization: `Bearer ${token}`
 *     }
 *   }
 * });
 * 
 * // Response:
 * // {
 * //   data: {
 * //     getUser: {
 * //       _id: "699702f1229d239324d2af96",
 * //       userNick: "John Doe",           // Display name / Username
 * //       userEmail: "john@example.com",
 * //       userPhone: "+1 555 123 456",
 * //       userImage: "uploads/user/abc123.jpg",
 * //       userDescription: "Short bio...",
 * //       userRole: "BUYER",
 * //       createdAt: "2024-01-15T10:30:00.000Z",
 * //       updatedAt: "2024-01-20T14:45:00.000Z",
 * //       ...
 * //     }
 * //   }
 * // }
 */

/**
 * UPDATE MY PROFILE - Frontend Usage:
 * 
 * // Update profile information (only send fields you want to change)
 * const { data } = await client.mutate({
 *   mutation: UPDATE_MY_PROFILE,
 *   variables: {
 *     input: {
 *       _id: currentUserId,              // Required by GraphQL type (backend uses auth token, ignores this)
 *       userNick: "John Doe",            // Display name / Username
 *       userEmail: "john@example.com",   // Email address
 *       userPhone: "+1 555 123 456",     // Phone number
 *       userImage: "uploads/user/abc123.jpg",  // Profile image (from imageUploader)
 *       userDescription: "Updated bio..."     // Description
 *     }
 *   },
 *   context: {
 *     headers: {
 *       authorization: `Bearer ${token}`
 *     }
 *   }
 * });
 * 
 * // Response includes updated user data + new accessToken
 */

/**
 * CHANGE MY PASSWORD - Frontend Usage:
 * 
 * // Change password (requires current password verification)
 * const { data } = await client.mutate({
 *   mutation: CHANGE_MY_PASSWORD,
 *   variables: {
 *     input: {
 *       currentPassword: "oldPass123",   // REQUIRED - Current password for verification
 *       newPassword: "newPass456",      // REQUIRED - New password (5-12 characters)
 *       securityCode: "123456"          // OPTIONAL - Security number (if implemented)
 *     }
 *   },
 *   context: {
 *     headers: {
 *       authorization: `Bearer ${token}`
 *     }
 *   }
 * });
 * 
 * // Response: true if successful
 * // Throws error if current password is incorrect
 */

/**
 * UPLOAD PROFILE IMAGE - Frontend Usage:
 * 
 * // Step 1: Upload image file
 * const { data: uploadData } = await client.mutate({
 *   mutation: UPLOAD_PROFILE_IMAGE,
 *   variables: {
 *     file: imageFile,        // File object from input
 *     target: "user"          // Target folder
 *   },
 *   context: {
 *     headers: {
 *       authorization: `Bearer ${token}`
 *     }
 *   }
 * });
 * 
 * // Response: "uploads/user/uuid-filename.jpg"
 * 
 * // Step 2: Update profile with image path
 * const imagePath = uploadData.imageUploader;
 * await client.mutate({
 *   mutation: UPDATE_MY_PROFILE,
 *   variables: {
 *     input: {
 *       _id: currentUserId,
 *       userImage: imagePath
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
 * COMPLETE PROFILE UPDATE FLOW:
 * 
 * // Example: Update profile with image upload
 * const updateProfileWithImage = async (imageFile, profileData) => {
 *   // 1. Upload image
 *   const { data: uploadData } = await client.mutate({
 *     mutation: UPLOAD_PROFILE_IMAGE,
 *     variables: {
 *       file: imageFile,
 *       target: "user"
 *     },
 *     context: {
 *       headers: {
 *         authorization: `Bearer ${token}`
 *       }
 *     }
 *   });
 * 
 *   // 2. Update profile with all data including image
 *   const { data } = await client.mutate({
 *     mutation: UPDATE_MY_PROFILE,
 *     variables: {
 *       input: {
 *         _id: currentUserId,
 *         userNick: profileData.displayName,
 *         userEmail: profileData.email,
 *         userPhone: profileData.phone,
 *         userImage: uploadData.imageUploader,
 *         userDescription: profileData.description
 *       }
 *     },
 *     context: {
 *       headers: {
 *         authorization: `Bearer ${token}`
 *       }
 *     }
 *   });
 * 
 *   return data.updateUser;
 * };
 */
