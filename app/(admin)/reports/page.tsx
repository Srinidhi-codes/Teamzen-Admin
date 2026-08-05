"use client";

import ReportsPage from "@/components/reports/Reports";
import { EliteRouteGuard } from "@/components/common/EliteRouteGuard";

export default function Page() {
  return (
    <EliteRouteGuard
      feature="advanced_analytics"
      roles={["superadmin", "admin", "hr"]}
    >
      <ReportsPage />
    </EliteRouteGuard>
  );
}
