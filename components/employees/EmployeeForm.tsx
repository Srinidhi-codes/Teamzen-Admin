"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useGraphQLUserMutations, useGraphQLUsers } from "@/lib/graphql/users/userHook";
import { toast } from "sonner";
import { User } from "@/lib/graphql/users/types";
import { Loader2, Eye, EyeOff, Plus, AlertCircle } from "lucide-react";
import { PhotoOverlay } from "@/components/common/PhotoOverlay";
import { Switch } from "@/components/ui/switch";
import { FormSelect } from "../common/FormSelect";
import { z } from "zod";
import { useStore } from "@/lib/store/useStore";
import { useGraphQLDepartments, useGraphQLDesignations, useGraphQLOrganizations, useGraphQLOfficeLocations } from "@/lib/graphql/organization/organizationsHook";
import { DatePickerSimple } from "../ui/datePicker";
import moment from "moment";
import { Input } from "../ui/input";
import ConfirmationModal from "../common/ConfirmationModal";
import { FormSkeleton } from "../common/Skeleton";


import { usePayrollQueries, usePayrollMutations } from "@/lib/graphql/payroll/payrollHook";
import { Switch as ToggleSwitch } from "@/components/ui/switch";
import { Tabs, TabsContent } from "../ui/tabs";
import { CreditCard, Wallet, Landmark, User as UserIcon, Briefcase } from "lucide-react";
import { useGraphQLUser } from "@/lib/api/graphqlHooks";
import { cn } from "@/lib/utils";
import { SegmentedTabs } from "@/components/common/SegmentedTabs";
import { useOnboardingMutations } from "@/lib/graphql/onboarding/onboardingHook";
import Link from "next/link";

interface EmployeeFormProps {
    initialData?: User | null;
    onSuccess: () => void;
    onCancel: () => void;
}

const employeeSchema = z.object({
    firstName: z.string().min(1, "First name required "),
    lastName: z.string().min(1, "Last name required "),
    email: z.string().email("Invalid email address"),
    password: z.string().optional(),
    phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
    role: z.string().min(1, "Role required "),
    dateOfJoining: z.string().default(moment().format("YYYY-MM-DD")),
    dateOfBirth: z.string().optional(),
    dateOfExit: z.string().optional(),
    employmentType: z.string().min(1, "Employment type required "),
    isActive: z.boolean().default(true),
    departmentId: z.string().min(1, "Department is required "),
    designationId: z.string().min(1, "Designation is required "),
    officeLocationId: z.string().optional(),
    isStaff: z.boolean().default(false),
    isVerified: z.boolean().default(false),
    organizationId: z.string().optional(),
    managerId: z.string().optional(),
    // Financials
    bankAccountNumber: z.string().optional(),
    bankIfscCode: z.string().optional(),
    panNumber: z.string().optional(),
    aadharNumber: z.string().optional(),
    uanNumber: z.string().optional(),
    // Payroll
    salaryStructureId: z.string().optional(),
    annualCtc: z.string().optional(),
    effectiveFrom: z.string().optional(),
});

type EmployeeTab = "identity" | "employment" | "financials" | "payroll";

const FIELD_TAB_MAP: Record<string, EmployeeTab> = {
    firstName: "identity",
    lastName: "identity",
    email: "identity",
    password: "identity",
    phoneNumber: "identity",
    role: "identity",
    dateOfBirth: "identity",
    dateOfJoining: "employment",
    dateOfExit: "employment",
    employmentType: "employment",
    departmentId: "employment",
    designationId: "employment",
    officeLocationId: "employment",
    organizationId: "employment",
    managerId: "employment",
    bankAccountNumber: "financials",
    bankIfscCode: "financials",
    panNumber: "financials",
    aadharNumber: "financials",
    uanNumber: "financials",
    salaryStructureId: "payroll",
    annualCtc: "payroll",
    effectiveFrom: "payroll",
};

const TAB_ORDER: EmployeeTab[] = ["identity", "employment", "financials", "payroll"];

const TAB_LABELS: Record<EmployeeTab, string> = {
    identity: "Identity",
    employment: "Work",
    financials: "Finance",
    payroll: "Payroll",
};

function tabHasErrors(tab: EmployeeTab, fieldErrors: Record<string, string>): boolean {
    return Object.keys(fieldErrors).some((field) => FIELD_TAB_MAP[field] === tab);
}

function countTabErrors(tab: EmployeeTab, fieldErrors: Record<string, string>): number {
    return Object.keys(fieldErrors).filter((field) => FIELD_TAB_MAP[field] === tab).length;
}

