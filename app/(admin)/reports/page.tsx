"use client";

import ReportsPage from "@/components/reports/Reports";
import { PlanGate } from "@/components/common/PlanGate";
import { useOrgPlan } from "@/lib/hooks/useOrgPlan";

export default function Page() {
  const { can, requiredPlan } = useOrgPlan();
  return (
    <PlanGate
      allowed={can("advanced_analytics")}
      requiredPlan={requiredPlan("advanced_analytics")}
      title="Reports need Elite"
      description="Advanced analytics and exports are included on the Elite plan."
      hideWhenLocked
    >
      <ReportsPage />
    </PlanGate>
  );
}
