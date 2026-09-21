"use client";

import { useCSVExport } from "@/lib/hooks/useCSVExport";
import { CSVColumn } from "@/lib/utils/csvExport";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Download,
  UserPlus,
  UserX,
  Users,
  UserCheck as UserCheckIcon,
  RotateCcw,
  Upload,
} from "lucide-react";
import { Stat } from "@/components/common/Stats";
import { PageHeader } from "@/components/common/PageHeader";
import { User } from "@/lib/graphql/users/types";
import { useGraphQLUsers, useGraphQLUserStatusMutations } from "@/lib/graphql/users/userHook";
import { useDebounce } from "@/lib/hooks/useDebounce";
import EmployeeForm from "./EmployeeForm";
import EmployeeCard from "./EmployeeCard";
import { PaginationControls } from "../common/PaginationControls";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SearchInput } from "@/components/common/SearchInput";
import { Skeleton } from "@/components/common/Skeleton";
import {
  useGraphQLDepartments,
  useGraphQLDesignations,
  useGraphQLOfficeLocations,
  useGraphQLOrganizations,
} from "@/lib/graphql/organization/organizationsHook";
import { OrganizationFilterSelect } from "@/components/common/OrganizationFilterSelect";
import { useSearchParams } from "next/navigation";
import { useStore } from "@/lib/store/useStore";
import { useOnboardingMutations } from "@/lib/graphql/onboarding/onboardingHook";
import { toast } from "sonner";
import { useMutation } from "@apollo/client/react";
import { START_OFFBOARDING } from "@/lib/graphql/offboarding/queries";

type StartOffboardingResult = {
  success: boolean;
  error?: string | null;
  offboardingId?: string | null;
  inviteUrl?: string | null;
};

