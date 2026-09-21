import { gql } from "@apollo/client";

export const CREATE_FEEDBACK = gql`
  mutation CreateFeedback($input: CreateFeedbackInput!) {
    createFeedback(input: $input) {
      success
      error
      feedback {
        id
        title
        message
        category
        status
        visibility
        createdAt
      }
    }
  }
`;

export const REPLY_TO_FEEDBACK = gql`
  mutation ReplyToFeedback($input: ReplyFeedbackInput!) {
    replyToFeedback(input: $input) {
      success
      error
      feedback {
        id
        adminReply
        status
        repliedAt
        repliedBy {
          id
          firstName
          lastName
        }
      }
    }
  }
`;

export const UPDATE_FEEDBACK_STATUS = gql`
  mutation UpdateFeedbackStatus($input: UpdateFeedbackStatusInput!) {
    updateFeedbackStatus(input: $input) {
      success
      error
      feedback {
        id
        status
      }
    }
  }
`;

export const ESCALATE_FEEDBACK = gql`
  mutation EscalateFeedback($input: EscalateFeedbackInput!) {
    escalateFeedback(input: $input) {
      success
      error
      feedback {
        id
        status
        escalatedToPlatform
        escalatedAt
        escalationNote
        escalatedBy {
          id
          firstName
          lastName
        }
      }
    }
  }
`;
