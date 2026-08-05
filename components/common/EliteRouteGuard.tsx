"use client";

import { notFound } from "next/navigation";
import { useOrgPlan } from "@/lib/hooks/useOrgPlan";
import type { PlanFeature } from "@/lib/plans";

interface EliteRouteGuardProps {
  feature: PlanFeature;
  /** If set, user.role must be one of these. */
  roles?: string[];
  children: React.ReactNode;
}

/**
 * Hides gated routes completely: unauthorized users get a real 404 (no upgrade tease).
 */
export function EliteRouteGuard({
  feature,
  roles,
  children,
}: EliteRouteGuardProps) {
  const { user, can, planKnown, isSuperadmin } = useOrgPlan();

  if (!user || !planKnown) {
    return (
      <div className="page-shell">
        <div className="h-40 animate-pulse rounded-xl border border-border bg-muted/40" />
      </div>
    );
  }

  const roleOk = !roles || roles.includes(user.role);
  const featureOk = isSuperadmin || can(feature);

  if (!roleOk || !featureOk) {
    notFound();
  }

  return <>{children}</>;
}
