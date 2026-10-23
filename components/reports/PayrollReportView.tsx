"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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
  chartTooltipProps,
} from "./ReportShared";
import { Pagination } from "@/components/common/Pagination";
import type { PayrollReport, PayrollRunRow } from "@/lib/graphql/reports/types";
import {
  DollarSign,
  ChevronRight,
  Calendar,
  Search,
  CheckCircle2,
  Clock,
  FileText,
  CreditCard,
  Building,
  ArrowUpRight,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const PAGE_SIZE_OPTIONS = [8, 15, 30];

function formatInr(n: number) {
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}

function RunStatusBadge({ status }: { status: string }) {
  const s = status?.toLowerCase() || "";
  if (s === "completed" || s === "paid" || s === "processed") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
        <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
        <span className="capitalize">{status}</span>
      </span>
    );
  }
  if (s === "processing") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/20 bg-sky-500/10 px-2.5 py-1 text-xs font-semibold text-sky-700 dark:text-sky-400">
        <Clock className="h-3 w-3 text-sky-600 dark:text-sky-400 animate-spin" />
        <span className="capitalize">Processing</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:text-amber-400">
      <FileText className="h-3 w-3 text-amber-600 dark:text-amber-400" />
      <span className="capitalize">{status || "Draft"}</span>
    </span>
  );
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
  const router = useRouter();

  // Filter & Pagination state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  const series = useMemo(() => {
    if (!report?.monthlySeries) return [];
    return report.monthlySeries.map((p) => ({
      month: p.label,
      gross: p.value,
      deductions: p.secondary ?? 0,
      net: p.tertiary ?? 0,
    }));
  }, [report?.monthlySeries]);

  // Filtered runs
  const filteredRuns = useMemo(() => {
    if (!report?.runs) return [];
    return report.runs.filter((r) => {
      const matchSearch =
        search.trim() === "" ||
        r.label.toLowerCase().includes(search.toLowerCase()) ||
        String(r.year).includes(search) ||
        r.status.toLowerCase().includes(search.toLowerCase());

      const matchStatus =
        statusFilter === "ALL" ||
        r.status.toLowerCase() === statusFilter.toLowerCase();

      return matchSearch && matchStatus;
    });
  }, [report?.runs, search, statusFilter]);

  // Pagination slicing
  const totalPages = Math.ceil(filteredRuns.length / pageSize) || 1;
  const paginatedRuns = useMemo(() => {
    const from = (currentPage - 1) * pageSize;
    return filteredRuns.slice(from, from + pageSize);
  }, [filteredRuns, currentPage, pageSize]);

  const handleRowClick = (run: PayrollRunRow) => {
    router.push(`/payroll/${run.id}`);
  };

  // Department total cost calculation
  const totalDeptCost = useMemo(() => {
    if (!report?.departmentCost) return 0;
    return report.departmentCost.reduce((sum, d) => sum + (d.value || 0), 0);
  }, [report?.departmentCost]);

  if (error) return <ReportError message={error.message} />;
  if (loading || !report) return <ReportLoadingBlocks />;

  return (
    <div className="space-y-6">
      {/* ── KPI Strip ─────────────────────────────────────────────────── */}
      <ReportKpiStrip kpis={report.kpis} />

      {/* ── Advances & Auxiliary Metric Banner ─────────────────────────── */}
      {(report.advancesOutstanding > 0 || report.advancesCount > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-4 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 shadow-xs">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <CreditCard className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                Outstanding Salary Advances
              </p>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-xl font-extrabold text-foreground">
                  {formatInr(report.advancesOutstanding)}
                </span>
                <span className="text-xs text-muted-foreground">
                  across {report.advancesCount} active {report.advancesCount === 1 ? "advance" : "advances"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground">Payroll Processing Hub</p>
                <p className="text-[11px] text-muted-foreground">
                  Manage payroll runs, adjustments, tax deductions & bank payout files
                </p>
              </div>
            </div>
            <Link
              href="/payroll"
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-muted/30 px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer shrink-0"
            >
              <span>Manage Runs</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* ── Trend & Department Charts ─────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Trend Line Chart (2 Cols) */}
        <div className="lg:col-span-2">
          <ChartPanel
            title="Payroll Cost Progression"
            subtitle="Gross disbursements, statutory deductions, and net payouts across cycles"
            empty={!series.length}
          >
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={series}
                  margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.6} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                  <YAxis
                    tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                    tickFormatter={(v) => `${Math.round(v / 1000)}k`}
                  />
                  <Tooltip
                    {...chartTooltipProps}
                    formatter={(v) => [formatInr(Number(v)), ""]}
                  />
                  <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                  <Line
                    type="monotone"
                    dataKey="gross"
                    stroke="var(--primary)"
                    strokeWidth={2.5}
                    dot={{ r: 4 }}
                    name="Gross Total"
                  />
                  <Line
                    type="monotone"
                    dataKey="deductions"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    name="Deductions"
                  />
                  <Line
                    type="monotone"
                    dataKey="net"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    name="Net Payout"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ChartPanel>
        </div>

        {/* Department Cost Distribution (1 Col) */}
        <div>
          <ChartPanel
            title="Cost by Department"
            subtitle="Allocation in the latest cycle"
            empty={!report.departmentCost.length}
          >
            <div className="h-[300px] flex flex-col justify-between">
              <div className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={report.departmentCost}
                    layout="vertical"
                    margin={{ top: 5, right: 15, left: 15, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.6} />
                    <XAxis
                      type="number"
                      tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                      tickFormatter={(v) => `${Math.round(v / 1000)}k`}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={90}
                      tick={{ fontSize: 10, fill: "var(--foreground)" }}
                    />
                    <Tooltip
                      {...chartTooltipProps}
                      formatter={(v) => [formatInr(Number(v)), "Net Cost"]}
                    />
                    <Bar
                      dataKey="value"
                      fill="oklch(0.6 0.16 260)"
                      name="Cost"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Department Cost Progress Breakdown */}
              <div className="space-y-2 border-t border-border/70 pt-3 text-xs">
                {report.departmentCost.slice(0, 3).map((d) => {
                  const pct = totalDeptCost ? Math.round((d.value / totalDeptCost) * 100) : 0;
                  return (
                    <div key={d.name} className="space-y-1">
                      <div className="flex items-center justify-between text-muted-foreground font-medium">
                        <span className="truncate">{d.name}</span>
                        <span className="font-bold text-foreground tabular-nums">
                          {formatInr(d.value)} ({pct}%)
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </ChartPanel>
        </div>
      </div>

      {/* ── Payroll Runs Interactive Register ─────────────────────────── */}
      <ReportTableShell
        title="Payroll Runs Directory"
        subtitle="Click any payroll run row to open its complete disbursement breakdown, payslip list, and execution summary"
        action={
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search */}
            <div className="relative w-full sm:w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search run period..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-8.5 w-full rounded-xl border border-border bg-background pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1 rounded-xl border border-border bg-background p-0.5">
              {(["ALL", "COMPLETED", "DRAFT"] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => {
                    setStatusFilter(st);
                    setCurrentPage(1);
                  }}
                  className={cn(
                    "rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer",
                    statusFilter === st
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                  )}
                >
                  {st === "ALL" ? "All" : st.charAt(0) + st.slice(1).toLowerCase()}
                </button>
              ))}
            </div>

            {/* Page Size Selector */}
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="h-8.5 rounded-xl border border-border bg-background px-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size} / page
                </option>
              ))}
            </select>
          </div>
        }
        empty={!filteredRuns.length}
        emptyMessage={
          search || statusFilter !== "ALL"
            ? "No payroll runs match your filter criteria."
            : "No payroll runs recorded in this range."
        }
        footer={
          filteredRuns.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              total={filteredRuns.length}
              pageSize={pageSize}
              label="payroll runs"
            />
          )
        }
      >
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-border/80 bg-muted/40 text-xs font-semibold text-muted-foreground">
              <th className="px-5 py-3.5">Payroll Cycle</th>
              <th className="px-5 py-3.5 text-center">Status</th>
              <th className="px-5 py-3.5 text-right">Gross Total</th>
              <th className="px-5 py-3.5 text-right">Deductions</th>
              <th className="px-5 py-3.5 text-right">Net Payout</th>
              <th className="px-5 py-3.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {paginatedRuns.map((r) => (
              <tr
                key={r.id}
                onClick={() => handleRowClick(r)}
                className="group cursor-pointer transition-all duration-150 hover:bg-primary/5 active:scale-[0.998]"
                title="Click to view full payroll run details"
              >
                {/* Period */}
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold shadow-xs transition-transform group-hover:scale-105">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {r.label}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Cycle {r.month}/{r.year}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Status */}
                <td className="px-5 py-3.5 text-center">
                  <RunStatusBadge status={r.status} />
                </td>

                {/* Gross */}
                <td className="px-5 py-3.5 text-right font-medium text-foreground tabular-nums">
                  {formatInr(r.totalGross)}
                </td>

                {/* Deductions */}
                <td className="px-5 py-3.5 text-right tabular-nums text-rose-600 dark:text-rose-400 font-medium">
                  {formatInr(r.totalDeduction)}
                </td>

                {/* Net Pay */}
                <td className="px-5 py-3.5 text-right">
                  <span className="font-bold tabular-nums text-emerald-600 dark:text-emerald-400 text-sm">
                    {formatInr(r.totalNetPay)}
                  </span>
                </td>

                {/* Action Arrow */}
                <td className="px-5 py-3.5 text-right">
                  <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground group-hover:text-primary transition-colors">
                    <span className="hidden sm:inline">Open Run</span>
                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </ReportTableShell>
    </div>
  );
}
