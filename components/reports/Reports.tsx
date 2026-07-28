"use client";

import { Info } from "lucide-react";
import dynamic from "next/dynamic";
import { PageHeader } from "@/components/common/PageHeader";

const ReportsCharts = dynamic(
  () => import("@/components/reports/ReportsCharts").then((m) => m.ReportsCharts),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-4">
        <div className="h-[320px] animate-pulse rounded-xl border border-border bg-muted/40" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="h-[320px] animate-pulse rounded-xl border border-border bg-muted/40" />
          <div className="h-[320px] animate-pulse rounded-xl border border-border bg-muted/40" />
        </div>
      </div>
    ),
  }
);

export default function ReportsPage() {
  return (
    <div className="page-shell">
      <PageHeader
        title="Reports"
        description="Workforce, attendance, leave, and payroll trends."
      />

      <div className="flex items-start gap-2.5 rounded-xl border border-border bg-muted/40 px-4 py-3">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Charts below use sample data for layout preview. Live reporting will connect to your
          organization data in a later release.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">Turnover rate</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">2.8%</p>
          <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-400">
            ↓ 0.5% vs last quarter
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">Avg leave days / employee</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">12.5</p>
          <p className="mt-1 text-xs text-muted-foreground">Per year</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">Avg salary</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">₹57,258</p>
          <p className="mt-1 text-xs text-sky-700 dark:text-sky-400">↑ ₹2,500 vs last month</p>
        </div>
      </div>

      <ReportsCharts />
    </div>
  );
}
