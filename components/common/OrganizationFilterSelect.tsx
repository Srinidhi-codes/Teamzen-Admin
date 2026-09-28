"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGraphQLOrganizations } from "@/lib/graphql/organization/organizationsHook";
import { useStore } from "@/lib/store/useStore";
import { cn } from "@/lib/utils";

const ALL_ORGS = "__all__";

interface OrganizationFilterSelectProps {
  value: string;
  onChange: (organizationId: string) => void;
  className?: string;
  triggerClassName?: string;
  /** When true, always render even for non-superadmin (uses their org only). */
  forceShow?: boolean;
  placeholder?: string;
}

/**
 * Superadmin-only organization filter. Returns null for other roles.
 * Pass empty string for "All organizations".
 */
export function OrganizationFilterSelect({
  value,
  onChange,
  className,
  triggerClassName,
  forceShow = false,
  placeholder = "All organizations",
}: OrganizationFilterSelectProps) {
  const { user, isAuthenticated } = useStore();
  const isSuperadmin = user?.role === "superadmin";
  const shouldLoad = isAuthenticated && (forceShow || isSuperadmin);
  const { organizations, isOrganizationsLoading } = useGraphQLOrganizations(
    undefined,
    undefined,
    { skip: !shouldLoad }
  );

  if (!forceShow && !isSuperadmin) return null;

  return (
    <div className={cn("min-w-[200px]", className)}>
      <Select
        value={value || ALL_ORGS}
        onValueChange={(v) => onChange(v === ALL_ORGS ? "" : v)}
        disabled={isOrganizationsLoading}
      >
        <SelectTrigger
          className={cn(
            "h-9 rounded-md border-border bg-background text-sm",
            triggerClassName
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_ORGS}>{placeholder}</SelectItem>
          {(organizations || []).map((org) => (
            <SelectItem key={org.id} value={String(org.id)}>
              {org.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

interface PlanFilterSelectProps {
  value: string;
  onChange: (plan: string) => void;
  className?: string;
}

export function PlanFilterSelect({ value, onChange, className }: PlanFilterSelectProps) {
  const ALL = "__all__";
  return (
    <div className={cn("min-w-[140px]", className)}>
      <Select value={value || ALL} onValueChange={(v) => onChange(v === ALL ? "" : v)}>
        <SelectTrigger className="h-9 rounded-md border-border bg-background text-sm">
          <SelectValue placeholder="All plans" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All plans</SelectItem>
          <SelectItem value="free">Free</SelectItem>
          <SelectItem value="pro">Pro</SelectItem>
          <SelectItem value="elite">Elite</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

interface StatusFilterSelectProps {
  value: "" | "active" | "suspended";
  onChange: (status: "" | "active" | "suspended") => void;
  className?: string;
}

export function StatusFilterSelect({ value, onChange, className }: StatusFilterSelectProps) {
  const ALL = "__all__";
  const mapped = value === "active" ? "active" : value === "suspended" ? "suspended" : ALL;
  return (
    <div className={cn("min-w-[140px]", className)}>
      <Select
        value={mapped}
        onValueChange={(v) =>
          onChange(v === ALL ? "" : (v as "active" | "suspended"))
        }
      >
        <SelectTrigger className="h-9 rounded-md border-border bg-background text-sm">
          <SelectValue placeholder="All statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All statuses</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="suspended">Suspended</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
