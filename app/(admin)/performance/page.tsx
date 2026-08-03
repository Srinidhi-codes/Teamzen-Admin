"use client";

import PerformancePage from "@/components/performance/Performance";
import { EliteRouteGuard } from "@/components/common/EliteRouteGuard";

export default function Page() {
  return (
    <EliteRouteGuard
      feature="advanced_analytics"
      roles={["superadmin", "admin", "hr", "manager"]}
    >
      <PerformancePage />
    </EliteRouteGuard>
  );
}
