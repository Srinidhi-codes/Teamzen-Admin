import { gql } from "@apollo/client";

export const PERFORMANCE_OVERVIEW = gql`
  query PerformanceOverview($organizationId: ID) {
    performanceOverview(organizationId: $organizationId) {
      activeCycles
      pendingReviews
      completedReviews
      completionRate
      goalsTotal
      goalsOnTrack
      goalsAtRisk
      goalsCompleted
      ratingDistribution {
        name
        value
      }
      goalByDepartment {
        name
        value
      }
    }
  }
`;

export const PERFORMANCE_CYCLES = gql`
  query PerformanceCycles($organizationId: ID, $status: String) {
    performanceCycles(organizationId: $organizationId, status: $status) {
      id
      name
      description
      startDate
      endDate
      status
      organizationId
      reviewCount
      completedReviews
      goalCount
    }
  }
`;

export const PERFORMANCE_GOALS = gql`
  query PerformanceGoals(
    $organizationId: ID
    $cycleId: ID
    $userId: ID
    $search: String
  ) {
    performanceGoals(
      organizationId: $organizationId
      cycleId: $cycleId
      userId: $userId
      search: $search
    ) {
      id
      title
      description
      target
      progress
      status
      dueDate
      userId
      userName
      department
      cycleId
      cycleName
    }
  }
`;

export const PERFORMANCE_REVIEWS = gql`
  query PerformanceReviews(
    $organizationId: ID
    $cycleId: ID
    $status: String
  ) {
    performanceReviews(
      organizationId: $organizationId
      cycleId: $cycleId
      status: $status
    ) {
      id
      cycleId
      cycleName
      employeeId
      employeeName
      reviewerId
      reviewerName
      selfScore
      managerScore
      selfComments
      managerComments
      status
      department
    }
  }
`;
