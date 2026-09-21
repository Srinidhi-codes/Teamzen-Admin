"use client";

import { Users, Building2, FileText, CreditCard, Hash, Loader2 } from "lucide-react";
import { Switch } from "../ui/switch";
import { toast } from "sonner";
import { useStore } from "@/lib/store/useStore";
import {
  useGraphQLActivateOrganizationMutation,
  useGraphQLSuspendOrganizationMutation,
} from "@/lib/graphql/organization/organizationsHook";
import { Organization } from "@/lib/graphql/organization/types";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface Props {
  organizations: Organization[];
  onViewEmployees: (org: Organization) => void;
}

export default function OrganizationList({ organizations, onViewEmployees }: Props) {
  const router = useRouter();
  const { activateOrganization } = useGraphQLActivateOrganizationMutation();
  const { suspendOrganization } = useGraphQLSuspendOrganizationMutation();
  const { user } = useStore();
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const toggleStatus = async (org: Organization) => {
    setTogglingId(String(org.id));
    try {
      const action = org.isActive ? suspendOrganization : activateOrganization;
      await action(String(org.id));
      toast.success(`${org.isActive ? "Suspended" : "Activated"} ${org.name}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to update status");
    } finally {
      setTogglingId(null);
    }
  };

  if (!organizations?.length) {
    return (
      <div className="rounded-xl border border-dashed border-border px-6 py-16 text-center">
        <Building2 className="mx-auto mb-3 h-8 w-8 text-muted-foreground/40" />
        <h3 className="text-sm font-medium text-foreground">No organizations yet</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Create an organization to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
      {organizations.map((org) => (
        <div key={org.id} className="flex flex-col rounded-xl border border-border bg-card">
          <div className="flex items-start gap-3 border-b border-border p-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted">
              {org.logo?.url ? (
                <img src={org.logo.url} alt="" className="h-full w-full object-contain p-1" />
              ) : (
                <Building2 className="h-5 w-5 text-primary" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <button
                  type="button"
                  onClick={() => router.push(`/organizations/${org.id}`)}
                  className="truncate text-left text-sm font-semibold text-foreground hover:text-primary"
                >
                  {org.name}
                </button>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span
                    className={cn(
                      "rounded-md px-1.5 py-0.5 text-[11px] font-medium",
                      org.isActive
                        ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                        : "bg-destructive/10 text-destructive"
                    )}
                  >
                    {org.isActive ? "Active" : "Suspended"}
                  </span>
                  {org.plan && (
                    <span className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-medium capitalize text-muted-foreground">
                      {org.plan} plan
                    </span>
                  )}
                </div>
              </div>
              <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                <Users className="h-3 w-3" />
                {org.employeeCount || 0} employees
              </p>
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-2 p-4 text-sm">
            {org.headquartersAddress && (
              <p className="line-clamp-2 text-muted-foreground">{org.headquartersAddress}</p>
            )}
            <div className="space-y-1.5 text-xs text-muted-foreground">
              {org.registrationNumber && (
                <p className="flex items-center gap-2">
                  <Hash className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate text-foreground">{org.registrationNumber}</span>
                </p>
              )}
              {org.gstNumber && (
                <p className="flex items-center gap-2">
                  <FileText className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate text-foreground">{org.gstNumber}</span>
                </p>
              )}
              {org.panNumber && (
                <p className="flex items-center gap-2">
                  <CreditCard className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate text-foreground">{org.panNumber}</span>
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 border-t border-border p-3">
            <button
              type="button"
              onClick={() => router.push(`/organizations/${org.id}`)}
              className="inline-flex h-8 flex-1 items-center justify-center rounded-md border border-border px-3 text-xs font-medium hover:bg-muted"
            >
              View details
            </button>
            <button
              type="button"
              onClick={() => onViewEmployees(org)}
              className="inline-flex h-8 flex-1 items-center justify-center rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-primary/90"
            >
              Employees
            </button>
            {(user?.role === "admin" || user?.role === "superadmin") && (
              <div className="flex h-8 items-center px-1">
                {togglingId === String(org.id) ? (
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                ) : (
                  <Switch checked={org.isActive} onCheckedChange={() => toggleStatus(org)} />
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
