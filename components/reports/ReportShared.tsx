"use client";

import { cn } from "@/lib/utils";
import { AlertCircle, BarChart3, Database } from "lucide-react";

const chartTooltipStyle = {
  backgroundColor: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: "12px",
  fontSize: "12px",
  color: "var(--popover-foreground)",
  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
  padding: "8px 12px",
};

const chartTooltipItemStyle = {
  color: "var(--popover-foreground)",
  fontWeight: "600",
};

const chartTooltipLabelStyle = {
  color: "var(--muted-foreground)",
  fontSize: "11px",
  marginBottom: "4px",
};

/** Spread onto Recharts <Tooltip /> so dark-mode text stays readable. */
const chartTooltipProps = {
  contentStyle: chartTooltipStyle,
  itemStyle: chartTooltipItemStyle,
  labelStyle: chartTooltipLabelStyle,
};

export {
  chartTooltipStyle,
  chartTooltipItemStyle,
  chartTooltipLabelStyle,
  chartTooltipProps,
};

export function ChartPanel({
  title,
  subtitle,
  icon: Icon = BarChart3,
  action,
  children,
  className,
  empty,
  emptyMessage = "No data recorded for this selected range.",
}: {
  title: string;
  subtitle?: string;
  icon?: any;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  empty?: boolean;
  emptyMessage?: string;
}) {
  return (
    <section className={cn("overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:shadow-md", className)}>
      <div className="flex items-center justify-between gap-3 border-b border-border/70 bg-muted/20 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-tight text-foreground">{title}</h2>
            {subtitle && <p className="text-[11px] text-muted-foreground">{subtitle}</p>}
          </div>
        </div>
        {action}
      </div>
      <div className="p-5">
        {empty ? (
          <div className="flex h-[260px] flex-col items-center justify-center gap-2 text-center text-muted-foreground">
            <Database className="h-8 w-8 opacity-30" />
            <p className="text-xs font-medium">{emptyMessage}</p>
          </div>
        ) : (
          children
        )}
      </div>
    </section>
  );
}

export function ReportTableShell({
  title,
  subtitle,
  action,
  children,
  empty,
  emptyMessage = "No records found matching criteria.",
  footer,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  empty?: boolean;
  emptyMessage?: string;
  footer?: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:shadow-md">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border/70 bg-muted/20 px-5 py-4">
        <div>
          <h2 className="text-sm font-bold tracking-tight text-foreground">{title}</h2>
          {subtitle && <p className="text-[11px] text-muted-foreground">{subtitle}</p>}
        </div>
        {action}
      </div>
      {empty ? (
        <div className="flex flex-col items-center justify-center gap-2 px-5 py-14 text-center text-muted-foreground">
          <Database className="h-8 w-8 opacity-30" />
          <p className="text-xs font-medium">{emptyMessage}</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">{children}</div>
          {footer && (
            <div className="border-t border-border/70 bg-muted/10 p-3 sm:p-4">
              {footer}
            </div>
          )}
        </>
      )}
    </section>
  );
}

export function ReportError({ message }: { message?: string }) {
  return (
    <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center">
      <AlertCircle className="mx-auto h-8 w-8 text-destructive mb-2" />
      <h3 className="text-sm font-semibold text-foreground">Report Generation Issue</h3>
      <p className="mt-1 text-xs text-destructive">
        {message || "Failed to load report. Check organization plan access and try again."}
      </p>
    </div>
  );
}

export function ReportLoadingBlocks() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-28 rounded-2xl border border-border bg-muted/30"
          />
        ))}
      </div>
      <div className="h-[340px] rounded-2xl border border-border bg-muted/30" />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="h-[290px] rounded-2xl border border-border bg-muted/30" />
        <div className="h-[290px] rounded-2xl border border-border bg-muted/30" />
      </div>
    </div>
  );
}
