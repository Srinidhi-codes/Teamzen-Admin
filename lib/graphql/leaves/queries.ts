import { gql } from "@apollo/client";

export const GET_LEAVES = gql`  
    query LeaveTypes($search: String){
    leaveTypes(search: $search){
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
    query LeaveBalance($allOrg: Boolean, $search: String) {
    leaveBalance(allOrg: $allOrg, search: $search){
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
    totalAllocation
    isActive
    lockedAt
    lastUpdated
  }
}
`;

export const GET_LEAVE_REQUESTS = gql`
  query getLeaveRequests($approvalsOnly: Boolean, $search: String){
    getLeaveRequests(approvalsOnly: $approvalsOnly, search: $search){
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

export const GET_COMPANY_HOLIDAYS = gql`
  query CompanyHolidays($search: String) {
    companyHolidays(search: $search) {
      id
      name
      holidayDate
      isOptional
      description
      createdAt
    }
  }
`;

