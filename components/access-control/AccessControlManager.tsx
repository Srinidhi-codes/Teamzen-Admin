"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import {
  GET_PLAN_FEATURE_MATRIX,
  GET_ORGANIZATION_ENTITLEMENTS,
  GET_COMPANY_ADMIN_DELEGATION,
  GET_ROLE_PERMISSION_MATRIX,
} from "@/lib/graphql/access-control/queries";
import {
  UPDATE_PLAN_FEATURE_DEFAULT,
  UPDATE_ORGANIZATION_FEATURE_OVERRIDE,
  RESET_ORGANIZATION_FEATURE_OVERRIDE,
  UPDATE_COMPANY_ADMIN_DELEGATION,
  UPDATE_ROLE_PERMISSION,
  RESET_ROLE_PERMISSIONS_TO_DEFAULT,
  CREATE_CUSTOM_ROLE,
  DELETE_CUSTOM_ROLE,
} from "@/lib/graphql/access-control/mutations";
import { useGraphQLOrganizations } from "@/lib/graphql/organization/organizationsHook";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Layers,
  Building,
  KeyRound,
  Sliders,
  Check,
  RotateCcw,
  Search,
  RefreshCw,
  Sparkles,
  Info,
  Lock,
  Eye,
  SlidersHorizontal,
  ChevronRight,
  UserCheck,
  Plus,
  Trash2,
  UserPlus,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/common/PageHeader";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Pagination } from "@/components/common/Pagination";
import { useStore } from "@/lib/store/useStore";

