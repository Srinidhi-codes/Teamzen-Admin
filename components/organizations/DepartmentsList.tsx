"use client";

import { Department } from "@/lib/graphql/organization/types";
import { Layers, Building2, Loader2, Edit } from "lucide-react";
import { Switch } from "../ui/switch";
import { toast } from "sonner";
import {
  useGraphQLActivateDepartmentMutation,
  useGraphQLSuspendDepartmentMutation,
} from "@/lib/graphql/organization/organizationsHook";
import { useStore } from "@/lib/store/useStore";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface DepartmentListProps {
  departments: Department[];
  onEdit: (department: Department) => void;
}

export default function DepartmentList({ departments, onEdit }: DepartmentListProps) {
  const { user } = useStore();
  const { activateDepartment } = useGraphQLActivateDepartmentMutation();
  const { suspendDepartment } = useGraphQLSuspendDepartmentMutation();
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const toggleStatus = async (dept: Department) => {
    setTogglingId(String(dept.id));
    try {
      const action = dept.isActive ? suspendDepartment : activateDepartment;
      await action(String(dept.id));
      toast.success(`${dept.isActive ? "Suspended" : "Activated"} ${dept.name}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to update status");
    } finally {
      setTogglingId(null);
    }
  };

  const isAuthorized =
    user?.role === "admin" ||
    user?.role === "superadmin" ||
    user?.role === "hr" ||
    user?.role === "manager";

  if (!departments?.length) {
    return (
      <div className="rounded-xl border border-dashed border-border px-6 py-16 text-center">
        <Layers className="mx-auto mb-3 h-8 w-8 text-muted-foreground/40" />
        <h3 className="text-sm font-medium text-foreground">No departments yet</h3>
        <p className="mt-1 text-sm text-muted-foreground">Create a department to organize teams.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
      {departments.map((dept) => (
        <div key={dept.id} className="flex flex-col rounded-xl border border-border bg-card">
          <div className="flex items-start gap-3 border-b border-border p-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Layers className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <h3 className="truncate text-sm font-semibold text-foreground">{dept.name}</h3>
                <span
                  className={cn(
                    "shrink-0 rounded-md px-1.5 py-0.5 text-[11px] font-medium",
                    dept.isActive
                      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                      : "bg-destructive/10 text-destructive"
                  )}
                >
                  {dept.isActive ? "Active" : "Suspended"}
                </span>
              </div>
              <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                <Building2 className="h-3 w-3" />
                {dept.organization?.name || "Organization"}
              </p>
            </div>
          </div>

          <div className="flex-1 p-4">
            <p className="line-clamp-3 text-sm text-muted-foreground">
              {dept.description || "No description"}
            </p>
          </div>

          {isAuthorized && (
            <div className="flex items-center justify-between gap-2 border-t border-border p-3">
              <button
                type="button"
                onClick={() => onEdit(dept)}
                className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border px-3 text-xs font-medium hover:bg-muted"
              >
                <Edit className="h-3.5 w-3.5" />
                Edit
              </button>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Active</span>
                {togglingId === String(dept.id) ? (
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                ) : (
                  <Switch checked={dept.isActive} onCheckedChange={() => toggleStatus(dept)} />
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
