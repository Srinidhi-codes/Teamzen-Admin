"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { OrganizationFilterSelect } from "@/components/common/OrganizationFilterSelect";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HrOnboardingTourButton } from "@/components/onboarding/OnboardingTour";
import {
  useOnboardingMutations,
  useOnboardingOverview,
  useOnboardingTemplates,
  useOnboardings,
} from "@/lib/graphql/onboarding/onboardingHook";
import { useGraphQLUsers } from "@/lib/graphql/users/userHook";

const STATUS_FILTERS = [
  { value: "", label: "All" },
  { value: "preboarding", label: "Preboarding" },
  { value: "in_progress", label: "In progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

function Kpi({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}

function statusBadge(status: string) {
  const map: Record<string, string> = {
    invited: "bg-slate-100 text-slate-700",
    preboarding: "bg-amber-100 text-amber-800",
    in_progress: "bg-sky-100 text-sky-800",
    completed: "bg-emerald-100 text-emerald-800",
    cancelled: "bg-rose-100 text-rose-800",
  };
  return map[status] || "bg-muted text-muted-foreground";
}

export default function OnboardingPage() {
  const [organizationId, setOrganizationId] = useState("");
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [showStart, setShowStart] = useState(false);
  const [inviteUrl, setInviteUrl] = useState("");
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState({
    email: "",
    firstName: "",
    lastName: "",
    password: "Welcome@123",
    dateOfJoining: "",
    managerId: "",
    templateId: "",
  });

  const { overview, refetch: refetchOverview } = useOnboardingOverview(
    organizationId || undefined
  );
  const { onboardings, isLoading, error, refetch } = useOnboardings({
    organizationId: organizationId || undefined,
    status: status || undefined,
    search: search || undefined,
  });
  const { templates } = useOnboardingTemplates(organizationId || undefined);
  const { users } = useGraphQLUsers();
  const { startPreboarding, loading } = useOnboardingMutations();

  const managers = useMemo(
    () =>
      (users || []).filter((u: { role?: string }) =>
        ["manager", "admin", "hr"].includes(u.role || "")
      ),
    [users]
  );

  async function handleStart(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    setInviteUrl("");
    try {
      const result = await startPreboarding({
        variables: {
          input: {
            email: form.email,
            firstName: form.firstName,
            lastName: form.lastName,
            password: form.password,
            organizationId: organizationId || undefined,
            dateOfJoining: form.dateOfJoining || undefined,
            managerId: form.managerId || undefined,
            templateId: form.templateId || undefined,
            generateOffer: true,
            sendInvite: true,
          },
        },
      });
      const payload = result.data?.startPreboarding;
      if (!payload?.success) {
        setFormError(payload?.error || "Failed to start preboarding");
        return;
      }
      setInviteUrl(payload.inviteUrl || "");
      setShowStart(false);
      setForm({
        email: "",
        firstName: "",
        lastName: "",
        password: "Welcome@123",
        dateOfJoining: "",
        managerId: "",
        templateId: "",
      });
      refetch();
      refetchOverview();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to start");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Onboarding"
        description="Preboarding, document verification, and day-1 checklists"
        actions={
          <div className="flex flex-wrap gap-2">
            <HrOnboardingTourButton variant="board" />
            <Link
              href="/onboarding/templates"
              id="onboarding-nav-templates"
              className="rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted"
            >
              Templates
            </Link>
            <Link
              href="/onboarding/letters"
              id="onboarding-nav-letters"
              className="rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted"
            >
              Offer letters
            </Link>
            <button
              type="button"
              id="onboarding-start-hire"
              onClick={() => setShowStart(true)}
              className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
            >
              Start hire
            </button>
          </div>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <OrganizationFilterSelect
          value={organizationId}
          onChange={setOrganizationId}
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name or email"
          className="h-10 rounded-lg border border-border bg-background px-3 text-sm"
        />
        <div className="flex flex-wrap gap-1">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s.value || "all"}
              type="button"
              onClick={() => setStatus(s.value)}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                status === s.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {overview && (
        <div id="onboarding-kpis" className="grid grid-cols-2 gap-3 lg:grid-cols-4 xl:grid-cols-6">
          <Kpi label="Total" value={overview.total} />
          <Kpi label="Preboarding" value={overview.preboarding} />
          <Kpi label="In progress" value={overview.inProgress} />
          <Kpi label="Completed" value={overview.completed} />
          <Kpi label="Pending docs" value={overview.pendingVerifications} />
          <Kpi label="Overdue tasks" value={overview.overdueTasks} />
        </div>
      )}

      {inviteUrl && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          Invite sent. Portal link:{" "}
          <a className="underline break-all" href={inviteUrl} target="_blank" rel="noreferrer">
            {inviteUrl}
          </a>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {(error as Error).message}
        </div>
      )}

      <div id="onboarding-board-table" className="overflow-hidden rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/40 text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Employee</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Progress</th>
              <th className="px-4 py-3 font-medium">Join date</th>
              <th className="px-4 py-3 font-medium">Template</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  Loading…
                </td>
              </tr>
            )}
            {!isLoading && onboardings.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  No onboardings yet. Start a hire to begin preboarding.
                </td>
              </tr>
            )}
            {onboardings.map((row) => (
              <tr key={row.id} className="border-t border-border">
                <td className="px-4 py-3">
                  <div className="font-medium">{row.userName}</div>
                  <div className="text-xs text-muted-foreground">{row.userEmail}</div>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadge(
                      row.status
                    )}`}
                  >
                    {row.status.replace("_", " ")}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${row.progressPct}%` }}
                      />
                    </div>
                    <span className="tabular-nums text-xs">{row.progressPct}%</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {row.joinDate || "—"}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {row.templateName || "—"}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/onboarding/${row.id}`}
                    className="text-primary hover:underline"
                  >
                    Open
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showStart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form
            onSubmit={handleStart}
            className="w-full max-w-lg space-y-4 rounded-2xl border border-border bg-card p-6 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Start hire / preboarding</h2>
              <button type="button" onClick={() => setShowStart(false)}>
                ✕
              </button>
            </div>
            {formError && (
              <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {formError}
              </p>
            )}
            <div className="grid grid-cols-2 gap-3">
              <input
                required
                placeholder="First name"
                className="rounded-lg border border-border px-3 py-2 text-sm"
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              />
              <input
                required
                placeholder="Last name"
                className="rounded-lg border border-border px-3 py-2 text-sm"
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              />
            </div>
            <input
              required
              type="email"
              placeholder="Work email"
              className="w-full rounded-lg border border-border px-3 py-2 text-sm"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <input
              required
              type="text"
              placeholder="Temp password"
              className="w-full rounded-lg border border-border px-3 py-2 text-sm"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <input
              type="date"
              className="w-full rounded-lg border border-border px-3 py-2 text-sm"
              value={form.dateOfJoining}
              onChange={(e) => setForm({ ...form, dateOfJoining: e.target.value })}
            />
            <Select
              value={form.managerId || "__none__"}
              onValueChange={(value) =>
                setForm({
                  ...form,
                  managerId: value === "__none__" ? "" : value,
                })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Manager (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Manager (optional)</SelectItem>
                {managers.map(
                  (m: {
                    id: string;
                    firstName?: string;
                    lastName?: string;
                    email: string;
                  }) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.firstName} {m.lastName} ({m.email})
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
            <Select
              value={form.templateId || "__default__"}
              onValueChange={(value) =>
                setForm({
                  ...form,
                  templateId: value === "__default__" ? "" : value,
                })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Default template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__default__">Default template</SelectItem>
                {templates.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                    {t.isDefault ? " (default)" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-60"
            >
              {loading ? "Creating…" : "Create & send invite"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
