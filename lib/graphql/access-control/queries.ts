import { gql } from "@apollo/client";

export const GET_PLAN_FEATURE_MATRIX = gql`
  query GetPlanFeatureMatrix {
    planFeatureMatrix {
      key
      name
      category
      description
      free
      pro
      elite
    }
  }
`;

export const GET_ORGANIZATION_ENTITLEMENTS = gql`
  query GetOrganizationEntitlements($organizationId: ID!) {
    organizationEntitlements(organizationId: $organizationId) {
      moduleKey
      name
      category
      description
      planDefault
      isOverridden
      isEnabled
      notes
    }
  }
`;

export const GET_COMPANY_ADMIN_DELEGATION = gql`
  query GetCompanyAdminDelegation($organizationId: ID!) {
    companyAdminDelegation(organizationId: $organizationId) {
      organizationId
      organizationName
      canManagePayroll
      canManageLeaves
      canManageAttendance
      canManageEmployees
      canManageEmailTemplates
      canManageOnboarding
      canManagePolicies
      canManageRbac
      updatedAt
    }
  }
`;

export const GET_ROLE_PERMISSION_MATRIX = gql`
  query GetRolePermissionMatrix($organizationId: ID!) {
    rolePermissionMatrix(organizationId: $organizationId) {
      organizationId
      organizationName
      role
      roleLabel
      isSystemRole
      permissions {
        moduleKey
        moduleName
        moduleCategory
        accessLevel
      }
    }
  }
`;

export const GET_MY_EFFECTIVE_PERMISSIONS = gql`
  query GetMyEffectivePermissions {
    myEffectivePermissions {
      isSuperadmin
      role
      organizationId
      organizationName
      plan
      permissionsJson
    }
  }
`;
