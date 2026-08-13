"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import moment from "moment";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormSelect } from "@/components/common/FormSelect";
import { PageHeader } from "@/components/common/PageHeader";
import { OrganizationFilterSelect } from "@/components/common/OrganizationFilterSelect";
import { Skeleton } from "@/components/common/Skeleton";
import { HrOnboardingTourButton } from "@/components/onboarding/OnboardingTour";
import {
  useOnboardingMutations,
  useOnboardingOverview,
  useOnboardingTemplates,
  useOnboardings,
} from "@/lib/graphql/onboarding/onboardingHook";
import { useGraphQLUsers } from "@/lib/graphql/users/userHook";
import {
  useGraphQLDepartments,
  useGraphQLDesignations,
} from "@/lib/graphql/organization/organizationsHook";

function formatJoinDate(value?: string | Date | null) {
  if (value == null || value === "") return "—";
  if (typeof value === "string") {
    const day = value.trim().match(/^(\d{4}-\d{2}-\d{2})/);
    if (day) {
      const m = moment(day[1], "YYYY-MM-DD", true);
      if (m.isValid()) return m.format("DD MMM YYYY");
    }
  }
  const m = moment(value);
  return m.isValid() ? m.format("DD MMM YYYY") : String(value);
}

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
    departmentId: "",
    designationId: "",
    managerId: "",
    templateId: "",
    generateOffer: true,
    includeCtcAnnexure: false,
    annualCtc: "",
    sendInvite: true,
  });

  const { overview, isLoading: overviewLoading, refetch: refetchOverview } = useOnboardingOverview(
    organizationId || undefined
  );
  const { onboardings, isLoading, error, refetch } = useOnboardings({
    organizationId: organizationId || undefined,
    status: status || undefined,
    search: search || undefined,
  });
  const { templates } = useOnboardingTemplates(organizationId || undefined);
  const { users } = useGraphQLUsers();
  const { departments } = useGraphQLDepartments(undefined, organizationId || undefined);
  const { designations } = useGraphQLDesignations(undefined, organizationId || undefined);
  const { startPreboarding, loading } = useOnboardingMutations();
  const [submitting, setSubmitting] = useState(false);
  const startBusy = loading || submitting;

  const managers = useMemo(
    () =>
      (users || []).filter((u: { role?: string }) =>
        ["manager", "admin", "hr"].includes(u.role || "")
      ),
    [users]
  );

  async function handleStart(e: React.FormEvent) {
    e.preventDefault();
    if (startBusy) return;
    setFormError("");
    setInviteUrl("");
    setSubmitting(true);
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
            departmentId: form.departmentId || undefined,
            designationId: form.designationId || undefined,
            managerId: form.managerId || undefined,
            templateId: form.templateId || undefined,
            generateOffer: form.generateOffer,
            includeCtcAnnexure: form.includeCtcAnnexure,
            annualCtc:
              form.includeCtcAnnexure && form.annualCtc
                ? Number(form.annualCtc)
                : undefined,
            sendInvite: form.sendInvite,
          },
        },
      });
      const payload = result.data?.startPreboarding;
      if (!payload?.success) {
        setFormError(payload?.error || "Failed to start preboarding");
        return;
      }
      // Close modal immediately so UI doesn't feel stuck during refetch
      setShowStart(false);
      setInviteUrl(payload.inviteUrl || "");
      setForm({
        email: "",
        firstName: "",
        lastName: "",
        password: "Welcome@123",
        dateOfJoining: "",
        departmentId: "",
        designationId: "",
        managerId: "",
        templateId: "",
        generateOffer: true,
        includeCtcAnnexure: false,
        annualCtc: "",
        sendInvite: true,
      });
      void Promise.all([refetch(), refetchOverview()]);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to start");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Onboarding"
        description="New joiners: offer, preboarding portal, docs, then activate. Already on the roster? Add them under Employees, then use Onboard on their card."
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
            <Button
              className="cursor-pointer"
              id="onboarding-start-hire"
              onClick={() => setShowStart(true)}
            >
              Start hire
            </Button>
          </div>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <OrganizationFilterSelect
          value={organizationId}
          onChange={setOrganizationId}
        />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name or email"
          className="h-10"
        />
        <div className="flex flex-wrap gap-1">
          {STATUS_FILTERS.map((s) => (
            <Button
              key={s.value || "all"}
              type="button"
              size="sm"
              variant={status === s.value ? "default" : "secondary"}
              onClick={() => setStatus(s.value)}
            >
              {s.label}
            </Button>
          ))}
        </div>
      </div>

      {overviewLoading && !overview ? (
        <div id="onboarding-kpis" className="grid grid-cols-2 gap-3 lg:grid-cols-4 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-4">
              <Skeleton className="mb-2 h-3 w-16" />
              <Skeleton className="h-7 w-10" />
            </div>
          ))}
        </div>
      ) : overview ? (
        <div id="onboarding-kpis" className="grid grid-cols-2 gap-3 lg:grid-cols-4 xl:grid-cols-6">
          <Kpi label="Total" value={overview.total} />
          <Kpi label="Preboarding" value={overview.preboarding} />
          <Kpi label="In progress" value={overview.inProgress} />
          <Kpi label="Completed" value={overview.completed} />
          <Kpi label="Pending docs" value={overview.pendingVerifications} />
          <Kpi label="Overdue tasks" value={overview.overdueTasks} />
        </div>
      ) : null}

      {inviteUrl && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          <span>Invite sent.</span>
          <a
            className="inline-flex items-center rounded-lg bg-emerald-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-800"
            href={inviteUrl}
            target="_blank"
            rel="noreferrer"
          >
            Open joining link
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
            {isLoading &&
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={`sk-${i}`} className="border-t border-border">
                  <td className="px-4 py-3">
                    <Skeleton className="mb-1.5 h-4 w-36" />
                    <Skeleton className="h-3 w-48" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-2 w-24 rounded-full" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-20" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-24" />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Skeleton className="ml-auto h-4 w-12" />
                  </td>
                </tr>
              ))}
            {!isLoading && onboardings.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  No onboardings yet. Start a hire to begin preboarding.
                </td>
              </tr>
            )}
            {!isLoading &&
              onboardings.map((row) => (
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
                  {formatJoinDate(row.joinDate)}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {row.templateName || "—"}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/onboarding/${row.id}`}
                    className="text-primary hover:underline"
                  >
                    View
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
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                disabled={startBusy}
                onClick={() => setShowStart(false)}
              >
                ✕
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Creates an inactive hire, checklist, and optional offer + magic-link
              portal. For people already active in Employees, close this and use{" "}
              <span className="font-medium text-foreground">Onboard</span> on
              their card instead.
            </p>
            <fieldset disabled={startBusy} className="space-y-4 disabled:opacity-70">
            {formError && (
              <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {formError}
              </p>
            )}
            <div className="grid grid-cols-2 gap-3">
              <Input
                required
                placeholder="First name"
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              />
              <Input
                required
                placeholder="Last name"
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              />
            </div>
            <Input
              required
              type="email"
              placeholder="Work email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <Input
              required
              type="text"
              placeholder="Temp password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <Input
              type="date"
              value={form.dateOfJoining}
              onChange={(e) => setForm({ ...form, dateOfJoining: e.target.value })}
            />
            <FormSelect
              label="Department"
              value={form.departmentId || "__none__"}
              onValueChange={(value) =>
                setForm({
                  ...form,
                  departmentId: value === "__none__" ? "" : value,
                })
              }
              placeholder="Department (optional)"
              options={[
                { label: "Department (optional)", value: "__none__" },
                ...(departments || []).map((d: { id: string; name: string }) => ({
                  label: d.name,
                  value: d.id,
                })),
              ]}
            />
            <FormSelect
              label="Designation"
              value={form.designationId || "__none__"}
              onValueChange={(value) =>
                setForm({
                  ...form,
                  designationId: value === "__none__" ? "" : value,
                })
              }
              placeholder="Designation (optional)"
              options={[
                { label: "Designation (optional)", value: "__none__" },
                ...(designations || []).map((d: { id: string; name: string }) => ({
                  label: d.name,
                  value: d.id,
                })),
              ]}
            />
            <FormSelect
              label="Manager"
              value={form.managerId || "__none__"}
              onValueChange={(value) =>
                setForm({
                  ...form,
                  managerId: value === "__none__" ? "" : value,
                })
              }
              placeholder="Manager (optional)"
              options={[
                { label: "Manager (optional)", value: "__none__" },
                ...managers.map(
                  (m: {
                    id: string;
                    firstName?: string;
                    lastName?: string;
                    email: string;
                  }) => ({
                    label: `${m.firstName || ""} ${m.lastName || ""} (${m.email})`.trim(),
                    value: m.id,
                  })
                ),
              ]}
            />
            <FormSelect
              label="Template"
              value={form.templateId || "__default__"}
              onValueChange={(value) =>
                setForm({
                  ...form,
                  templateId: value === "__default__" ? "" : value,
                })
              }
              placeholder="Default template"
              options={[
                { label: "Default template", value: "__default__" },
                ...templates.map((t) => ({
                  label: `${t.name}${t.isDefault ? " (default)" : ""}`,
                  value: t.id,
                })),
              ]}
            />
            <div className="rounded-xl border border-border bg-muted/20 p-4">
              <p className="mb-3 text-sm font-medium">Offer letter</p>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.generateOffer}
                  onChange={(e) =>
                    setForm({ ...form, generateOffer: e.target.checked })
                  }
                />
                Generate PDF offer letter before sending invite
              </label>
              <label className="mt-3 flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.sendInvite}
                  onChange={(e) =>
                    setForm({ ...form, sendInvite: e.target.checked })
                  }
                />
                Send invite email with portal link
              </label>
              {form.generateOffer && (
                <>
                  <label className="mt-3 flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={form.includeCtcAnnexure}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          includeCtcAnnexure: e.target.checked,
                        })
                      }
                    />
                    Include CTC annexure (Annexure A) in the offer PDF
                  </label>
                  {form.includeCtcAnnexure && (
                    <div className="mt-3">
                      <label className="mb-1 block text-xs text-muted-foreground">
                        Annual CTC (INR) — required for annexure
                      </label>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        placeholder="e.g. 600000"
                        value={form.annualCtc}
                        onChange={(e) =>
                          setForm({ ...form, annualCtc: e.target.value })
                        }
                        required={form.includeCtcAnnexure}
                      />
                      <p className="mt-1 text-xs text-muted-foreground">
                        PDF will include a full monthly / annual CTC break-up table.
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
            </fieldset>
            <Button
              type="submit"
              disabled={startBusy}
              className="w-full"
            >
              {startBusy ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {form.generateOffer
                    ? "Creating hire & offer…"
                    : form.sendInvite
                      ? "Creating & sending…"
                      : "Creating hire…"}
                </>
              ) : form.sendInvite ? (
                "Create & send invite"
              ) : (
                "Create hire"
              )}
            </Button>
            {startBusy && (
              <p className="text-center text-xs text-muted-foreground">
                This can take a few seconds while we generate the offer PDF
                {form.sendInvite ? " and send the invite" : ""}.
              </p>
            )}
          </form>
        </div>
      )}
    </div>
  );
}
