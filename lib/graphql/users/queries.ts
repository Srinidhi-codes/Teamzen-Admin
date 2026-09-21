import { gql } from "@apollo/client";

export const GET_ME = gql`
  query Me {
    me {
      id
      email
      username
      firstName
      lastName
      phoneNumber
      role
      isActive
      isVerified
      dateOfJoining
      dateOfBirth
      gender
      profilePictureUrl
      employeeId
      employmentType
      manager {
        id
        firstName
        lastName
      }
      department {
        id
        name
      }
      designation {
        id
        name
      }
      officeLocation {
        id
        name
        address
      }
      bankAccountNumber
      bankIfscCode
      panNumber
      aadharNumber
      uanNumber
      hasSeenOnboarding
      hasSeenAiOnboarding
      emailLoginAlerts
      organization {
        id
        name
        plan
        planExpiresAt
        daysUntilPlanExpiry
        logo {
          url
        }
        llmApiKey
        accent
        faceAttendanceEnabled
        weekendDays
      }
      salaryDetails {
        id
        salaryStructure {
          id
          name
          components {
            id
            component {
              id
              name
              code
              componentType
            }
            calculationType
            value
          }
        }
        annualCtc
        effectiveFrom
        isActive
        componentOverrides {
          id
          component {
            id
            name
            code
          }
          isExcluded
          overrideValue
        }
      }
    }
  }
`;

export const GET_ALL_USERS = gql`
  query AllUsers(
    $page: Int
    $pageSize: Int
    $filters: UserFilterInput
    $sort: UserSortInput
  ) {
    allUsers(
      page: $page
      pageSize: $pageSize
      filters: $filters
      sort: $sort
    ) {
      results {
        id
        email
        username
        firstName
        lastName
        phoneNumber
        role
        isActive
        isVerified
        onboardingStarted
        dateOfJoining
        dateOfBirth
        gender
        profilePictureUrl
        employeeId
        employmentType
        faceEnrolled
        faceEnrolledAt
        organization {
          id
          name
        }
        department {
          id
          name
        }
        designation {
          id
          name
        }
        officeLocation {
          id
          name
          address
        }
        manager {
          id
          firstName
          lastName
        }
        bankAccountNumber
        bankIfscCode
        panNumber
        aadharNumber
        uanNumber
        residentialAddress
        salaryDetails {
          id
          salaryStructure {
            id
            name
            components {
              id
              component {
                id
                name
                code
                componentType
              }
              calculationType
              value
            }
          }
          annualCtc
          effectiveFrom
          isActive
          componentOverrides {
            id
            component {
              id
              name
              code
            }
            isExcluded
            overrideValue
          }
        }
      }
      total
      page
      pageSize
    }
  }
`;

export const GET_LOGIN_HISTORY = gql`
  query GlobalLoginHistory($page: Int, $pageSize: Int, $organizationId: ID, $search: String) {
    globalLoginHistory(page: $page, pageSize: $pageSize, organizationId: $organizationId, search: $search) {
      results {
        id
        loginTime
        ipAddress
        userAgent
        location
        latitude
        longitude
        status
        user {
          id
          firstName
          lastName
          email
          profilePictureUrl
        }
      }
      total
      page
      pageSize
    }
  }
`;

export const GET_MY_LOGIN_HISTORY = gql`
  query GetMyLoginHistory($page: Int, $pageSize: Int) {
    mySecurityLogs(page: $page, pageSize: $pageSize) {
      results {
        id
        latitude
        longitude
      }
    }
  }
`;
