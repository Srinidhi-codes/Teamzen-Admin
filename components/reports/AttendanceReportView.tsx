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
  chartTooltipStyle,
} from "./ReportShared";
import type { AttendanceReport } from "@/lib/graphql/reports/types";

export function AttendanceReportView({
  report,
  loading,
  error,
}: {
  report?: AttendanceReport;
  loading?: boolean;
  error?: Error | null;
}) {
  if (error) return <ReportError message={error.message} />;
  if (loading || !report) return <ReportLoadingBlocks />;

  const daily = report.dailySeries.map((p) => ({
    day: p.label,
    present: p.value,
    absent: p.secondary ?? 0,
    late: p.tertiary ?? 0,
  }));

  return (
    <div className="space-y-4">
      <ReportKpiStrip kpis={report.kpis} />

      <ChartPanel title="Daily attendance" empty={!daily.length}>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={daily}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip contentStyle={chartTooltipStyle} />
              <Legend />
              <Bar dataKey="present" fill="oklch(0.6 0.14 150)" name="Present" stackId="a" />
              <Bar dataKey="late" fill="oklch(0.7 0.15 70)" name="Late" stackId="a" />
              <Bar dataKey="absent" fill="oklch(0.55 0.2 25)" name="Absent" stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartPanel>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartPanel title="Status mix" empty={!report.statusBreakdown.length}>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={report.statusBreakdown}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                >
                  {report.statusBreakdown.map((d, i) => (
                    <Cell key={d.name} fill={d.color || `hsl(${i * 45} 50% 50%)`} />
                  ))}
                </Pie>
                <Tooltip contentStyle={chartTooltipStyle} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartPanel>
        <ChartPanel title="By office" empty={!report.officeBreakdown.length}>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={report.officeBreakdown} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={100}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Bar dataKey="value" fill="var(--primary)" name="Records" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartPanel>
      </div>

      <ReportTableShell
        title="Employee attendance"
        empty={!report.employees.length}
        emptyMessage="No attendance rows for this range."
      >
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs text-muted-foreground">
              <th className="px-5 py-3 font-medium">Employee</th>
              <th className="px-5 py-3 font-medium">Dept</th>
              <th className="px-5 py-3 font-medium">Present</th>
              <th className="px-5 py-3 font-medium">Late</th>
              <th className="px-5 py-3 font-medium">Absent</th>
              <th className="px-5 py-3 font-medium">Leave</th>
              <th className="px-5 py-3 font-medium">Rate</th>
            </tr>
          </thead>
          <tbody>
            {report.employees.slice(0, 100).map((e) => (
              <tr key={e.id} className="border-b border-border/60 last:border-0">
                <td className="px-5 py-3">
                  <div className="font-medium">{e.name}</div>
                  <div className="text-xs text-muted-foreground">{e.email}</div>
                </td>
                <td className="px-5 py-3 text-muted-foreground">
                  {e.department || "—"}
                </td>
                <td className="px-5 py-3 tabular-nums">{e.presentDays}</td>
                <td className="px-5 py-3 tabular-nums">{e.lateDays}</td>
                <td className="px-5 py-3 tabular-nums">{e.absentDays}</td>
                <td className="px-5 py-3 tabular-nums">{e.leaveDays}</td>
                <td className="px-5 py-3 tabular-nums font-medium">
                  {e.attendanceRate}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </ReportTableShell>
    </div>
  );
}
