"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Building,
  Globe,
  Layers,
  Shapes,
  Building2,
  MapPin,
  Briefcase,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { SearchInput } from "@/components/common/SearchInput";
import { PageHeader } from "@/components/common/PageHeader";
import { Stat } from "@/components/common/Stats";
import { OfficeLocation, Organization, Department, Designation } from "@/lib/graphql/organization/types";
import OrganizationList from "./OrganizationList";
import CreateOrganizationForm from "./CreateOrganizationForm";
import { AddDepartmentForm, AddDesignationForm, AddOfficeForm } from "./OrganizationForms";
import OfficeLocationList from "./OfficeLocationList";
import DepartmentList from "./DepartmentsList";
import DesignationList from "./DesignationList";
import {
  useGraphQLDepartments,
  useGraphQLDesignations,
  useGraphQLOfficeLocations,
  useGraphQLOrganizations,
} from "@/lib/graphql/organization/organizationsHook";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useStore } from "@/lib/store/useStore";
import { SegmentedTabs } from "@/components/common/SegmentedTabs";
import { PageSkeleton, Skeleton } from "@/components/common/Skeleton";

export default function OrganizationsPage() {
  const { user } = useStore();
  type FormKey = "organization" | "office" | "department" | "designation" | null;

  const tabs = useMemo(
    () => [
      { id: "organizations", label: "Organizations", icon: Building },
      { id: "offices", label: "Offices", icon: Globe },
      { id: "departments", label: "Departments", icon: Layers },
      { id: "designations", label: "Designations", icon: Shapes },
    ],
    []
  );

  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(() =>
    tabParam && tabs.find((t) => t.id === tabParam) ? tabParam : "organizations"
  );

  const [activeForm, setActiveForm] = useState<FormKey>(null);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [editingOffLoc, setEditingOffLoc] = useState<OfficeLocation | null>(null);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [editingDesig, setEditingDesig] = useState<Designation | null>(null);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const router = useRouter();

  const openForm = (key: FormKey) => setActiveForm(key);

  const closeForm = () => {
    setActiveForm(null);
    setEditingOrg(null);
    setEditingOffLoc(null);
    setEditingDept(null);
    setEditingDesig(null);
  };

  useEffect(() => {
    if (tabParam && tabs.find((t) => t.id === tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam, tabs]);

  const handleActiveTab = (tab: string) => {
    if (tab) {
      setActiveTab(tab);
      setSearch("");
      router.push(`/organizations?tab=${tab}`, { scroll: false });
    }
  };

  const { organizations, isOrganizationsLoading: orgsLoading } = useGraphQLOrganizations(
    activeTab === "organizations" ? debouncedSearch : ""
  );
  const { officeLocations, isOfficeLocationsLoading: officesLoading } = useGraphQLOfficeLocations(
    activeTab === "offices" ? debouncedSearch : ""
  );
  const { departments, isDepartmentsLoading: deptsLoading } = useGraphQLDepartments(
    activeTab === "departments" ? debouncedSearch : ""
  );
  const { designations, isDesignationsLoading: desigsLoading } = useGraphQLDesignations(
    activeTab === "designations" ? debouncedSearch : ""
  );

  const handleViewEmployees = () => router.push(`/employees`);
  const handleEditOrg = (org: Organization) => {
    setEditingOrg(org);
    setActiveForm("organization");
  };
  const handleEditOffLoc = (office: OfficeLocation) => {
    setEditingOffLoc(office);
    setActiveForm("office");
  };
  const handleEditDept = (dept: Department) => {
    setEditingDept(dept);
    setActiveForm("department");
  };
  const handleEditDesignation = (desig: Designation) => {
    setEditingDesig(desig);
    setActiveForm("designation");
  };

  const isLoading = orgsLoading || officesLoading || deptsLoading || desigsLoading;

  if (!user) {
    return <PageSkeleton />;
  }

  const isAuthorized = user.role === "admin" || user.role === "superadmin";

  if (!isAuthorized) {
    return (
      <div className="mx-auto max-w-md rounded-xl border border-border bg-card px-6 py-12 text-center">
        <h3 className="text-base font-semibold text-foreground">Access restricted</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Only admins can manage organization structure.
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

  const createLabel =
    activeTab === "offices"
      ? "Add office"
      : activeTab === "organizations"
        ? "Add organization"
        : activeTab === "departments"
          ? "Add department"
          : "Add designation";

  const dialogTitle =
    activeForm === "organization"
      ? editingOrg
        ? "Edit organization"
        : "Add organization"
      : activeForm === "office"
        ? editingOffLoc
          ? "Edit office"
          : "Add office"
        : activeForm === "department"
          ? editingDept
            ? "Edit department"
            : "Add department"
          : editingDesig
            ? "Edit designation"
            : "Add designation";

  return (
    <div className="page-shell">
      <PageHeader
        title="Organizations"
        description="Manage companies, offices, departments, and designations."
      />

      <SegmentedTabs tabs={tabs} value={activeTab} onChange={handleActiveTab} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          icon={Building2}
          label="Organizations"
          value={organizations?.length || 0}
          color="text-primary"
          gradient="bg-primary/10"
        />
        <Stat
          icon={MapPin}
          label="Offices"
          value={officeLocations?.length || 0}
          color="text-amber-700 dark:text-amber-400"
          gradient="bg-amber-500/10"
        />
        <Stat
          icon={Layers}
          label="Departments"
          value={departments?.length || 0}
          color="text-emerald-700 dark:text-emerald-400"
          gradient="bg-emerald-500/10"
        />
        <Stat
          icon={Briefcase}
          label="Designations"
          value={designations?.length || 0}
          color="text-sky-700 dark:text-sky-400"
          gradient="bg-sky-500/10"
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput
          placeholder={`Search ${activeTab}…`}
          value={search}
          onChange={setSearch}
          containerClassName="max-w-md"
        />

        {!(activeTab === "organizations" && user.role !== "superadmin") && (
          <button
            onClick={() => {
              if (activeTab === "organizations") openForm("organization");
              if (activeTab === "offices") openForm("office");
              if (activeTab === "departments") openForm("department");
              if (activeTab === "designations") openForm("designation");
            }}
            className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            {createLabel}
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3" aria-busy="true" aria-label="Loading">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {activeTab === "organizations" && (
            <OrganizationList
              organizations={organizations || []}
              onEdit={handleEditOrg}
              onViewEmployees={handleViewEmployees}
            />
          )}
          {activeTab === "offices" && (
            <OfficeLocationList
              officeLocations={officeLocations ?? []}
              onEdit={handleEditOffLoc}
            />
          )}
          {activeTab === "departments" && (
            <DepartmentList departments={departments ?? []} onEdit={handleEditDept} />
          )}
          {activeTab === "designations" && (
            <DesignationList
              designations={designations ?? []}
              onEdit={handleEditDesignation}
            />
          )}
        </>
      )}

      <Dialog open={activeForm !== null} onOpenChange={(open) => !open && closeForm()}>
        <DialogContent className="flex h-[min(90vh,640px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-xl">
          <DialogHeader className="shrink-0 border-b border-border px-6 py-4 text-left">
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogDescription>
              Fill in the details below and save when you’re done.
            </DialogDescription>
          </DialogHeader>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-5">
            {activeForm === "organization" && (
              <CreateOrganizationForm
                orgEditData={editingOrg}
                onCancel={closeForm}
                onSubmit={async () => closeForm()}
              />
            )}
            {activeForm === "office" && (
              <AddOfficeForm
                officeLocationEditData={editingOffLoc}
                onCancel={closeForm}
                onSubmit={async () => closeForm()}
              />
            )}
            {activeForm === "department" && (
              <AddDepartmentForm
                departmentEditData={editingDept}
                onCancel={closeForm}
                onSubmit={async () => closeForm()}
              />
            )}
            {activeForm === "designation" && (
              <AddDesignationForm
                designationEditData={editingDesig}
                onCancel={closeForm}
                onSubmit={async () => closeForm()}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
