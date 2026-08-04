"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormSelect } from "@/components/common/FormSelect";
import { PageHeader } from "@/components/common/PageHeader";
import { OrganizationFilterSelect } from "@/components/common/OrganizationFilterSelect";
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
  const { departments } = useGraphQLDepartments(undefined, organizationId || undefined);
  const { designations } = useGraphQLDesignations(undefined, organizationId || undefined);
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
      setInviteUrl(payload.inviteUrl || "");
      setShowStart(false);
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
            <Button
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
              <Button type="button" variant="ghost" size="icon-sm" onClick={() => setShowStart(false)}>
                ✕
              </Button>
            </div>
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
                    Attach CTC annexure in generated PDF
                  </label>
                  {form.includeCtcAnnexure && (
                    <div className="mt-3">
                      <label className="mb-1 block text-xs text-muted-foreground">
                        Annual CTC (INR)
                      </label>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        placeholder="e.g. 800000"
                        value={form.annualCtc}
                        onChange={(e) =>
                          setForm({ ...form, annualCtc: e.target.value })
                        }
                      />
                    </div>
                  )}
                </>
              )}
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading
                ? "Creating…"
                : form.sendInvite
                  ? "Create & send invite"
                  : "Create hire"}
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
