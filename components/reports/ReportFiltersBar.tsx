"use client";

import moment from "moment";
import { Download, RotateCcw } from "lucide-react";
import { DatePickerSimple } from "@/components/ui/datePicker";
import { OrganizationFilterSelect } from "@/components/common/OrganizationFilterSelect";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGraphQLDepartments } from "@/lib/graphql/organization/organizationsHook";
import { useStore } from "@/lib/store/useStore";
import type { ReportFilters } from "@/lib/graphql/reports/types";

const ALL_DEPTS = "__all__";
const DEPT_ROLES = new Set(["superadmin", "admin", "hr", "manager"]);

interface ReportFiltersBarProps {
  filters: ReportFilters;
  onChange: (next: ReportFilters) => void;
  onExport?: () => void;
  exportLabel?: string;
}

export function ReportFiltersBar({
  filters,
  onChange,
  onExport,
  exportLabel = "Export CSV",
}: ReportFiltersBarProps) {
  const { user, isAuthenticated } = useStore();
  const canLoadDepts =
    isAuthenticated && !!user?.role && DEPT_ROLES.has(user.role);
  const { departments, isDepartmentsLoading } = useGraphQLDepartments(
    undefined,
    filters.organizationId || undefined,
    { skip: !canLoadDepts }
  );

  const set = (patch: Partial<ReportFilters>) => onChange({ ...filters, ...patch });

  const resetDates = () => {
    set({
      dateFrom: moment().subtract(90, "days").format("YYYY-MM-DD"),
      dateTo: moment().format("YYYY-MM-DD"),
    });
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <DatePickerSimple
            label="From"
            value={filters.dateFrom}
            onChange={(d) =>
              set({ dateFrom: d ? moment(d).format("YYYY-MM-DD") : undefined })
            }
          />
          <DatePickerSimple
            label="To"
            value={filters.dateTo}
            onChange={(d) =>
              set({ dateTo: d ? moment(d).format("YYYY-MM-DD") : undefined })
            }
          />
          <div className="flex flex-col space-y-2">
            <label className="text-premium-label px-1">Department</label>
            <Select
              value={filters.departmentId || ALL_DEPTS}
              onValueChange={(v) =>
                set({ departmentId: v === ALL_DEPTS ? undefined : v })
              }
              disabled={isDepartmentsLoading || !canLoadDepts}
            >
              <SelectTrigger className="h-9 rounded-md border-border bg-background text-sm">
                <SelectValue placeholder="All departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_DEPTS}>All departments</SelectItem>
                {(departments || []).map((d: { id: string; name: string }) => (
                  <SelectItem key={d.id} value={String(d.id)}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {user?.role === "superadmin" && (
            <div className="flex flex-col space-y-2">
              <label className="text-premium-label px-1">Organization</label>
              <OrganizationFilterSelect
                value={filters.organizationId || ""}
                onChange={(id) => set({ organizationId: id || undefined })}
                placeholder="Select organization"
                className="min-w-0"
              />
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={resetDates}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
            title="Reset date range"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          {onExport && (
            <button
              type="button"
              onClick={onExport}
              className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-background px-3 text-sm font-medium text-foreground hover:bg-muted"
            >
              <Download className="h-4 w-4" />
              {exportLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
