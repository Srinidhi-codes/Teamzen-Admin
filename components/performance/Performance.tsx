"use client";

import { useMemo, useState } from "react";
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
import { PageHeader } from "@/components/common/PageHeader";
import { OrganizationFilterSelect } from "@/components/common/OrganizationFilterSelect";
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
import { chartTooltipStyle } from "@/components/reports/ReportShared";
import { Download, Plus, Trash2, Users } from "lucide-react";

const COLORS = [
  "oklch(0.55 0.14 250)",
  "oklch(0.6 0.14 150)",
  "oklch(0.7 0.15 70)",
  "oklch(0.55 0.2 25)",
];

function Kpi({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function OverviewTab({ organizationId }: { organizationId: string }) {
  const { overview, isLoading, error } = usePerformanceOverview(
    organizationId || undefined
  );

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
        {(error as Error).message}
      </div>
    );
  }

  if (isLoading || !overview) {
    return (
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-[88px] animate-pulse rounded-xl border border-border bg-muted/40" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Active cycles" value={overview.activeCycles} />
        <Kpi
          label="Completion rate"
          value={`${overview.completionRate}%`}
          hint={`${overview.completedReviews} completed`}
        />
        <Kpi label="Pending reviews" value={overview.pendingReviews} />
        <Kpi
          label="Goals on track"
          value={overview.goalsOnTrack}
          hint={`${overview.goalsAtRisk} at risk`}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-card">
          <div className="border-b border-border px-5 py-3.5">
            <h2 className="text-sm font-semibold">Rating distribution</h2>
          </div>
          <div className="p-4">
            {overview.ratingDistribution.length === 0 ? (
              <div className="flex h-[240px] items-center justify-center text-sm text-muted-foreground">
                No completed ratings yet.
              </div>
            ) : (
              <div className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={overview.ratingDistribution}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={85}
                    >
                      {overview.ratingDistribution.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={chartTooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card">
          <div className="border-b border-border px-5 py-3.5">
            <h2 className="text-sm font-semibold">Goal attainment by department</h2>
          </div>
          <div className="p-4">
            {overview.goalByDepartment.length === 0 ? (
              <div className="flex h-[240px] items-center justify-center text-sm text-muted-foreground">
                No goals yet.
              </div>
            ) : (
              <div className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={overview.goalByDepartment}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis unit="%" tick={{ fontSize: 12 }} />
                    <Tooltip contentStyle={chartTooltipStyle} />
                    <Bar dataKey="value" fill="var(--primary)" name="Attainment %" />
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
  const [form, setForm] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    status: "draft",
  });

  const submit = async () => {
    if (!form.name || !form.startDate || !form.endDate) return;
    await createCycle({
      ...form,
      organizationId: organizationId || undefined,
    });
    setShowForm(false);
    setForm({ name: "", description: "", startDate: "", endDate: "", status: "draft" });
  };

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
        {(error as Error).message}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          New cycle
        </button>
      </div>

      {showForm && (
        <div className="grid grid-cols-1 gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-3">
          <input
            className="h-9 rounded-md border border-border bg-background px-3 text-sm"
            placeholder="Cycle name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            type="date"
            className="h-9 rounded-md border border-border bg-background px-3 text-sm"
            value={form.startDate}
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
          />
          <input
            type="date"
            className="h-9 rounded-md border border-border bg-background px-3 text-sm"
            value={form.endDate}
            onChange={(e) => setForm({ ...form, endDate: e.target.value })}
          />
          <input
            className="h-9 rounded-md border border-border bg-background px-3 text-sm sm:col-span-2"
            placeholder="Description (optional)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <button
            type="button"
            disabled={loading}
            onClick={submit}
            className="h-9 rounded-md bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            Create
          </button>
        </div>
      )}

      <section className="rounded-xl border border-border bg-card">
        {isLoading ? (
          <div className="h-40 animate-pulse bg-muted/40" />
        ) : cycles.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-muted-foreground">
            No review cycles yet. Create one to start performance reviews.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Cycle</th>
                  <th className="px-5 py-3 font-medium">Dates</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Reviews</th>
                  <th className="px-5 py-3 font-medium">Goals</th>
                  <th className="px-5 py-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {cycles.map((c: PerformanceCycle) => (
                  <tr key={c.id} className="border-b border-border/60 last:border-0">
                    <td className="px-5 py-3">
                      <div className="font-medium">{c.name}</div>
                      {c.description && (
                        <div className="text-xs text-muted-foreground line-clamp-1">
                          {c.description}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3 tabular-nums text-muted-foreground">
                      {c.startDate} → {c.endDate}
                    </td>
                    <td className="px-5 py-3">
                      <Select
                        value={c.status}
                        onValueChange={(status) =>
                          updateCycle({ id: c.id, status })
                        }
                      >
                        <SelectTrigger className="h-8 w-[120px] text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-5 py-3 tabular-nums">
                      {c.completedReviews}/{c.reviewCount}
                    </td>
                    <td className="px-5 py-3 tabular-nums">{c.goalCount}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          title="Seed reviews for all employees"
                          disabled={loading}
                          onClick={() => seedReviews(c.id)}
                          className="inline-flex h-8 items-center gap-1 rounded-md border border-border px-2 text-xs hover:bg-muted"
                        >
                          <Users className="h-3.5 w-3.5" />
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
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={cycleId || "__all__"}
          onValueChange={(v) => setCycleId(v === "__all__" ? "" : v)}
        >
          <SelectTrigger className="h-9 w-[220px]">
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
          className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border px-3 text-sm hover:bg-muted"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {(error as Error).message}
        </div>
      )}

      <section className="rounded-xl border border-border bg-card">
        {isLoading ? (
          <div className="h-40 animate-pulse bg-muted/40" />
        ) : reviews.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-muted-foreground">
            No reviews yet. Activate a cycle and seed reviews.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Employee</th>
                  <th className="px-5 py-3 font-medium">Cycle</th>
                  <th className="px-5 py-3 font-medium">Reviewer</th>
                  <th className="px-5 py-3 font-medium">Self</th>
                  <th className="px-5 py-3 font-medium">Manager</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((r) => (
                  <tr
                    key={r.id}
                    className="cursor-pointer border-b border-border/60 last:border-0 hover:bg-muted/40"
                    onClick={() => openReview(r)}
                  >
                    <td className="px-5 py-3">
                      <div className="font-medium">{r.employeeName}</div>
                      <div className="text-xs text-muted-foreground">
                        {r.department || "—"}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{r.cycleName}</td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {r.reviewerName || "—"}
                    </td>
                    <td className="px-5 py-3 tabular-nums">
                      {r.selfScore ?? "—"}
                    </td>
                    <td className="px-5 py-3 tabular-nums">
                      {r.managerScore ?? "—"}
                    </td>
                    <td className="px-5 py-3 capitalize">{r.status.replace("_", " ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div className="w-full max-w-lg rounded-xl border border-border bg-card p-5 shadow-lg">
            <h3 className="text-base font-semibold">{selected.employeeName}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {selected.cycleName} · {selected.status.replace("_", " ")}
            </p>
            <div className="mt-4 space-y-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Self assessment</p>
                <p className="mt-1">
                  Score: {selected.selfScore ?? "—"} — {selected.selfComments || "No comments"}
                </p>
              </div>
              <label className="block">
                <span className="text-xs text-muted-foreground">Manager score (1–5)</span>
                <input
                  type="number"
                  min={1}
                  max={5}
                  step={0.5}
                  className="mt-1 h-9 w-full rounded-md border border-border bg-background px-3"
                  value={mgrScore}
                  onChange={(e) => setMgrScore(e.target.value)}
                />
              </label>
              <label className="block">
                <span className="text-xs text-muted-foreground">Manager comments</span>
                <textarea
                  className="mt-1 min-h-[80px] w-full rounded-md border border-border bg-background px-3 py-2"
                  value={mgrComments}
                  onChange={(e) => setMgrComments(e.target.value)}
                />
              </label>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="h-9 rounded-md border border-border px-3 text-sm hover:bg-muted"
              >
                Close
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={completeReview}
                className="h-9 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                Complete review
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
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <input
          className="h-9 min-w-[200px] flex-1 rounded-md border border-border bg-background px-3 text-sm"
          placeholder="Search goals…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          type="button"
          onClick={() =>
            exportData(
              goals,
              [
                { accessor: "title", header: "Title" },
                { accessor: "userName", header: "Employee" },
                { accessor: "department", header: "Department" },
                { accessor: "progress", header: "Progress" },
                { accessor: "status", header: "Status" },
                { accessor: "cycleName", header: "Cycle" },
              ],
              { filename: "performance-goals" }
            )
          }
          className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border px-3 text-sm hover:bg-muted"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Add goal
        </button>
      </div>

      {showForm && (
        <div className="grid grid-cols-1 gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-3">
          <input
            className="h-9 rounded-md border border-border bg-background px-3 text-sm"
            placeholder="Goal title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <Select
            value={form.userId || "__none__"}
            onValueChange={(v) =>
              setForm({ ...form, userId: v === "__none__" ? "" : v })
            }
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Employee (required)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">Select employee…</SelectItem>
              {(users || []).map((u) => (
                <SelectItem key={u.id} value={String(u.id)}>
                  {[u.firstName, u.lastName].filter(Boolean).join(" ") || u.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input
            className="h-9 rounded-md border border-border bg-background px-3 text-sm"
            placeholder="Target"
            value={form.target}
            onChange={(e) => setForm({ ...form, target: e.target.value })}
          />
          <Select
            value={form.cycleId || "__none__"}
            onValueChange={(v) =>
              setForm({ ...form, cycleId: v === "__none__" ? "" : v })
            }
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Cycle (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">No cycle</SelectItem>
              {cycles.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <button
            type="button"
            disabled={loading || !form.title || !form.userId}
            onClick={submit}
            className="h-9 rounded-md bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            Create goal
          </button>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {(error as Error).message}
        </div>
      )}

      <section className="rounded-xl border border-border bg-card">
        {isLoading ? (
          <div className="h-40 animate-pulse bg-muted/40" />
        ) : goals.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-muted-foreground">
            No goals yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Goal</th>
                  <th className="px-5 py-3 font-medium">Owner</th>
                  <th className="px-5 py-3 font-medium">Progress</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {goals.map((g: PerformanceGoal) => (
                  <tr key={g.id} className="border-b border-border/60 last:border-0">
                    <td className="px-5 py-3">
                      <div className="font-medium">{g.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {g.cycleName || "No cycle"}
                        {g.target ? ` · ${g.target}` : ""}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div>{g.userName}</div>
                      <div className="text-xs text-muted-foreground">
                        {g.department || "—"}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${g.progress}%` }}
                          />
                        </div>
                        <span className="tabular-nums text-xs">{g.progress}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <Select
                        value={g.status}
                        onValueChange={(status) =>
                          updateGoal({ id: g.id, status })
                        }
                      >
                        <SelectTrigger className="h-8 w-[140px] text-xs">
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
                    <td className="px-5 py-3 text-right">
                      <button
                        type="button"
                        disabled={loading}
                        onClick={() => {
                          if (confirm("Delete this goal?")) deleteGoal(g.id);
                        }}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default function PerformancePage() {
  const [organizationId, setOrganizationId] = useState("");
  const [tab, setTab] = useState("overview");

  const description = useMemo(() => {
    const map: Record<string, string> = {
      overview: "Completion, ratings, and goal health",
      cycles: "Create and manage review cycles",
      reviews: "Inbox for self and manager reviews",
      goals: "Track goals and progress",
    };
    return map[tab] || "Reviews, goals, and performance cycles.";
  }, [tab]);

  return (
      <div className="page-shell">
        <PageHeader
          title="Performance"
          description={description}
          actions={
            <OrganizationFilterSelect
              value={organizationId}
              onChange={setOrganizationId}
              placeholder="Select organization"
            />
          }
        />

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="h-auto w-full flex-wrap justify-start gap-1 rounded-xl border border-border bg-card p-1 sm:w-fit">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="cycles">Cycles</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
          </TabsList>

          <div className="mt-4">
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
