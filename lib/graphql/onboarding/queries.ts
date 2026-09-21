import { gql } from "@apollo/client";
import { ONBOARDING_DETAIL_FIELDS, ONBOARDING_LIST_FIELDS } from "./types";

export const ONBOARDING_OVERVIEW = gql`
  query OnboardingOverview($organizationId: ID) {
    onboardingOverview(organizationId: $organizationId) {
      total
      invited
      preboarding
      inProgress
      completed
      cancelled
      pendingVerifications
      overdueTasks
    }
  }
`;

export const ONBOARDINGS = gql`
  query Onboardings($organizationId: ID, $status: String, $search: String) {
    onboardings(organizationId: $organizationId, status: $status, search: $search) {
      ${ONBOARDING_LIST_FIELDS}
      tasks { id status }
      documents { id verificationStatus }
      offerLetter { id status }
    }
  }
`;

export const ONBOARDING_DETAIL = gql`
  query OnboardingDetail($id: ID!) {
    onboardingDetail(id: $id) {
      ${ONBOARDING_DETAIL_FIELDS}
    }
  }
`;

export const ONBOARDING_TEMPLATES = gql`
  query OnboardingTemplates($organizationId: ID) {
    onboardingTemplates(organizationId: $organizationId) {
      id
      name
      description
      organizationId
      departmentId
      designationId
      employmentType
      isDefault
      itContactId
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

export const LETTER_TEMPLATES = gql`
  query LetterTemplates($organizationId: ID, $letterType: String) {
    letterTemplates(organizationId: $organizationId, letterType: $letterType) {
      id
      name
      letterType
      subject
      bodyHtml
      isDefault
      organizationId
    }
  }
`;
