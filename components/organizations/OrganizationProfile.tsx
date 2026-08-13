"use client";

import {
  useGraphQLOrganization,
  useGraphQLUpdateOrganizationMutation,
} from "@/lib/graphql/organization/organizationsHook";
import type { OrganizationInput } from "@/lib/graphql/organization/types";
import {
  Building2,
  MapPin,
  Hash,
  FileText,
  CreditCard,
  ArrowLeft,
  Loader2,
  Camera,
  Edit3,
  Save,
  X,
  ScanFace,
  CalendarDays,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Input } from "../common/Input";
import { PageHeader } from "../common/PageHeader";
import { useStore } from "@/lib/store/useStore";
import { useOrgPlan } from "@/lib/hooks/useOrgPlan";
import { planLabel } from "@/lib/plans";
import api from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import moment from "moment";
import { AccentPicker, COMPANY_ACCENTS } from "./AccentPicker";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

const WEEKDAY_OPTIONS: { value: number; label: string; short: string }[] = [
  { value: 0, label: "Monday", short: "Mon" },
  { value: 1, label: "Tuesday", short: "Tue" },
  { value: 2, label: "Wednesday", short: "Wed" },
  { value: 3, label: "Thursday", short: "Thu" },
  { value: 4, label: "Friday", short: "Fri" },
  { value: 5, label: "Saturday", short: "Sat" },
  { value: 6, label: "Sunday", short: "Sun" },
];

function formatWeekendDays(days?: number[] | null) {
  const list = Array.isArray(days) ? days : [6];
  if (list.length === 0) return "None (7-day week)";
  return list
    .slice()
    .sort((a, b) => a - b)
    .map((d) => WEEKDAY_OPTIONS.find((o) => o.value === d)?.label || String(d))
    .join(", ");
}

interface OrganizationProfileProps {
  id: string;
}

