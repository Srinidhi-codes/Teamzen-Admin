import { gql } from "@apollo/client";

export const MARK_NOTIFICATION_READ = gql`
  mutation MarkNotificationRead($id: ID!) {
    markNotificationAsRead(id: $id)
  }
`;

export const MARK_ALL_READ = gql`
  mutation MarkAllRead {
    markAllNotificationsAsRead
  }
`;

export const SEND_BROADCAST_NOTIFICATION = gql`
  mutation SendBroadcastNotification($message: String!, $verb: String, $notificationType: String) {
    sendBroadcastNotification(message: $message, verb: $verb, notificationType: $notificationType)
  }
`;

export const SEND_CUSTOM_NOTIFICATION = gql`
  mutation SendCustomNotification($recipientId: ID!, $message: String!, $verb: String, $notificationType: String) {
    sendCustomNotification(recipientId: $recipientId, message: $message, verb: $verb, notificationType: $notificationType)
  }
`;

export const DELETE_NOTIFICATION = gql`
  mutation DeleteNotification($id: ID!) {
    deleteNotification(id: $id)
  }
`;
