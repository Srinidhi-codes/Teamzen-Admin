"use client";

import React, { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { EmployeeAttendanceReportView, TimeframeMode } from "@/components/attendance/EmployeeAttendanceReportView";

function EmployeeReportPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const employeeId = searchParams.get("employeeId") || searchParams.get("userId") || undefined;
  const timeframe = (searchParams.get("timeframe") as TimeframeMode) || "month";

  const handleEmployeeChange = (newId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("employeeId", newId);
    router.replace(`/attendance/report?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="mx-auto max-w-7xl py-1 sm:py-4 w-full min-w-0">
      <EmployeeAttendanceReportView
        initialEmployeeId={employeeId}
        onEmployeeChange={handleEmployeeChange}
        showNavigationBack={true}
        backHref="/attendance"
        initialTimeframe={timeframe}
      />
    </div>
  );
}

export default function EmployeeAttendanceReportPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
          <div className="h-8 w-64 rounded-xl bg-muted animate-pulse" />
          <div className="h-28 rounded-2xl bg-muted/60 animate-pulse" />
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-24 rounded-2xl bg-muted/40 animate-pulse" />
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-48 rounded-2xl bg-muted/30 animate-pulse" />
            <div className="h-48 rounded-2xl bg-muted/30 animate-pulse" />
          </div>
        </div>
      }
    >
      <EmployeeReportPageContent />
    </Suspense>
  );
}
