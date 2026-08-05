"use client";

import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ReportKpiStrip } from "./ReportKpiStrip";
import {
  ChartPanel,
  ReportError,
  ReportLoadingBlocks,
  ReportTableShell,
  chartTooltipProps,
} from "./ReportShared";
import type { LeaveReport } from "@/lib/graphql/reports/types";

export function LeaveReportView({
  report,
  loading,
  error,
}: {
  report?: LeaveReport;
  loading?: boolean;
  error?: Error | null;
}) {
  if (error) return <ReportError message={error.message} />;
  if (loading || !report) return <ReportLoadingBlocks />;

  const flux = report.monthlyFlux.map((p) => ({
    month: p.label,
    approved: p.value,
    rejected: p.secondary ?? 0,
    pending: p.tertiary ?? 0,
  }));

  return (
    <div className="space-y-4">
      <ReportKpiStrip kpis={report.kpis} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartPanel title="Days by leave type" empty={!report.typeBreakdown.length}>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={report.typeBreakdown}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={95}
                >
                  {report.typeBreakdown.map((d, i) => (
                    <Cell key={d.name} fill={d.color || `hsl(${i * 40} 50% 50%)`} />
                  ))}
                </Pie>
                <Tooltip {...chartTooltipProps} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartPanel>
        <ChartPanel title="Utilization % by type" empty={!report.utilization.length}>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={report.utilization}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 12 }} unit="%" />
                <Tooltip {...chartTooltipProps} />
                <Bar dataKey="value" fill="var(--primary)" name="Used %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartPanel>
      </div>

      <ChartPanel title="Monthly leave flux" empty={!flux.length}>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={flux}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip {...chartTooltipProps} />
              <Legend />
              <Bar dataKey="approved" fill="oklch(0.6 0.14 150)" name="Approved" />
              <Bar dataKey="pending" fill="oklch(0.7 0.15 70)" name="Pending" />
              <Bar dataKey="rejected" fill="oklch(0.55 0.2 25)" name="Rejected" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartPanel>

      <ReportTableShell
        title="Upcoming approved leaves"
        empty={!report.upcoming.length}
        emptyMessage="No upcoming approved leaves."
      >
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs text-muted-foreground">
              <th className="px-5 py-3 font-medium">Employee</th>
              <th className="px-5 py-3 font-medium">Type</th>
              <th className="px-5 py-3 font-medium">From</th>
              <th className="px-5 py-3 font-medium">To</th>
              <th className="px-5 py-3 font-medium">Days</th>
            </tr>
          </thead>
          <tbody>
            {report.upcoming.map((r) => (
              <tr key={r.id} className="border-b border-border/60 last:border-0">
                <td className="px-5 py-3 font-medium">{r.employee}</td>
                <td className="px-5 py-3 text-muted-foreground">{r.leaveType}</td>
                <td className="px-5 py-3 tabular-nums">{r.fromDate}</td>
                <td className="px-5 py-3 tabular-nums">{r.toDate}</td>
                <td className="px-5 py-3 tabular-nums">{r.durationDays}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </ReportTableShell>

      <ReportTableShell
        title="Leave requests"
        empty={!report.requests.length}
        emptyMessage="No leave requests in this range."
      >
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs text-muted-foreground">
              <th className="px-5 py-3 font-medium">Employee</th>
              <th className="px-5 py-3 font-medium">Type</th>
              <th className="px-5 py-3 font-medium">Dates</th>
              <th className="px-5 py-3 font-medium">Days</th>
              <th className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {report.requests.slice(0, 100).map((r) => (
              <tr key={r.id} className="border-b border-border/60 last:border-0">
                <td className="px-5 py-3">
                  <div className="font-medium">{r.employee}</div>
                  <div className="text-xs text-muted-foreground">
                    {r.department || "—"}
                  </div>
                </td>
                <td className="px-5 py-3 text-muted-foreground">{r.leaveType}</td>
                <td className="px-5 py-3 tabular-nums text-muted-foreground">
                  {r.fromDate} → {r.toDate}
                </td>
                <td className="px-5 py-3 tabular-nums">{r.durationDays}</td>
                <td className="px-5 py-3 capitalize">{r.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </ReportTableShell>
    </div>
  );
}
