import { gql } from 'graphql-tag';

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

export const MARK_ALL_NOTIFICATIONS_AS_READ = gql`
  mutation MarkAllNotificationsAsRead {
    markAllNotificationsAsRead
  }
`;

export const GET_UNREAD_NOTIFICATION_COUNT = gql`
  query GetUnreadNotificationCount($input: NotificationInquiry) {
    getUnreadNotificationCount(input: $input)
  }
`;

export const DELETE_NOTIFICATION = gql`
  mutation DeleteNotification($notificationId: String!) {
    deleteNotification(notificationId: $notificationId) {
      _id
    }
  }
`;

export const DELETE_ALL_NOTIFICATIONS = gql`
  mutation DeleteAllNotifications {
    deleteAllNotifications
  }
`;
