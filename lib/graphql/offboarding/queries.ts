import { gql } from "@apollo/client";

export const OFFBOARDING_OVERVIEW = gql`
  query OffboardingOverview {
    offboardingOverview {
      total
      initiated
      inProgress
      settlementPending
      lettersPending
      completed
      cancelled
    }
  }
`;

export const OFFBOARDINGS = gql`
  query Offboardings($status: String) {
    offboardings(status: $status) {
      id
      status
      reason
      progressPct
      exitDate
      lastWorkingDay
      userId
      userName
      userEmail
      templateName
    }
  }
`;

export const EMPLOYEE_OFFBOARDING = gql`
  query EmployeeOffboarding($offboardingId: ID!) {
    employeeOffboarding(offboardingId: $offboardingId) {
      id
      status
      reason
      progressPct
      exitDate
      lastWorkingDay
      notes
      userId
      userName
      userEmail
      templateName
      tasks {
        id
        title
        description
        assigneeRole
        phase
        status
        dueAt
        isRequired
        notes
      }
      settlement {
        id
        status
        proRataSalary
        leaveEncashment
        bonusGratuity
        otherAdditions
        recoveries
        otherDeductions
        netPayable
        notes
        computedAt
        approvedAt
        acknowledgedAt
        paidAt
      }
      letters {
        id
        letterType
        subject
        pdfUrl
        downloadUrl
        status
        issuedAt
      }
    }
  }
`;

export const START_OFFBOARDING = gql`
  mutation StartOffboarding($input: StartOffboardingInput!) {
    startOffboarding(input: $input) {
      success
      error
      offboardingId
      inviteToken
      inviteUrl
    }
  }
`;

export const COMPUTE_FNF = gql`
  mutation ComputeFnfSettlement($input: SettlementInput!) {
    computeFnfSettlement(input: $input) {
      success
      error
    }
  }
`;

export const APPROVE_FNF = gql`
  mutation ApproveFnfSettlement($offboardingId: ID!) {
    approveFnfSettlement(offboardingId: $offboardingId) {
      success
      error
    }
  }
`;

export const MARK_FNF_PAID = gql`
  mutation MarkFnfPaid($offboardingId: ID!) {
    markFnfPaid(offboardingId: $offboardingId) {
      success
      error
    }
  }
`;

export const GENERATE_EXIT_LETTER = gql`
  mutation GenerateExitLetter(
    $offboardingId: ID!
    $letterType: String!
    $letterTemplateId: ID
  ) {
    generateExitLetter(
      offboardingId: $offboardingId
      letterType: $letterType
      letterTemplateId: $letterTemplateId
    ) {
      success
      error
    }
  }
`;

export const COMPLETE_OFFBOARDING_TASK = gql`
  mutation CompleteOffboardingTask($taskId: ID!, $notes: String) {
    completeOffboardingTask(taskId: $taskId, notes: $notes) {
      success
      error
    }
  }
`;

export const SKIP_OFFBOARDING_TASK = gql`
  mutation SkipOffboardingTask($taskId: ID!, $notes: String) {
    skipOffboardingTask(taskId: $taskId, notes: $notes) {
      success
      error
    }
  }
`;

export const RESEND_EXIT_INVITE = gql`
  mutation ResendExitInvite($offboardingId: ID!) {
    resendExitInvite(offboardingId: $offboardingId) {
      success
      error
      inviteUrl
      inviteToken
    }
  }
`;

export const CANCEL_OFFBOARDING = gql`
  mutation CancelOffboarding($offboardingId: ID!) {
    cancelOffboarding(offboardingId: $offboardingId) {
      success
      error
    }
  }
`;

export const REQUEST_EMPLOYEE_DOCUMENT = gql`
  mutation RequestEmployeeDocument($input: RequestEmployeeDocumentInput!) {
    requestEmployeeDocument(input: $input) {
      success
      error
      id
    }
  }
`;

export const EMPLOYEE_ISSUED_DOCUMENTS = gql`
  query EmployeeIssuedDocuments($userId: ID!) {
    employeeIssuedDocuments(userId: $userId) {
      id
      category
      title
      financialYear
      downloadUrl
      publishedAt
      visibleToEmployee
    }
  }
`;

export const EMPLOYEE_DOCUMENT_REQUESTS = gql`
  query EmployeeDocumentRequests($userId: ID!, $status: String) {
    employeeDocumentRequests(userId: $userId, status: $status) {
      id
      title
      category
      status
      description
      dueAt
      fileUrl
      verificationStatus
    }
  }
`;
