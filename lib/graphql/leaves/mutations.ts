import { gql } from "@apollo/client";

export const LEAVE_REQUEST_PROCESS = gql`
   mutation LeaveRequestProcess($input: LeaveRequestProcessInput!) {
      leaveRequestProcess(input: $input) {
         id
         status
      }
   }
`;

export const CREATE_LEAVE_TYPE = gql`
  mutation CreateLeaveType($input: LeaveTypeInput!) {
    createLeaveType(input: $input) {
      id
      name
      code
      maxDaysPerYear
      carryForwardAllowed
      carryForwardMaxDays
      accrualFrequency
      accrualDays
      isPaidLeave
      requiresApproval
      allowEncashment
      encashmentRate
      prorateOnJoin
      prorateOnExit
      prorationBasis
      isActive
    }
  }
`;

export const CREATE_LEAVE_BALANCE = gql`
  mutation CreateLeaveBalance($input: LeaveBalanceInput!) {
    createLeaveBalance(input: $input) {
      id
      user {
        id
        firstName
      }
      leaveType {
        id
        name
      }
      totalEntitled
      availableBalance
    }
  }
`;

export const UPDATE_LEAVE_TYPE = gql`
  mutation UpdateLeaveType($input: UpdateLeaveTypeInput!) {
    updateLeaveType(input: $input) {
      id
      name
      code
      maxDaysPerYear
      carryForwardAllowed
      carryForwardMaxDays
      accrualFrequency
      accrualDays
      isPaidLeave
      requiresApproval
      allowEncashment
      encashmentRate
      prorateOnJoin
      prorateOnExit
      prorationBasis
      isActive
    }
  }
`;

export const DELETE_LEAVE_TYPE = gql`
  mutation DeleteLeaveType($id: ID!) {
    deleteLeaveType(id: $id)
  }
`;

export const UPDATE_LEAVE_BALANCE = gql`
  mutation UpdateLeaveBalance($input: UpdateLeaveBalanceInput!) {
    updateLeaveBalance(input: $input) {
      id
      totalEntitled
      used
      pendingApproval
      availableBalance
      isActive
    }
  }
`;

export const DELETE_LEAVE_BALANCE = gql`
  mutation DeleteLeaveBalance($id: ID!) {
    deleteLeaveBalance(id: $id)
  }
`;