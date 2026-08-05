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
  const { user: graphqlUser, isLoading } = useGraphQLUser();
  const user = graphqlUser || storeUser;
  const isSuperadmin = user?.role === "superadmin";
  const plan = user?.organization?.plan;
  const expiresAt = user?.organization?.planExpiresAt ?? null;
  // While plan is still unknown, avoid treating it as Free (prevents upgrade/gated flash).
  const planKnown = isSuperadmin || Boolean(plan) || (!isLoading && !user?.organization);
  const activePlan = isSuperadmin
    ? "elite"
    : planKnown
      ? effectivePlan(plan, expiresAt)
      : "elite";

  return {
    user,
    plan,
    expiresAt,
    activePlan,
    isSuperadmin,
    planKnown,
    // Platform superadmin is not plan-gated — they manage orgs, not subscribe.
    // Until plan is known, allow features to avoid Free-plan lock flash.
    can: (feature: PlanFeature) =>
      isSuperadmin ||
      !planKnown ||
      hasPlanFeature(plan, expiresAt, feature),
    requiredPlan: (feature: PlanFeature) => minPlanForFeature(feature),
  };
}
