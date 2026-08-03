"use client";

import { cn } from "@/lib/utils";

const chartTooltipStyle = {
  backgroundColor: "var(--card)",
  borderColor: "var(--border)",
  borderRadius: "8px",
  fontSize: "12px",
  color: "var(--foreground)",
  boxShadow: "none",
};

export { chartTooltipStyle };

export function ChartPanel({
  title,
  children,
  className,
  empty,
  emptyMessage = "No data for this range.",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
  empty?: boolean;
  emptyMessage?: string;
}) {
  return (
    <section className={cn("rounded-xl border border-border bg-card", className)}>
      <div className="border-b border-border px-5 py-3.5">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      </div>
      <div className="p-4 sm:p-5">
        {empty ? (
          <div className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">
            {emptyMessage}
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
  children,
  empty,
  emptyMessage = "No rows to show.",
}: {
  title: string;
  children: React.ReactNode;
  empty?: boolean;
  emptyMessage?: string;
}) {
  return (
    <section className="rounded-xl border border-border bg-card">
      <div className="border-b border-border px-5 py-3.5">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      </div>
      {empty ? (
        <div className="px-5 py-12 text-center text-sm text-muted-foreground">
          {emptyMessage}
        </div>
      ) : (
        <div className="overflow-x-auto">{children}</div>
      )}
    </section>
  );
}

export function ReportError({ message }: { message?: string }) {
  return (
    <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
      {message || "Failed to load report. Check plan access and try again."}
    </div>
  );
}

export function ReportLoadingBlocks() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-[88px] animate-pulse rounded-xl border border-border bg-muted/40"
          />
        ))}
      </div>
      <div className="h-[320px] animate-pulse rounded-xl border border-border bg-muted/40" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="h-[280px] animate-pulse rounded-xl border border-border bg-muted/40" />
        <div className="h-[280px] animate-pulse rounded-xl border border-border bg-muted/40" />
      </div>
    </div>
  );
}
