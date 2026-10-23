"use client";

import { useState, useEffect, useMemo } from "react";
import { User } from "@/lib/graphql/users/types";
import {
  useGraphQLPromoteEmployee,
  useGraphQLEligibleManagers,
} from "@/lib/graphql/users/userHook";
import {
  useGraphQLDepartments,
  useGraphQLDesignations,
} from "@/lib/graphql/organization/organizationsHook";
import { AdaptiveModal } from "@/components/common/AdaptiveModal";
import { FormSelect } from "@/components/common/FormSelect";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { DatePickerSimple } from "@/components/ui/datePicker";
import {
  TrendingUp,
  Award,
  Building2,
  Briefcase,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Info,
} from "lucide-react";
import Image from "next/image";
import moment from "moment";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { getPromotionEligibility } from "./EmployeeForm";

interface PromotionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: User | null;
  onSuccess: () => void;
}

const HIERARCHY_LEVEL_OPTIONS = [
  {
    value: "1",
    label: "Level 1 • Executive Leadership (CEO, MD, Founder)",
    tier: "Executive",
  },
  {
    value: "2",
    label: "Level 2 • Senior Leadership (Director, VP, Regional Head)",
    tier: "Leadership",
  },
  {
    value: "3",
    label: "Level 3 • Management (Manager, Lead, HRBP) — Eligible Manager",
    tier: "Management",
  },
  {
    value: "4",
    label: "Level 4 • Professional / Senior IC (Staff, Dev, QA, DevOps)",
    tier: "Professional",
  },
  {
    value: "5",
    label: "Level 5 • Associate / Support (Associate, Operations, IT, Intern)",
    tier: "Associate",
  },
];

const ROLE_OPTIONS = [
  { value: "employee", label: "Employee (Individual Contributor)" },
  { value: "manager", label: "Manager (People Manager)" },
  { value: "hr", label: "HR / HRBP" },
  { value: "admin", label: "Admin" },
];

