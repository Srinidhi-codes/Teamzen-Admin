import { gql } from "@apollo/client";

export const FEEDBACK_LIST = gql`
  query FeedbackList($status: String, $category: String, $organizationId: ID) {
    feedbackList(status: $status, category: $category, organizationId: $organizationId) {
      id
      title
      message
      category
      status
      visibility
      adminReply
      repliedAt
      createdAt
      updatedAt
      organizationId
      organizationName
      escalatedToPlatform
      escalatedAt
      escalationNote
      author {
        id
        firstName
        lastName
        email
      }
      repliedBy {
        id
        firstName
        lastName
      }
      escalatedBy {
        id
        firstName
        lastName
      }
      attachments {
        id
        fileName
        fileUrl
        createdAt
      }
    }
  }
`;

export const FEEDBACK_ITEM = gql`
  query FeedbackItem($id: ID!) {
    feedbackItem(id: $id) {
      id
      title
      message
      category
      status
      visibility
      adminReply
      repliedAt
      createdAt
      organizationId
      organizationName
      escalatedToPlatform
      escalatedAt
      escalationNote
      author {
        id
        firstName
        lastName
        email
      }
      repliedBy {
        id
        firstName
        lastName
      }
      escalatedBy {
        id
        firstName
        lastName
      }
      attachments {
        id
        fileName
        fileUrl
        createdAt
      }
    }
  }
`;