function getFirstErrorTab(fieldErrors: Record<string, string>): EmployeeTab {
    for (const tab of TAB_ORDER) {
        if (tabHasErrors(tab, fieldErrors)) return tab;
    }
    return "identity";
}

function getErrorTabs(fieldErrors: Record<string, string>): EmployeeTab[] {
    return TAB_ORDER.filter((tab) => tabHasErrors(tab, fieldErrors));
}

function buildEmployeeFormData(initialData?: User | null) {
    return {
        firstName: initialData?.firstName || "",
        lastName: initialData?.lastName || "",
        email: initialData?.email || "",
        dateOfBirth: initialData?.dateOfBirth || "",
        password: "",
        phoneNumber: initialData?.phoneNumber || "",
        role: initialData?.role || "employee",
        dateOfJoining: initialData?.dateOfJoining || moment().format("YYYY-MM-DD"),
        dateOfExit: initialData?.dateOfExit || "",
        employmentType: initialData?.employmentType || "full_time",
        isActive: initialData?.isActive !== false,
        departmentId: initialData?.department?.id ? String(initialData.department.id) : "",
        designationId: initialData?.designation?.id ? String(initialData.designation.id) : "",
        officeLocationId: initialData?.officeLocation?.id ? String(initialData.officeLocation.id) : "",
        isStaff: initialData?.isStaff !== false,
        // Verified only after required onboarding tasks/docs complete
        isVerified: Boolean(initialData?.isVerified),
        managerId: initialData?.manager?.id ? String(initialData.manager.id) : "",
        organizationId: initialData?.organization?.id ? String(initialData.organization.id) : "",
        bankAccountNumber: initialData?.bankAccountNumber || "",
        bankIfscCode: initialData?.bankIfscCode || "",
        panNumber: initialData?.panNumber || "",
        aadharNumber: initialData?.aadharNumber || "",
        uanNumber: initialData?.uanNumber || "",
        salaryStructureId: initialData?.salaryDetails?.salaryStructure?.id
            ? String(initialData.salaryDetails.salaryStructure.id)
            : "",
        annualCtc: initialData?.salaryDetails?.annualCtc
            ? String(initialData.salaryDetails.annualCtc)
            : "",
        effectiveFrom:
            initialData?.salaryDetails?.effectiveFrom ||
            moment().startOf("month").format("YYYY-MM-DD"),
    };
}

