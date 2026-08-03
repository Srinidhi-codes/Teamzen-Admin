"use client";

import Link from "next/link";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
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
import type { PayrollReport } from "@/lib/graphql/reports/types";

function formatInr(n: number) {
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}

export function PayrollReportView({
  report,
  loading,
  error,
}: {
  report?: PayrollReport;
  loading?: boolean;
  error?: Error | null;
}) {
  if (error) return <ReportError message={error.message} />;
  if (loading || !report) return <ReportLoadingBlocks />;

  const series = report.monthlySeries.map((p) => ({
    month: p.label,
    gross: p.value,
    deductions: p.secondary ?? 0,
    net: p.tertiary ?? 0,
  }));

  return (
    <div className="space-y-4">
      <ReportKpiStrip kpis={report.kpis} />

      <ChartPanel title="Payroll cost trend" empty={!series.length}>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={series}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => `${Math.round(v / 1000)}k`}
              />
              <Tooltip
                contentStyle={chartTooltipStyle}
                formatter={(v) => formatInr(Number(v))}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="gross"
                stroke="var(--primary)"
                strokeWidth={2}
                dot={false}
                name="Gross"
              />
              <Line
                type="monotone"
                dataKey="deductions"
                stroke="oklch(0.55 0.2 25)"
                strokeWidth={1.5}
                dot={false}
                name="Deductions"
              />
              <Line
                type="monotone"
                dataKey="net"
                stroke="oklch(0.6 0.14 150)"
                strokeWidth={1.5}
                dot={false}
                name="Net"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ChartPanel>

      <ChartPanel
        title="Department cost (latest run)"
        empty={!report.departmentCost.length}
      >
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={report.departmentCost}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => `${Math.round(v / 1000)}k`}
              />
              <Tooltip
                contentStyle={chartTooltipStyle}
                formatter={(v) => formatInr(Number(v))}
              />
              <Bar dataKey="value" fill="var(--primary)" name="Net cost" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartPanel>

      <ReportTableShell
        title="Payroll runs"
        empty={!report.runs.length}
        emptyMessage="No payroll runs in this range."
      >
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs text-muted-foreground">
              <th className="px-5 py-3 font-medium">Period</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Gross</th>
              <th className="px-5 py-3 font-medium">Deductions</th>
              <th className="px-5 py-3 font-medium">Net</th>
              <th className="px-5 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {report.runs.map((r) => (
              <tr key={r.id} className="border-b border-border/60 last:border-0">
                <td className="px-5 py-3 font-medium">{r.label}</td>
                <td className="px-5 py-3 capitalize text-muted-foreground">
                  {r.status}
                </td>
                <td className="px-5 py-3 tabular-nums">{formatInr(r.totalGross)}</td>
                <td className="px-5 py-3 tabular-nums">
                  {formatInr(r.totalDeduction)}
                </td>
                <td className="px-5 py-3 tabular-nums font-medium">
                  {formatInr(r.totalNetPay)}
                </td>
                <td className="px-5 py-3 text-right">
                  <Link
                    href={`/payroll/${r.id}`}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    Open
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </ReportTableShell>
    </div>
  );
}
