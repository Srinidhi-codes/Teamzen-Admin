"use client";

import { useEffect, useMemo, useState } from "react";
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
  ResponsiveContainer,
} from "recharts";
import { Pagination } from "@/components/common/Pagination";
import { OrganizationFilterSelect } from "@/components/common/OrganizationFilterSelect";
import { PageHeader } from "@/components/common/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCSVExport } from "@/lib/hooks/useCSVExport";
import { useGraphQLUsers } from "@/lib/graphql/users/userHook";
import {
  usePerformanceOverview,
  usePerformanceCycles,
  usePerformanceGoals,
  usePerformanceReviews,
  usePerformanceMutations,
} from "@/lib/graphql/performance/performanceHook";
import type {
  PerformanceCycle,
  PerformanceGoal,
  PerformanceReview,
} from "@/lib/graphql/performance/types";
import { chartTooltipProps } from "@/components/reports/ReportShared";
import {
  Download,
  Plus,
  Trash2,
  Users,
  TrendingUp,
  Target,
  CheckSquare,
  Layers,
  Award,
  Calendar,
  Clock,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  X,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";

const RATING_COLORS = [
  "#38ABB1", // Teal
  "#10B981", // Emerald
  "#F59E0B", // Amber
  "#EF4444", // Rose
  "#8B5CF6", // Purple
];

function KpiCard({
  label,
  value,
  hint,
  icon: Icon,
  colorClass,
  progress,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: any;
  colorClass: string;
  progress?: number;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-xs transition-all duration-200 hover:shadow-md">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground truncate">
          {label}
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
          {value}
        </p>
        {hint && (
          <p className="mt-1 text-xs font-medium text-muted-foreground/90">{hint}</p>
        )}
        {progress !== undefined && (
          <div className="mt-2.5 h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function OverviewTab({ organizationId }: { organizationId: string }) {
  const { overview, isLoading, error } = usePerformanceOverview(
    organizationId || undefined
  );

  if (error) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center">
        <AlertCircle className="mx-auto h-8 w-8 text-destructive mb-2" />
        <h3 className="text-sm font-semibold text-foreground">Performance Overview Error</h3>
        <p className="mt-1 text-xs text-destructive">{(error as Error).message}</p>
      </div>
    );
  }

  if (isLoading || !overview) {
    return (
      <div className="space-y-5 animate-pulse">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl border border-border bg-muted/30" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="h-80 rounded-2xl border border-border bg-muted/30" />
          <div className="h-80 rounded-2xl border border-border bg-muted/30" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── KPI Strip ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          label="Active Cycles"
          value={overview.activeCycles}
          hint="Ongoing evaluation periods"
          icon={Layers}
          colorClass="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20"
        />
        <KpiCard
          label="Completion Rate"
          value={`${overview.completionRate}%`}
          hint={`${overview.completedReviews} reviews closed`}
          icon={CheckSquare}
          colorClass="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
          progress={overview.completionRate}
        />
        <KpiCard
          label="Pending Reviews"
          value={overview.pendingReviews}
          hint="Awaiting manager or self review"
          icon={Clock}
          colorClass="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
        />
        <KpiCard
          label="Goals On Track"
          value={overview.goalsOnTrack}
          hint={`${overview.goalsAtRisk} goals at risk`}
          icon={Target}
          colorClass="bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20"
        />
      </div>

      {/* ── Visual Analytics ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Rating Distribution Donut */}
        <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-border/70 bg-muted/20 px-5 py-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                <Award className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-foreground">Rating Distribution</h2>
                <p className="text-[11px] text-muted-foreground">Evaluation scores across completed cycles</p>
              </div>
            </div>
            <span className="rounded-full border border-border bg-muted/50 px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
              Ratings
            </span>
          </div>

          <div className="p-5">
            {overview.ratingDistribution.length === 0 ? (
              <div className="flex h-[260px] flex-col items-center justify-center gap-2 text-center text-muted-foreground">
                <Award className="h-8 w-8 opacity-30" />
                <p className="text-xs font-medium">No completed ratings submitted yet.</p>
              </div>
            ) : (
              <div className="flex h-[260px] flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative h-[200px] w-full sm:h-full sm:w-1/2 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={overview.ratingDistribution}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={54}
                        outerRadius={82}
                        paddingAngle={3}
                      >
                        {overview.ratingDistribution.map((_, i) => (
                          <Cell
                            key={i}
                            fill={RATING_COLORS[i % RATING_COLORS.length]}
                            stroke="var(--card)"
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <Tooltip {...chartTooltipProps} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                    <Star className="h-4 w-4 text-amber-400 fill-amber-400 mb-0.5" />
                    <span className="text-xs font-bold text-foreground">Ratings</span>
                  </div>
                </div>

                <ul className="custom-scrollbar max-h-[220px] w-full space-y-2 overflow-y-auto pr-1 sm:w-1/2">
                  {overview.ratingDistribution.map((entry, index) => (
                    <li
                      key={index}
                      className="flex items-center justify-between gap-3 rounded-lg border border-border/40 bg-muted/20 px-2.5 py-1.5 text-xs"
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: RATING_COLORS[index % RATING_COLORS.length] }}
                        />
                        <span className="truncate font-medium text-foreground">{entry.name}</span>
                      </span>
                      <span className="font-bold tabular-nums text-foreground">{entry.value}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>

        {/* Goal Attainment by Department */}
        <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-border/70 bg-muted/20 px-5 py-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                <Target className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-foreground">Goal Attainment</h2>
                <p className="text-[11px] text-muted-foreground">Department target completion rate %</p>
              </div>
            </div>
            <span className="rounded-full border border-border bg-muted/50 px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
              By Team
            </span>
          </div>

          <div className="p-5">
            {overview.goalByDepartment.length === 0 ? (
              <div className="flex h-[260px] flex-col items-center justify-center gap-2 text-center text-muted-foreground">
                <Target className="h-8 w-8 opacity-30" />
                <p className="text-xs font-medium">No department goals defined yet.</p>
              </div>
            ) : (
              <div className="h-[260px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={overview.goalByDepartment}
                    margin={{ top: 12, right: 12, left: -16, bottom: 0 }}
                  >
                    <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" opacity={0.6} />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                      dy={8}
                    />
                    <YAxis
                      unit="%"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                    />
                    <Tooltip {...chartTooltipProps} />
                    <Bar
                      dataKey="value"
                      fill="#38ABB1"
                      radius={[6, 6, 0, 0]}
                      name="Attainment %"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function CyclesTab({ organizationId }: { organizationId: string }) {
  const { cycles, isLoading, error } = usePerformanceCycles(
    organizationId || undefined
  );
  const { createCycle, updateCycle, deleteCycle, seedReviews, loading } =
    usePerformanceMutations();
  const [showForm, setShowForm] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [form, setForm] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    setPage(1);
  }, [cycles]);

  const totalPages = Math.ceil(cycles.length / pageSize) || 1;
  const paginatedCycles = useMemo(() => {
    const start = (page - 1) * pageSize;
    return cycles.slice(start, start + pageSize);
  }, [cycles, page, pageSize]);

  const submit = async () => {
    if (!form.name || !form.startDate || !form.endDate) return;
    await createCycle({
      name: form.name,
      description: form.description,
      startDate: form.startDate,
      endDate: form.endDate,
      organizationId: organizationId || undefined,
    });
    setShowForm(false);
    setForm({ name: "", description: "", startDate: "", endDate: "" });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-foreground">Review Cycles</h3>
          <p className="text-xs text-muted-foreground">Manage organization-wide evaluation windows</p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          {showForm ? "Cancel" : "New Review Cycle"}
        </button>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-primary/20 bg-card p-5 shadow-sm space-y-4">
          <h4 className="text-sm font-bold text-foreground">Configure New Performance Cycle</h4>
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Cycle Name</label>
              <input
                className="h-10 w-full rounded-xl border border-border bg-background px-3 text-xs"
                placeholder="e.g. Q4 2026 Appraisal Cycle"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Description (Optional)</label>
              <input
                className="h-10 w-full rounded-xl border border-border bg-background px-3 text-xs"
                placeholder="Brief guidelines or notes"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Start Date</label>
              <input
                type="date"
                className="h-10 w-full rounded-xl border border-border bg-background px-3 text-xs"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">End Date</label>
              <input
                type="date"
                className="h-10 w-full rounded-xl border border-border bg-background px-3 text-xs"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="h-9 rounded-lg border border-border bg-background px-4 text-xs font-semibold text-muted-foreground hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={submit}
              className="h-9 rounded-lg bg-primary px-5 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-50"
            >
              Create Cycle
            </button>
          </div>
        </div>
      )}

      {/* Cycles Table */}
      <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        {isLoading ? (
          <div className="h-44 animate-pulse bg-muted/40" />
        ) : cycles.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 px-5 py-14 text-center text-muted-foreground">
            <Layers className="h-8 w-8 opacity-30" />
            <p className="text-xs font-medium">No review cycles configured yet. Click above to create one.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-muted-foreground font-semibold">
                  <th className="px-5 py-3.5">Cycle Name</th>
                  <th className="px-5 py-3.5">Timeline</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Review Progress</th>
                  <th className="px-5 py-3.5">Goals</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {paginatedCycles.map((c: PerformanceCycle) => {
                  const progressPct = c.reviewCount > 0
                    ? Math.round((c.completedReviews / c.reviewCount) * 100)
                    : 0;

                  return (
                    <tr key={c.id} className="transition-colors hover:bg-muted/30">
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-foreground">{c.name}</div>
                        {c.description && (
                          <div className="text-[11px] text-muted-foreground line-clamp-1">
                            {c.description}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3.5 tabular-nums text-muted-foreground font-medium">
                        {c.startDate} <span className="opacity-40">→</span> {c.endDate}
                      </td>
                      <td className="px-5 py-3.5">
                        <Select
                          value={c.status}
                          onValueChange={(status) =>
                            updateCycle({ id: c.id, status })
                          }
                        >
                          <SelectTrigger className="h-8 w-[115px] rounded-lg text-xs font-semibold">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-20 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full"
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                          <span className="font-mono text-[11px] font-bold text-foreground">
                            {c.completedReviews}/{c.reviewCount}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 tabular-nums font-bold text-foreground">
                        {c.goalCount}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            title="Seed reviews for all eligible employees"
                            disabled={loading}
                            onClick={() => seedReviews(c.id)}
                            className="inline-flex h-8 items-center gap-1 rounded-lg border border-border bg-background px-2.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer"
                          >
                            <Users className="h-3.5 w-3.5 text-primary" />
                            Seed
                          </button>
                          <button
                            type="button"
                            title="Delete cycle"
                            disabled={loading}
                            onClick={() => {
                              if (confirm(`Delete cycle "${c.name}"?`)) {
                                deleteCycle(c.id);
                              }
                            }}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="border-t border-border p-3.5 bg-muted/10">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
              total={cycles.length}
              pageSize={pageSize}
              label="cycles"
            />
          </div>
        )}
      </section>
    </div>
  );
}

function ReviewsTab({ organizationId }: { organizationId: string }) {
  const [cycleId, setCycleId] = useState("");
  const [selected, setSelected] = useState<PerformanceReview | null>(null);
  const { cycles } = usePerformanceCycles(organizationId || undefined);
  const { reviews, isLoading, error } = usePerformanceReviews({
    organizationId: organizationId || undefined,
    cycleId: cycleId || undefined,
  });
  const { updateReview, loading } = usePerformanceMutations();
  const { exportData } = useCSVExport();
  const [mgrScore, setMgrScore] = useState("");
  const [mgrComments, setMgrComments] = useState("");

  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    setPage(1);
  }, [reviews, cycleId]);

  const totalPages = Math.ceil(reviews.length / pageSize) || 1;
  const paginatedReviews = useMemo(() => {
    const start = (page - 1) * pageSize;
    return reviews.slice(start, start + pageSize);
  }, [reviews, page, pageSize]);

  const openReview = (r: PerformanceReview) => {
    setSelected(r);
    setMgrScore(r.managerScore != null ? String(r.managerScore) : "");
    setMgrComments(r.managerComments || "");
  };

  const completeReview = async () => {
    if (!selected) return;
    await updateReview({
      id: selected.id,
      managerScore: mgrScore ? parseFloat(mgrScore) : null,
      managerComments: mgrComments,
      status: "completed",
    });
    setSelected(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={cycleId || "__all__"}
            onValueChange={(v) => setCycleId(v === "__all__" ? "" : v)}
          >
            <SelectTrigger className="h-10 w-[230px] rounded-xl text-xs font-semibold">
              <SelectValue placeholder="All cycles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All cycles</SelectItem>
              {cycles.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <button
          type="button"
          onClick={() =>
            exportData(
              reviews,
              [
                { accessor: "employeeName", header: "Employee" },
                { accessor: "cycleName", header: "Cycle" },
                { accessor: "status", header: "Status" },
                { accessor: "selfScore", header: "Self score" },
                { accessor: "managerScore", header: "Manager score" },
                { accessor: "department", header: "Department" },
              ],
              { filename: "performance-reviews" }
            )
          }
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-background px-4 text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer"
        >
          <Download className="h-4 w-4" />
          Export Reviews CSV
        </button>
      </div>

      {error && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-xs text-destructive">
          {(error as Error).message}
        </div>
      )}

      {/* Reviews Table */}
      <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        {isLoading ? (
          <div className="h-44 animate-pulse bg-muted/40" />
        ) : reviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 px-5 py-14 text-center text-muted-foreground">
            <CheckSquare className="h-8 w-8 opacity-30" />
            <p className="text-xs font-medium">No reviews logged yet. Activate a cycle and click Seed.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-muted-foreground font-semibold">
                  <th className="px-5 py-3.5">Employee</th>
                  <th className="px-5 py-3.5">Review Cycle</th>
                  <th className="px-5 py-3.5">Assigned Manager</th>
                  <th className="px-5 py-3.5">Self Score</th>
                  <th className="px-5 py-3.5">Manager Score</th>
                  <th className="px-5 py-3.5">Review Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {paginatedReviews.map((r) => (
                  <tr
                    key={r.id}
                    className="cursor-pointer transition-colors hover:bg-muted/30"
                    onClick={() => openReview(r)}
                  >
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-foreground">{r.employeeName}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {r.department || "General"}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-medium text-foreground">{r.cycleName}</td>
                    <td className="px-5 py-3.5 text-muted-foreground font-medium">
                      {r.reviewerName || "Unassigned"}
                    </td>
                    <td className="px-5 py-3.5">
                      {r.selfScore != null ? (
                        <span className="rounded-md bg-muted px-2 py-0.5 font-bold font-mono text-foreground">
                          {r.selfScore} / 5
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      {r.managerScore != null ? (
                        <span className="rounded-md bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 font-bold font-mono">
                          {r.managerScore} / 5
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={cn(
                          "rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border",
                          r.status === "completed"
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
                            : "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30"
                        )}
                      >
                        {r.status.replace("_", " ")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="border-t border-border p-3.5 bg-muted/10">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
              total={reviews.length}
              pageSize={pageSize}
              label="reviews"
            />
          </div>
        )}
      </section>

      {/* Review Dialog */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95 space-y-4">
            <div className="flex items-start justify-between border-b border-border/70 pb-3">
              <div>
                <h3 className="text-base font-bold text-foreground">{selected.employeeName}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {selected.cycleName} • <span className="capitalize">{selected.status.replace("_", " ")}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="rounded-xl border border-border/70 bg-muted/20 p-3.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                  Employee Self-Assessment
                </span>
                <p className="font-semibold text-foreground">
                  Score: {selected.selfScore ?? "—"} / 5
                </p>
                <p className="mt-1 text-muted-foreground">
                  {selected.selfComments || "No self-comments provided."}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Manager Rating Score (1 to 5)
                </label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  step={0.5}
                  className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm font-semibold"
                  value={mgrScore}
                  onChange={(e) => setMgrScore(e.target.value)}
                  placeholder="e.g. 4.5"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Evaluation Feedback & Remarks
                </label>
                <textarea
                  className="w-full rounded-xl border border-border bg-background p-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                  rows={4}
                  value={mgrComments}
                  onChange={(e) => setMgrComments(e.target.value)}
                  placeholder="Summarize strengths, milestone deliveries, and areas for improvement..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-border/70">
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="h-9 rounded-xl border border-border px-4 text-xs font-semibold text-muted-foreground hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={completeReview}
                className="h-9 rounded-xl bg-primary px-5 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-50"
              >
                Confirm Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function GoalsTab({ organizationId }: { organizationId: string }) {
  const [search, setSearch] = useState("");
  const { goals, isLoading, error } = usePerformanceGoals({
    organizationId: organizationId || undefined,
    search: search || undefined,
  });
  const { cycles } = usePerformanceCycles(organizationId || undefined);
  const { users } = useGraphQLUsers({
    page: 1,
    pageSize: 200,
    filters: {
      isActive: true,
      organizationId: organizationId || undefined,
    },
  });
  const { createGoal, updateGoal, deleteGoal, loading } = usePerformanceMutations();
  const { exportData } = useCSVExport();
  const [showForm, setShowForm] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    setPage(1);
  }, [goals, search]);

  const totalPages = Math.ceil(goals.length / pageSize) || 1;
  const paginatedGoals = useMemo(() => {
    const start = (page - 1) * pageSize;
    return goals.slice(start, start + pageSize);
  }, [goals, page, pageSize]);

  const [form, setForm] = useState({
    title: "",
    target: "",
    cycleId: "",
    userId: "",
    progress: 0,
    status: "not_started",
  });

  const submit = async () => {
    if (!form.title || !form.userId) return;
    await createGoal({
      title: form.title,
      target: form.target,
      cycleId: form.cycleId || undefined,
      userId: form.userId,
      progress: form.progress,
      status: form.status,
      organizationId: organizationId || undefined,
    });
    setShowForm(false);
    setForm({
      title: "",
      target: "",
      cycleId: "",
      userId: "",
      progress: 0,
      status: "not_started",
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative min-w-[240px] flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            className="h-10 w-full rounded-xl border border-border bg-card pl-9 pr-3 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="Search objectives or employees…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              exportData(
                goals,
                [
                  { accessor: "title", header: "Goal" },
                  { accessor: "userName", header: "Owner" },
                  { accessor: "progress", header: "Progress %" },
                  { accessor: "status", header: "Status" },
                  { accessor: "cycleName", header: "Cycle" },
                ],
                { filename: "goals-tracking" }
              )
            }
            className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-border bg-background px-3.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            {showForm ? "Cancel" : "Add Goal"}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-primary/20 bg-card p-5 shadow-sm space-y-4">
          <h4 className="text-sm font-bold text-foreground">Create Employee Performance Objective</h4>
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Goal Title</label>
              <input
                className="h-10 w-full rounded-xl border border-border bg-background px-3 text-xs"
                placeholder="e.g. Deliver Real-Time Notifications Engine"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Target / Deliverable</label>
              <input
                className="h-10 w-full rounded-xl border border-border bg-background px-3 text-xs"
                placeholder="e.g. 99.9% uptime and <200ms latency"
                value={form.target}
                onChange={(e) => setForm({ ...form, target: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Assigned Employee</label>
              <Select
                value={form.userId}
                onValueChange={(userId) => setForm({ ...form, userId })}
              >
                <SelectTrigger className="h-10 rounded-xl text-xs">
                  <SelectValue placeholder="Select team member" />
                </SelectTrigger>
                <SelectContent>
                  {(users || []).map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.firstName} {u.lastName} ({u.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Evaluation Cycle</label>
              <Select
                value={form.cycleId}
                onValueChange={(cycleId) => setForm({ ...form, cycleId })}
              >
                <SelectTrigger className="h-10 rounded-xl text-xs">
                  <SelectValue placeholder="Select cycle" />
                </SelectTrigger>
                <SelectContent>
                  {cycles.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="h-9 rounded-lg border border-border bg-background px-4 text-xs font-semibold text-muted-foreground hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={submit}
              className="h-9 rounded-lg bg-primary px-5 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-50"
            >
              Save Goal
            </button>
          </div>
        </div>
      )}

      {/* Goals Table */}
      <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        {isLoading ? (
          <div className="h-44 animate-pulse bg-muted/40" />
        ) : goals.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 px-5 py-14 text-center text-muted-foreground">
            <Target className="h-8 w-8 opacity-30" />
            <p className="text-xs font-medium">No performance goals found. Click Add Goal to create one.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-muted-foreground font-semibold">
                  <th className="px-5 py-3.5">Objective Title</th>
                  <th className="px-5 py-3.5">Goal Owner</th>
                  <th className="px-5 py-3.5">Progress Meter</th>
                  <th className="px-5 py-3.5">Goal Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {paginatedGoals.map((g: PerformanceGoal) => {
                  return (
                    <tr key={g.id} className="transition-colors hover:bg-muted/30">
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-foreground">{g.title}</div>
                        <div className="text-[11px] text-muted-foreground">
                          {g.cycleName || "Stand-alone"}
                          {g.target ? ` • ${g.target}` : ""}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-foreground">{g.userName}</div>
                        <div className="text-[11px] text-muted-foreground">{g.department || "General"}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="h-2 w-28 overflow-hidden rounded-full bg-muted">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all",
                                g.progress >= 80
                                  ? "bg-emerald-500"
                                  : g.progress >= 40
                                  ? "bg-teal-500"
                                  : "bg-amber-500"
                              )}
                              style={{ width: `${g.progress}%` }}
                            />
                          </div>
                          <span className="tabular-nums font-mono font-bold text-foreground">
                            {g.progress}%
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <Select
                          value={g.status}
                          onValueChange={(status) =>
                            updateGoal({ id: g.id, status })
                          }
                        >
                          <SelectTrigger className="h-8 w-[130px] rounded-lg text-xs font-semibold">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="not_started">Not started</SelectItem>
                            <SelectItem value="in_progress">In progress</SelectItem>
                            <SelectItem value="at_risk">At risk</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          type="button"
                          disabled={loading}
                          onClick={() => {
                            if (confirm("Delete this goal?")) deleteGoal(g.id);
                          }}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="border-t border-border p-3.5 bg-muted/10">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
              total={goals.length}
              pageSize={pageSize}
              label="goals"
            />
          </div>
        )}
      </section>
    </div>
  );
}

export default function PerformancePage() {
  const [organizationId, setOrganizationId] = useState("");
  const [tab, setTab] = useState("overview");

  const tabMeta: Record<string, { label: string; desc: string; icon: any }> = {
    overview: {
      label: "Overview",
      desc: "Completion rates, rating distribution, and goal health",
      icon: TrendingUp,
    },
    cycles: {
      label: "Cycles",
      desc: "Configure review cycle windows and review seeding",
      icon: Layers,
    },
    reviews: {
      label: "Reviews",
      desc: "Manager evaluations and employee self-assessment inbox",
      icon: CheckSquare,
    },
    goals: {
      label: "Goals",
      desc: "Objective progress meters and performance milestones",
      icon: Target,
    },
  };

  const currentMeta = tabMeta[tab] || tabMeta.overview;

  return (
    <div className="w-full space-y-6 pb-10">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <PageHeader
        title="Performance & Talent"
        description={currentMeta.desc}
        actions={
          <OrganizationFilterSelect
            value={organizationId}
            onChange={setOrganizationId}
            placeholder="Select organization"
          />
        }
      />

      {/* ── Main Tabbed Architecture ───────────────────────────────── */}
      <Tabs value={tab} onValueChange={setTab} className="space-y-5">
        <TabsList className="h-auto w-full flex-wrap justify-start gap-1.5 rounded-2xl border border-border bg-card p-1.5 shadow-xs sm:w-fit">
          {Object.entries(tabMeta).map(([key, meta]) => {
            const Icon = meta.icon;
            const isSelected = tab === key;

            return (
              <TabsTrigger
                key={key}
                value={key}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all duration-200 cursor-pointer",
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{meta.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <div>
          <TabsContent value="overview" className="mt-0">
            <OverviewTab organizationId={organizationId} />
          </TabsContent>
          <TabsContent value="cycles" className="mt-0">
            <CyclesTab organizationId={organizationId} />
          </TabsContent>
          <TabsContent value="reviews" className="mt-0">
            <ReviewsTab organizationId={organizationId} />
          </TabsContent>
          <TabsContent value="goals" className="mt-0">
            <GoalsTab organizationId={organizationId} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