export default function PromotionModal({
  open,
  onOpenChange,
  employee,
  onSuccess,
}: PromotionModalProps) {
  const orgId = employee?.organization?.id ? String(employee.organization.id) : undefined;

  const { designations } = useGraphQLDesignations(undefined, orgId);
  const { departments } = useGraphQLDepartments(undefined, orgId);
  const { managers: eligibleManagers, isLoading: isManagersLoading } =
    useGraphQLEligibleManagers(orgId);
  const { promoteEmployee, isPromoting } = useGraphQLPromoteEmployee();

  // Form states
  const [newDesignationId, setNewDesignationId] = useState("");
  const [newDepartmentId, setNewDepartmentId] = useState("");
  const [newRole, setNewRole] = useState("employee");
  const [newHierarchyLevel, setNewHierarchyLevel] = useState("3");
  const [newManagerId, setNewManagerId] = useState("none");
  const [makeManager, setMakeManager] = useState(false);
  const [annualCtc, setAnnualCtc] = useState("");
  const [effectiveDate, setEffectiveDate] = useState(() =>
    moment().format("YYYY-MM-DD")
  );
  const [promotionNotes, setPromotionNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Sync initial form values when employee changes
  useEffect(() => {
    if (employee && open) {
      const currentLevel =
        employee.hierarchyLevel !== undefined && employee.hierarchyLevel !== null
          ? String(employee.hierarchyLevel)
          : "4";

      setNewDesignationId(employee.designation?.id ? String(employee.designation.id) : "");
      setNewDepartmentId(employee.department?.id ? String(employee.department.id) : "");
      setNewRole(employee.role || "employee");
      // Default recommended hierarchy level: if current level is 4 or 5, suggest level 3 (Management)
      const suggestedLevel = Number(currentLevel) > 3 ? "3" : currentLevel;
      setNewHierarchyLevel(suggestedLevel);
      setMakeManager(employee.isManager || employee.role === "manager" || suggestedLevel === "3");
      setNewManagerId(employee.manager?.id ? String(employee.manager.id) : "none");
      setAnnualCtc(
        employee.salaryDetails?.annualCtc
          ? String(employee.salaryDetails.annualCtc)
          : ""
      );
      setEffectiveDate(moment().format("YYYY-MM-DD"));
      setPromotionNotes("");
      setErrors({});
    }
  }, [employee, open]);

  // Handle Designation change: auto-recommend hierarchy level if designation specifies one
  const handleDesignationChange = (desigId: string) => {
    setNewDesignationId(desigId);
    if (!desigId) return;
    const selected = designations?.find((d) => String(d.id) === desigId);
    if (selected?.hierarchyLevel) {
      setNewHierarchyLevel(String(selected.hierarchyLevel));
      if (selected.hierarchyLevel <= 3) {
        setMakeManager(true);
        if (newRole === "employee") {
          setNewRole("manager");
        }
      }
    }
  };

  // Handle Make Manager toggle
  const handleMakeManagerToggle = (checked: boolean) => {
    setMakeManager(checked);
    if (checked) {
      if (Number(newHierarchyLevel) > 3) {
        setNewHierarchyLevel("3");
      }
      if (newRole === "employee") {
        setNewRole("manager");
      }
    } else {
      if (newRole === "manager") {
        setNewRole("employee");
      }
    }
  };

  // Handle Role change
  const handleRoleChange = (role: string) => {
    setNewRole(role);
    if (role === "manager" || role === "admin" || role === "hr") {
      setMakeManager(true);
      if (Number(newHierarchyLevel) > 3) {
        setNewHierarchyLevel(role === "admin" ? "1" : "3");
      }
    }
  };

  // Handle Hierarchy Level change
  const handleLevelChange = (levelStr: string) => {
    setNewHierarchyLevel(levelStr);
    const lvl = Number(levelStr);
    if (lvl <= 3) {
      setMakeManager(true);
    } else {
      setMakeManager(false);
      if (newRole === "manager") {
        setNewRole("employee");
      }
    }
  };

  // Hike calculation helper
  const hikeDetails = useMemo(() => {
    const currentCtc = Number(employee?.salaryDetails?.annualCtc || 0);
    const revisedCtc = Number(annualCtc || 0);
    if (!currentCtc || !revisedCtc || revisedCtc <= currentCtc) {
      return null;
    }
    const hikeDiff = revisedCtc - currentCtc;
    const hikePercent = ((hikeDiff / currentCtc) * 100).toFixed(1);
    return {
      diff: hikeDiff,
      percent: hikePercent,
    };
  }, [employee?.salaryDetails?.annualCtc, annualCtc]);

  // Options lists
  const designationOptions = useMemo(() => {
    return (designations || []).map((d) => ({
      label: d.hierarchyLevel ? `${d.name} (Grade L${d.hierarchyLevel})` : d.name,
      value: String(d.id),
    }));
  }, [designations]);

  const departmentOptions = useMemo(() => {
    return (departments || []).map((d) => ({
      label: d.name,
      value: String(d.id),
    }));
  }, [departments]);

  const managerOptions = useMemo(() => {
    const list = [{ label: "No reporting manager (Independent)", value: "none" }];
    const selfId = employee?.id ? String(employee.id) : "";

    const available = (eligibleManagers || [])
      .filter((m) => String(m.id) !== selfId)
      .map((m) => {
        const desig = m.designation?.name ? ` • ${m.designation.name}` : "";
        const level =
          m.hierarchyLevel !== undefined && m.hierarchyLevel !== null
            ? ` (L${m.hierarchyLevel})`
            : "";
        return {
          label: `${m.firstName} ${m.lastName}${desig}${level}`,
          value: String(m.id),
        };
      });

    return [...list, ...available];
  }, [eligibleManagers, employee?.id]);

  const eligibility = useMemo(() => getPromotionEligibility(employee), [employee]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee) return;

    if (!eligibility.eligible) {
      toast.error(eligibility.reason || "Employee is not eligible for promotion.");
      return;
    }

    const newErrors: Record<string, string> = {};
    if (!newDesignationId) {
      newErrors.designation = "New designation is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const payload = {
        userId: employee.id,
        newRole,
        newHierarchyLevel: parseInt(newHierarchyLevel, 10),
        newDesignationId: newDesignationId || undefined,
        newDepartmentId: newDepartmentId || undefined,
        newManagerId: newManagerId === "none" ? undefined : newManagerId,
        makeManager,
        annualCtc: annualCtc ? parseFloat(annualCtc) : undefined,
        effectiveDate: effectiveDate || undefined,
        promotionNotes: promotionNotes.trim() || undefined,
      };

      const result = await promoteEmployee(payload);

      if (result?.success) {
        const desigName =
          designations?.find((d) => String(d.id) === newDesignationId)?.name ||
          "new role";
        toast.success(
          `🎉 ${employee.firstName} ${employee.lastName} has been successfully promoted to ${desigName}!`,
          {
            description: makeManager
              ? "They are now qualified and listed as a Reporting Manager for other employees."
              : "Employee profile and hierarchy grade updated.",
            duration: 5000,
          }
        );
        onSuccess();
        onOpenChange(false);
      } else {
        toast.error(result?.error || "Failed to process promotion.");
      }
    } catch (err: any) {
      toast.error(err?.message || "An unexpected error occurred.");
    }
  };

  if (!employee) return null;

  const currentLevelLabel =
    HIERARCHY_LEVEL_OPTIONS.find(
      (opt) => opt.value === String(employee.hierarchyLevel ?? 4)
    )?.tier || "Staff";

  return (
    <AdaptiveModal
      open={open}
      onOpenChange={onOpenChange}
      title="Promote Employee"
      description="Advance employee role, hierarchy grade, title, and managerial authority."
      className="sm:max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        <div className="p-6 space-y-6">
          {/* Employee Current Snapshot Card */}
          <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-card via-card to-primary/5 p-4 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl border-2 border-border bg-muted shadow-sm">
                {employee.profilePictureUrl ? (
                  <Image
                    src={employee.profilePictureUrl}
                    alt=""
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-lg font-bold text-primary bg-primary/10">
                    {employee.firstName?.charAt(0)}
                    {employee.lastName?.charAt(0)}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-bold text-foreground truncate">
                    {employee.firstName} {employee.lastName}
                  </h4>
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground font-semibold">
                    {employee.employeeId || "No ID"}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1 font-medium text-foreground">
                    <Briefcase className="h-3 w-3 text-primary" />
                    {employee.designation?.name || "No designation"}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Building2 className="h-3 w-3 text-primary" />
                    {employee.department?.name || "General"}
                  </span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block">
                  Current Grade
                </span>
                <span className="inline-flex items-center gap-1 mt-0.5 rounded-full px-2.5 py-0.5 text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                  <Award className="h-3 w-3" />
                  Level {employee.hierarchyLevel ?? 4} ({currentLevelLabel})
                </span>
              </div>
            </div>

            {/* Path Progression Visualizer */}
            <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <span className="font-medium">Current:</span>
                <span className="text-foreground font-semibold">
                  {employee.designation?.name || "Employee"} (L{employee.hierarchyLevel ?? 4})
                </span>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-primary animate-pulse" />
              <div className="flex items-center gap-1.5 text-primary font-semibold">
                <span>Promoted:</span>
                <span className="decoration-primary decoration-2 underline-offset-2">
                  Level {newHierarchyLevel}{" "}
                  {makeManager ? "• Reporting Manager" : ""}
                </span>
              </div>
            </div>
          </div>

          {!eligibility.eligible && (
            <div className="flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-xs text-destructive">
              <Info className="h-5 w-5 shrink-0 mt-0.5 text-destructive" />
              <div>
                <p className="font-bold text-sm">Promotion Restricted</p>
                <p className="mt-0.5 text-destructive/90">{eligibility.reason}</p>
                <p className="mt-1 text-[11px] opacity-75">
                  HR Rule: Employees must be active, verified through onboarding, and have completed at least 90 days of tenure before promotion.
                </p>
              </div>
            </div>
          )}

          {/* Manager Authority Switch Highlight */}
          <div
            className={cn(
              "rounded-xl border p-4 transition-all duration-200",
              makeManager
                ? "border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-950/20"
                : "border-border bg-muted/20"
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <ShieldCheck
                    className={cn(
                      "h-4 w-4",
                      makeManager ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
                    )}
                  />
                  <span className="text-sm font-semibold text-foreground">
                    Promote to Reporting Manager
                  </span>
                  {makeManager && (
                    <span className="rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider">
                      Manager Listed
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Enabling this qualifies this employee as a Reporting Manager. Their name will
                  immediately appear in all Manager selection dropdowns (onboarding, hiring, and
                  roster).
                </p>
              </div>
              <Switch
                checked={makeManager}
                onCheckedChange={handleMakeManagerToggle}
              />
            </div>
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* New Designation */}
            <FormSelect
              label="New Designation"
              name="newDesignationId"
              required
              value={newDesignationId}
              onValueChange={handleDesignationChange}
              options={designationOptions}
              placeholder="Select promoted title"
              error={errors.designation}
            />

            {/* Hierarchy Grade / Level */}
            <FormSelect
              label="Hierarchy Grade / Level"
              name="newHierarchyLevel"
              required
              value={newHierarchyLevel}
              onValueChange={handleLevelChange}
              options={HIERARCHY_LEVEL_OPTIONS.map((opt) => ({
                label: opt.label,
                value: opt.value,
              }))}
            />

            {/* Role Assignment */}
            <FormSelect
              label="System Role"
              name="newRole"
              required
              value={newRole}
              onValueChange={handleRoleChange}
              options={ROLE_OPTIONS}
            />

            {/* Department (Optional shift) */}
            <FormSelect
              label="Department"
              name="newDepartmentId"
              value={newDepartmentId}
              onValueChange={setNewDepartmentId}
              options={departmentOptions}
              placeholder="Keep current department"
            />

            {/* Reports To (New Manager) */}
            <div className="sm:col-span-2">
              <FormSelect
                label="New Reporting Manager (Reports To)"
                name="newManagerId"
                value={newManagerId}
                onValueChange={setNewManagerId}
                options={managerOptions}
                placeholder="Select their new manager"
              />
              <p className="mt-1 text-[11px] text-muted-foreground flex items-center gap-1">
                <Info className="h-3 w-3 text-muted-foreground/80" />
                Only managers and higher hierarchy levels (L1–L3) appear in this list.
              </p>
            </div>

            {/* Revised Annual CTC */}
            <div>
              <Input
                label="Revised Annual CTC (₹)"
                name="annualCtc"
                type="number"
                placeholder="e.g. 1200000"
                value={annualCtc}
                onChange={(e) => setAnnualCtc(e.target.value)}
              />
              {hikeDetails && (
                <p className="mt-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +{hikeDetails.percent}% Hike (+₹{hikeDetails.diff.toLocaleString("en-IN")})
                </p>
              )}
            </div>

            {/* Effective Date */}
            <div>
              <DatePickerSimple
                label="Effective Date"
                value={effectiveDate}
                onChange={(date) =>
                  setEffectiveDate(date ? moment(date).format("YYYY-MM-DD") : "")
                }
                allowFuture
              />
            </div>
          </div>

          {/* Promotion Notes / Merit Summary */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Promotion Announcement / Justification Notes (Optional)
            </label>
            <textarea
              value={promotionNotes}
              onChange={(e) => setPromotionNotes(e.target.value)}
              placeholder="e.g. Promoted to Senior Engineering Lead for stellar performance in Q3 and delivery of core architecture."
              rows={3}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {/* Modal Sticky Footer */}
        <div className="sticky bottom-0 z-10 flex items-center justify-end gap-3 border-t border-border bg-card px-6 py-4">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={isPromoting}
            className="inline-flex h-9 items-center justify-center rounded-lg border border-border bg-background px-4 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPromoting || !eligibility.eligible}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isPromoting ? (
              <>
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                Processing Promotion…
              </>
            ) : (
              <>
                <TrendingUp className="h-4 w-4" />
                Confirm Promotion
              </>
            )}
          </button>
        </div>
      </form>
    </AdaptiveModal>
  );
}
