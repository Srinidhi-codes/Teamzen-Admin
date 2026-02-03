import { gql } from "@apollo/client";

export const GET_LEAVES = gql`  
    query LeaveTypes{
    leaveTypes{
    id
    name
    code
    description
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

export const GET_LEAVE_BALANCE = gql`
    query LeaveBalance {
    leaveBalance{
    id
    user{
        id
        firstName
    }
    leaveType{
        id
        name
    }
    year
    totalEntitled
    used
    pendingApproval
    accrued
    expired
    isLocked
    availableBalance
    isActive
    lockedAt
    lastUpdated
  }
}
`;

export const GET_LEAVE_REQUESTS = gql`
  query getLeaveRequests{
    getLeaveRequests{
      id
      user{
        id
        firstName
        lastName
      }
      leaveType{
        id
        name
      }
      fromDate
      toDate
      durationDays
      reason
      status
      approvedBy{
        id
        firstName
      }
      approvalComments
      createdAt
    }
  }
`