export default function EmployeeForm({
    initialData,
    onSuccess,
    onCancel,
}: EmployeeFormProps) {
    const router = useRouter();
    const [formData, setFormData] = useState(() => buildEmployeeFormData(initialData));
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [alsoStartOnboarding, setAlsoStartOnboarding] = useState(false);
    const [startingOnboarding, setStartingOnboarding] = useState(false);
    const errorBannerRef = useRef<HTMLDivElement>(null);
    const { user: storeUser } = useStore();
    const { user: graphqlUser } = useGraphQLUser();
    const currentUser = graphqlUser || storeUser;
    const { createUser, updateUser, isCreatingUser, isUpdatingUser } = useGraphQLUserMutations();
    const { startOnboardingForEmployee } = useOnboardingMutations();

    const optionsOrgId =
        formData.organizationId ||
        (initialData?.organization?.id ? String(initialData.organization.id) : undefined) ||
        (currentUser?.organization?.id ? String(currentUser.organization.id) : undefined);

    const { users: orgUsers } = useGraphQLUsers({
        page: 1,
        pageSize: 200,
        filters: {
            isActive: true,
            ...(optionsOrgId ? { organizationId: optionsOrgId } : {}),
        },
    });
    const { organizations } = useGraphQLOrganizations();
    const { designations, isDesignationsLoading } = useGraphQLDesignations(
        undefined,
        optionsOrgId
    );
    const { departments, isDepartmentsLoading } = useGraphQLDepartments(
        undefined,
        optionsOrgId
    );
    const { officeLocations, isOfficeLocationsLoading } = useGraphQLOfficeLocations(
        undefined,
        optionsOrgId
    );
    const { salaryStructures, isStructuresLoading } = usePayrollQueries();
    const { assignSalaryToEmployee, saveEmployeeComponentOverrides } = usePayrollMutations();

    const [activeTab, setActiveTab] = useState<EmployeeTab>("identity");
    const [profilePicture, setProfilePicture] = useState<File | null>(null);
    const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(initialData?.profilePictureUrl || null);
    const [isPhotoOpen, setIsPhotoOpen] = useState(false);
    const [componentOverrides, setComponentOverrides] = useState<Record<string, { isExcluded: boolean; overrideValue: string }>>({});
    const isSubmitting = isCreatingUser || isUpdatingUser || startingOnboarding;
    const formMetaLoading =
        (isDepartmentsLoading && !departments) ||
        (isDesignationsLoading && !designations) ||
        (isOfficeLocationsLoading && !officeLocations);

    const matchesOrganization = (item: { organizationId?: string | number | null; organization?: { id?: string | number | null } | null }, orgId?: string) => {
        if (!orgId) return true;
        const itemOrgId = item?.organizationId ?? item?.organization?.id;
        return itemOrgId != null && String(itemOrgId) === String(orgId);
    };

    /** Radix Select blanks the trigger when value is missing from items — keep current selection visible. */
    const ensureSelectedOption = (
        options: { label: string; value: string }[],
        selectedId?: string,
        selectedLabel?: string | null
    ) => {
        if (!selectedId) return options;
        if (options.some((o) => o.value === selectedId)) return options;
        return [
            { label: selectedLabel || "Current selection", value: selectedId },
            ...options,
        ];
    };

    const departmentOptions = ensureSelectedOption(
        (departments || [])
            .filter((d) => matchesOrganization(d, optionsOrgId))
            .map((d) => ({ label: d.name, value: String(d.id) })),
        formData.departmentId,
        initialData?.department?.name
    );
    const designationOptions = ensureSelectedOption(
        (designations || [])
            .filter((d) => matchesOrganization(d, optionsOrgId))
            .map((d) => ({ label: d.name, value: String(d.id) })),
        formData.designationId,
        initialData?.designation?.name
    );
    const officeLocationOptions = ensureSelectedOption(
        (officeLocations || [])
            .filter((o) => matchesOrganization(o, optionsOrgId))
            .map((o) => ({ label: o.name, value: String(o.id) })),
        formData.officeLocationId,
        initialData?.officeLocation?.name
    );
    const organizationOptions = (organizations || []).map((o) => ({
        label: o.name,
        value: String(o.id),
    }));
    const managerOptions = (() => {
        if (!orgUsers) return [];
        const selfId = initialData?.id ? String(initialData.id) : "";
        return orgUsers
            .filter((u) => {
                if (selfId && String(u.id) === selfId) return false;
                return ["manager", "admin", "hr", "superadmin"].includes(
                    (u.role || "").toLowerCase()
                );
            })
            .map((u) => ({
                label: `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.email,
                value: String(u.id),
            }));
    })();
    const managerSelectOptions = ensureSelectedOption(
        [{ label: "No manager", value: "none" }, ...managerOptions],
        formData.managerId || "none",
        initialData?.manager
            ? `${initialData.manager.firstName || ""} ${initialData.manager.lastName || ""}`.trim()
            : "No manager"
    );

    useEffect(() => {
        const orgId = currentUser?.organization?.id;
        if (!initialData && orgId && !formData.organizationId) {
            setFormData((prev) => ({ ...prev, organizationId: String(orgId) }));
        }
    }, [currentUser, initialData, formData.organizationId]);

    useEffect(() => {
        if (!initialData) return;
        setFormData(buildEmployeeFormData(initialData));
        if (initialData.salaryDetails?.componentOverrides) {
            const ovrs: Record<string, { isExcluded: boolean; overrideValue: string }> = {};
            for (const o of initialData.salaryDetails.componentOverrides) {
                ovrs[o.component.id] = {
                    isExcluded: o.isExcluded,
                    overrideValue: o.overrideValue != null ? String(o.overrideValue) : "",
                };
            }
            setComponentOverrides(ovrs);
        }
        setProfilePicturePreview(initialData.profilePictureUrl || null);
    }, [initialData]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setProfilePicture(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfilePicturePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => {
            const newData = { ...prev, [name]: value };
            if (!initialData && name === "firstName") {
                const firstWord = value.trim().split(" ")[0];
                if (firstWord) newData.password = `${firstWord}@123`;
            }
            return newData;
        });
        if (errors[name]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleDateChange = (name: string, date: Date | undefined) => {
        setFormData((prev) => ({
            ...prev,
            [name]: date ? moment(date).format("YYYY-MM-DD") : ""
        }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData((prev) => {
            const newData = { ...prev, [name]: value };
            
            // If organization changes, clear dependent fields to avoid cross-org data issues
            if (name === "organizationId") {
                newData.departmentId = "";
                newData.designationId = "";
                newData.officeLocationId = "";
                newData.managerId = "";
            }

            if (name === "salaryStructureId") {
                setComponentOverrides({});
            }
            
            return newData;
        });
        if (errors[name]) {
            setErrors((prev) => {
                const next = { ...prev };
                delete next[name];
                return next;
            });
        }
    };

    const focusFirstError = (fieldErrors: Record<string, string>, tab: EmployeeTab) => {
        const firstField =
            Object.keys(fieldErrors).find((field) => FIELD_TAB_MAP[field] === tab) ||
            Object.keys(fieldErrors)[0];
        if (!firstField) return;

        window.setTimeout(() => {
            errorBannerRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
            const byName = document.querySelector<HTMLElement>(`[name="${firstField}"]`);
            const byData = document.querySelector<HTMLElement>(`[data-field="${firstField}"]`);
            const el = byName || byData;
            el?.scrollIntoView({ behavior: "smooth", block: "center" });
            const focusable = el?.querySelector<HTMLElement>("button, input, [tabindex]") || el;
            focusable?.focus?.();
        }, 80);
    };

    const handleSwitchChange = (name: string, checked: boolean) => {
        setFormData((prev) => ({ ...prev, [name]: checked }));
    };

    const buildOverridePayload = () =>
        Object.entries(componentOverrides)
            .filter(([_, v]) => v.isExcluded || v.overrideValue !== "")
            .map(([componentId, v]) => ({
                componentId,
                isExcluded: v.isExcluded,
                overrideValue: v.overrideValue ? Number(v.overrideValue) : null,
            }));

    const handlePayrollOnlySave = async () => {
        if (!initialData) {
            toast.error("Create the employee first before saving payroll details.");
            return;
        }

        let employeeSalaryId = initialData.salaryDetails?.id || null;

        if (formData.salaryStructureId && formData.annualCtc) {
            const payrollResult = await assignSalaryToEmployee(
                initialData.id,
                formData.salaryStructureId,
                Number(formData.annualCtc),
                formData.effectiveFrom
            );
            if (!payrollResult.success) {
                toast.error("Failed to save payroll details: " + payrollResult.error);
                return;
            }
            employeeSalaryId = payrollResult.salary?.id || employeeSalaryId;
            toast.success("Salary structure assigned successfully");
        }

        const overridesList = buildOverridePayload();
        if (employeeSalaryId && Object.keys(componentOverrides).length > 0) {
            const ovrResult = await saveEmployeeComponentOverrides(employeeSalaryId, overridesList);
            if (!ovrResult.success) {
                toast.error("Failed to save component overrides: " + ovrResult.error);
                return;
            }
            toast.success("Component overrides saved");
        }

        if (!formData.salaryStructureId && overridesList.length > 0) {
            toast.error("Assign a salary structure before saving component overrides.");
            return;
        }

        onSuccess();
    };

    const handleSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
        e?.preventDefault();

        try {
            if (initialData && activeTab === "payroll") {
                await handlePayrollOnlySave();
                return;
            }

            const validationResult = employeeSchema.safeParse(formData);
            if (!validationResult.success) {
                const fieldErrors: Record<string, string> = {};
                validationResult.error.issues.forEach((issue) => {
                    const path = issue.path[0]?.toString();
                    if (path) fieldErrors[path] = issue.message;
                });
                setErrors(fieldErrors);
                const errorTab = getFirstErrorTab(fieldErrors);
                setActiveTab(errorTab);
                const errorTabs = getErrorTabs(fieldErrors);
                const firstMessage = Object.values(fieldErrors)[0]?.trim();
                const errorCount = Object.keys(fieldErrors).length;
                toast.error(
                    errorTabs.length > 1
                        ? `${firstMessage} (+${errorCount - 1} more) — check ${errorTabs.map((t) => TAB_LABELS[t]).join(", ")}`
                        : `${firstMessage}${errorCount > 1 ? ` (+${errorCount - 1} more)` : ""} — switched to ${TAB_LABELS[errorTab]}`
                );
                focusFirstError(fieldErrors, errorTab);
                return;
            }

            setErrors({});
            let savedUser: any = null;
            if (initialData) {
                const { password, salaryStructureId, annualCtc, effectiveFrom, ...updateData } = formData;
                const result = await updateUser(initialData.id, {
                    ...updateData,
                    organizationId: formData.organizationId || null,
                    departmentId: formData.departmentId || null,
                    designationId: formData.designationId || null,
                    officeLocationId: formData.officeLocationId || null,
                    managerId: formData.managerId || null,
                    dateOfBirth: formData.dateOfBirth || null,
                    dateOfJoining: formData.dateOfJoining || null,
                    dateOfExit: formData.dateOfExit || null,
                });
                if (result?.success) {
                    savedUser = initialData;
                    // Handle Photo Upload via REST if selected
                    if (profilePicture) {
                        const uploadFormData = new FormData();
                        uploadFormData.append("profile_picture", profilePicture);
                        try {
                            const axios = (await import("axios")).default;
                            await axios.post(`/api/users/${initialData.id}/upload_photo/`, uploadFormData, {
                                headers: { "Content-Type": "multipart/form-data" },
                                withCredentials: true
                            });
                            toast.success("Profile photo updated");
                        } catch (err) {
                            toast.error("Failed to upload photo");
                        }
                    }
                    toast.success("Employee updated successfully");
                } else {
                    toast.error(result?.error || "Failed to update employee");
                    return;
                }
            } else {
                if (!formData.password || formData.password.length < 6) {
                    toast.error("Temporary password is required (min 6 characters)");
                    setActiveTab("identity");
                    setErrors({ password: "Temporary password is required (min 6 characters)" });
                    return;
                }
                const { salaryStructureId, annualCtc, effectiveFrom, ...createData } = formData;
                const result = await createUser({
                    ...createData,
                    managerId: formData.managerId || null,
                    departmentId: formData.departmentId || null,
                    designationId: formData.designationId || null,
                    officeLocationId: formData.officeLocationId || null,
                    organizationId: formData.organizationId || null,
                });
                if (result?.success) {
                    savedUser = result.user;
                    // Handle Photo Upload via REST for NEW user
                    if (profilePicture && savedUser?.id) {
                        const uploadFormData = new FormData();
                        uploadFormData.append("profile_picture", profilePicture);
                        try {
                            const axios = (await import("axios")).default;
                            await axios.post(`/api/users/${savedUser.id}/upload_photo/`, uploadFormData, {
                                headers: { "Content-Type": "multipart/form-data" },
                                withCredentials: true
                            });
                        } catch (err) {
                            toast.error("User created, but photo upload failed");
                        }
                    }
                    toast.success("Employee created successfully. Welcome email with login credentials sent.");
                } else {
                    toast.error(result?.error || "Failed to create employee");
                    return;
                }
            }

            // Handle Payroll Assignment...
            let savedSalaryId = initialData?.salaryDetails?.id || null;
            if (savedUser && formData.salaryStructureId && formData.annualCtc) {
                const payrollResult = await assignSalaryToEmployee(
                    savedUser.id,
                    formData.salaryStructureId,
                    Number(formData.annualCtc),
                    formData.effectiveFrom
                );
                if (payrollResult.success) {
                    savedSalaryId = payrollResult.salary?.id || savedSalaryId;
                    toast.success("Salary structure assigned successfully");
                } else {
                    toast.error("User saved, but failed to assign salary structure: " + payrollResult.error);
                }
            }

            // Save component overrides if employee has a salary record
            const salaryId = savedSalaryId;
            if (salaryId && Object.keys(componentOverrides).length > 0) {
                const overridesList = buildOverridePayload();
                const ovrResult = await saveEmployeeComponentOverrides(salaryId, overridesList);
                if (!ovrResult.success) {
                    toast.error("Failed to save component overrides: " + ovrResult.error);
                }
            }

            // Optional: attach onboarding after create (bridge from Add employee)
            if (!initialData && alsoStartOnboarding && savedUser?.id) {
                setStartingOnboarding(true);
                try {
                    const obResult = await startOnboardingForEmployee({
                        variables: {
                            input: {
                                userId: savedUser.id,
                                generateOffer: false,
                                sendInvite: false,
                            },
                        },
                    });
                    const payload = obResult.data?.startOnboardingForEmployee;
                    if (payload?.onboardingId) {
                        if (payload.success) {
                            toast.success("Onboarding checklist started");
                        } else {
                            toast.message(payload.error || "Opened existing onboarding");
                        }
                        onSuccess();
                        router.push(`/onboarding/${payload.onboardingId}`);
                        return;
                    }
                    toast.error(
                        payload?.error ||
                            "Employee created, but onboarding could not be started"
                    );
                } catch (err: any) {
                    toast.error(
                        err?.message ||
                            "Employee created, but onboarding could not be started"
                    );
                } finally {
                    setStartingOnboarding(false);
                }
            }

            onSuccess();
        } catch (error: any) {
            toast.error(error.message || "An error occurred");
        }
    };

    if (formMetaLoading) {
        return <FormSkeleton />;
    }

    return (
        <>
        <form noValidate onSubmit={handleSubmit} onKeyDown={(e) => { if (e.key === "Enter" && (e.target as HTMLElement).tagName !== "TEXTAREA") e.preventDefault(); }} className="flex min-h-0 flex-1 flex-col">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as EmployeeTab)} className="flex min-h-0 flex-1 flex-col gap-0">
                {Object.keys(errors).length > 0 && (
                    <div
                        ref={errorBannerRef}
                        className="mb-3 flex shrink-0 items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
                    >
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                        <div>
                            <p className="font-medium">
                                {Object.keys(errors).length} validation{" "}
                                {Object.keys(errors).length === 1 ? "error" : "errors"}
                            </p>
                            <p className="mt-0.5 text-xs text-destructive/80">
                                Check{" "}
                                {getErrorTabs(errors)
                                    .map((t) => TAB_LABELS[t])
                                    .join(", ")}
                            </p>
                        </div>
                    </div>
                )}
                <SegmentedTabs
                    className="mb-4 shrink-0"
                    value={activeTab}
                    onChange={(id) => setActiveTab(id as EmployeeTab)}
                    tabs={[
                        {
                            id: "identity",
                            label: "Identity",
                            icon: UserIcon,
                            count: countTabErrors("identity", errors),
                            tone: tabHasErrors("identity", errors) ? "destructive" : "default",
                        },
                        {
                            id: "employment",
                            label: "Work",
                            icon: Briefcase,
                            count: countTabErrors("employment", errors),
                            tone: tabHasErrors("employment", errors) ? "destructive" : "default",
                        },
                        {
                            id: "financials",
                            label: "Finance",
                            icon: Landmark,
                            count: countTabErrors("financials", errors),
                            tone: tabHasErrors("financials", errors) ? "destructive" : "default",
                        },
                        {
                            id: "payroll",
                            label: "Payroll",
                            icon: Wallet,
                            count: countTabErrors("payroll", errors),
                            tone: tabHasErrors("payroll", errors) ? "destructive" : "default",
                        },
                    ]}
                />

                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1">
                <TabsContent value="identity" forceMount className={cn("mt-0 space-y-6 data-[state=inactive]:hidden")}>
                    {/* Profile Picture Upload Section */}
                    <div className="flex items-center gap-4 rounded-xl border border-border bg-muted/30 p-4">
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => profilePicturePreview && setIsPhotoOpen(true)}
                                className={`flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl border border-border bg-card ${profilePicturePreview ? "cursor-zoom-in" : "cursor-default"}`}
                            >
                                {profilePicturePreview ? (
                                    <img src={profilePicturePreview} alt="Preview" className="h-full w-full object-cover" />
                                ) : (
                                    <UserIcon className="h-8 w-8 text-muted-foreground/40" />
                                )}
                            </button>
                            <label className="absolute -bottom-1.5 -right-1.5 cursor-pointer rounded-lg bg-primary p-1.5 text-primary-foreground hover:bg-primary/90">
                                <Plus className="h-3.5 w-3.5" />
                                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                            </label>
                        </div>
                        <div className="flex-1">
                            <h4 className="text-sm font-medium">Profile photo</h4>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                                JPG or PNG, max 2MB.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input label="First Name" name="firstName" required value={formData.firstName} onChange={handleChange} error={errors.firstName} />
                        <Input label="Last Name" name="lastName" required value={formData.lastName} onChange={handleChange} error={errors.lastName} />
                        <Input label="Email" name="email" type="email" required value={formData.email} onChange={handleChange} error={errors.email} />
                        <Input label="Phone Number" name="phoneNumber" required value={formData.phoneNumber} onChange={handleChange} error={errors.phoneNumber} />
                        {!initialData && (
                            <Input
                                label="Temporary Password"
                                name="password"
                                type="text"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                error={errors.password}
                                hint="Auto-filled from first name (e.g. John@123). Sent in the welcome email."
                            />
                        )}
                        <DatePickerSimple label="Date of Birth" value={formData.dateOfBirth} onChange={(date) => handleDateChange("dateOfBirth", date)} error={errors.dateOfBirth} />
                        <FormSelect
                            label="Role"
                            name="role"
                            value={formData.role}
                            onValueChange={(v) => handleSelectChange("role", v)}
                            error={errors.role}
                            options={[
                                { label: "Employee", value: "employee" },
                                { label: "Manager", value: "manager" },
                                { label: "HR", value: "hr" },
                                ...(currentUser?.role === 'superadmin' || currentUser?.role === 'admin' ? [{ label: "Admin", value: "admin" }] : [])
                            ]}
                        />
                    </div>
                </TabsContent>

                <TabsContent value="employment" forceMount className={cn("mt-0 space-y-4 data-[state=inactive]:hidden")}>
                    <div className="grid grid-cols-2 gap-4">
                        <DatePickerSimple label="Date of Joining" value={formData.dateOfJoining} onChange={(date) => handleDateChange("dateOfJoining", date)} error={errors.dateOfJoining} />
                        <DatePickerSimple label="Date of Exit" value={formData.dateOfExit} onChange={(date) => handleDateChange("dateOfExit", date)} />
                        
                        {currentUser?.role === 'superadmin' && (
                            <FormSelect
                                label="Organization"
                                name="organizationId"
                                required
                                value={formData.organizationId}
                                onValueChange={(v) => handleSelectChange("organizationId", v)}
                                options={organizationOptions}
                                error={errors.organizationId}
                            />
                        )}
                        
                        <FormSelect
                            label="Department"
                            name="departmentId"
                            required
                            value={formData.departmentId}
                            onValueChange={(v) => handleSelectChange("departmentId", v)}
                            options={departmentOptions}
                            error={errors.departmentId}
                        />
                        <FormSelect
                            label="Designation"
                            name="designationId"
                            required
                            value={formData.designationId}
                            onValueChange={(v) => handleSelectChange("designationId", v)}
                            options={designationOptions}
                            error={errors.designationId}
                        />
                        <FormSelect
                            label="Employment Type"
                            name="employmentType"
                            required
                            value={formData.employmentType}
                            onValueChange={(v) => handleSelectChange("employmentType", v)}
                            options={[{ label: "Full Time", value: "full_time" }, { label: "Contract", value: "contract" }, { label: "Intern", value: "intern" }]}
                            error={errors.employmentType}
                        />
                        <FormSelect
                            label="Office Location"
                            name="officeLocationId"
                            value={formData.officeLocationId}
                            onValueChange={(v) => handleSelectChange("officeLocationId", v)}
                            options={officeLocationOptions}
                            error={errors.officeLocationId}
                        />
                        <FormSelect
                            label="Reporting Manager"
                            name="managerId"
                            value={formData.managerId || "none"}
                            onValueChange={(v) =>
                                handleSelectChange("managerId", v === "none" ? "" : v)
                            }
                            options={managerSelectOptions}
                            placeholder="Select manager"
                            error={errors.managerId}
                        />
                    </div>

                    {!initialData && (
                        <div className="space-y-3 rounded-xl border border-border bg-muted/30 p-4">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-sm font-medium text-foreground">
                                        Also start onboarding
                                    </p>
                                    <p className="mt-0.5 text-xs text-muted-foreground">
                                        Attach a checklist after creating this roster record.
                                        For new joiners with offer letters and a magic-link portal,
                                        prefer{" "}
                                        <Link
                                            href="/onboarding"
                                            className="font-medium text-primary underline-offset-2 hover:underline"
                                        >
                                            Onboarding → Start hire
                                        </Link>
                                        .
                                    </p>
                                </div>
                                <Switch
                                    checked={alsoStartOnboarding}
                                    onCheckedChange={setAlsoStartOnboarding}
                                />
                            </div>
                        </div>
                    )}

                    {initialData && (
                        <div className="rounded-xl border border-border bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
                            Need docs or a checklist for this person? Use{" "}
                            <span className="font-medium text-foreground">Start onboarding</span>{" "}
                            on their employee card, or open{" "}
                            <Link
                                href="/onboarding"
                                className="font-medium text-primary underline-offset-2 hover:underline"
                            >
                                Onboarding
                            </Link>
                            .
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="financials" forceMount className={cn("mt-0 space-y-4 data-[state=inactive]:hidden")}>
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Bank Account Number" name="bankAccountNumber" value={formData.bankAccountNumber} onChange={handleChange} />
                        <Input label="IFSC Code" name="bankIfscCode" value={formData.bankIfscCode} onChange={handleChange} />
                        <Input label="PAN Number" name="panNumber" value={formData.panNumber} onChange={handleChange} />
                        <Input label="Aadhar Number" name="aadharNumber" value={formData.aadharNumber} onChange={handleChange} />
                        <Input label="UAN Number" name="uanNumber" value={formData.uanNumber} onChange={handleChange} />
                    </div>
                </TabsContent>

                <TabsContent value="payroll" forceMount className={cn("mt-0 space-y-4 data-[state=inactive]:hidden")}>
                    <div className="space-y-4 rounded-xl border border-border bg-muted/20 p-4">
                        <div className="flex items-center gap-3">
                            <CreditCard className="h-5 w-5 text-primary" />
                            <div>
                                <h3 className="text-sm font-medium">Compensation</h3>
                                <p className="text-xs text-muted-foreground">Salary structure and annual CTC.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <FormSelect
                                label="Salary Structure"
                                name="salaryStructureId"
                                value={formData.salaryStructureId}
                                onValueChange={(v) => handleSelectChange("salaryStructureId", v)}
                                options={ensureSelectedOption(
                                    (salaryStructures || []).map((s: { id: string | number; name: string }) => ({
                                        label: s.name,
                                        value: String(s.id),
                                    })),
                                    formData.salaryStructureId,
                                    initialData?.salaryDetails?.salaryStructure?.name
                                )}
                            />
                            <Input
                                label="Annual CTC (₹)"
                                name="annualCtc"
                                type="number"
                                value={formData.annualCtc}
                                onChange={handleChange}
                                hint="Total cost to company per year"
                            />
                            <DatePickerSimple
                                label="Effective From"
                                value={formData.effectiveFrom}
                                onChange={(date) => handleDateChange("effectiveFrom", date)}
                            />
                        </div>
                    </div>

                    {/* Per-employee component customization */}
                    {(() => {
                        const selectedStructure = salaryStructures.find((s: any) => String(s.id) === formData.salaryStructureId);
                        const structComponents = selectedStructure?.components || [];
                        if (structComponents.length === 0) return null;
                        return (
                        <div className="space-y-4 rounded-xl border border-border bg-muted/20 p-4">
                            <div className="flex items-center gap-3">
                                <Wallet className="h-5 w-5 text-primary" />
                                <div>
                                    <h3 className="text-sm font-medium">Component Customization</h3>
                                    <p className="text-xs text-muted-foreground">Toggle or override specific salary components for this employee.</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {structComponents.map((sc: any) => {
                                    const compId = sc.component.id;
                                    const ovr = componentOverrides[compId] || { isExcluded: false, overrideValue: "" };
                                    const isEarning = sc.component.componentType === "earning";
                                    return (
                                        <div key={sc.id} className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
                                            <ToggleSwitch
                                                checked={!ovr.isExcluded}
                                                onCheckedChange={(checked) => {
                                                    setComponentOverrides((prev) => ({
                                                        ...prev,
                                                        [compId]: { ...ovr, isExcluded: !checked },
                                                    }));
                                                }}
                                            />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium truncate">{sc.component.name}</span>
                                                    <span className={cn(
                                                        "text-[10px] px-1.5 py-0.5 rounded font-medium",
                                                        isEarning ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"
                                                    )}>
                                                        {isEarning ? "Earning" : "Deduction"}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    Default: {sc.calculationType === "flat" ? `₹${sc.value}` : `${sc.value}% of ${sc.component.code}`}
                                                </p>
                                            </div>
                                            <div className="w-32 shrink-0">
                                                <input
                                                    type="number"
                                                    placeholder="Override ₹"
                                                    disabled={ovr.isExcluded}
                                                    value={ovr.overrideValue}
                                                    onChange={(e) => {
                                                        setComponentOverrides((prev) => ({
                                                            ...prev,
                                                            [compId]: { ...ovr, overrideValue: e.target.value },
                                                        }));
                                                    }}
                                                    className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-sm disabled:opacity-50"
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        );
                    })()}
                </TabsContent>
                </div>
            </Tabs>

            <div className="mt-6 flex shrink-0 justify-end gap-2 border-t border-border pt-4">
                <button type="button" onClick={onCancel} className="btn-ghost">Cancel</button>
                <button type="submit" className="btn-primary gap-2" disabled={isSubmitting || (activeTab === "payroll" && isStructuresLoading)}>
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : (initialData ? "Save changes" : "Create employee")}
                </button>
            </div>
        </form>
        <PhotoOverlay
            open={isPhotoOpen}
            onOpenChange={setIsPhotoOpen}
            src={profilePicturePreview}
            name={`${formData.firstName || ""} ${formData.lastName || ""}`.trim() || "Employee"}
        />
        </>
    );
}