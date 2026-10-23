"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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
import type { AttendanceReport, AttendanceEmployeeRow } from "@/lib/graphql/reports/types";
import {
  Search,
  ChevronRight,
  ArrowUpDown,
  Filter,
  Clock,
  UserCheck,
  AlertCircle,
  Calendar,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const PAGE_SIZE_OPTIONS = [10, 20, 50];

function getInitials(name: string) {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getAvatarColor(name: string) {
  const colors = [
    "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
    "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
    "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
    "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function AttendanceReportView({
  report,
  loading,
  error,
}: {
  report?: AttendanceReport;
  loading?: boolean;
  error?: Error | null;
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"rate" | "name" | "present">("rate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const daily = useMemo(() => {
    if (!report) return [];
    return report.dailySeries.map((p) => ({
      day: p.label,
      present: p.value,
      absent: p.secondary ?? 0,
      late: p.tertiary ?? 0,
    }));
  }, [report]);

  // Unique departments for filter dropdown
  const departments = useMemo(() => {
    if (!report?.employees) return [];
    const set = new Set<string>();
    report.employees.forEach((e) => {
      if (e.department) set.add(e.department);
    });
    return Array.from(set).sort();
  }, [report?.employees]);

  // Filtered & sorted employees
  const filteredEmployees = useMemo(() => {
    if (!report?.employees) return [];
    let list = report.employees.filter((e) => {
      const matchSearch =
        search.trim() === "" ||
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.email.toLowerCase().includes(search.toLowerCase()) ||
        (e.department && e.department.toLowerCase().includes(search.toLowerCase()));

      const matchDept = selectedDept === "ALL" || e.department === selectedDept;

      return matchSearch && matchDept;
    });

    list.sort((a, b) => {
      let cmp = 0;
      if (sortBy === "rate") cmp = a.attendanceRate - b.attendanceRate;
      else if (sortBy === "name") cmp = a.name.localeCompare(b.name);
      else if (sortBy === "present") cmp = a.presentDays - b.presentDays;

      return sortOrder === "asc" ? cmp : -cmp;
    });

    return list;
  }, [report?.employees, search, selectedDept, sortBy, sortOrder]);

  // Pagination slicing
  const totalPages = Math.ceil(filteredEmployees.length / pageSize) || 1;
  const paginatedEmployees = useMemo(() => {
    const from = (currentPage - 1) * pageSize;
    return filteredEmployees.slice(from, from + pageSize);
  }, [filteredEmployees, currentPage, pageSize]);

  // Reset page when search or dept changes
  const handleSearchChange = (val: string) => {
    setSearch(val);
    setCurrentPage(1);
  };

  const handleDeptChange = (dept: string) => {
    setSelectedDept(dept);
    setCurrentPage(1);
  };

  const handleSort = (field: "rate" | "name" | "present") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder(field === "name" ? "asc" : "desc");
    }
    setCurrentPage(1);
  };

  const handleRowClick = (emp: AttendanceEmployeeRow) => {
    router.push(`/attendance/report?employeeId=${emp.id}`);
  };

  if (error) return <ReportError message={error.message} />;
  if (loading || !report) return <ReportLoadingBlocks />;

  return (
    <div className="space-y-6">
      {/* ── KPI Strip ─────────────────────────────────────────────────── */}
      <ReportKpiStrip kpis={report.kpis} />

      {/* ── Daily Attendance Chart ───────────────────────────────────── */}
      <ChartPanel
        title="Daily Attendance Distribution"
        subtitle="Daily present, late, and absent check-ins across the selected timeframe"
        empty={!daily.length}
      >
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={daily} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.6} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} allowDecimals={false} />
              <Tooltip {...chartTooltipProps} />
              <Legend wrapperStyle={{ paddingTop: 10, fontSize: 12 }} />
              <Bar dataKey="present" fill="#10b981" name="Present" stackId="a" radius={[0, 0, 0, 0]} />
              <Bar dataKey="late" fill="#f59e0b" name="Late Login" stackId="a" radius={[0, 0, 0, 0]} />
              <Bar dataKey="absent" fill="#ef4444" name="Absent" stackId="a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartPanel>

      {/* ── Breakdown Charts ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <ChartPanel
          title="Attendance Status Breakdown"
          subtitle="Proportion of all recorded logs"
          empty={!report.statusBreakdown.length}
        >
          <div className="h-[270px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={report.statusBreakdown}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={95}
                  paddingAngle={3}
                >
                  {report.statusBreakdown.map((d, i) => (
                    <Cell
                      key={d.name}
                      fill={d.color || `hsl(${i * 45 + 160} 70% 45%)`}
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
          title="Attendance by Office Location"
          subtitle="Presence volume grouped by branch / office"
          empty={!report.officeBreakdown.length}
        >
          <div className="h-[270px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={report.officeBreakdown}
                layout="vertical"
                margin={{ top: 10, right: 20, left: 20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.6} />
                <XAxis type="number" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={110}
                  tick={{ fontSize: 11, fill: "var(--foreground)" }}
                />
                <Tooltip {...chartTooltipProps} />
                <Bar
                  dataKey="value"
                  fill="var(--primary)"
                  name="Recorded Logs"
                  radius={[0, 6, 6, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartPanel>
      </div>

      {/* ── Employee Attendance Interactive Table ───────────────────── */}
      <ReportTableShell
        title="Employee Attendance Roster"
        subtitle="Click any employee row to drill down into their individual timeline, GPS breadcrumb log, and daily punch cards"
        action={
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative w-full sm:w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search employee..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="h-8.5 w-full rounded-xl border border-border bg-background pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Department Filter */}
            {departments.length > 0 && (
              <select
                value={selectedDept}
                onChange={(e) => handleDeptChange(e.target.value)}
                className="h-8.5 rounded-xl border border-border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              >
                <option value="ALL">All Departments</option>
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            )}

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
        empty={!filteredEmployees.length}
        emptyMessage={
          search || selectedDept !== "ALL"
            ? "No employees match your search or filter criteria."
            : "No attendance records found for this timeframe."
        }
        footer={
          filteredEmployees.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              total={filteredEmployees.length}
              pageSize={pageSize}
              label="employees"
            />
          )
        }
      >
        <div className="p-2 sm:p-0">
          <table className="w-full min-w-[840px] text-left text-sm">
            <thead>
              <tr className="border-b border-border/80 bg-muted/40 text-xs font-semibold text-muted-foreground">
                <th
                  className="px-5 py-3.5 cursor-pointer hover:text-foreground transition-colors"
                  onClick={() => handleSort("name")}
                >
                  <div className="flex items-center gap-1.5">
                    <span>Employee</span>
                    <ArrowUpDown className="h-3 w-3 text-muted-foreground/70" />
                  </div>
                </th>
                <th className="px-5 py-3.5">Department</th>
                <th
                  className="px-5 py-3.5 text-center cursor-pointer hover:text-foreground transition-colors"
                  onClick={() => handleSort("present")}
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span>Present</span>
                    <ArrowUpDown className="h-3 w-3 text-muted-foreground/70" />
                  </div>
                </th>
                <th className="px-5 py-3.5 text-center">Late</th>
                <th className="px-5 py-3.5 text-center">Absent</th>
                <th className="px-5 py-3.5 text-center">Leave</th>
                <th
                  className="px-5 py-3.5 cursor-pointer hover:text-foreground transition-colors"
                  onClick={() => handleSort("rate")}
                >
                  <div className="flex items-center gap-1.5">
                    <span>Attendance Rate</span>
                    <ArrowUpDown className="h-3 w-3 text-muted-foreground/70" />
                  </div>
                </th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {paginatedEmployees.map((e) => {
                const rate = e.attendanceRate;
                const isHigh = rate >= 90;
                const isMid = rate >= 75 && rate < 90;

                return (
                  <tr
                    key={e.id}
                    onClick={() => handleRowClick(e)}
                    className="group cursor-pointer transition-all duration-150 hover:bg-primary/5 active:scale-[0.998]"
                    title="Click to view detailed attendance report"
                  >
                    {/* Employee Profile */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-xs font-bold shadow-xs transition-transform group-hover:scale-105",
                            getAvatarColor(e.name)
                          )}
                        >
                          {getInitials(e.name)}
                        </div>
                        <div>
                          <div className="font-semibold text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">
                            <span>{e.name}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">{e.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Department */}
                    <td className="px-5 py-3.5 text-xs text-muted-foreground">
                      {e.department ? (
                        <span className="inline-flex items-center rounded-lg border border-border/70 bg-muted/30 px-2 py-0.5 text-xs font-medium text-foreground">
                          {e.department}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/60">—</span>
                      )}
                    </td>

                    {/* Present Days */}
                    <td className="px-5 py-3.5 text-center">
                      <span className="inline-flex items-center rounded-md bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        {e.presentDays}d
                      </span>
                    </td>

                    {/* Late Days */}
                    <td className="px-5 py-3.5 text-center">
                      {e.lateDays > 0 ? (
                        <span className="inline-flex items-center rounded-md bg-amber-500/10 px-2 py-0.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                          {e.lateDays}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground/60">0</span>
                      )}
                    </td>

                    {/* Absent Days */}
                    <td className="px-5 py-3.5 text-center">
                      {e.absentDays > 0 ? (
                        <span className="inline-flex items-center rounded-md bg-rose-500/10 px-2 py-0.5 text-xs font-bold text-rose-600 dark:text-rose-400">
                          {e.absentDays}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground/60">0</span>
                      )}
                    </td>

                    {/* Leave Days */}
                    <td className="px-5 py-3.5 text-center">
                      {e.leaveDays > 0 ? (
                        <span className="inline-flex items-center rounded-md bg-purple-500/10 px-2 py-0.5 text-xs font-bold text-purple-600 dark:text-purple-400">
                          {e.leaveDays}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground/60">0</span>
                      )}
                    </td>

                    {/* Rate Progress Bar & Percentage */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-20 rounded-full bg-muted/80 overflow-hidden shrink-0">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all duration-300",
                              isHigh
                                ? "bg-emerald-500"
                                : isMid
                                ? "bg-amber-500"
                                : "bg-rose-500"
                            )}
                            style={{ width: `${Math.min(rate, 100)}%` }}
                          />
                        </div>
                        <span
                          className={cn(
                            "text-xs font-bold tabular-nums",
                            isHigh
                              ? "text-emerald-600 dark:text-emerald-400"
                              : isMid
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-rose-600 dark:text-rose-400"
                          )}
                        >
                          {rate}%
                        </span>
                      </div>
                    </td>

                    {/* Action Arrow */}
                    <td className="px-5 py-3.5 text-right">
                      <div className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground group-hover:text-primary transition-colors">
                        <span className="hidden sm:inline">Details</span>
                        <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </ReportTableShell>
    </div>
  );
}
