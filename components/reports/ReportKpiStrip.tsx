"use client";

import type { ReportKpi } from "@/lib/graphql/reports/types";
import { cn } from "@/lib/utils";

export function ReportKpiStrip({
  kpis,
  loading,
}: {
  kpis?: ReportKpi[];
  loading?: boolean;
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-[88px] animate-pulse rounded-xl border border-border bg-muted/40"
          />
        ))}
      </div>
    );
  }

  if (!kpis?.length) return null;

  return (
    <div
      className={cn(
        "grid gap-3",
        kpis.length <= 3 ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-2 lg:grid-cols-4"
      )}
    >
      {kpis.map((kpi) => (
        <div
          key={kpi.label}
          className="rounded-xl border border-border bg-card p-4 sm:p-5"
        >
          <p className="text-sm text-muted-foreground">{kpi.label}</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">
            {kpi.value}
          </p>
          {kpi.hint && (
            <p className="mt-1 text-xs text-muted-foreground">{kpi.hint}</p>
          )}
        </div>
      ))}
    </div>
  );
}
