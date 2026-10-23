import { Suspense } from "react";
import ReportsPage from "@/components/reports/Reports";
import { EliteRouteGuard } from "@/components/common/EliteRouteGuard";

export default function Page() {
  return (
    <EliteRouteGuard
      feature="advanced_analytics"
      roles={["superadmin", "admin", "hr"]}
    >
      <Suspense fallback={<div className="p-8 text-center text-muted-foreground animate-pulse">Loading reports...</div>}>
        <ReportsPage />
      </Suspense>
    </EliteRouteGuard>
  );
}
