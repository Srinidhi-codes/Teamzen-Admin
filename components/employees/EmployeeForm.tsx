"use client";

import { useState, useEffect } from "react";
import { useGraphQLUserMutations } from "@/lib/graphql/users/userHook";
import { toast } from "sonner";
import { User } from "@/lib/graphql/users/types";
import { Loader2, Eye, EyeOff, Plus } from "lucide-react";
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { CreditCard, Wallet, Landmark, User as UserIcon, Briefcase } from "lucide-react";
import { useGraphQLUser } from "@/lib/api/graphqlHooks";
import { cn } from "@/lib/utils";

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

export default function EmployeeForm({
    initialData,
    onSuccess,
    onCancel,
}: EmployeeFormProps) {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        dateOfBirth: "",
        password: "",
        phoneNumber: "",
        role: "employee",
        dateOfJoining: moment().format("YYYY-MM-DD"),
        dateOfExit: "",
        employmentType: "full_time",
        isActive: true,
        departmentId: "",
        designationId: "",
        officeLocationId: "",
        isStaff: false,
        isVerified: false,
        managerId: "",
        organizationId: "",
        // Financials
        bankAccountNumber: "",
        bankIfscCode: "",
        panNumber: "",
        aadharNumber: "",
        uanNumber: "",
        // Payroll
        salaryStructureId: "",
        annualCtc: "",
        effectiveFrom: moment().startOf('month').format("YYYY-MM-DD"),
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const { user: storeUser } = useStore();
    const { user: graphqlUser } = useGraphQLUser();
    const currentUser = graphqlUser || storeUser;
    const { createUser, updateUser, isCreatingUser, isUpdatingUser } = useGraphQLUserMutations();
    const { organizations, isOrganizationsLoading } = useGraphQLOrganizations();
    const { designations, isDesignationsLoading } = useGraphQLDesignations();
    const { departments, isDepartmentsLoading } = useGraphQLDepartments();
    const { officeLocations, isOfficeLocationsLoading } = useGraphQLOfficeLocations();
    const { salaryStructures, isStructuresLoading } = usePayrollQueries();
    const { assignSalaryToEmployee } = usePayrollMutations();

    const [activeTab, setActiveTab] = useState("identity");
    const [profilePicture, setProfilePicture] = useState<File | null>(null);
    const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(initialData?.profilePictureUrl || null);
    const isSubmitting = isCreatingUser || isUpdatingUser;
    const formMetaLoading =
        (isDepartmentsLoading && !departments) ||
        (isDesignationsLoading && !designations) ||
        (isOfficeLocationsLoading && !officeLocations);

    // Get options helpers
    const getDepartmentOptions = () => {
        if (!departments) return [];
        let filtered = departments;
        if (formData.organizationId) {
            filtered = departments.filter((d: any) => String(d.organization?.id) === formData.organizationId);
        }
        return filtered.map((d: any) => ({ label: d.name, value: String(d.id) }));
    };

    const getDesignationOptions = () => {
        if (!designations) return [];
        let filtered = designations;
        if (formData.organizationId) {
            filtered = designations.filter((d: any) => String(d.organization?.id) === formData.organizationId);
        }
        return filtered.map((d: any) => ({ label: d.name, value: String(d.id) }));
    };

    const getOfficeLocationOptions = () => {
        if (!officeLocations) return [];
        let filtered = officeLocations;
        if (formData.organizationId) {
            filtered = officeLocations.filter((o: any) => String(o.organizationId) === formData.organizationId);
        }
        return filtered.map((o: any) => ({ label: o.name, value: String(o.id) }));
    };

    const getOrganizationOptions = () => {
        if (!organizations) return [];
        return organizations.map((o: any) => ({ label: o.name, value: String(o.id) }));
    };

    const departmentOptions = getDepartmentOptions();
    const designationOptions = getDesignationOptions();
    const officeLocationOptions = getOfficeLocationOptions();
    const organizationOptions = getOrganizationOptions();

    useEffect(() => {
        const orgId = currentUser?.organization?.id;
        if (!initialData && orgId && !formData.organizationId) {
            setFormData(prev => ({ ...prev, organizationId: String(orgId) }));
        }
    }, [currentUser, initialData, formData.organizationId]);

    useEffect(() => {
        if (!initialData) return;

        setFormData({
            firstName: initialData.firstName || "",
            lastName: initialData.lastName || "",
            email: initialData.email || "",
            dateOfBirth: initialData.dateOfBirth || "",
            password: "",
            phoneNumber: initialData.phoneNumber || "",
            role: initialData.role || "employee",
            dateOfJoining: initialData.dateOfJoining || "",
            dateOfExit: initialData.dateOfExit || "",
            employmentType: initialData.employmentType || "full_time",
            isActive: initialData.isActive !== false,
            departmentId: initialData.department?.id ? String(initialData.department.id) : "",
            designationId: initialData.designation?.id ? String(initialData.designation.id) : "",
            officeLocationId: initialData.officeLocation?.id ? String(initialData.officeLocation.id) : "",
            isStaff: initialData.isStaff !== false,
            isVerified: initialData.isVerified !== false,
            managerId: initialData.manager?.id ? String(initialData.manager.id) : "",
            organizationId: initialData.organization?.id ? String(initialData.organization.id) : "",
            // Financials
            bankAccountNumber: initialData.bankAccountNumber || "",
            bankIfscCode: initialData.bankIfscCode || "",
            panNumber: initialData.panNumber || "",
            aadharNumber: initialData.aadharNumber || "",
            uanNumber: initialData.uanNumber || "",
            // Payroll
            salaryStructureId: initialData.salaryDetails?.salaryStructure?.id ? String(initialData.salaryDetails.salaryStructure.id) : "",
            annualCtc: initialData.salaryDetails?.annualCtc ? String(initialData.salaryDetails.annualCtc) : "",
            effectiveFrom: initialData.salaryDetails?.effectiveFrom || moment().startOf('month').format("YYYY-MM-DD"),
        });
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
            
            return newData;
        });
    };

    const handleSwitchChange = (name: string, checked: boolean) => {
        setFormData((prev) => ({ ...prev, [name]: checked }));
    };

    const handleSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
        e?.preventDefault();

        try {
            const validationResult = employeeSchema.safeParse(formData);
            if (!validationResult.success) {
                const fieldErrors: Record<string, string> = {};
                validationResult.error.issues.forEach((issue) => {
                    const path = issue.path[0]?.toString();
                    if (path) fieldErrors[path] = issue.message;
                });
                setErrors(fieldErrors);
                toast.error("Please fix validation errors across all tabs");
                return;
            }

            let savedUser: any = null;
            if (initialData) {
                const { password, salaryStructureId, annualCtc, effectiveFrom, ...updateData } = formData;
                const result = await updateUser(initialData.id, updateData);
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
                const { salaryStructureId, annualCtc, effectiveFrom, ...createData } = formData;
                const result = await createUser(createData);
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
                    toast.success("Employee created successfully");
                } else {
                    toast.error(result?.error || "Failed to create employee");
                    return;
                }
            }

            // Handle Payroll Assignment...
            if (savedUser && formData.salaryStructureId && formData.annualCtc) {
                const payrollResult = await assignSalaryToEmployee(
                    savedUser.id,
                    formData.salaryStructureId,
                    Number(formData.annualCtc),
                    formData.effectiveFrom
                );
                if (payrollResult.success) {
                    toast.success("Salary structure assigned successfully");
                } else {
                    toast.error("User saved, but failed to assign salary structure: " + payrollResult.error);
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
        <form onSubmit={handleSubmit} className="flex min-h-full flex-col">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex min-h-0 flex-1 flex-col gap-0">
                <TabsList className="mb-4 grid h-auto w-full shrink-0 grid-cols-4 gap-0 rounded-none border-b border-border bg-transparent p-0">
                    <TabsTrigger
                        value="identity"
                        className="rounded-none border-b-2 border-transparent py-2.5 text-sm data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                    >
                        <UserIcon className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Identity</span>
                    </TabsTrigger>
                    <TabsTrigger
                        value="employment"
                        className="rounded-none border-b-2 border-transparent py-2.5 text-sm data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                    >
                        <Briefcase className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Work</span>
                    </TabsTrigger>
                    <TabsTrigger
                        value="financials"
                        className="rounded-none border-b-2 border-transparent py-2.5 text-sm data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                    >
                        <Landmark className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Finance</span>
                    </TabsTrigger>
                    <TabsTrigger
                        value="payroll"
                        className="rounded-none border-b-2 border-transparent py-2.5 text-sm data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                    >
                        <Wallet className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Payroll</span>
                    </TabsTrigger>
                </TabsList>

                <div className="relative min-h-[360px] flex-1">
                <TabsContent value="identity" forceMount className={cn("mt-0 space-y-6 data-[state=inactive]:hidden")}>
                    {/* Profile Picture Upload Section */}
                    <div className="flex items-center gap-4 rounded-xl border border-border bg-muted/30 p-4">
                        <div className="relative">
                            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl border border-border bg-card">
                                {profilePicturePreview ? (
                                    <img src={profilePicturePreview} alt="Preview" className="h-full w-full object-cover" />
                                ) : (
                                    <UserIcon className="h-8 w-8 text-muted-foreground/40" />
                                )}
                            </div>
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
                        <DatePickerSimple label="Date of Birth" value={formData.dateOfBirth} onChange={(date) => handleDateChange("dateOfBirth", date)} error={errors.dateOfBirth} />
                        <FormSelect
                            label="Role"
                            value={formData.role}
                            onValueChange={(v) => handleSelectChange("role", v)}
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
                        <DatePickerSimple label="Date of Joining" value={formData.dateOfJoining} onChange={(date) => handleDateChange("dateOfJoining", date)} />
                        <DatePickerSimple label="Date of Exit" value={formData.dateOfExit} onChange={(date) => handleDateChange("dateOfExit", date)} />
                        
                        {currentUser?.role === 'superadmin' && (
                            <FormSelect label="Organization" required value={formData.organizationId} onValueChange={(v) => handleSelectChange("organizationId", v)} options={organizationOptions} />
                        )}
                        
                        <FormSelect label="Department" required value={formData.departmentId} onValueChange={(v) => handleSelectChange("departmentId", v)} options={departmentOptions} />
                        <FormSelect label="Designation" required value={formData.designationId} onValueChange={(v) => handleSelectChange("designationId", v)} options={designationOptions} />
                        <FormSelect label="Employment Type" required value={formData.employmentType} onValueChange={(v) => handleSelectChange("employmentType", v)} options={[{ label: "Full Time", value: "full_time" }, { label: "Contract", value: "contract" }, { label: "Intern", value: "intern" }]} />
                        <FormSelect label="Office Location" value={formData.officeLocationId} onValueChange={(v) => handleSelectChange("officeLocationId", v)} options={officeLocationOptions} />
                    </div>
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
                                value={formData.salaryStructureId}
                                onValueChange={(v) => handleSelectChange("salaryStructureId", v)}
                                options={salaryStructures.map((s: any) => ({ label: s.name, value: String(s.id) }))}
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
    );
}