export default function EmployeesPage() {
  const { user } = useStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;
  const [searchTerm, setSearchTerm] = useState("");
  const [organizationId, setOrganizationId] = useState(
    () => searchParams.get("organizationId") || ""
  );
  const [startingOnboardingId, setStartingOnboardingId] = useState<string | null>(
    null
  );
  const [startingOffboardingId, setStartingOffboardingId] = useState<string | null>(
    null
  );
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const { users, total, isUsersLoading, refetchUsers } = useGraphQLUsers({
    page: currentPage,
    pageSize,
    filters: {
      search: debouncedSearchTerm || undefined,
      organizationId: organizationId || undefined,
    },
  });
  // Prefetch dropdown data so Add/Edit employee opens instantly from cache
  useGraphQLOrganizations();
  useGraphQLDepartments(undefined, organizationId || undefined);
  useGraphQLDesignations(undefined, organizationId || undefined);
  useGraphQLOfficeLocations(undefined, organizationId || undefined);
  const { updateUserStatus } = useGraphQLUserStatusMutations();
  const { startOnboardingForEmployee } = useOnboardingMutations();
  const [startOffboarding] = useMutation<
    { startOffboarding?: StartOffboardingResult | null },
    {
      input: {
        userId: string;
        exitDate: string;
        lastWorkingDay: string;
        reason: string;
        deactivateNow: boolean;
        sendInvite: boolean;
      };
    }
  >(START_OFFBOARDING);
  const { exportData } = useCSVExport<User>();

  const handleStatusToggle = async (userId: string, newStatus: boolean) => {
    try {
      await updateUserStatus({ userId, isActive: newStatus });
      refetchUsers();
    } catch (err) {
      console.error("Error updating user status:", err);
    }
  };

  const handleStartOnboarding = async (employee: User) => {
    setStartingOnboardingId(employee.id);
    try {
      const result = await startOnboardingForEmployee({
        variables: {
          input: {
            userId: employee.id,
            generateOffer: false,
            sendInvite: false,
          },
        },
      });
      const payload = result.data?.startOnboardingForEmployee;
      if (payload?.onboardingId) {
        if (payload.success) {
          toast.success(`Onboarding started for ${employee.firstName}`);
        } else {
          toast.message(payload.error || "Opening existing onboarding");
        }
        refetchUsers();
        router.push(`/onboarding/${payload.onboardingId}`);
        return;
      }
      toast.error(payload?.error || "Could not start onboarding");
    } catch (err: any) {
      toast.error(err?.message || "Could not start onboarding");
    } finally {
      setStartingOnboardingId(null);
    }
  };

  const handleStartOffboarding = async (employee: User) => {
    setStartingOffboardingId(employee.id);
    try {
      const exitDate =
        employee.dateOfExit || new Date().toISOString().slice(0, 10);
      const result = await startOffboarding({
        variables: {
          input: {
            userId: employee.id,
            exitDate,
            lastWorkingDay: exitDate,
            reason: "resign",
            deactivateNow: true,
            sendInvite: true,
          },
        },
      });
      const payload = result.data?.startOffboarding;
      if (payload?.success && payload.offboardingId) {
        toast.success(
          payload.inviteUrl
            ? `F&F started. Employee marked inactive; exit link ready.`
            : `F&F started for ${employee.firstName}. Employee marked inactive.`
        );
        if (payload.inviteUrl) {
          await navigator.clipboard?.writeText(payload.inviteUrl).catch(() => undefined);
        }
        refetchUsers();
        router.push(`/offboarding/${payload.offboardingId}`);
        return;
      }
      toast.error(payload?.error || "Could not start F&F");
    } catch (err: any) {
      toast.error(err?.message || "Could not start F&F");
    } finally {
      setStartingOffboardingId(null);
    }
  };

  const isEditing = !!selectedEmployee;

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, organizationId]);

  useEffect(() => {
    const fromUrl = searchParams.get("organizationId") || "";
    if (fromUrl && fromUrl !== organizationId) {
      setOrganizationId(fromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleEdit = (user: User) => {
    setSelectedEmployee(user);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedEmployee(null);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setSelectedEmployee(null);
  };

  const handleSuccess = () => {
    handleClose();
    refetchUsers();
  };

  const employeeCSVColumns: CSVColumn<User>[] = [
    { header: "Employee ID", accessor: "employeeId" },
    { header: "First Name", accessor: "firstName" },
    { header: "Last Name", accessor: "lastName" },
    { header: "Email", accessor: "email" },
    { header: "Phone Number", accessor: "phoneNumber" },
    { header: "Department", accessor: "department.name" },
    { header: "Designation", accessor: "designation.name" },
    { header: "Organization", accessor: "organization.name" },
    {
      header: "Employment Type",
      accessor: "employmentType",
      formatter: (value) => value?.replace("_", " ").toUpperCase() || "",
    },
    { header: "Role", accessor: (value) => value?.role?.toUpperCase() || "" },
    { header: "Status", accessor: (user) => (user.isActive ? "Active" : "Inactive") },
    { header: "Date of Joining", accessor: "dateOfJoining" },
    { header: "Date of Birth", accessor: "dateOfBirth" },
    {
      header: "Manager",
      accessor: (user) =>
        user.manager ? `${user.manager.firstName} ${user.manager.lastName}` : "",
    },
    { header: "Bank Account Number", accessor: "bankAccountNumber" },
    { header: "Bank IFSC Code", accessor: "bankIfscCode" },
    { header: "PAN Number", accessor: "panNumber" },
    { header: "Aadhar Number", accessor: "aadharNumber" },
    { header: "UAN Number", accessor: "uanNumber" },
  ];

  const handleExportCSV = () => {
    exportData(users || [], employeeCSVColumns, {
      filename: "employees",
      includeTimestamp: true,
    });
  };

  const statsList = [
    {
      label: "Total employees",
      value: total || 0,
      icon: Users,
      color: "text-sky-700 dark:text-sky-400",
      gradient: "bg-sky-500/10",
    },
    {
      label: "Active on page",
      value: users?.filter((e) => e.isActive).length || 0,
      icon: UserCheckIcon,
      color: "text-emerald-700 dark:text-emerald-400",
      gradient: "bg-emerald-500/10",
    },
    {
      label: "Joined this month",
      value:
        users?.filter((u) => {
          const joinDate = new Date(u.dateOfJoining || "");
          const monthAgo = new Date();
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return joinDate > monthAgo;
        }).length || 0,
      icon: UserPlus,
      color: "text-primary",
      gradient: "bg-primary/10",
    },
    {
      label: "Inactive on page",
      value: users?.filter((e) => !e.isActive).length || 0,
      icon: UserX,
      color: "text-destructive",
      gradient: "bg-destructive/10",
    },
  ];

  return (
    <div className="page-shell">
      <PageHeader
        title="Employees"
        description="Directory of people already on your roster. For new joiners with offer & documents, use Onboarding → Start hire."
        actions={
          <>
            <Link
              href="/onboarding"
              className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-background px-3 text-sm font-medium text-foreground hover:bg-muted"
            >
              Start hire
            </Link>
            <button
              onClick={handleExportCSV}
              className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-background px-3 text-sm font-medium text-foreground hover:bg-muted"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
            <Link
              href={
                organizationId
                  ? `/employees/import?organizationId=${encodeURIComponent(organizationId)}`
                  : "/employees/import"
              }
              className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-background px-3 text-sm font-medium text-foreground hover:bg-muted"
            >
              <Upload className="h-4 w-4" />
              Import
            </Link>
            <button
              onClick={handleAdd}
              className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <UserPlus className="h-4 w-4" />
              Add employee
            </button>
            <button
              onClick={() => refetchUsers()}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
              title="Refresh"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statsList.map((stat, i) => (
          <Stat
            key={i}
            icon={stat.icon}
            label={stat.label}
            value={stat.value}
            color={stat.color}
            gradient={stat.gradient}
          />
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchInput
            placeholder="Search by name, email, or employee ID…"
            value={searchTerm}
            onChange={setSearchTerm}
            containerClassName="max-w-md"
          />
          {user?.role === "superadmin" && (
            <OrganizationFilterSelect
              value={organizationId}
              onChange={setOrganizationId}
            />
          )}
        </div>
      </div>

      {isUsersLoading && !users?.length ? (
        <div className="space-y-4" aria-busy="true" aria-label="Loading employees">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-5">
                <div className="mb-4 flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="mb-2 h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            ))}
          </div>
        </div>
      ) : users && users.length > 0 ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {users.map((employee) => (
              <EmployeeCard
                key={employee.id}
                employee={employee}
                onEdit={handleEdit}
                onStatusToggle={handleStatusToggle}
                onStartOnboarding={handleStartOnboarding}
                startingOnboardingId={startingOnboardingId}
                onStartOffboarding={handleStartOffboarding}
                startingOffboardingId={startingOffboardingId}
              />
            ))}
          </div>
          <PaginationControls
            total={total || 0}
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            paginationLabel="employees"
          />
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border px-6 py-16 text-center">
          <Users className="mx-auto mb-3 h-8 w-8 text-muted-foreground/40" />
          <h3 className="text-sm font-medium text-foreground">No employees found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Try a different search, or add your first employee.
          </p>
        </div>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="flex h-[min(90vh,720px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
          <DialogHeader className="shrink-0 border-b border-border px-6 py-4 text-left">
            <DialogTitle>{isEditing ? "Edit employee" : "Add employee"}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Update this employee’s profile and employment details."
                : "Create a roster record for someone already joining or on payroll. New candidates with offer letters should use Onboarding → Start hire."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-6 py-5">
            <EmployeeForm
              key={selectedEmployee?.id || "new-employee"}
              initialData={selectedEmployee}
              onSuccess={handleSuccess}
              onCancel={handleClose}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
