"use client";

import moment from "moment";
import { Download, RotateCcw, Filter, Calendar as CalendarIcon, Sparkles } from "lucide-react";
import { DatePickerSimple } from "@/components/ui/datePicker";
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
import { cn } from "@/lib/utils";

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

  const setPreset = (days: number) => {
    set({
      dateFrom: moment().subtract(days, "days").format("YYYY-MM-DD"),
      dateTo: moment().format("YYYY-MM-DD"),
    });
  };

  const setQuarter = () => {
    set({
      dateFrom: moment().startOf("quarter").format("YYYY-MM-DD"),
      dateTo: moment().endOf("quarter").format("YYYY-MM-DD"),
    });
  };

  const setYearToDate = () => {
    set({
      dateFrom: moment().startOf("year").format("YYYY-MM-DD"),
      dateTo: moment().format("YYYY-MM-DD"),
    });
  };

  const resetDates = () => {
    set({
      dateFrom: moment().subtract(90, "days").format("YYYY-MM-DD"),
      dateTo: moment().format("YYYY-MM-DD"),
      departmentId: undefined,
    });
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
      {/* Top Filter Header & Presets */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3.5">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-primary" />
          <span className="text-xs font-bold text-foreground uppercase tracking-wider">
            Filter Range & Scope
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-semibold text-muted-foreground mr-1">Presets:</span>
          <button
            type="button"
            onClick={() => setPreset(30)}
            className="rounded-lg border border-border/80 bg-muted/30 px-2.5 py-1 text-[11px] font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            30 Days
          </button>
          <button
            type="button"
            onClick={() => setPreset(90)}
            className="rounded-lg border border-border/80 bg-muted/30 px-2.5 py-1 text-[11px] font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            90 Days
          </button>
          <button
            type="button"
            onClick={setQuarter}
            className="rounded-lg border border-border/80 bg-muted/30 px-2.5 py-1 text-[11px] font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            This Quarter
          </button>
          <button
            type="button"
            onClick={setYearToDate}
            className="rounded-lg border border-border/80 bg-muted/30 px-2.5 py-1 text-[11px] font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            YTD
          </button>
        </div>
      </div>

      {/* Main Filter Inputs */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid flex-1 grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
          <DatePickerSimple
            label="Start Date"
            value={filters.dateFrom}
            onChange={(d) =>
              set({ dateFrom: d ? moment(d).format("YYYY-MM-DD") : undefined })
            }
          />
          <DatePickerSimple
            label="End Date"
            value={filters.dateTo}
            onChange={(d) =>
              set({ dateTo: d ? moment(d).format("YYYY-MM-DD") : undefined })
            }
          />
          <div className="flex flex-col space-y-1.5">
            <label className="text-xs font-semibold text-foreground px-0.5">Department</label>
            <Select
              value={filters.departmentId || ALL_DEPTS}
              onValueChange={(v) =>
                set({ departmentId: v === ALL_DEPTS ? undefined : v })
              }
              disabled={isDepartmentsLoading || !canLoadDepts}
            >
              <SelectTrigger className="h-10 rounded-xl border-border bg-background text-xs font-medium focus:ring-2 focus:ring-primary/20">
                <SelectValue placeholder="All departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_DEPTS}>All departments</SelectItem>
                {(departments || []).map((d) => (
                  <SelectItem key={d.id} value={String(d.id)}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 pt-2 sm:pt-0">
          <button
            type="button"
            onClick={resetDates}
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-border bg-background px-3 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            title="Reset filters to default"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>

          {onExport && (
            <button
              type="button"
              onClick={onExport}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
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
