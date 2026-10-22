import { gql } from "@apollo/client";

export const ORGANIZATION_DOCUMENT_REQUESTS = gql`
  query OrganizationDocumentRequests($status: String, $organizationId: ID) {
    organizationDocumentRequests(status: $status, organizationId: $organizationId) {
      id
      title
      category
      description
      status
      dueAt
      createdAt
      fulfilledAt
      userId
      userName
      fileUrl
      verificationStatus
      fulfilledDocumentId
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

export const CANCEL_DOCUMENT_REQUEST = gql`
  mutation CancelDocumentRequest($requestId: ID!) {
    cancelDocumentRequest(requestId: $requestId) {
      success
      error
      id
    }
  }
`;

export const VERIFY_VAULT_DOCUMENT = gql`
  mutation VerifyVaultDocument(
    $documentId: ID!
    $approve: Boolean!
    $rejectionReason: String
  ) {
    verifyVaultDocument(
      documentId: $documentId
      approve: $approve
      rejectionReason: $rejectionReason
    ) {
      success
      error
      id
    }
  }
`;

export const ORG_EMPLOYEE_DOCUMENT_REQUESTS = gql`
  query OrgEmployeeDocumentRequests($status: String, $organizationId: ID) {
    orgEmployeeDocumentRequests(status: $status, organizationId: $organizationId) {
      id
      category
      customTitle
      reason
      status
      issuedDocumentUrl
      issuedAt
      rejectedReason
      createdAt
      userId
      userName
      userEmail
    }
  }
`;

export const ORG_ISSUED_DOCUMENTS = gql`
  query OrgIssuedDocuments($organizationId: ID, $category: String) {
    orgIssuedDocuments(organizationId: $organizationId, category: $category) {
      id
      category
      title
      financialYear
      fileName
      downloadUrl
      notes
      publishedAt
      visibleToEmployee
      userId
      userName
    }
  }
`;

export const ISSUE_EMPLOYEE_DOCUMENT = gql`
  mutation IssueEmployeeDocument($input: IssueEmployeeDocumentInput!) {
    issueEmployeeDocument(input: $input) {
      success
      error
      id
    }
  }
`;

export const REJECT_EMPLOYEE_DOCUMENT = gql`
  mutation RejectEmployeeDocument($input: RejectEmployeeDocumentInput!) {
    rejectEmployeeDocument(input: $input) {
      success
      error
      id
    }
  }
`;