export function AccessControlManager() {
  const { user } = useStore();
  const isSuperadmin = user?.role === "superadmin";
  const isAdmin = user?.role === "admin";

  const [isHydrated, setIsHydrated] = useState(false);

  React.useEffect(() => {
    if (useStore.persist?.hasHydrated?.()) {
      setIsHydrated(true);
      return;
    }
    const unsub = useStore.persist?.onFinishHydration?.(() => {
      setIsHydrated(true);
    });
    const timer = setTimeout(() => {
      setIsHydrated(true);
    }, 150);
    return () => {
      unsub?.();
      clearTimeout(timer);
    };
  }, []);

  const [activeMainTab, setActiveMainTab] = useState<"plans" | "companies" | "workforce">(
    isSuperadmin ? "plans" : "workforce"
  );

  // Selected organization for company entitlements & workforce role matrix
  const { organizations = [] } = useGraphQLOrganizations();
  const [selectedOrgId, setSelectedOrgId] = useState<string>("");

  const orgList = organizations || [];

  // Default to user's org if available, or first org
  React.useEffect(() => {
    if (!selectedOrgId) {
      const userOrgId = (user as any)?.organization?.id || (user as any)?.organizationId;
      if (userOrgId) {
        setSelectedOrgId(String(userOrgId));
      } else if (orgList.length > 0) {
        setSelectedOrgId(String(orgList[0].id));
      }
    }
  }, [selectedOrgId, user, orgList]);

  const currentOrg = useMemo(() => {
    return orgList.find((o: any) => String(o.id) === String(selectedOrgId));
  }, [orgList, selectedOrgId]);

  // Search & Category filter
  const [searchFilter, setSearchFilter] = useState("");

  // --- TAB 1: Plan Feature Matrix (Super Admin) ---
  const {
    data: planMatrixData,
    loading: planMatrixLoading,
    refetch: refetchPlanMatrix,
  } = useQuery<any>(GET_PLAN_FEATURE_MATRIX, {
    skip: !isSuperadmin,
    fetchPolicy: "cache-and-network",
  });

  const [updatePlanDefault] = useMutation(UPDATE_PLAN_FEATURE_DEFAULT, {
    onCompleted: () => {
      toast.success("Plan feature default updated");
      refetchPlanMatrix();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to update plan feature");
    },
  });

  // --- TAB 2: Company Entitlements & Admin Delegation (Super Admin) ---
  const {
    data: orgEntitlementsData,
    loading: orgEntitlementsLoading,
    refetch: refetchOrgEntitlements,
  } = useQuery<any>(GET_ORGANIZATION_ENTITLEMENTS, {
    variables: { organizationId: selectedOrgId },
    skip: !isSuperadmin || !selectedOrgId,
    fetchPolicy: "cache-and-network",
  });

  const {
    data: delegationData,
    loading: delegationLoading,
    refetch: refetchDelegation,
  } = useQuery<any>(GET_COMPANY_ADMIN_DELEGATION, {
    variables: { organizationId: selectedOrgId },
    skip: !isSuperadmin || !selectedOrgId,
    fetchPolicy: "cache-and-network",
  });

  const [updateOrgOverride] = useMutation(UPDATE_ORGANIZATION_FEATURE_OVERRIDE, {
    onCompleted: () => {
      toast.success("Company feature override saved");
      refetchOrgEntitlements();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to update override");
    },
  });

  const [resetOrgOverride] = useMutation(RESET_ORGANIZATION_FEATURE_OVERRIDE, {
    onCompleted: () => {
      toast.success("Reverted module to subscription plan default");
      refetchOrgEntitlements();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to reset override");
    },
  });

  const [updateDelegation, { loading: isUpdatingDelegation }] = useMutation(
    UPDATE_COMPANY_ADMIN_DELEGATION,
    {
      onCompleted: () => {
        toast.success("Company admin delegation permissions updated");
        refetchDelegation();
      },
      onError: (err) => {
        toast.error(err.message || "Failed to update delegation");
      },
    }
  );

  // Local state for delegation toggles
  const [delegationState, setDelegationState] = useState({
    can_manage_payroll: true,
    can_manage_leaves: true,
    can_manage_attendance: true,
    can_manage_employees: true,
    can_manage_email_templates: true,
    can_manage_onboarding: true,
    can_manage_policies: true,
    can_manage_rbac: true,
  });

  React.useEffect(() => {
    if (delegationData?.companyAdminDelegation) {
      const d = delegationData.companyAdminDelegation;
      setDelegationState({
        can_manage_payroll: d.canManagePayroll,
        can_manage_leaves: d.canManageLeaves,
        can_manage_attendance: d.canManageAttendance,
        can_manage_employees: d.canManageEmployees,
        can_manage_email_templates: d.canManageEmailTemplates,
        can_manage_onboarding: d.canManageOnboarding,
        can_manage_policies: d.canManagePolicies,
        can_manage_rbac: d.canManageRbac,
      });
    }
  }, [delegationData]);

  // --- TAB 3: Workforce Role Permission Matrix (Super Admin & Company Admin) ---
  const {
    data: roleMatrixData,
    loading: roleMatrixLoading,
    refetch: refetchRoleMatrix,
  } = useQuery<any>(GET_ROLE_PERMISSION_MATRIX, {
    variables: { organizationId: selectedOrgId },
    skip: !selectedOrgId,
    fetchPolicy: "cache-and-network",
  });

  const [updateRolePermission] = useMutation(UPDATE_ROLE_PERMISSION, {
    onCompleted: () => {
      toast.success("Role access permission updated");
      refetchRoleMatrix();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to update role permission");
    },
  });

  const [resetRolePermissions] = useMutation(RESET_ROLE_PERMISSIONS_TO_DEFAULT, {
    onCompleted: () => {
      toast.success("Workforce role permissions reset to default presets");
      refetchRoleMatrix();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to reset role permissions");
    },
  });

  const [createCustomRole, { loading: isCreatingRole }] = useMutation(CREATE_CUSTOM_ROLE, {
    onCompleted: () => {
      toast.success("Workforce role created successfully");
      refetchRoleMatrix();
      setAddRoleModalOpen(false);
      setNewRoleLabel("");
      setNewRoleKey("");
      setNewRoleDescription("");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to create custom role");
    },
  });

  const [deleteCustomRole, { loading: isDeletingRole }] = useMutation(DELETE_CUSTOM_ROLE, {
    onCompleted: () => {
      toast.success("Role removed successfully");
      refetchRoleMatrix();
      setSelectedRole("employee");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to delete role");
    },
  });

  // Selected role for workforce matrix
  const [selectedRole, setSelectedRole] = useState<string>("employee");

  // Add custom role modal state
  const [addRoleModalOpen, setAddRoleModalOpen] = useState(false);
  const [newRoleLabel, setNewRoleLabel] = useState("");
  const [newRoleKey, setNewRoleKey] = useState("");
  const [newRoleBasePreset, setNewRoleBasePreset] = useState("employee");
  const [newRoleDescription, setNewRoleDescription] = useState("");

  const planMatrix = planMatrixData?.planFeatureMatrix || [];
  const orgEntitlements = orgEntitlementsData?.organizationEntitlements || [];
  const roleMatrices = roleMatrixData?.rolePermissionMatrix || [];

  React.useEffect(() => {
    if (roleMatrices.length > 0 && !roleMatrices.some((r: any) => r.role === selectedRole)) {
      setSelectedRole(roleMatrices[0].role);
    }
  }, [roleMatrices, selectedRole]);

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleLabel.trim()) {
      toast.error("Please enter a role label");
      return;
    }
    const keyToUse = (
      newRoleKey.trim() ||
      newRoleLabel
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, "_")
        .replace(/_+/g, "_")
        .replace(/^_|_$/g, "")
    ).slice(0, 32);

    const res = await createCustomRole({
      variables: {
        organizationId: selectedOrgId,
        roleLabel: newRoleLabel.trim(),
        roleKey: keyToUse,
        copyFromRole: newRoleBasePreset,
        description: newRoleDescription.trim() || null,
      },
    });

    if ((res.data as any)?.createCustomRole) {
      setSelectedRole(keyToUse);
    }
  };

  const handleDeleteRole = (r: any) => {
    if (r.isSystemRole || ["admin", "hr", "manager", "employee"].includes(r.role)) {
      toast.error("Built-in system roles cannot be deleted");
      return;
    }
    if (
      confirm(
        `Are you sure you want to delete role "${r.roleLabel || r.role}"? Any users assigned to this role will default back to Employee.`
      )
    ) {
      deleteCustomRole({
        variables: {
          organizationId: selectedOrgId,
          roleKey: r.role,
        },
      });
    }
  };

  const currentRoleMatrix = useMemo(() => {
    return roleMatrices.find((r: any) => r.role === selectedRole);
  }, [roleMatrices, selectedRole]);

  // Filtered lists
  const filteredPlanMatrix = useMemo(() => {
    return planMatrix.filter((item: any) => {
      return (
        !searchFilter ||
        item.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
        item.description.toLowerCase().includes(searchFilter.toLowerCase()) ||
        item.category.toLowerCase().includes(searchFilter.toLowerCase())
      );
    });
  }, [planMatrix, searchFilter]);

  const filteredEntitlements = useMemo(() => {
    return orgEntitlements.filter((item: any) => {
      return (
        !searchFilter ||
        item.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
        item.description.toLowerCase().includes(searchFilter.toLowerCase())
      );
    });
  }, [orgEntitlements, searchFilter]);

  const filteredRolePermissions = useMemo(() => {
    if (!currentRoleMatrix) return [];
    return currentRoleMatrix.permissions.filter((p: any) => {
      return (
        !searchFilter ||
        p.moduleName.toLowerCase().includes(searchFilter.toLowerCase()) ||
        p.moduleCategory.toLowerCase().includes(searchFilter.toLowerCase())
      );
    });
  }, [currentRoleMatrix, searchFilter]);

  // Pagination states for all 3 tiers
  const pageSize = 10;
  const [plansPage, setPlansPage] = useState(1);
  const [entitlementsPage, setEntitlementsPage] = useState(1);
  const [rolePermissionsPage, setRolePermissionsPage] = useState(1);

  React.useEffect(() => {
    setPlansPage(1);
  }, [searchFilter]);

  React.useEffect(() => {
    setEntitlementsPage(1);
  }, [searchFilter, selectedOrgId]);

  React.useEffect(() => {
    setRolePermissionsPage(1);
  }, [searchFilter, selectedOrgId, selectedRole]);

  const totalPlansPages = Math.ceil(filteredPlanMatrix.length / pageSize) || 1;
  const paginatedPlanMatrix = useMemo(() => {
    const start = (plansPage - 1) * pageSize;
    return filteredPlanMatrix.slice(start, start + pageSize);
  }, [filteredPlanMatrix, plansPage, pageSize]);

  const totalEntitlementsPages = Math.ceil(filteredEntitlements.length / pageSize) || 1;
  const paginatedEntitlements = useMemo(() => {
    const start = (entitlementsPage - 1) * pageSize;
    return filteredEntitlements.slice(start, start + pageSize);
  }, [filteredEntitlements, entitlementsPage, pageSize]);

  const totalRolePermissionsPages = Math.ceil(filteredRolePermissions.length / pageSize) || 1;
  const paginatedRolePermissions = useMemo(() => {
    const start = (rolePermissionsPage - 1) * pageSize;
    return filteredRolePermissions.slice(start, start + pageSize);
  }, [filteredRolePermissions, rolePermissionsPage, pageSize]);

  // While store is hydrating on page reload, render a smooth skeleton placeholder instead of flashing "Access Restricted"
  if (!isHydrated && !isAdmin && !isSuperadmin) {
    return (
      <div className="w-full space-y-6 animate-pulse">
        <div className="flex flex-col gap-2">
          <div className="h-3 w-40 rounded bg-muted/60" />
          <div className="h-8 w-72 rounded bg-muted/80" />
          <div className="h-4 w-96 rounded bg-muted/50" />
        </div>
        <div className="h-[650px] rounded-2xl border border-border bg-card" />
      </div>
    );
  }

  // Genuinely unauthorized user (once store has fully hydrated)
  if (isHydrated && !isAdmin && !isSuperadmin) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Lock className="h-12 w-12 text-rose-500 mb-3" />
        <h2 className="text-lg font-bold text-foreground">Access Restricted</h2>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm">
          Access Control and Feature Governance is restricted strictly to Admin and Super Admin personnel.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header with Breadcrumbs */}
      <PageHeader
        title="Access Control & Feature Governance"
        description="Hierarchical governance across subscription plans, company entitlements, and workforce role permissions."
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (isSuperadmin) {
                refetchPlanMatrix();
                refetchOrgEntitlements();
                refetchDelegation();
              }
              refetchRoleMatrix();
            }}
            className="h-9 gap-1.5 text-xs font-medium cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
        }
      />

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-border pb-2">
        {isSuperadmin && (
          <button
            type="button"
            onClick={() => setActiveMainTab("plans")}
            className={cn(
              "flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all cursor-pointer",
              activeMainTab === "plans"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Layers className="h-4 w-4" />
            <span>Tier 1: Subscription Plan Matrix</span>
            <span className="rounded-full bg-white/20 px-1.5 py-0.2 text-[10px] font-bold">
              Global
            </span>
          </button>
        )}

        {isSuperadmin && (
          <button
            type="button"
            onClick={() => setActiveMainTab("companies")}
            className={cn(
              "flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all cursor-pointer",
              activeMainTab === "companies"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Building className="h-4 w-4" />
            <span>Tier 1: Company Overrides &amp; Delegation</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => setActiveMainTab("workforce")}
          className={cn(
            "flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all cursor-pointer",
            activeMainTab === "workforce"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <UserCheck className="h-4 w-4" />
          <span>Tier 2: Workforce Role Permissions</span>
        </button>
      </div>

      {/* ========================================================
          TIER 1: SUBSCRIPTION PLAN FEATURE MATRIX (SUPER ADMIN)
         ======================================================== */}
      {activeMainTab === "plans" && isSuperadmin && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-primary flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Subscription Plan Feature Entitlements
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5 max-w-2xl">
                Configure which website modules and features are granted by default when an organization purchases or subscribes to Free, Pro, or Elite plans.
              </p>
            </div>
            <div className="w-full sm:w-64">
              <Input
                type="text"
                placeholder="Search modules..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="h-8 text-xs rounded-xl bg-background"
              />
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <th className="p-4 min-w-[240px]">Website Section / Module</th>
                    <th className="p-4 min-w-[120px] text-center">Category</th>
                    <th className="p-4 text-center min-w-[120px]">
                      <span className="inline-block rounded-md bg-muted px-2 py-0.5 text-xs font-bold text-foreground">
                        Free Plan
                      </span>
                    </th>
                    <th className="p-4 text-center min-w-[120px]">
                      <span className="inline-block rounded-md bg-sky-500/10 px-2 py-0.5 text-xs font-bold text-sky-600 dark:text-sky-400 border border-sky-500/20">
                        Pro Plan
                      </span>
                    </th>
                    <th className="p-4 text-center min-w-[120px]">
                      <span className="inline-block rounded-md bg-violet-500/10 px-2 py-0.5 text-xs font-bold text-violet-600 dark:text-violet-400 border border-violet-500/20">
                        Elite Plan
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {planMatrixLoading ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-xs text-muted-foreground">
                        Loading plan entitlements...
                      </td>
                    </tr>
                  ) : (
                    paginatedPlanMatrix.map((item: any) => (
                      <tr key={item.key} className="hover:bg-muted/30 transition-colors">
                        <td className="p-4">
                          <p className="font-bold text-foreground text-sm">{item.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                            {item.description}
                          </p>
                        </td>
                        <td className="p-4 text-center">
                          <span className="rounded-md border border-border px-2 py-0.5 text-[11px] font-medium text-muted-foreground bg-muted/30">
                            {item.category}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex justify-center">
                            <Switch
                              checked={item.free}
                              onCheckedChange={(checked) =>
                                updatePlanDefault({
                                  variables: { plan: "free", moduleKey: item.key, isEnabled: checked },
                                })
                              }
                            />
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex justify-center">
                            <Switch
                              checked={item.pro}
                              onCheckedChange={(checked) =>
                                updatePlanDefault({
                                  variables: { plan: "pro", moduleKey: item.key, isEnabled: checked },
                                })
                              }
                            />
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex justify-center">
                            <Switch
                              checked={item.elite}
                              onCheckedChange={(checked) =>
                                updatePlanDefault({
                                  variables: { plan: "elite", moduleKey: item.key, isEnabled: checked },
                                })
                              }
                            />
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {totalPlansPages > 1 && (
              <div className="p-4 border-t border-border">
                <Pagination
                  currentPage={plansPage}
                  totalPages={totalPlansPages}
                  onPageChange={setPlansPage}
                  total={filteredPlanMatrix.length}
                  pageSize={pageSize}
                  label="modules"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          TIER 1: COMPANY PLAN OVERRIDES & DELEGATION (SUPER ADMIN)
         ======================================================== */}
      {activeMainTab === "companies" && isSuperadmin && (
        <div className="space-y-6">
          {/* Company Selector Header */}
          <div className="rounded-2xl border border-border bg-card p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <Building className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Target Organization
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <select
                    value={selectedOrgId}
                    onChange={(e) => setSelectedOrgId(e.target.value)}
                    className="h-9 rounded-xl border border-border bg-background px-3 text-xs font-bold text-foreground cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/40"
                  >
                    {orgList.map((org: any) => (
                      <option key={org.id} value={org.id}>
                        {org.name} ({org.plan?.toUpperCase() || "FREE"})
                      </option>
                    ))}
                  </select>

                  {currentOrg && (
                    <span className="rounded-md bg-primary/10 px-2 py-1 text-xs font-bold text-primary border border-primary/20">
                      Plan: {currentOrg.plan?.toUpperCase() || "FREE"}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="w-full sm:w-64">
              <Input
                type="text"
                placeholder="Search modules..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="h-8 text-xs rounded-xl bg-background"
              />
            </div>
          </div>

          {/* Section A: Company Feature Overrides */}
          <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
            <div className="border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Sliders className="h-4 w-4 text-primary" />
                Custom Plan Feature Overrides for {currentOrg?.name}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Grant enterprise features or revoke modules specifically for this company, overriding their base subscription plan.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <th className="p-3.5">Module</th>
                    <th className="p-3.5 text-center">Category</th>
                    <th className="p-3.5 text-center">Plan Default</th>
                    <th className="p-3.5 text-center">Status for this Org</th>
                    <th className="p-3.5 text-right">Override Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {orgEntitlementsLoading ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-xs text-muted-foreground">
                        Loading organization feature entitlements...
                      </td>
                    </tr>
                  ) : (
                    paginatedEntitlements.map((item: any) => (
                      <tr key={item.moduleKey} className="hover:bg-muted/30 transition-colors">
                        <td className="p-3.5">
                          <p className="font-bold text-foreground text-sm">{item.name}</p>
                          <p className="text-xs text-muted-foreground">{item.description}</p>
                        </td>
                        <td className="p-3.5 text-center">
                          <span className="rounded-md border border-border px-2 py-0.5 text-[11px] font-medium text-muted-foreground bg-muted/30">
                            {item.category}
                          </span>
                        </td>
                        <td className="p-3.5 text-center">
                          <span
                            className={cn(
                              "rounded-md px-2 py-0.5 text-xs font-semibold",
                              item.planDefault
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : "bg-muted text-muted-foreground"
                            )}
                          >
                            {item.planDefault ? "Included" : "Excluded"}
                          </span>
                        </td>
                        <td className="p-3.5 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Switch
                              checked={item.isEnabled}
                              onCheckedChange={(checked) =>
                                updateOrgOverride({
                                  variables: {
                                    organizationId: selectedOrgId,
                                    moduleKey: item.moduleKey,
                                    isEnabled: checked,
                                  },
                                })
                              }
                            />
                            <span
                              className={cn(
                                "text-xs font-bold",
                                item.isEnabled
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : "text-rose-600 dark:text-rose-400"
                              )}
                            >
                              {item.isEnabled ? "Active" : "Disabled"}
                            </span>
                          </div>
                        </td>
                        <td className="p-3.5 text-right">
                          {item.isOverridden ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                resetOrgOverride({
                                  variables: {
                                    organizationId: selectedOrgId,
                                    moduleKey: item.moduleKey,
                                  },
                                })
                              }
                              className="h-7 text-xs text-amber-600 hover:text-amber-700 hover:bg-amber-500/10 cursor-pointer"
                            >
                              <RotateCcw className="h-3 w-3 mr-1" />
                              Revert to Plan
                            </Button>
                          ) : (
                            <span className="text-[11px] text-muted-foreground">Using Plan</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {totalEntitlementsPages > 1 && (
              <div className="p-4 border-t border-border">
                <Pagination
                  currentPage={entitlementsPage}
                  totalPages={totalEntitlementsPages}
                  onPageChange={setEntitlementsPage}
                  total={filteredEntitlements.length}
                  pageSize={pageSize}
                  label="modules"
                />
              </div>
            )}
          </div>

          {/* Section B: Company Admin Delegated Privileges */}
          <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
            <div className="border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-primary" />
                Company Admin Delegation for {currentOrg?.name}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Selectively configure what the Company Admins of this organization are authorized to manage and administer.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              {[
                {
                  id: "can_manage_payroll",
                  title: "Manage Payroll",
                  desc: "Can run payroll, edit salary structures, and view employee compensations.",
                },
                {
                  id: "can_manage_leaves",
                  title: "Manage Leaves",
                  desc: "Can approve leaves, adjust leave quotas, and modify holiday calendars.",
                },
                {
                  id: "can_manage_attendance",
                  title: "Manage Attendance",
                  desc: "Can configure shifts, office geofences, and face attendance settings.",
                },
                {
                  id: "can_manage_employees",
                  title: "Manage Employees",
                  desc: "Can invite, edit, reassign, or terminate employee profiles.",
                },
                {
                  id: "can_manage_email_templates",
                  title: "Manage Email Templates",
                  desc: "Can toggle automated emails and customize email copies & templates.",
                },
                {
                  id: "can_manage_onboarding",
                  title: "Manage Onboarding",
                  desc: "Can configure candidate onboarding workflows and checklists.",
                },
                {
                  id: "can_manage_policies",
                  title: "Manage Policies",
                  desc: "Can publish and mandate company compliance policies.",
                },
                {
                  id: "can_manage_rbac",
                  title: "Manage Workforce RBAC",
                  desc: "Can customize role access levels for employees and managers.",
                },
              ].map((item) => {
                const checked = (delegationState as any)[item.id] ?? true;
                return (
                  <div
                    key={item.id}
                    className="flex flex-col justify-between rounded-xl border border-border bg-muted/20 p-4 space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-foreground">{item.title}</span>
                        <Switch
                          checked={checked}
                          onCheckedChange={(val) =>
                            setDelegationState((prev) => ({ ...prev, [item.id]: val }))
                          }
                        />
                      </div>
                      <p className="text-[11px] leading-relaxed text-muted-foreground mt-1.5">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-3">
              <Button
                size="sm"
                onClick={() => {
                  updateDelegation({
                    variables: {
                      organizationId: selectedOrgId,
                      canManagePayroll: delegationState.can_manage_payroll,
                      canManageLeaves: delegationState.can_manage_leaves,
                      canManageAttendance: delegationState.can_manage_attendance,
                      canManageEmployees: delegationState.can_manage_employees,
                      canManageEmailTemplates: delegationState.can_manage_email_templates,
                      canManageOnboarding: delegationState.can_manage_onboarding,
                      canManagePolicies: delegationState.can_manage_policies,
                      canManageRbac: delegationState.can_manage_rbac,
                    },
                  });
                }}
                disabled={isUpdatingDelegation}
                className="gap-1.5 text-xs font-medium cursor-pointer"
              >
                <Check className="h-3.5 w-3.5" />
                Save Delegated Privileges
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TIER 2: WORKFORCE ROLE PERMISSION MATRIX
         ======================================================== */}
      {activeMainTab === "workforce" && (
        <div className="space-y-4">
          {/* Header & Controls */}
          <div className="rounded-2xl border border-border bg-card p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <UserCheck className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Workforce Role Access Matrix
                </p>
                {isSuperadmin ? (
                  <select
                    value={selectedOrgId}
                    onChange={(e) => setSelectedOrgId(e.target.value)}
                    className="mt-1 h-8 rounded-xl border border-border bg-background px-3 text-xs font-bold text-foreground cursor-pointer focus:outline-none"
                  >
                    {orgList.map((org: any) => (
                      <option key={org.id} value={org.id}>
                        {org.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-sm font-bold text-foreground">{currentOrg?.name}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (confirm("Reset role permissions to system defaults?")) {
                    resetRolePermissions({ variables: { organizationId: selectedOrgId } });
                  }
                }}
                className="h-8 text-xs text-rose-600 hover:bg-rose-500/10 border-rose-500/20 cursor-pointer"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Reset Role Presets
              </Button>

              <div className="w-full sm:w-60">
                <Input
                  type="text"
                  placeholder="Filter sections..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="h-8 text-xs rounded-xl bg-background"
                />
              </div>
            </div>
          </div>

          {/* Role Tabs with Dynamic Custom Roles and + Add Role Option */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2">
            <div className="flex flex-wrap items-center gap-1.5">
              {(roleMatrices.length > 0
                ? roleMatrices
                : [
                    { role: "admin", roleLabel: "Company Admin", isSystemRole: true },
                    { role: "hr", roleLabel: "Human Resources (HR)", isSystemRole: true },
                    { role: "manager", roleLabel: "Team Manager", isSystemRole: true },
                    { role: "employee", roleLabel: "Employee / Staff", isSystemRole: true },
                  ]
              ).map((r: any) => {
                const isSelected = selectedRole === r.role;
                const isSystem = r.isSystemRole ?? ["admin", "hr", "manager", "employee"].includes(r.role);

                return (
                  <div
                    key={r.role}
                    className={cn(
                      "group flex items-center rounded-xl transition-all cursor-pointer",
                      isSelected
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedRole(r.role)}
                      className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold"
                    >
                      <span>{r.roleLabel || r.role}</span>
                      {!isSystem && (
                        <span
                          className={cn(
                            "rounded-md px-1.5 py-0.2 text-[9px] font-semibold uppercase tracking-wider",
                            isSelected
                              ? "bg-white/20 text-white"
                              : "bg-primary/10 text-primary border border-primary/20"
                          )}
                        >
                          Custom
                        </span>
                      )}
                    </button>

                    {!isSystem && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteRole(r);
                        }}
                        title={`Delete custom role "${r.roleLabel || r.role}"`}
                        className={cn(
                          "mr-1.5 p-1 rounded-lg transition-colors opacity-70 hover:opacity-100 cursor-pointer",
                          isSelected
                            ? "hover:bg-white/20 text-white"
                            : "hover:bg-rose-500/10 text-rose-500"
                        )}
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <Button
              size="sm"
              onClick={() => {
                setNewRoleLabel("");
                setNewRoleKey("");
                setNewRoleBasePreset("employee");
                setNewRoleDescription("");
                setAddRoleModalOpen(true);
              }}
              className="h-8 gap-1.5 text-xs font-semibold cursor-pointer bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 hover:border-primary/50 shadow-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Role</span>
            </Button>
          </div>

          {/* Role Permissions Table */}
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <th className="p-3.5">Website Section / Module</th>
                    <th className="p-3.5 text-center">Category</th>
                    <th className="p-3.5 text-center">Access Level</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {roleMatrixLoading ? (
                    <tr>
                      <td colSpan={3} className="p-8 text-center text-xs text-muted-foreground">
                        Loading workforce permissions...
                      </td>
                    </tr>
                  ) : filteredRolePermissions.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="p-8 text-center text-xs text-muted-foreground">
                        No sections match your filter.
                      </td>
                    </tr>
                  ) : (
                    paginatedRolePermissions.map((item: any) => (
                      <tr key={item.moduleKey} className="hover:bg-muted/30 transition-colors">
                        <td className="p-3.5">
                          <p className="font-bold text-foreground text-sm">{item.moduleName}</p>
                          <p className="text-xs text-muted-foreground font-mono">
                            Key: {item.moduleKey}
                          </p>
                        </td>
                        <td className="p-3.5 text-center">
                          <span className="rounded-md border border-border px-2 py-0.5 text-[11px] font-medium text-muted-foreground bg-muted/30">
                            {item.moduleCategory}
                          </span>
                        </td>
                        <td className="p-3.5 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {[
                              { level: "full", label: "Full Access (Manage)", color: "text-emerald-600 border-emerald-500/30 bg-emerald-500/10" },
                              { level: "view", label: "Read Only (View)", color: "text-sky-600 border-sky-500/30 bg-sky-500/10" },
                              { level: "none", label: "Hidden / No Access", color: "text-rose-600 border-rose-500/30 bg-rose-500/10" },
                            ].map((opt) => (
                              <button
                                key={opt.level}
                                type="button"
                                onClick={() => {
                                  updateRolePermission({
                                    variables: {
                                      organizationId: selectedOrgId,
                                      role: selectedRole,
                                      moduleKey: item.moduleKey,
                                      accessLevel: opt.level,
                                    },
                                  });
                                }}
                                className={cn(
                                  "rounded-lg px-2.5 py-1 text-xs font-semibold border transition-all cursor-pointer",
                                  item.accessLevel === opt.level
                                    ? opt.color
                                    : "border-border text-muted-foreground hover:bg-muted"
                                )}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {totalRolePermissionsPages > 1 && (
              <div className="p-4 border-t border-border">
                <Pagination
                  currentPage={rolePermissionsPage}
                  totalPages={totalRolePermissionsPages}
                  onPageChange={setRolePermissionsPage}
                  total={filteredRolePermissions.length}
                  pageSize={pageSize}
                  label="modules"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Custom Role Modal */}
      <Dialog open={addRoleModalOpen} onOpenChange={setAddRoleModalOpen}>
        <DialogContent className="max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-foreground">
              <UserPlus className="h-4 w-4 text-primary" />
              Create New Workforce Role
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Define a dynamic role for {currentOrg?.name || "your organization"} and configure granular website module access.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateRole} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Role Title / Name</label>
              <Input
                value={newRoleLabel}
                onChange={(e) => {
                  const val = e.target.value;
                  setNewRoleLabel(val);
                  setNewRoleKey(
                    val
                      .toLowerCase()
                      .replace(/[^a-z0-9_]/g, "_")
                      .replace(/_+/g, "_")
                      .replace(/^_|_$/g, "")
                  );
                }}
                placeholder="e.g. Payroll Officer, Compliance Auditor, Recruiter..."
                className="text-xs rounded-xl"
                required
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-foreground">Role Identifier (Key)</label>
                <span className="text-[10px] text-muted-foreground font-mono">internal_key</span>
              </div>
              <Input
                value={newRoleKey}
                onChange={(e) =>
                  setNewRoleKey(
                    e.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9_]/g, "_")
                      .replace(/_+/g, "_")
                  )
                }
                placeholder="e.g. payroll_officer"
                className="text-xs rounded-xl font-mono text-primary"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Initial Permission Preset</label>
              <select
                value={newRoleBasePreset}
                onChange={(e) => setNewRoleBasePreset(e.target.value)}
                className="w-full h-9 rounded-xl border border-border bg-background px-3 text-xs font-medium text-foreground cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="employee">Clone Employee / Staff Defaults</option>
                <option value="manager">Clone Team Manager Defaults</option>
                <option value="hr">Clone Human Resources (HR) Defaults</option>
                <option value="admin">Clone Company Admin Defaults</option>
                <option value="none">Start Empty (No Access to all modules)</option>
              </select>
              <p className="text-[11px] text-muted-foreground">
                You can fine-tune every individual website module access level right after creating.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Description (Optional)</label>
              <Input
                value={newRoleDescription}
                onChange={(e) => setNewRoleDescription(e.target.value)}
                placeholder="Brief purpose or scope of this role..."
                className="text-xs rounded-xl"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setAddRoleModalOpen(false)}
                className="text-xs cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isCreatingRole || !newRoleLabel.trim()}
                className="text-xs font-bold cursor-pointer gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                {isCreatingRole ? "Creating..." : "Create Role"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
