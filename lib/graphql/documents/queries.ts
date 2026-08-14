import { gql } from "@apollo/client";

export const ORGANIZATION_DOCUMENT_REQUESTS = gql`
  query OrganizationDocumentRequests($status: String) {
    organizationDocumentRequests(status: $status) {
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
