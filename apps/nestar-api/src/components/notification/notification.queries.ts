import { gql } from 'graphql-tag';

/**
 * GraphQL Queries and Mutations for Notifications
 * Ready-to-use queries for frontend GraphQL client
 * 
 * All notification operations require authentication (AuthGuard).
 * 
 * Note: Install graphql-tag if using in frontend:
 * npm install graphql-tag
 * 
 * Or use with Apollo Client:
 * import { gql } from '@apollo/client';
 */

// ============================================================================
// GET MY NOTIFICATIONS (Authenticated - Returns paginated list)
// ============================================================================
// Query: getMyNotifications
// Input: NotificationInquiry
// Returns: Paginated list of user's notifications with sender/receiver user data
export const GET_MY_NOTIFICATIONS = gql`
  query GetMyNotifications($input: NotificationInquiry!) {
    getMyNotifications(input: $input) {
      list {
        _id
        type
        message
        read
        relatedQuoteId
        senderUserId
        receiverUserId
        createdAt
        updatedAt
        senderUserData {
          _id
          userNick
          userEmail
          userPhone
          userDescription
          userRole
          userStatus
        }
        receiverUserData {
          _id
          userNick
          userEmail
          userPhone
          userDescription
          userRole
          userStatus
        }
      }
      metaCounter {
        total
      }
    }
  }
`;

// ============================================================================
// MARK NOTIFICATION AS READ (Authenticated - Mutation)
// ============================================================================
// Mutation: markNotificationAsRead
// Input: notificationId (String)
// Returns: Updated notification object
export const MARK_NOTIFICATION_AS_READ = gql`
  mutation MarkNotificationAsRead($notificationId: String!) {
    markNotificationAsRead(notificationId: $notificationId) {
      _id
      type
      message
      read
      relatedQuoteId
      senderUserId
      receiverUserId
      createdAt
      updatedAt
    }
  }
`;

// ============================================================================
// MARK ALL NOTIFICATIONS AS READ (Authenticated - Mutation)
// ============================================================================
// Mutation: markAllNotificationsAsRead
// Input: None (uses authenticated user's ID)
// Returns: Number of notifications marked as read
export const MARK_ALL_NOTIFICATIONS_AS_READ = gql`
  mutation MarkAllNotificationsAsRead {
    markAllNotificationsAsRead
  }
`;

// ============================================================================
// GET UNREAD NOTIFICATION COUNT (Authenticated - Query)
// ============================================================================
// Query: getUnreadNotificationCount
// Input: NotificationInquiry (optional)
// Returns: Number (count of unread notifications)
export const GET_UNREAD_NOTIFICATION_COUNT = gql`
  query GetUnreadNotificationCount($input: NotificationInquiry) {
    getUnreadNotificationCount(input: $input)
  }
`;

// ============================================================================
// DELETE NOTIFICATION (Authenticated - Mutation)
// ============================================================================
// Mutation: deleteNotification
// Input: notificationId (String)
// Returns: Deleted notification object with _id
export const DELETE_NOTIFICATION = gql`
  mutation DeleteNotification($notificationId: String!) {
    deleteNotification(notificationId: $notificationId) {
      _id
    }
  }
`;

// ============================================================================
// DELETE ALL NOTIFICATIONS (Authenticated - Mutation)
// ============================================================================
// Mutation: deleteAllNotifications
// Input: None (uses authenticated user's ID)
// Returns: Number (count of deleted notifications)
export const DELETE_ALL_NOTIFICATIONS = gql`
  mutation DeleteAllNotifications {
    deleteAllNotifications
  }
`;

// ============================================================================
// FRONTEND USAGE EXAMPLES
// ============================================================================

/**
 * GET MY NOTIFICATIONS - Frontend Usage:
 * 
 * // Get all notifications (read and unread)
 * const { data, loading, error } = await client.query({
 *   query: GET_MY_NOTIFICATIONS,
 *   variables: {
 *     input: {
 *       page: 1,                    // REQUIRED - Page number (min: 1)
 *       limit: 20,                  // REQUIRED - Items per page (min: 1)
 *       search: {
 *         read: undefined,          // OPTIONAL - true: only read, false: only unread, undefined: all
 *         type: undefined           // OPTIONAL - Filter by NotificationType enum
 *       }
 *     }
 *   },
 *   context: {
 *     headers: {
 *       authorization: `Bearer ${token}`
 *     }
 *   }
 * });
 * 
 * // Get only unread notifications
 * const { data } = await client.query({
 *   query: GET_MY_NOTIFICATIONS,
 *   variables: {
 *     input: {
 *       page: 1,
 *       limit: 20,
 *       search: {
 *         read: false               // Only unread notifications
 *       }
 *     }
 *   },
 *   context: {
 *     headers: {
 *       authorization: `Bearer ${token}`
 *     }
 *   }
 * });
 * 
 * // Get only QUOTE_SENT notifications
 * const { data } = await client.query({
 *   query: GET_MY_NOTIFICATIONS,
 *   variables: {
 *     input: {
 *       page: 1,
 *       limit: 20,
 *       search: {
 *         type: "QUOTE_SENT"        // Filter by notification type
 *       }
 *     }
 *   },
 *   context: {
 *     headers: {
 *       authorization: `Bearer ${token}`
 *     }
 *   }
 * });
 * 
 * // Example response:
 * // {
 * //   data: {
 * //     getMyNotifications: {
 * //       list: [
 * //         {
 * //           _id: "69970318229d239324d2afaa",
 * //           type: "QUOTE_SENT",
 * //           message: "You have received a new quote",
 * //           read: false,
 * //           relatedQuoteId: "69970318229d239324d2afbb",
 * //           senderUserId: "69970318229d239324d2afcc",
 * //           receiverUserId: "69970318229d239324d2afdd",
 * //           createdAt: "2024-01-15T10:30:00Z",
 * //           updatedAt: "2024-01-15T10:30:00Z",
 * //           senderUserData: {
 * //             _id: "69970318229d239324d2afcc",
 * //             userNick: "john_doe",
 * //             userEmail: "john@example.com",
 * //             ...
 * //           }
 * //         }
 * //       ],
 * //       metaCounter: [{ total: 15 }]
 * //     }
 * //   }
 * // }
 * 
 * // Available NotificationType values:
 * // - "QUOTE_SENT": Notification when a quote is sent
 * // - "QUOTE_ACCEPTED": Notification when a quote is accepted
 */

