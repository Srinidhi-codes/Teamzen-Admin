import { gql } from "@apollo/client";

export const UPDATE_PROFILE = gql`
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      success
      error
      user {
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
        hasSeenOnboarding
        hasSeenAiOnboarding
      }
    }
  }
`;

export const CHANGE_PASSWORD = gql`
  mutation ChangePassword($oldPassword: String!, $newPassword: String!) {
    changePassword(oldPassword: $oldPassword, newPassword: $newPassword) {
      success
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

export const USER_STATUS = gql`
  mutation UserStatus($input: UserStatusInput!) {
    userStatus(input: $input) {
        id
        email
        firstName
        lastName
        isActive
    }
  }
`;

export const UPDATE_LOGIN_LOCATION = gql`
  mutation UpdateLoginLocation($latitude: Float!, $longitude: Float!) {
    updateLoginLocation(latitude: $latitude, longitude: $longitude)
  }
`;
