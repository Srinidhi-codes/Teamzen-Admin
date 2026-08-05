import { gql } from "@apollo/client";

export const GET_LEAVES = gql`  
    query LeaveTypes($search: String, $organizationId: ID){
    leaveTypes(search: $search, organizationId: $organizationId){
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
    organization {
      id
      name
    }
  }
}
`;

export const GET_LEAVE_BALANCE = gql`
    query LeaveBalance($allOrg: Boolean, $search: String, $organizationId: ID) {
    leaveBalance(allOrg: $allOrg, search: $search, organizationId: $organizationId){
    id
    user{
        id
        firstName
        lastName
        manager {
          id
        }
        department {
          id
          name
        }
        organization {
          id
          name
        }
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
  query getLeaveRequests($approvalsOnly: Boolean, $search: String, $organizationId: ID){
    getLeaveRequests(approvalsOnly: $approvalsOnly, search: $search, organizationId: $organizationId){
      id
      user{
        id
        firstName
        lastName
        organization {
          id
          name
        }
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
  query CompanyHolidays($search: String, $organizationId: ID) {
    companyHolidays(search: $search, organizationId: $organizationId) {
      id
      name
      holidayDate
      isOptional
      description
      createdAt
      organization {
        id
        name
      }
    }
  }
`;
