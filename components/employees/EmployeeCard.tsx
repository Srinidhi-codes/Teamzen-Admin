"use client";

import { User } from "@/lib/graphql/users/types";
import { Mail, Phone, Building2, Edit, MapPin, ClipboardList, Loader2, LogOut } from "lucide-react";
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
  onStartOnboarding?: (employee: User) => void | Promise<void>;
  startingOnboardingId?: string | null;
  onStartOffboarding?: (employee: User) => void | Promise<void>;
  startingOffboardingId?: string | null;
}

export default function EmployeeCard({
  employee,
  onEdit,
  onStatusToggle,
  onStartOnboarding,
  startingOnboardingId,
  onStartOffboarding,
  startingOffboardingId,
}: EmployeeCardProps) {
  const [isPhotoOpen, setIsPhotoOpen] = useState(false);
  const { user: currentUser } = useStore();
  const isAdminOrHr =
    currentUser?.role === "admin" ||
    currentUser?.role === "hr" ||
    currentUser?.role === "superadmin";
  const isStarting = startingOnboardingId === employee.id;
  const isStartingFnf = startingOffboardingId === employee.id;

  return (
    <>
    <div className="flex flex-col rounded-2xl border border-border bg-card overflow-hidden relative shadow-sm hover:shadow-md transition-shadow">
      {/* ID Card Banner Header */}
      <div 
        className="h-24 w-full relative bg-gradient-to-r from-primary/10 to-primary/5"
        style={employee.organization?.accent ? { background: `linear-gradient(135deg, ${employee.organization.accent}20, transparent)` } : undefined}
      >
        <div className="absolute top-3 right-3">
            <span
                className={cn(
                "rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider shadow-sm",
                employee.isActive
                    ? "bg-emerald-500 text-white dark:bg-emerald-600"
                    : "bg-destructive text-white"
                )}
            >
                {employee.isActive ? "Active" : "Inactive"}
            </span>
        </div>
      </div>

      {/* Profile Photo & ID Number */}
      <div className="px-5 relative flex justify-between items-end -mt-12 mb-3">
        <button
          type="button"
          onClick={() => employee.profilePictureUrl && setIsPhotoOpen(true)}
          className={cn(
            "relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border-4 border-card bg-muted shadow-sm",
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
            <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-primary bg-primary/10">
              {employee.firstName?.charAt(0)}
              {employee.lastName?.charAt(0)}
            </div>
          )}
        </button>
        
        {employee.employeeId && (
            <div className="text-right pb-1">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">ID Number</p>
                <p className="font-mono text-sm font-bold text-foreground bg-muted/50 px-2 py-0.5 rounded border border-border/50 mt-0.5">{employee.employeeId}</p>
            </div>
        )}
      </div>

      {/* Main Details */}
      <div className="flex flex-1 flex-col px-5 pb-5">
        <div className="mb-5">
            <h3 className="truncate text-xl font-bold text-foreground tracking-tight">
                {employee.firstName} {employee.lastName}
            </h3>
            <p className="truncate text-sm font-semibold text-primary mt-0.5">
                {employee.designation?.name || "No designation"}
            </p>
            <p className="truncate text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                <Building2 className="h-3 w-3" />
                {employee.organization?.name || employee.department?.name
                ? `${employee.organization?.name || ""} ${employee.organization?.name && employee.department?.name ? '·' : ''} ${employee.department?.name || ""}`
                : "No department"}
            </p>
        </div>

        {/* Contact Info Box */}
        <div className="space-y-3 text-xs bg-muted/30 rounded-xl p-3.5 border border-border/50 shadow-sm">
            <div className="flex items-center gap-3 text-muted-foreground">
                <Mail className="h-3.5 w-3.5 shrink-0 text-primary/70" />
                <span className="truncate text-foreground font-medium">{employee.email}</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
                <Phone className="h-3.5 w-3.5 shrink-0 text-primary/70" />
                <span className="truncate text-foreground font-medium">{employee.phoneNumber || "—"}</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-primary/70" />
                <span className="truncate text-foreground font-medium">
                {employee.officeLocation?.name || "No office"}
                </span>
            </div>
        </div>

        {/* Tags */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="rounded-md border border-border/60 bg-background px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground shadow-sm">
                {employee.employmentType?.replace("_", " ") || "—"}
            </span>
            {employee.faceEnrolled && (
                <span className="rounded-md bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 shadow-sm">
                Face Enrolled
                </span>
            )}
        </div>
      </div>

      {/* Admin Actions Footer */}
      {isAdminOrHr && (
        <div className="flex items-center justify-between gap-3 border-t border-border bg-muted/10 px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <Switch
              checked={employee.isActive}
              onCheckedChange={(checked) => onStatusToggle(employee.id, checked)}
              className="scale-90"
            />
            <span className="text-xs font-medium text-muted-foreground">
                {employee.isActive ? "Active" : "Suspended"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(employee)}
              className="inline-flex h-8 items-center gap-1.5 rounded-md bg-primary/10 text-primary px-3 text-xs font-semibold hover:bg-primary/20 transition-colors"
              aria-label="Edit employee"
            >
              <Edit className="h-3.5 w-3.5" />
              Edit
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