export default function OrganizationProfile({ id }: OrganizationProfileProps) {
  const router = useRouter();
  const { user } = useStore();
  const { can, requiredPlan } = useOrgPlan();
  const canFaceAttendance = can("face_attendance");
  const {
    organization,
    isOrganizationLoading,
    isOrganizationError,
    refetchOrganization,
  } = useGraphQLOrganization(id);
  const { updateOrganization, isUpdatingOrganizationLoading } =
    useGraphQLUpdateOrganizationMutation();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>({
    name: "",
    gstNumber: "",
    panNumber: "",
    registrationNumber: "",
    headquartersAddress: "",
    logo: "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleStartEdit = () => {
    if (!organization) return;
    setFormData({
      id: organization.id,
      name: organization.name,
      gstNumber: organization.gstNumber || "",
      panNumber: organization.panNumber || "",
      registrationNumber: organization.registrationNumber || "",
      headquartersAddress: organization.headquartersAddress || "",
      isActive: organization.isActive,
      // Don't put logo.url here — absolute URLs exceed ImageField varchar and must not be re-saved
      logo: "",
      llmApiKey: organization.llmApiKey || "",
      accent: organization.accent || "teal",
      faceAttendanceEnabled: organization.faceAttendanceEnabled ?? false,
      weekendDays: Array.isArray(organization.weekendDays)
        ? [...organization.weekendDays]
        : [6],
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: "",
      gstNumber: "",
      panNumber: "",
      registrationNumber: "",
      headquartersAddress: "",
      logo: "",
      llmApiKey: "",
      accent: "teal",
      faceAttendanceEnabled: false,
      weekendDays: [6],
    });
  };

  const toggleWeekendDay = (day: number) => {
    setFormData((prev: OrganizationInput & { weekendDays?: number[] }) => {
      const current = Array.isArray(prev.weekendDays) ? [...prev.weekendDays] : [];
      const next = current.includes(day)
        ? current.filter((d) => d !== day)
        : [...current, day].sort((a, b) => a - b);
      return { ...prev, weekendDays: next };
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateOrganization(formData);
      toast.success("Organization updated");
      await refetchOrganization();
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to update organization");
    }
  };

  const handleLogoClick = () => {
    if (isEditing) fileInputRef.current?.click();
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB.");
      return;
    }

    setIsUploading(true);
    const data = new FormData();
    data.append("logo", file);

    try {
      const response = await api.patch(`${API_ENDPOINTS.ORGANIZATIONS}${id}/`, data);
      if (response.data) {
        toast.success("Logo updated");
        await refetchOrganization();
        setFormData({ ...formData, logo: response.data.logo });
      }
    } catch (error: any) {
      console.error("Logo upload failed:", error);
      let errorMsg = "Failed to upload logo.";
      if (error.response?.data) {
        const data = error.response.data;
        const firstKey = Object.keys(data)[0];
        if (firstKey) {
          const firstErr = data[firstKey];
          errorMsg += ` ${firstKey}: ${Array.isArray(firstErr) ? firstErr[0] : firstErr}`;
        }
      }
      toast.error(errorMsg);
    } finally {
      setIsUploading(false);
    }
  };

  if (isOrganizationLoading || !user) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
        <p className="text-sm text-muted-foreground">Loading organization…</p>
      </div>
    );
  }

  if (isOrganizationError) {
    return (
      <div className="mx-auto max-w-md rounded-xl border border-destructive/20 bg-destructive/5 px-6 py-10 text-center">
        <h3 className="text-base font-semibold text-foreground">Couldn’t load organization</h3>
        <p className="mt-2 text-sm text-muted-foreground">{isOrganizationError.message}</p>
        <Button onClick={() => refetchOrganization()} variant="outline" className="mt-6">
          Try again
        </Button>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="mx-auto max-w-md rounded-xl border border-dashed border-border px-6 py-10 text-center">
        <p className="text-sm text-muted-foreground">Organization not found.</p>
        <Button onClick={() => router.back()} variant="link" className="mt-3">
          Go back
        </Button>
      </div>
    );
  }

  const isAuthorized = user.role === "admin" || user.role === "superadmin";

  if (!isAuthorized) {
    return (
      <div className="mx-auto max-w-md rounded-xl border border-border bg-card px-6 py-12 text-center">
        <h3 className="text-base font-semibold text-foreground">Access restricted</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Only admins can view organization details.
        </p>
        <button
          onClick={() => router.push("/dashboard")}
          className="mt-6 inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Back to dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="page-shell mx-auto max-w-5xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <PageHeader title={organization.name} description="Organization profile and tax details" />
        </div>
        {isAuthorized && !isEditing && (
          <Button onClick={handleStartEdit} className="shrink-0">
            <Edit3 className="mr-2 h-4 w-4" />
            Edit profile
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-1">
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex flex-col items-center text-center">
              <button
                type="button"
                onClick={handleLogoClick}
                className={cn(
                  "relative mb-4 flex h-24 w-24 items-center justify-center overflow-hidden rounded-xl border border-border bg-muted",
                  isEditing && "cursor-pointer hover:border-primary/40"
                )}
              >
                {organization.logo?.url ? (
                  <img
                    src={organization.logo.url}
                    alt=""
                    className="h-16 w-16 object-contain"
                  />
                ) : (
                  <Building2 className="h-8 w-8 text-primary" />
                )}
                {isEditing && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-foreground/50 text-background opacity-0 transition-opacity hover:opacity-100">
                    {isUploading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <Camera className="mb-1 h-4 w-4" />
                        <span className="text-[10px]">Upload</span>
                      </>
                    )}
                  </div>
                )}
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleLogoChange}
                className="hidden"
                accept="image/*"
              />

              <div className="mb-4 flex items-center gap-2">
                <span
                  className={cn(
                    "rounded-md px-1.5 py-0.5 text-[11px] font-medium",
                    organization.isActive
                      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                      : "bg-destructive/10 text-destructive"
                  )}
                >
                  {organization.isActive ? "Active" : "Suspended"}
                </span>
              </div>

              <div className="grid w-full grid-cols-2 gap-2">
                <div className="rounded-lg border border-border bg-muted/30 px-3 py-2.5">
                  <p className="text-[11px] text-muted-foreground">Employees</p>
                  <p className="text-lg font-semibold tabular-nums text-foreground">
                    {organization.employeeCount || 0}
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-muted/30 px-3 py-2.5">
                  <p className="text-[11px] text-muted-foreground">Since</p>
                  <p className="text-lg font-semibold tabular-nums text-foreground">
                    {moment(organization.createdAt).format("YYYY")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="mb-3 text-sm font-semibold text-foreground">Activity</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Created</span>
                <span className="text-foreground">
                  {moment(organization.createdAt).format("DD MMM YYYY")}
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Updated</span>
                <span className="text-foreground">
                  {moment(organization.updatedAt).format("DD MMM YYYY")}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          {isEditing ? (
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="mb-5 flex items-center justify-between border-b border-border pb-4">
                <h2 className="text-base font-semibold text-foreground">Edit details</h2>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="text-muted-foreground hover:text-foreground"
                  aria-label="Cancel"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Input
                    label="Organization name"
                    placeholder="Legal name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                  <Input
                    label="Registration number"
                    placeholder="Registration number"
                    value={formData.registrationNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, registrationNumber: e.target.value })
                    }
                  />
                  <Input
                    label="GST number"
                    placeholder="GST number"
                    value={formData.gstNumber}
                    onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                  />
                  <Input
                    label="PAN number"
                    placeholder="PAN number"
                    value={formData.panNumber}
                    onChange={(e) => setFormData({ ...formData, panNumber: e.target.value })}
                  />
                  <div className="md:col-span-2">
                    <Input
                      label="Headquarters"
                      placeholder="Address"
                      value={formData.headquartersAddress}
                      onChange={(e) =>
                        setFormData({ ...formData, headquartersAddress: e.target.value })
                      }
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Input
                      label="LLM API key"
                      placeholder="Organization API key"
                      type="password"
                      value={formData.llmApiKey}
                      onChange={(e) => setFormData({ ...formData, llmApiKey: e.target.value })}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <AccentPicker
                      value={formData.accent || "teal"}
                      onChange={(accent) => setFormData({ ...formData, accent })}
                    />
                  </div>
                  <div className="md:col-span-2 flex items-center justify-between gap-4 rounded-xl border border-border bg-muted/20 p-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <ScanFace className="h-4 w-4 text-primary" />
                        Face attendance
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {canFaceAttendance
                          ? "Require face verification for check-in/out on web and mobile."
                          : `Requires the ${planLabel(requiredPlan("face_attendance"))} plan. Upgrade in Settings → Plan & billing.`}
                      </p>
                    </div>
                    <Switch
                      checked={canFaceAttendance && !!formData.faceAttendanceEnabled}
                      disabled={!canFaceAttendance}
                      onCheckedChange={(checked) => {
                        if (!canFaceAttendance) return;
                        setFormData({ ...formData, faceAttendanceEnabled: checked });
                      }}
                    />
                  </div>
                  <div className="md:col-span-2 space-y-3 rounded-xl border border-border bg-muted/20 p-4">
                    <div>
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <CalendarDays className="h-4 w-4 text-primary" />
                        Weekly offs (weekends)
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Selected days are excluded from leave duration and shown as weekend
                        on the employee dashboard. Toggle Saturday for a 5-day week, or add
                        more days as needed.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {WEEKDAY_OPTIONS.map((day) => {
                        const selected = (formData.weekendDays || []).includes(day.value);
                        return (
                          <button
                            key={day.value}
                            type="button"
                            onClick={() => toggleWeekendDay(day.value)}
                            className={cn(
                              "rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
                              selected
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border bg-background text-muted-foreground hover:bg-muted"
                            )}
                            aria-pressed={selected}
                          >
                            {day.short}
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8"
                        onClick={() =>
                          setFormData({ ...formData, weekendDays: [6] })
                        }
                      >
                        Sun only
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8"
                        onClick={() =>
                          setFormData({ ...formData, weekendDays: [5, 6] })
                        }
                      >
                        Sat + Sun
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8"
                        onClick={() =>
                          setFormData({ ...formData, weekendDays: [4, 5] })
                        }
                      >
                        Fri + Sat
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button disabled={isUpdatingOrganizationLoading}>
                    {isUpdatingOrganizationLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving…
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save changes
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="mb-3 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <h2 className="text-sm font-semibold text-foreground">Headquarters</h2>
                </div>
                <p className="text-sm text-muted-foreground">
                  {organization.headquartersAddress || "No address on file"}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <DataBox
                  icon={Hash}
                  label="Registration"
                  value={organization.registrationNumber}
                />
                <DataBox icon={FileText} label="GST number" value={organization.gstNumber} />
                <DataBox icon={CreditCard} label="PAN number" value={organization.panNumber} />
                <DataBox
                  icon={Hash}
                  label="LLM API key"
                  value={organization.llmApiKey ? "••••••••••••••••" : "Not set"}
                />
                <DataBox
                  icon={Hash}
                  label="Color theme"
                  value={
                    COMPANY_ACCENTS.find((a) => a.name === (organization.accent || "teal"))
                      ?.label || "Teal"
                  }
                />
                <DataBox
                  icon={ScanFace}
                  label="Face attendance"
                  value={
                    !canFaceAttendance
                      ? `Unavailable (${planLabel(requiredPlan("face_attendance"))}+)`
                      : organization.faceAttendanceEnabled
                        ? "Enabled"
                        : "Disabled"
                  }
                />
                <DataBox
                  icon={CalendarDays}
                  label="Weekly offs"
                  value={formatWeekendDays(organization.weekendDays)}
                />
              </div>

              <div className="flex flex-col items-start justify-between gap-4 rounded-xl border border-border bg-card p-5 sm:flex-row sm:items-center">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Employees</h3>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {organization.employeeCount || 0} people in this organization
                  </p>
                </div>
                <Button onClick={() => router.push("/employees")} variant="outline">
                  Open directory
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DataBox({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string | undefined;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-2 flex items-center gap-2 text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        <span className="text-xs">{label}</span>
      </div>
      <p className="truncate text-sm font-medium text-foreground">{value || "—"}</p>
    </div>
  );
}
