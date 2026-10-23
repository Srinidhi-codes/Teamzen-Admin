"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import moment from "moment";
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
import { Pagination } from "@/components/common/Pagination";
import type { LeaveReport, LeaveRequestRow } from "@/lib/graphql/reports/types";
import {
  Search,
  ChevronRight,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ExternalLink,
  Layers,
  ArrowRight,
  Sparkles,
  X,
  User,
  Building,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const PAGE_SIZE_OPTIONS = [10, 20, 50];

function getInitials(name: string) {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getAvatarColor(name: string) {
  const colors = [
    "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
    "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
    "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
    "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function StatusBadge({ status }: { status: string }) {
  const s = status?.toLowerCase() || "";
  if (s === "approved") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
        <span>Approved</span>
      </span>
    );
  }
  if (s === "rejected") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/20 bg-rose-500/10 px-2.5 py-1 text-xs font-semibold text-rose-700 dark:text-rose-400">
        <XCircle className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
        <span>Rejected</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:text-amber-400">
      <Clock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
      <span>Pending</span>
    </span>
  );
}

export function LeaveReportView({
  report,
  loading,
  error,
}: {
  report?: LeaveReport;
  loading?: boolean;
  error?: Error | null;
}) {
  const router = useRouter();

  // Requests table state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Upcoming leaves table pagination
  const [upcomingPage, setUpcomingPage] = useState(1);
  const upcomingPageSize = 5;

  // Selected leave detail modal
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequestRow | null>(null);

  const flux = useMemo(() => {
    if (!report?.monthlyFlux) return [];
    return report.monthlyFlux.map((p) => ({
      month: p.label,
      approved: p.value,
      rejected: p.secondary ?? 0,
      pending: p.tertiary ?? 0,
    }));
  }, [report?.monthlyFlux]);

  // Filtered requests
  const filteredRequests = useMemo(() => {
    if (!report?.requests) return [];
    return report.requests.filter((r) => {
      const matchSearch =
        search.trim() === "" ||
        r.employee.toLowerCase().includes(search.toLowerCase()) ||
        r.leaveType.toLowerCase().includes(search.toLowerCase()) ||
        (r.department && r.department.toLowerCase().includes(search.toLowerCase()));

      const matchStatus =
        statusFilter === "ALL" ||
        r.status.toLowerCase() === statusFilter.toLowerCase();

      return matchSearch && matchStatus;
    });
  }, [report?.requests, search, statusFilter]);

  // Pagination for requests
  const totalPages = Math.ceil(filteredRequests.length / pageSize) || 1;
  const paginatedRequests = useMemo(() => {
    const from = (currentPage - 1) * pageSize;
    return filteredRequests.slice(from, from + pageSize);
  }, [filteredRequests, currentPage, pageSize]);

  // Pagination for upcoming
  const upcomingTotalPages = Math.ceil((report?.upcoming?.length || 0) / upcomingPageSize) || 1;
  const paginatedUpcoming = useMemo(() => {
    if (!report?.upcoming) return [];
    const from = (upcomingPage - 1) * upcomingPageSize;
    return report.upcoming.slice(from, from + upcomingPageSize);
  }, [report?.upcoming, upcomingPage]);

  const handleRowClick = (req: LeaveRequestRow) => {
    setSelectedLeave(req);
  };

  const handleNavigateToLeaves = () => {
    router.push("/leaves?tab=requests");
  };

  if (error) return <ReportError message={error.message} />;
  if (loading || !report) return <ReportLoadingBlocks />;

  return (
    <div className="space-y-6">
      {/* ── KPI Strip ─────────────────────────────────────────────────── */}
      <ReportKpiStrip kpis={report.kpis} />

      {/* ── Charts Row ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <ChartPanel
          title="Leave Days by Leave Type"
          subtitle="Distribution of total absence days by category"
          empty={!report.typeBreakdown.length}
        >
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={report.typeBreakdown}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                >
                  {report.typeBreakdown.map((d, i) => (
                    <Cell
                      key={d.name}
                      fill={d.color || `hsl(${i * 45 + 260} 65% 55%)`}
                      stroke="var(--card)"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip {...chartTooltipProps} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartPanel>

        <ChartPanel
          title="Entitlement Utilization % by Type"
          subtitle="Percentage of allocated balance consumed across organization"
          empty={!report.utilization.length}
        >
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={report.utilization}
                margin={{ top: 10, right: 15, left: -15, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.6} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--foreground)" }} />
                <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} unit="%" />
                <Tooltip
                  {...chartTooltipProps}
                  formatter={(v) => [`${v}%`, "Used of Entitled"]}
                />
                <Bar
                  dataKey="value"
                  fill="oklch(0.6 0.18 290)"
                  name="Used %"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartPanel>
      </div>

      {/* ── Monthly Flux Chart ───────────────────────────────────────── */}
      <ChartPanel
        title="Monthly Leave Request Flux"
        subtitle="Approved, pending, and rejected leave volume over time"
        empty={!flux.length}
      >
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={flux}
              margin={{ top: 10, right: 15, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.6} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} allowDecimals={false} />
              <Tooltip {...chartTooltipProps} />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
              <Bar dataKey="approved" fill="#10b981" name="Approved" radius={[4, 4, 0, 0]} />
              <Bar dataKey="pending" fill="#f59e0b" name="Pending" radius={[4, 4, 0, 0]} />
              <Bar dataKey="rejected" fill="#ef4444" name="Rejected" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartPanel>

      {/* ── Upcoming Approved Leaves ─────────────────────────────────── */}
      <ReportTableShell
        title="Upcoming Approved Leaves"
        subtitle="Scheduled employee time off starting today onwards"
        action={
          <button
            type="button"
            onClick={handleNavigateToLeaves}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted/70 transition-colors cursor-pointer"
          >
            <span>Manage in Leaves Hub</span>
            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        }
        empty={!report.upcoming.length}
        emptyMessage="No upcoming approved leaves scheduled."
        footer={
          report.upcoming.length > upcomingPageSize && (
            <Pagination
              currentPage={upcomingPage}
              totalPages={upcomingTotalPages}
              onPageChange={setUpcomingPage}
              total={report.upcoming.length}
              pageSize={upcomingPageSize}
              label="upcoming leaves"
            />
          )
        }
      >
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead>
            <tr className="border-b border-border/80 bg-muted/40 text-xs font-semibold text-muted-foreground">
              <th className="px-5 py-3.5">Employee</th>
              <th className="px-5 py-3.5">Leave Type</th>
              <th className="px-5 py-3.5">Schedule</th>
              <th className="px-5 py-3.5 text-center">Duration</th>
              <th className="px-5 py-3.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {paginatedUpcoming.map((r) => (
              <tr
                key={r.id}
                onClick={() => handleRowClick(r)}
                className="group cursor-pointer transition-all duration-150 hover:bg-primary/5 active:scale-[0.998]"
                title="Click to view full leave details"
              >
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border text-xs font-bold shadow-xs",
                        getAvatarColor(r.employee)
                      )}
                    >
                      {getInitials(r.employee)}
                    </div>
                    <div>
                      <div className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {r.employee}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {r.department || "General"}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <span className="inline-flex items-center rounded-lg border border-purple-500/20 bg-purple-500/10 px-2.5 py-1 text-xs font-semibold text-purple-700 dark:text-purple-300">
                    {r.leaveType}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5 font-medium text-foreground">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{moment(r.fromDate).format("MMM DD, YYYY")}</span>
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    <span>{moment(r.toDate).format("MMM DD, YYYY")}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-center">
                  <span className="inline-flex items-center rounded-md bg-muted px-2.5 py-1 text-xs font-bold text-foreground">
                    {r.durationDays} {r.durationDays === 1 ? "day" : "days"}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <div className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground group-hover:text-primary transition-colors">
                    <span>Inspect</span>
                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </ReportTableShell>

      {/* ── Leave Requests Interactive Table ─────────────────────────── */}
      <ReportTableShell
        title="Leave Requests Register"
        subtitle="Click any leave request row to view approval details and launch quick action"
        action={
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search */}
            <div className="relative w-full sm:w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by employee / type..."
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
              {(["ALL", "APPROVED", "PENDING", "REJECTED"] as const).map((st) => (
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
        empty={!filteredRequests.length}
        emptyMessage={
          search || statusFilter !== "ALL"
            ? "No leave requests match your search or status filter."
            : "No leave requests recorded in this range."
        }
        footer={
          filteredRequests.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              total={filteredRequests.length}
              pageSize={pageSize}
              label="requests"
            />
          )
        }
      >
        <table className="w-full min-w-[780px] text-left text-sm">
          <thead>
            <tr className="border-b border-border/80 bg-muted/40 text-xs font-semibold text-muted-foreground">
              <th className="px-5 py-3.5">Employee</th>
              <th className="px-5 py-3.5">Leave Type</th>
              <th className="px-5 py-3.5">Dates / Schedule</th>
              <th className="px-5 py-3.5 text-center">Duration</th>
              <th className="px-5 py-3.5 text-center">Status</th>
              <th className="px-5 py-3.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {paginatedRequests.map((r) => (
              <tr
                key={r.id}
                onClick={() => handleRowClick(r)}
                className="group cursor-pointer transition-all duration-150 hover:bg-primary/5 active:scale-[0.998]"
                title="Click to view details"
              >
                {/* Employee Profile */}
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-xs font-bold shadow-xs transition-transform group-hover:scale-105",
                        getAvatarColor(r.employee)
                      )}
                    >
                      {getInitials(r.employee)}
                    </div>
                    <div>
                      <div className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {r.employee}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {r.department || "—"}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Leave Type */}
                <td className="px-5 py-3.5">
                  <span className="inline-flex items-center rounded-lg border border-border/70 bg-muted/30 px-2.5 py-1 text-xs font-medium text-foreground">
                    {r.leaveType}
                  </span>
                </td>

                {/* Dates */}
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{moment(r.fromDate).format("MMM DD, YYYY")}</span>
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    <span>{moment(r.toDate).format("MMM DD, YYYY")}</span>
                  </div>
                </td>

                {/* Duration */}
                <td className="px-5 py-3.5 text-center">
                  <span className="inline-flex items-center rounded-md bg-muted px-2.5 py-1 text-xs font-bold text-foreground">
                    {r.durationDays} {r.durationDays === 1 ? "day" : "days"}
                  </span>
                </td>

                {/* Status Badge */}
                <td className="px-5 py-3.5 text-center">
                  <StatusBadge status={r.status} />
                </td>

                {/* Action Arrow */}
                <td className="px-5 py-3.5 text-right">
                  <div className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground group-hover:text-primary transition-colors">
                    <span className="hidden sm:inline">Details</span>
                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </ReportTableShell>

      {/* ── Leave Request Detail Modal ───────────────────────────────── */}
      <Dialog open={!!selectedLeave} onOpenChange={(open) => !open && setSelectedLeave(null)}>
        <DialogContent className="max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
          <DialogHeader className="pb-3 border-b border-border/60">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                <Calendar className="h-5 w-5 text-purple-500" />
                <span>Leave Request Details</span>
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground">
              Review absence information and manage approvals
            </DialogDescription>
          </DialogHeader>

          {selectedLeave && (
            <div className="space-y-4 py-2">
              {/* Employee Summary Header */}
              <div className="flex items-center gap-3.5 rounded-xl border border-border/80 bg-muted/30 p-3.5">
                <div
                  className={cn(
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border text-sm font-bold shadow-xs",
                    getAvatarColor(selectedLeave.employee)
                  )}
                >
                  {getInitials(selectedLeave.employee)}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-foreground text-sm truncate">
                    {selectedLeave.employee}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {selectedLeave.department ? `${selectedLeave.department} Department` : "General Staff"}
                  </p>
                </div>
                <div>
                  <StatusBadge status={selectedLeave.status} />
                </div>
              </div>

              {/* Detail Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl border border-border/60 bg-muted/15 p-3 space-y-1">
                  <span className="text-muted-foreground font-medium">Leave Type</span>
                  <div className="font-bold text-foreground text-sm">
                    {selectedLeave.leaveType}
                  </div>
                </div>

                <div className="rounded-xl border border-border/60 bg-muted/15 p-3 space-y-1">
                  <span className="text-muted-foreground font-medium">Total Duration</span>
                  <div className="font-bold text-foreground text-sm">
                    {selectedLeave.durationDays} {selectedLeave.durationDays === 1 ? "Day" : "Days"}
                  </div>
                </div>

                <div className="col-span-2 rounded-xl border border-border/60 bg-muted/15 p-3 space-y-1.5">
                  <span className="text-muted-foreground font-medium">Absence Schedule</span>
                  <div className="flex items-center gap-2 font-semibold text-foreground text-xs sm:text-sm">
                    <Calendar className="h-4 w-4 text-purple-500 shrink-0" />
                    <span>{moment(selectedLeave.fromDate).format("dddd, MMMM D, YYYY")}</span>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span>{moment(selectedLeave.toDate).format("dddd, MMMM D, YYYY")}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedLeave(null);
                    router.push("/leaves?tab=requests");
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm hover:opacity-90 transition-opacity cursor-pointer"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>Open in Leaves Hub</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedLeave(null)}
                  className="rounded-xl border border-border bg-muted/40 px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
