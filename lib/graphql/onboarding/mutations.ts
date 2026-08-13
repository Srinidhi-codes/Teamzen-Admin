import { gql } from "@apollo/client";
import { ONBOARDING_DETAIL_FIELDS } from "./types";

export const START_PREBOARDING = gql`
  mutation StartPreboarding($input: StartPreboardingInput!) {
    startPreboarding(input: $input) {
      success
      error
      inviteToken
      inviteUrl
      onboardingId
    }
  }
`;

export const START_ONBOARDING_FOR_EMPLOYEE = gql`
  mutation StartOnboardingForEmployee($input: StartOnboardingForEmployeeInput!) {
    startOnboardingForEmployee(input: $input) {
      success
      error
      inviteToken
      inviteUrl
      onboardingId
    }
  }
`;

export const SEND_PREBOARDING_INVITE = gql`
  mutation SendPreboardingInvite($onboardingId: ID!) {
    sendPreboardingInvite(onboardingId: $onboardingId) {
      success
      error
      inviteToken
      inviteUrl
    }
  }
`;

export const ACTIVATE_ONBOARDING = gql`
  mutation ActivateEmployeeOnboarding($onboardingId: ID!, $tempPassword: String) {
    activateEmployeeOnboarding(onboardingId: $onboardingId, tempPassword: $tempPassword) {
      ${ONBOARDING_DETAIL_FIELDS}
    }
  }
`;

export const CANCEL_ONBOARDING = gql`
  mutation CancelOnboarding($onboardingId: ID!) {
    cancelOnboarding(onboardingId: $onboardingId) {
      id
      status
    }
  }
`;

export const COMPLETE_ONBOARDING_TASK = gql`
  mutation CompleteOnboardingTask($taskId: ID!, $notes: String) {
    completeOnboardingTask(taskId: $taskId, notes: $notes) {
      ${ONBOARDING_DETAIL_FIELDS}
    }
  }
`;

export const VERIFY_EMPLOYEE_DOCUMENT = gql`
  mutation VerifyEmployeeDocument($documentId: ID!, $approve: Boolean!, $rejectionReason: String) {
    verifyEmployeeDocument(documentId: $documentId, approve: $approve, rejectionReason: $rejectionReason) {
      ${ONBOARDING_DETAIL_FIELDS}
    }
  }
`;

export const GENERATE_OFFER = gql`
  mutation GenerateOfferForOnboarding($input: GenerateOfferInput!) {
    generateOfferForOnboarding(input: $input) {
      ${ONBOARDING_DETAIL_FIELDS}
    }
  }
`;

export const SEND_OFFER_LETTER_EMAIL = gql`
  mutation SendOfferLetterEmail($onboardingId: ID!) {
    sendOfferLetterEmail(onboardingId: $onboardingId) {
      success
      error
    }
  }
`;

export const CREATE_ONBOARDING_TEMPLATE = gql`
  mutation CreateOnboardingTemplate($input: CreateOnboardingTemplateInput!) {
    createOnboardingTemplate(input: $input) {
      id
      name
      isDefault
    }
  }
`;

export const UPDATE_ONBOARDING_TEMPLATE = gql`
  mutation UpdateOnboardingTemplate($input: UpdateOnboardingTemplateInput!) {
    updateOnboardingTemplate(input: $input) {
      id
      name
      isDefault
      description
    }
  }
`;

export const UPSERT_TASK_DEFINITION = gql`
  mutation UpsertTaskDefinition($input: UpsertTaskDefinitionInput!) {
    upsertTaskDefinition(input: $input) {
      id
      title
      phase
      assigneeRole
      sortOrder
    }
  }
`;

export const DELETE_TASK_DEFINITION = gql`
  mutation DeleteTaskDefinition($id: ID!) {
    deleteTaskDefinition(id: $id)
  }
`;

export const REORDER_TASK_DEFINITIONS = gql`
  mutation ReorderOnboardingTaskDefinitions($templateId: ID!, $taskIds: [ID!]!) {
    reorderOnboardingTaskDefinitions(templateId: $templateId, taskIds: $taskIds) {
      id
      name
      taskDefinitions {
        id
        title
        description
        assigneeRole
        phase
        dueOffsetDays
        requiresDocumentCategory
        isRequired
        sortOrder
      }
    }
  }
`;

export const SUGGEST_ONBOARDING_TASKS = gql`
  mutation SuggestOnboardingTasks($input: SuggestOnboardingTasksInput!) {
    suggestOnboardingTasks(input: $input) {
      success
      error
      appliedCount
      tasks {
        title
        description
        assigneeRole
        phase
        dueOffsetDays
        requiresDocumentCategory
        isRequired
        sortOrder
      }
    }
  }
`;

export const POLISH_OFFER_LETTER = gql`
  mutation PolishOfferLetter($input: PolishOfferLetterInput!) {
    polishOfferLetter(input: $input) {
      success
      error
      bodyHtml
    }
  }
`;

export const CREATE_LETTER_TEMPLATE = gql`
  mutation CreateLetterTemplate($input: LetterTemplateInput!) {
    createLetterTemplate(input: $input) {
      id
      name
      letterType
      isDefault
    }
  }
`;

export const UPDATE_LETTER_TEMPLATE = gql`
  mutation UpdateLetterTemplate($input: UpdateLetterTemplateInput!) {
    updateLetterTemplate(input: $input) {
      id
      name
      subject
      bodyHtml
      isDefault
    }
  }
`;
