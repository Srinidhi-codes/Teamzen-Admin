import { gql } from "@apollo/client";

export const UPDATE_PROFILE = gql`
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      id
      firstName
      lastName
      email
      phoneNumber
      dateOfBirth
      gender
      bankAccountNumber
      bankIfscCode
      panNumber
      aadharNumber
      uanNumber
      error
    }
  }
`;

export const CHANGE_PASSWORD = gql`
  mutation ChangePassword($oldPassword: String!, $newPassword: String!) {
    changePassword(oldPassword: $oldPassword, newPassword: $newPassword) {
      success
      message
      error
    }
  }
`;

export const CREATE_USER = gql`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      success
      error
      user {
        id
        email
        firstName
        lastName
        role
        isActive
        department {
            id
            name
        }
        designation {
            id
            name
        }
      }
    }
  }
`;

export const UPDATE_USER = gql`
  mutation UpdateUser($userId: String!, $input: UpdateUserInput!) {
    updateUser(userId: $userId, input: $input) {
      success
      error
      user {
        id
        email
        firstName
        lastName
        role
        isActive
        department {
            id
            name
        }
        designation {
            id
            name
        }
      }
    }
  }
`;
