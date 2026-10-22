import { gql } from "@apollo/client";

export const UPDATE_PLAN_FEATURE_DEFAULT = gql`
  mutation UpdatePlanFeatureDefault(
    $plan: String!
    $moduleKey: String!
    $isEnabled: Boolean!
  ) {
    updatePlanFeatureDefault(
      plan: $plan
      moduleKey: $moduleKey
      isEnabled: $isEnabled
    )
  }
`;

export const UPDATE_ORGANIZATION_FEATURE_OVERRIDE = gql`
  mutation UpdateOrganizationFeatureOverride(
    $organizationId: ID!
    $moduleKey: String!
    $isEnabled: Boolean!
    $notes: String
  ) {
    updateOrganizationFeatureOverride(
      organizationId: $organizationId
      moduleKey: $moduleKey
      isEnabled: $isEnabled
      notes: $notes
    )
  }
`;

export const RESET_ORGANIZATION_FEATURE_OVERRIDE = gql`
  mutation ResetOrganizationFeatureOverride(
    $organizationId: ID!
    $moduleKey: String!
  ) {
    resetOrganizationFeatureOverride(
      organizationId: $organizationId
      moduleKey: $moduleKey
    )
  }
`;

export const UPDATE_COMPANY_ADMIN_DELEGATION = gql`
  mutation UpdateCompanyAdminDelegation(
    $organizationId: ID!
    $canManagePayroll: Boolean!
    $canManageLeaves: Boolean!
    $canManageAttendance: Boolean!
    $canManageEmployees: Boolean!
    $canManageEmailTemplates: Boolean!
    $canManageOnboarding: Boolean!
    $canManagePolicies: Boolean!
    $canManageRbac: Boolean!
  ) {
    updateCompanyAdminDelegation(
      organizationId: $organizationId
      canManagePayroll: $canManagePayroll
      canManageLeaves: $canManageLeaves
      canManageAttendance: $canManageAttendance
      canManageEmployees: $canManageEmployees
      canManageEmailTemplates: $canManageEmailTemplates
      canManageOnboarding: $canManageOnboarding
      canManagePolicies: $canManagePolicies
      canManageRbac: $canManageRbac
    )
  }
`;

export const UPDATE_ROLE_PERMISSION = gql`
  mutation UpdateRolePermission(
    $organizationId: ID!
    $role: String!
    $moduleKey: String!
    $accessLevel: String!
  ) {
    updateRolePermission(
      organizationId: $organizationId
      role: $role
      moduleKey: $moduleKey
      accessLevel: $accessLevel
    )
  }
`;

export const RESET_ROLE_PERMISSIONS_TO_DEFAULT = gql`
  mutation ResetRolePermissionsToDefault($organizationId: ID!) {
    resetRolePermissionsToDefault(organizationId: $organizationId)
  }
`;

export const CREATE_CUSTOM_ROLE = gql`
  mutation CreateCustomRole(
    $organizationId: ID!
    $roleLabel: String!
    $roleKey: String
    $copyFromRole: String
    $description: String
  ) {
    createCustomRole(
      organizationId: $organizationId
      roleLabel: $roleLabel
      roleKey: $roleKey
      copyFromRole: $copyFromRole
      description: $description
    )
  }
`;

export const DELETE_CUSTOM_ROLE = gql`
  mutation DeleteCustomRole(
    $organizationId: ID!
    $roleKey: String!
  ) {
    deleteCustomRole(
      organizationId: $organizationId
      roleKey: $roleKey
    )
  }
`;

