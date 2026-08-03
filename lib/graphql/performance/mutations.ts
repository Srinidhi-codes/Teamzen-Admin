import { gql } from "@apollo/client";

export const CREATE_PERFORMANCE_CYCLE = gql`
  mutation CreatePerformanceCycle($input: CycleInput!) {
    createPerformanceCycle(input: $input) {
      id
      name
      status
      startDate
      endDate
    }
  }
`;

export const UPDATE_PERFORMANCE_CYCLE = gql`
  mutation UpdatePerformanceCycle($input: UpdateCycleInput!) {
    updatePerformanceCycle(input: $input) {
      id
      name
      status
      startDate
      endDate
      description
    }
  }
`;

export const DELETE_PERFORMANCE_CYCLE = gql`
  mutation DeletePerformanceCycle($id: ID!) {
    deletePerformanceCycle(id: $id)
  }
`;

export const SEED_CYCLE_REVIEWS = gql`
  mutation SeedCycleReviews($cycleId: ID!) {
    seedCycleReviews(cycleId: $cycleId) {
      id
      employeeName
      status
    }
  }
`;

export const CREATE_GOAL = gql`
  mutation CreateGoal($input: GoalInput!) {
    createGoal(input: $input) {
      id
      title
      progress
      status
    }
  }
`;

export const UPDATE_GOAL = gql`
  mutation UpdateGoal($input: UpdateGoalInput!) {
    updateGoal(input: $input) {
      id
      title
      progress
      status
      dueDate
    }
  }
`;

export const DELETE_GOAL = gql`
  mutation DeleteGoal($id: ID!) {
    deleteGoal(id: $id)
  }
`;

export const UPDATE_PERFORMANCE_REVIEW = gql`
  mutation UpdatePerformanceReview($input: UpdateReviewInput!) {
    updatePerformanceReview(input: $input) {
      id
      status
      selfScore
      managerScore
      selfComments
      managerComments
    }
  }
`;
