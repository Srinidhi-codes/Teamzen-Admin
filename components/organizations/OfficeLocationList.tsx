"use client";

import { MapPin, Edit, Clock, Navigation, Building2, Loader2 } from "lucide-react";
import { OfficeLocation } from "@/lib/graphql/organization/types";
import {
  useGraphQLActivateOfficeLocationMutation,
  useGraphQLSuspendOfficeLocationMutation,
} from "@/lib/graphql/organization/organizationsHook";
import { Switch } from "../ui/switch";
import { toast } from "sonner";
import { useStore } from "@/lib/store/useStore";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface OfficeLocationListProps {
  officeLocations: OfficeLocation[];
  onEdit: (org: OfficeLocation) => void;
}

export default function OfficeLocationList({ officeLocations, onEdit }: OfficeLocationListProps) {
  const { user } = useStore();
  const { activateOfficeLocation } = useGraphQLActivateOfficeLocationMutation();
  const { suspendOfficeLocation } = useGraphQLSuspendOfficeLocationMutation();
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const toggleStatus = async (office: OfficeLocation) => {
    setTogglingId(String(office.id));
    try {
      const action = office.isActive ? suspendOfficeLocation : activateOfficeLocation;
      await action(String(office.id));
      toast.success(`${office.isActive ? "Suspended" : "Activated"} ${office.name}`);
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

  if (!officeLocations?.length) {
    return (
      <div className="rounded-xl border border-dashed border-border px-6 py-16 text-center">
        <MapPin className="mx-auto mb-3 h-8 w-8 text-muted-foreground/40" />
        <h3 className="text-sm font-medium text-foreground">No offices yet</h3>
        <p className="mt-1 text-sm text-muted-foreground">Add an office location to continue.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
      {officeLocations.map((office) => (
        <div key={office.id} className="flex flex-col rounded-xl border border-border bg-card">
          <div className="flex items-start gap-3 border-b border-border p-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <MapPin className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <h3 className="truncate text-sm font-semibold text-foreground">{office.name}</h3>
                <span
                  className={cn(
                    "shrink-0 rounded-md px-1.5 py-0.5 text-[11px] font-medium",
                    office.isActive
                      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                      : "bg-destructive/10 text-destructive"
                  )}
                >
                  {office.isActive ? "Active" : "Suspended"}
                </span>
              </div>
              <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                <Building2 className="h-3 w-3" />
                Office
              </p>
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-3 p-4 text-sm">
            <p className="line-clamp-2 text-muted-foreground">
              {[office.address, office.city, office.zipCode].filter(Boolean).join(", ") || "—"}
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg border border-border bg-muted/30 px-3 py-2">
                <p className="mb-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Clock className="h-3 w-3" /> Hours
                </p>
                <p className="text-xs font-medium text-foreground">
                  {office.loginTime} – {office.logoutTime}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 px-3 py-2">
                <p className="mb-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Navigation className="h-3 w-3" /> Geo radius
                </p>
                <p className="text-xs font-medium text-foreground">{office.geoRadiusMeters}m</p>
              </div>
            </div>
          </div>

          {isAuthorized && (
            <div className="flex items-center justify-between gap-2 border-t border-border p-3">
              <button
                type="button"
                onClick={() => onEdit(office)}
                className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border px-3 text-xs font-medium hover:bg-muted"
              >
                <Edit className="h-3.5 w-3.5" />
                Edit
              </button>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Active</span>
                {togglingId === String(office.id) ? (
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                ) : (
                  <Switch checked={office.isActive} onCheckedChange={() => toggleStatus(office)} />
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
