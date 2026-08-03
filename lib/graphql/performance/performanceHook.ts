import { useQuery, useMutation } from "@apollo/client/react";
import {
  PERFORMANCE_OVERVIEW,
  PERFORMANCE_CYCLES,
  PERFORMANCE_GOALS,
  PERFORMANCE_REVIEWS,
} from "./queries";
import {
  CREATE_PERFORMANCE_CYCLE,
  UPDATE_PERFORMANCE_CYCLE,
  DELETE_PERFORMANCE_CYCLE,
  SEED_CYCLE_REVIEWS,
  CREATE_GOAL,
  UPDATE_GOAL,
  DELETE_GOAL,
  UPDATE_PERFORMANCE_REVIEW,
} from "./mutations";
import type {
  PerformanceOverview,
  PerformanceCycle,
  PerformanceGoal,
  PerformanceReview,
} from "./types";

export function usePerformanceOverview(organizationId?: string) {
  const { data, loading, error, refetch } = useQuery<{
    performanceOverview: PerformanceOverview;
  }>(PERFORMANCE_OVERVIEW, {
    variables: { organizationId: organizationId || undefined },
    fetchPolicy: "cache-and-network",
  });
  return {
    overview: data?.performanceOverview,
    isLoading: loading && !data,
    error,
    refetch,
  };
}

export function usePerformanceCycles(organizationId?: string, status?: string) {
  const { data, loading, error, refetch } = useQuery<{
    performanceCycles: PerformanceCycle[];
  }>(PERFORMANCE_CYCLES, {
    variables: {
      organizationId: organizationId || undefined,
      status: status || undefined,
    },
    fetchPolicy: "cache-and-network",
  });
  return {
    cycles: data?.performanceCycles ?? [],
    isLoading: loading && !data,
    error,
    refetch,
  };
}

export function usePerformanceGoals(vars?: {
  organizationId?: string;
  cycleId?: string;
  userId?: string;
  search?: string;
}) {
  const { data, loading, error, refetch } = useQuery<{
    performanceGoals: PerformanceGoal[];
  }>(PERFORMANCE_GOALS, {
    variables: {
      organizationId: vars?.organizationId || undefined,
      cycleId: vars?.cycleId || undefined,
      userId: vars?.userId || undefined,
      search: vars?.search || undefined,
    },
    fetchPolicy: "cache-and-network",
  });
  return {
    goals: data?.performanceGoals ?? [],
    isLoading: loading && !data,
    error,
    refetch,
  };
}

export function usePerformanceReviews(vars?: {
  organizationId?: string;
  cycleId?: string;
  status?: string;
}) {
  const { data, loading, error, refetch } = useQuery<{
    performanceReviews: PerformanceReview[];
  }>(PERFORMANCE_REVIEWS, {
    variables: {
      organizationId: vars?.organizationId || undefined,
      cycleId: vars?.cycleId || undefined,
      status: vars?.status || undefined,
    },
    fetchPolicy: "cache-and-network",
  });
  return {
    reviews: data?.performanceReviews ?? [],
    isLoading: loading && !data,
    error,
    refetch,
  };
}

export function usePerformanceMutations() {
  const refetchList = [
    { query: PERFORMANCE_CYCLES },
    { query: PERFORMANCE_GOALS },
    { query: PERFORMANCE_REVIEWS },
    { query: PERFORMANCE_OVERVIEW },
  ];

  const [createCycle, createCycleState] = useMutation(CREATE_PERFORMANCE_CYCLE, {
    refetchQueries: refetchList,
  });
  const [updateCycle, updateCycleState] = useMutation(UPDATE_PERFORMANCE_CYCLE, {
    refetchQueries: refetchList,
  });
  const [deleteCycle, deleteCycleState] = useMutation(DELETE_PERFORMANCE_CYCLE, {
    refetchQueries: refetchList,
  });
  const [seedReviews, seedReviewsState] = useMutation(SEED_CYCLE_REVIEWS, {
    refetchQueries: refetchList,
  });
  const [createGoal, createGoalState] = useMutation(CREATE_GOAL, {
    refetchQueries: refetchList,
  });
  const [updateGoal, updateGoalState] = useMutation(UPDATE_GOAL, {
    refetchQueries: refetchList,
  });
  const [deleteGoal, deleteGoalState] = useMutation(DELETE_GOAL, {
    refetchQueries: refetchList,
  });
  const [updateReview, updateReviewState] = useMutation(UPDATE_PERFORMANCE_REVIEW, {
    refetchQueries: refetchList,
  });

  return {
    createCycle: (input: Record<string, unknown>) =>
      createCycle({ variables: { input } }),
    updateCycle: (input: Record<string, unknown>) =>
      updateCycle({ variables: { input } }),
    deleteCycle: (id: string) => deleteCycle({ variables: { id } }),
    seedReviews: (cycleId: string) => seedReviews({ variables: { cycleId } }),
    createGoal: (input: Record<string, unknown>) =>
      createGoal({ variables: { input } }),
    updateGoal: (input: Record<string, unknown>) =>
      updateGoal({ variables: { input } }),
    deleteGoal: (id: string) => deleteGoal({ variables: { id } }),
    updateReview: (input: Record<string, unknown>) =>
      updateReview({ variables: { input } }),
    loading:
      createCycleState.loading ||
      updateCycleState.loading ||
      deleteCycleState.loading ||
      seedReviewsState.loading ||
      createGoalState.loading ||
      updateGoalState.loading ||
      deleteGoalState.loading ||
      updateReviewState.loading,
  };
}