/**
 * MARK NOTIFICATION AS READ - Frontend Usage:
 * 
 * const [markAsRead, { data, loading, error }] = useMutation(MARK_NOTIFICATION_AS_READ);
 * 
 * await markAsRead({
 *   variables: {
 *     notificationId: "69970318229d239324d2afaa"
 *   },
 *   context: {
 *     headers: {
 *       authorization: `Bearer ${token}`
 *     }
 *   }
 * });
 * 
 * // Example response:
 * // {
 * //   data: {
 * //     markNotificationAsRead: {
 * //       _id: "69970318229d239324d2afaa",
 * //       type: "QUOTE_SENT",
 * //       message: "You have received a new quote",
 * //       read: true,              // Now marked as read
 * //       ...
 * //     }
 * //   }
 * // }
 * 
 * // Note: This mutation will throw an error if:
 * // - Notification not found
 * // - User tries to mark someone else's notification as read
 * // - Notification is already marked as read
 */

/**
 * MARK ALL NOTIFICATIONS AS READ - Frontend Usage:
 * 
 * const [markAllAsRead, { data, loading, error }] = useMutation(MARK_ALL_NOTIFICATIONS_AS_READ);
 * 
 * await markAllAsRead({
 *   context: {
 *     headers: {
 *       authorization: `Bearer ${token}`
 *     }
 *   }
 * });
 * 
 * // Example response:
 * // {
 * //   data: {
 * //     markAllNotificationsAsRead: 5    // Number of notifications marked as read
 * //   }
 * // }
 */

/**
 * GET UNREAD NOTIFICATION COUNT - Frontend Usage:
 * 
 * // Get total unread count (no filters)
 * const { data } = await client.query({
 *   query: GET_UNREAD_NOTIFICATION_COUNT,
 *   context: {
 *     headers: {
 *       authorization: `Bearer ${token}`
 *     }
 *   }
 * });
 * 
 * // Get unread count filtered by type
 * const { data } = await client.query({
 *   query: GET_UNREAD_NOTIFICATION_COUNT,
 *   variables: {
 *     input: {
 *       page: 1,                    // Required but not used for count
 *       limit: 1,                   // Required but not used for count
 *       search: {
 *         read: false,              // Only count unread
 *         type: "QUOTE_SENT"        // Optional: filter by type
 *       }
 *     }
 *   },
 *   context: {
 *     headers: {
 *       authorization: `Bearer ${token}`
 *     }
 *   }
 * });
 * 
 * // Example response:
 * // {
 * //   data: {
 * //     getUnreadNotificationCount: 5    // Number of unread notifications
 * //   }
 * // }
 */

/**
 * DELETE NOTIFICATION - Frontend Usage:
 * 
 * const [deleteNotification, { data, loading, error }] = useMutation(DELETE_NOTIFICATION);
 * 
 * await deleteNotification({
 *   variables: {
 *     notificationId: "69970318229d239324d2afaa"
 *   },
 *   context: {
 *     headers: {
 *       authorization: `Bearer ${token}`
 *     }
 *   }
 * });
 * 
 * // Example response:
 * // {
 * //   data: {
 * //     deleteNotification: {
 * //       _id: "69970318229d239324d2afaa"
 * //     }
 * //   }
 * // }
 * 
 * // Note: This mutation will throw an error if:
 * // - Notification not found
 * // - User tries to delete someone else's notification
 */

/**
 * DELETE ALL NOTIFICATIONS - Frontend Usage:
 * 
 * const [deleteAllNotifications, { data, loading, error }] = useMutation(DELETE_ALL_NOTIFICATIONS);
 * 
 * await deleteAllNotifications({
 *   context: {
 *     headers: {
 *       authorization: `Bearer ${token}`
 *     }
 *   }
 * });
 * 
 * // Example response:
 * // {
 * //   data: {
 * //     deleteAllNotifications: 10    // Number of notifications deleted
 * //   }
 * // }
 * 
 * // Note: This mutation deletes ALL notifications for the authenticated user
 * // (only notifications where user is the receiver)
 */
