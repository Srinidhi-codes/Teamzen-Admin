"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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
import { Pagination } from "@/components/common/Pagination";
import type { WorkforceReport, WorkforceEmployeeRow } from "@/lib/graphql/reports/types";
import {
  Search,
  ChevronRight,
  ArrowUpDown,
  UserCheck,
  UserX,
  Users,
  Building,
  Briefcase,
  ExternalLink,
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

export function WorkforceReportView({
  report,
  loading,
  error,
}: {
  report?: WorkforceReport;
  loading?: boolean;
  error?: Error | null;
}) {
  const router = useRouter();

  // Search & Filter state
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [sortBy, setSortBy] = useState<"name" | "department" | "joined">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const series = useMemo(() => {
    if (!report?.headcountSeries) return [];
    return report.headcountSeries.map((p) => ({
      month: p.label,
      headcount: p.value,
      hires: p.secondary ?? 0,
      exits: p.tertiary ?? 0,
    }));
  }, [report?.headcountSeries]);

  // Unique departments for filter dropdown
  const departments = useMemo(() => {
    if (!report?.employees) return [];
    const set = new Set<string>();
    report.employees.forEach((e) => {
      if (e.department) set.add(e.department);
    });
    return Array.from(set).sort();
  }, [report?.employees]);

  // Filtered employees
  const filteredEmployees = useMemo(() => {
    if (!report?.employees) return [];
    let list = report.employees.filter((e) => {
      const matchSearch =
        search.trim() === "" ||
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.email.toLowerCase().includes(search.toLowerCase()) ||
        (e.department && e.department.toLowerCase().includes(search.toLowerCase())) ||
        (e.designation && e.designation.toLowerCase().includes(search.toLowerCase()));

      const matchDept = selectedDept === "ALL" || e.department === selectedDept;

      const matchStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && e.isActive) ||
        (statusFilter === "INACTIVE" && !e.isActive);

      return matchSearch && matchDept && matchStatus;
    });

    list.sort((a, b) => {
      let cmp = 0;
      if (sortBy === "name") cmp = a.name.localeCompare(b.name);
      else if (sortBy === "department") cmp = (a.department || "").localeCompare(b.department || "");
      else if (sortBy === "joined") cmp = (a.dateOfJoining || "").localeCompare(b.dateOfJoining || "");

      return sortOrder === "asc" ? cmp : -cmp;
    });

    return list;
  }, [report?.employees, search, selectedDept, statusFilter, sortBy, sortOrder]);

  // Pagination slicing
  const totalPages = Math.ceil(filteredEmployees.length / pageSize) || 1;
  const paginatedEmployees = useMemo(() => {
    const from = (currentPage - 1) * pageSize;
    return filteredEmployees.slice(from, from + pageSize);
  }, [filteredEmployees, currentPage, pageSize]);

  const handleRowClick = (emp: WorkforceEmployeeRow) => {
    router.push(`/attendance/report?employeeId=${emp.id}`);
  };

  const handleSort = (field: "name" | "department" | "joined") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  if (error) return <ReportError message={error.message} />;
  if (loading || !report) return <ReportLoadingBlocks />;

  return (
    <div className="space-y-6">
      {/* ── KPI Strip ─────────────────────────────────────────────────── */}
      <ReportKpiStrip kpis={report.kpis} />

      {/* ── Headcount Trend Chart ─────────────────────────────────────── */}
      <ChartPanel
        title="Workforce Headcount Progression"
        subtitle="Active personnel capacity, recruitment velocity, and attrition over time"
        empty={!series.length}
      >
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={series}
              margin={{ top: 10, right: 20, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.6} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} allowDecimals={false} />
              <Tooltip {...chartTooltipProps} />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
              <Line
                type="monotone"
                dataKey="headcount"
                stroke="var(--primary)"
                strokeWidth={2.5}
                dot={{ r: 4 }}
                name="Headcount"
              />
              <Line
                type="monotone"
                dataKey="hires"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 3 }}
                name="New Hires"
              />
              <Line
                type="monotone"
                dataKey="exits"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ r: 3 }}
                name="Departures"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ChartPanel>

      {/* ── Department & Employment Type Breakdown ───────────────────── */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <ChartPanel
          title="Headcount by Department"
          subtitle="Distribution of workforce across organizational divisions"
          empty={!report.departmentBreakdown.length}
        >
          <div className="h-[270px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={report.departmentBreakdown}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={95}
                  paddingAngle={3}
                >
                  {report.departmentBreakdown.map((d, i) => (
                    <Cell
                      key={d.name}
                      fill={d.color || `hsl(${i * 45 + 200} 70% 50%)`}
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
          title="Employment Classification"
          subtitle="Full-time, part-time, contract, and intern allocation"
          empty={!report.employmentTypeBreakdown.length}
        >
          <div className="h-[270px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={report.employmentTypeBreakdown}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={95}
                  paddingAngle={3}
                >
                  {report.employmentTypeBreakdown.map((d, i) => (
                    <Cell
                      key={d.name}
                      fill={d.color || `hsl(${i * 60 + 40} 70% 50%)`}
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
      </div>

      {/* ── Employees Directory Table ─────────────────────────────────── */}
      <ReportTableShell
        title="Employee Roster"
        subtitle="Click any employee row to open their attendance analytics and timeline record"
        action={
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search */}
            <div className="relative w-full sm:w-52">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search employees..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-8.5 w-full rounded-xl border border-border bg-background pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Department */}
            {departments.length > 0 && (
              <select
                value={selectedDept}
                onChange={(e) => {
                  setSelectedDept(e.target.value);
                  setCurrentPage(1);
                }}
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

            {/* Status Tabs */}
            <div className="flex items-center gap-1 rounded-xl border border-border bg-background p-0.5">
              {(["ALL", "ACTIVE", "INACTIVE"] as const).map((st) => (
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

            {/* Page Size */}
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
          search || selectedDept !== "ALL" || statusFilter !== "ALL"
            ? "No employees match your search or filter criteria."
            : "No employee records found."
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
        <table className="w-full min-w-[780px] text-left text-sm">
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
              <th
                className="px-5 py-3.5 cursor-pointer hover:text-foreground transition-colors"
                onClick={() => handleSort("department")}
              >
                <div className="flex items-center gap-1.5">
                  <span>Department</span>
                  <ArrowUpDown className="h-3 w-3 text-muted-foreground/70" />
                </div>
              </th>
              <th className="px-5 py-3.5">Designation</th>
              <th
                className="px-5 py-3.5 cursor-pointer hover:text-foreground transition-colors"
                onClick={() => handleSort("joined")}
              >
                <div className="flex items-center gap-1.5">
                  <span>Date of Joining</span>
                  <ArrowUpDown className="h-3 w-3 text-muted-foreground/70" />
                </div>
              </th>
              <th className="px-5 py-3.5 text-center">Status</th>
              <th className="px-5 py-3.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {paginatedEmployees.map((e) => (
              <tr
                key={e.id}
                onClick={() => handleRowClick(e)}
                className="group cursor-pointer transition-all duration-150 hover:bg-primary/5 active:scale-[0.998]"
                title="Click to view employee attendance & timeline"
              >
                {/* Name */}
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
                      <div className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {e.name}
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

                {/* Designation */}
                <td className="px-5 py-3.5 text-xs text-muted-foreground">
                  {e.designation || "—"}
                </td>

                {/* Joining */}
                <td className="px-5 py-3.5 tabular-nums text-xs text-muted-foreground">
                  {e.dateOfJoining || "—"}
                </td>

                {/* Status */}
                <td className="px-5 py-3.5 text-center">
                  {e.isActive ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Active</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                      <span>Inactive</span>
                    </span>
                  )}
                </td>

                {/* Action */}
                <td className="px-5 py-3.5 text-right">
                  <div className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground group-hover:text-primary transition-colors">
                    <span className="hidden sm:inline">Inspect</span>
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
