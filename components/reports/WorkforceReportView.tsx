"use client";

import {
  LineChart,
  Line,
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
import type { WorkforceReport } from "@/lib/graphql/reports/types";

export function WorkforceReportView({
  report,
  loading,
  error,
}: {
  report?: WorkforceReport;
  loading?: boolean;
  error?: Error | null;
}) {
  if (error) return <ReportError message={error.message} />;
  if (loading || !report) return <ReportLoadingBlocks />;

  const series = report.headcountSeries.map((p) => ({
    month: p.label,
    headcount: p.value,
    hires: p.secondary ?? 0,
    exits: p.tertiary ?? 0,
  }));

  return (
    <div className="space-y-4">
      <ReportKpiStrip kpis={report.kpis} />

      <ChartPanel title="Headcount trend" empty={!series.length}>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={series}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip {...chartTooltipProps} />
              <Legend />
              <Line
                type="monotone"
                dataKey="headcount"
                stroke="var(--primary)"
                strokeWidth={2}
                dot={false}
                name="Headcount"
              />
              <Line
                type="monotone"
                dataKey="hires"
                stroke="oklch(0.6 0.14 150)"
                strokeWidth={1.5}
                dot={false}
                name="Hires"
              />
              <Line
                type="monotone"
                dataKey="exits"
                stroke="oklch(0.55 0.2 25)"
                strokeWidth={1.5}
                dot={false}
                name="Exits"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ChartPanel>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartPanel
          title="By department"
          empty={!report.departmentBreakdown.length}
        >
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={report.departmentBreakdown}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={({ name, percent }) =>
                    `${name} ${((percent || 0) * 100).toFixed(0)}%`
                  }
                >
                  {report.departmentBreakdown.map((d, i) => (
                    <Cell key={d.name} fill={d.color || `hsl(${i * 40} 50% 50%)`} />
                  ))}
                </Pie>
                <Tooltip {...chartTooltipProps} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartPanel>
        <ChartPanel
          title="Employment type"
          empty={!report.employmentTypeBreakdown.length}
        >
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={report.employmentTypeBreakdown}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                >
                  {report.employmentTypeBreakdown.map((d, i) => (
                    <Cell key={d.name} fill={d.color || `hsl(${i * 50 + 20} 45% 55%)`} />
                  ))}
                </Pie>
                <Tooltip {...chartTooltipProps} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartPanel>
      </div>

      <ReportTableShell
        title="Employees"
        empty={!report.employees.length}
        emptyMessage="No employees match these filters."
      >
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs text-muted-foreground">
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Department</th>
              <th className="px-5 py-3 font-medium">Designation</th>
              <th className="px-5 py-3 font-medium">Joined</th>
              <th className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {report.employees.slice(0, 100).map((e) => (
              <tr key={e.id} className="border-b border-border/60 last:border-0">
                <td className="px-5 py-3">
                  <div className="font-medium text-foreground">{e.name}</div>
                  <div className="text-xs text-muted-foreground">{e.email}</div>
                </td>
                <td className="px-5 py-3 text-muted-foreground">
                  {e.department || "—"}
                </td>
                <td className="px-5 py-3 text-muted-foreground">
                  {e.designation || "—"}
                </td>
                <td className="px-5 py-3 tabular-nums text-muted-foreground">
                  {e.dateOfJoining || "—"}
                </td>
                <td className="px-5 py-3">
                  <span
                    className={
                      e.isActive
                        ? "text-emerald-700 dark:text-emerald-400"
                        : "text-muted-foreground"
                    }
                  >
                    {e.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </ReportTableShell>
    </div>
  );
}
