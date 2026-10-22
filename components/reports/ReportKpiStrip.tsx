"use client";

import type { ReportKpi } from "@/lib/graphql/reports/types";
import { cn } from "@/lib/utils";
import {
  Users,
  UserPlus,
  UserMinus,
  Clock,
  Calendar,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Percent,
} from "lucide-react";

function getKpiVisuals(label: string) {
  const l = label.toLowerCase();
  if (l.includes("headcount") || l.includes("total") || l.includes("employee")) {
    return {
      icon: Users,
      colorClass: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
      accentBorder: "hover:border-sky-500/40",
    };
  }
  if (l.includes("hire") || l.includes("join") || l.includes("new")) {
    return {
      icon: UserPlus,
      colorClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      accentBorder: "hover:border-emerald-500/40",
    };
  }
  if (l.includes("exit") || l.includes("attrition") || l.includes("turnover")) {
    return {
      icon: UserMinus,
      colorClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
      accentBorder: "hover:border-rose-500/40",
    };
  }
  if (l.includes("late") || l.includes("risk") || l.includes("delay")) {
    return {
      icon: AlertCircle,
      colorClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
      accentBorder: "hover:border-amber-500/40",
    };
  }
  if (l.includes("attendance") || l.includes("rate") || l.includes("present") || l.includes("%")) {
    return {
      icon: l.includes("%") ? Percent : Clock,
      colorClass: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
      accentBorder: "hover:border-teal-500/40",
    };
  }
  if (l.includes("leave") || l.includes("absence")) {
    return {
      icon: Calendar,
      colorClass: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
      accentBorder: "hover:border-purple-500/40",
    };
  }
  if (l.includes("pay") || l.includes("gross") || l.includes("net") || l.includes("cost") || l.includes("deduction")) {
    return {
      icon: DollarSign,
      colorClass: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
      accentBorder: "hover:border-indigo-500/40",
    };
  }
  return {
    icon: TrendingUp,
    colorClass: "bg-primary/10 text-primary border-primary/20",
    accentBorder: "hover:border-primary/40",
  };
}

export function ReportKpiStrip({
  kpis,
  loading,
}: {
  kpis?: ReportKpi[];
  loading?: boolean;
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-28 animate-pulse rounded-2xl border border-border bg-muted/40"
          />
        ))}
      </div>
    );
  }

  if (!kpis?.length) return null;

  return (
    <div
      className={cn(
        "grid gap-4",
        kpis.length <= 3 ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-2 lg:grid-cols-4"
      )}
    >
      {kpis.map((kpi) => {
        const { icon: Icon, colorClass, accentBorder } = getKpiVisuals(kpi.label);

        return (
          <div
            key={kpi.label}
            className={cn(
              "group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-xs transition-all duration-200 hover:shadow-md",
              accentBorder
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground truncate">
                {kpi.label}
              </span>
              <div
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border shadow-xs transition-transform group-hover:scale-105",
                  colorClass
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
            </div>

            <div className="mt-3">
              <p className="text-2xl font-extrabold text-foreground tabular-nums tracking-tight">
                {kpi.value}
              </p>
              {kpi.hint && (
                <p className="mt-1 text-xs font-medium text-muted-foreground/90">
                  {kpi.hint}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
