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


import { usePayrollQueries, usePayrollMutations } from "@/lib/graphql/payroll/payrollHook";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { CreditCard, Wallet, Landmark, User as UserIcon, Briefcase } from "lucide-react";
import { useGraphQLUser } from "@/lib/api/graphqlHooks";

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
    const isLoading = isCreatingUser || isUpdatingUser || isStructuresLoading;

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

    if (isDepartmentsLoading || isDesignationsLoading || isOfficeLocationsLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-4 bg-muted/30 p-1 rounded-2xl mb-8">
                    <TabsTrigger value="identity" className="rounded-xl gap-2 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-background data-[state=active]:shadow-sm">
                        <UserIcon className="w-3.5 h-3.5" /> Identity
                    </TabsTrigger>
                    <TabsTrigger value="employment" className="rounded-xl gap-2 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-background data-[state=active]:shadow-sm">
                        <Briefcase className="w-3.5 h-3.5" /> Work
                    </TabsTrigger>
                    <TabsTrigger value="financials" className="rounded-xl gap-2 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-background data-[state=active]:shadow-sm">
                        <Landmark className="w-3.5 h-3.5" /> Finance
                    </TabsTrigger>
                    <TabsTrigger value="payroll" className="rounded-xl gap-2 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-background data-[state=active]:shadow-sm">
                        <Wallet className="w-3.5 h-3.5" /> Payroll
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="identity" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {/* Profile Picture Upload Section */}
                    <div className="flex items-center gap-6 p-6 bg-muted/20 rounded-3xl border border-border/50">
                        <div className="relative group">
                            <div className="w-24 h-24 rounded-3xl bg-card border-4 border-background shadow-xl overflow-hidden flex items-center justify-center">
                                {profilePicturePreview ? (
                                    <img src={profilePicturePreview} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <UserIcon className="w-10 h-10 text-muted-foreground/30" />
                                )}
                            </div>
                            <label className="absolute -bottom-2 -right-2 p-2 bg-primary text-primary-foreground rounded-xl shadow-lg cursor-pointer hover:scale-110 transition-transform">
                                <Plus className="w-4 h-4" />
                                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                            </label>
                        </div>
                        <div className="flex-1">
                            <h4 className="text-sm font-black uppercase tracking-widest mb-1">Profile Photo</h4>
                            <p className="text-[10px] text-muted-foreground font-medium max-w-[200px]">
                                Upload a professional photo. Supported formats: JPG, PNG. Max size: 2MB.
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

                <TabsContent value="employment" className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
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

                <TabsContent value="financials" className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Bank Account Number" name="bankAccountNumber" value={formData.bankAccountNumber} onChange={handleChange} />
                        <Input label="IFSC Code" name="bankIfscCode" value={formData.bankIfscCode} onChange={handleChange} />
                        <Input label="PAN Number" name="panNumber" value={formData.panNumber} onChange={handleChange} />
                        <Input label="Aadhar Number" name="aadharNumber" value={formData.aadharNumber} onChange={handleChange} />
                        <Input label="UAN Number" name="uanNumber" value={formData.uanNumber} onChange={handleChange} />
                    </div>
                </TabsContent>

                <TabsContent value="payroll" className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="p-6 border border-primary/20 bg-primary/5 rounded-3xl space-y-6">
                        <div className="flex items-center gap-3">
                            <CreditCard className="w-5 h-5 text-primary" />
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-widest">Compensation Strategy</h3>
                                <p className="text-[10px] text-muted-foreground font-medium">Define the salary structure and annual CTC for this individual.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            </Tabs>

            <div className="flex justify-end gap-3 pt-6 border-t border-border">
                <button type="button" onClick={onCancel} className="px-8 py-4 text-muted-foreground text-[11px] font-black uppercase tracking-widest">Dismiss</button>
                <button type="submit" className="px-10 py-4 bg-primary text-primary-foreground rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center gap-3" disabled={isLoading}>
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (initialData ? "Apply Changes" : "Establish Profile")}
                </button>
            </div>
        </form>
    );
}