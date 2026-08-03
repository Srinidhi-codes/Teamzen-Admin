"use client";

import { User } from "@/lib/graphql/users/types";
import { Mail, Phone, Building2, Edit, MapPin } from "lucide-react";
import { Switch } from "../ui/switch";
import Image from "next/image";
import { useState } from "react";
import { useStore } from "@/lib/store/useStore";
import { cn } from "@/lib/utils";
import { PhotoOverlay } from "@/components/common/PhotoOverlay";

interface EmployeeCardProps {
  employee: User;
  onEdit: (employee: User) => void;
  onStatusToggle: (userId: string, newStatus: boolean) => void;
}

export default function EmployeeCard({ employee, onEdit, onStatusToggle }: EmployeeCardProps) {
  const [isPhotoOpen, setIsPhotoOpen] = useState(false);
  const { user: currentUser } = useStore();
  const isAdminOrHr =
    currentUser?.role === "admin" ||
    currentUser?.role === "hr" ||
    currentUser?.role === "superadmin";

  return (
    <>
    <div className="flex flex-col rounded-xl border border-border bg-card">
      <div className="flex items-start gap-3 border-b border-border p-4">
        <button
          type="button"
          onClick={() => employee.profilePictureUrl && setIsPhotoOpen(true)}
          className={cn(
            "relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-muted",
            employee.profilePictureUrl ? "cursor-zoom-in" : "cursor-default"
          )}
          title={employee.profilePictureUrl ? "View photo" : undefined}
        >
          {employee.profilePictureUrl ? (
            <Image
              src={employee.profilePictureUrl}
              alt=""
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm font-medium text-primary">
              {employee.firstName?.charAt(0)}
              {employee.lastName?.charAt(0)}
            </div>
          )}
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold text-foreground">
                {employee.firstName} {employee.lastName}
              </h3>
              <p className="truncate text-xs text-muted-foreground">
                {employee.designation?.name || "No designation"}
              </p>
            </div>
            <span
              className={cn(
                "shrink-0 rounded-md px-1.5 py-0.5 text-[11px] font-medium",
                employee.isActive
                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                  : "bg-destructive/10 text-destructive"
              )}
            >
              {employee.isActive ? "Active" : "Inactive"}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-4 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Mail className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate text-foreground">{employee.email}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Phone className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate text-foreground">{employee.phoneNumber || "—"}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Building2 className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate text-foreground">
            {employee.organization?.name
              ? `${employee.organization.name} · ${employee.department?.name || "No department"}`
              : employee.department?.name || "No department"}
          </span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate text-foreground">
            {employee.officeLocation?.name || "No office"}
          </span>
        </div>

        <div className="mt-1 flex items-center justify-between gap-2 pt-1">
          <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium capitalize text-muted-foreground">
            {employee.employmentType?.replace("_", " ") || "—"}
          </span>
          {employee.employeeId && (
            <span className="text-[11px] text-muted-foreground">{employee.employeeId}</span>
          )}
        </div>
      </div>

      {isAdminOrHr && (
        <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Active</span>
            <Switch
              checked={employee.isActive}
              onCheckedChange={(checked) => onStatusToggle(employee.id, checked)}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              Joined{" "}
              {employee.dateOfJoining
                ? new Date(employee.dateOfJoining).toLocaleDateString(undefined, {
                    month: "short",
                    year: "numeric",
                  })
                : "—"}
            </span>
            <button
              onClick={() => onEdit(employee)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Edit employee"
            >
              <Edit className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
    <PhotoOverlay
      open={isPhotoOpen}
      onOpenChange={setIsPhotoOpen}
      src={employee.profilePictureUrl || null}
      name={`${employee.firstName || ""} ${employee.lastName || ""}`.trim()}
    />
    </>
  );
}
