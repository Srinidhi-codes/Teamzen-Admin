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
      organization {
        id
        name
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
        dateOfJoining
        dateOfBirth
        gender
        profilePictureUrl
        employeeId
        employmentType
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
        bankAccountNumber
        bankIfscCode
        panNumber
        aadharNumber
        uanNumber
      }
      total
      page
      pageSize
    }
  }
`;
