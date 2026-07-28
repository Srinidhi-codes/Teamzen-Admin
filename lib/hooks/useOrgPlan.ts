"use client";

import { useGraphQLUser } from "@/lib/api/graphqlHooks";
import { useStore } from "@/lib/store/useStore";
import {
  effectivePlan,
  hasPlanFeature,
  minPlanForFeature,
  type PlanFeature,
} from "@/lib/plans";

export function useOrgPlan() {
  const { user: storeUser } = useStore();
  const { user: graphqlUser } = useGraphQLUser();
  const user = graphqlUser || storeUser;
  const plan = user?.organization?.plan;
  const expiresAt = user?.organization?.planExpiresAt ?? null;
  const activePlan = effectivePlan(plan, expiresAt);

  return {
    user,
    plan,
    expiresAt,
    activePlan,
    can: (feature: PlanFeature) => hasPlanFeature(plan, expiresAt, feature),
    requiredPlan: (feature: PlanFeature) => minPlanForFeature(feature),
  };
}
