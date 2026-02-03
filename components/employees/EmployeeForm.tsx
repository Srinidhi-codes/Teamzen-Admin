"use client";

import { useState, useEffect } from "react";
import { useGraphQLUserMutations } from "@/lib/graphql/users/userHook";
import { toast } from "sonner";
import { User } from "@/lib/graphql/users/types";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { FormSelect } from "../common/FormSelect";
import { z } from "zod";
import { useStore } from "@/lib/store/useStore";
import { useGraphQLDepartments, useGraphQLDesignations, useGraphQLOrganizations } from "@/lib/graphql/organization/organizationsHook";
import { DatePickerSimple } from "../ui/datePicker";
import moment from "moment";
import { Input } from "../ui/input";
import { Button } from "../ui/button";


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
    isStaff: z.boolean().default(false),
    isVerified: z.boolean().default(false),
    organizationId: z.string().min(1, "Organization is required "),
    managerId: z.string().optional(),
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
        isStaff: false,
        isVerified: false,
        managerId: "",
        organizationId: "",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const { user } = useStore();
    const { createUser, updateUser, isCreatingUser, isUpdatingUser } = useGraphQLUserMutations();
    const { organizations } = useGraphQLOrganizations();
    const { designations } = useGraphQLDesignations();
    const { departments } = useGraphQLDepartments();
    const [showPassword, setShowPassword] = useState(false);
    const isLoading = isCreatingUser || isUpdatingUser;

    useEffect(() => {
        const orgId = user?.organization?.id;
        if (!initialData && orgId && !formData.organizationId) {
            setFormData(prev => ({ ...prev, organizationId: String(orgId) }));
        }
    }, [user, initialData, formData.organizationId]);

    useEffect(() => {
        if (initialData) {
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
                isStaff: initialData.isStaff !== false,
                isVerified: initialData.isVerified !== false,
                managerId: initialData.manager?.id ? String(initialData.manager.id) : "",
                organizationId: initialData.organization?.id ? String(initialData.organization.id) : "",
            });
        }
    }, [initialData, organizations, designations, departments]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setFormData((prev) => {
            const newData = { ...prev, [name]: value };

            // Auto-generate password for new users when first name changes
            if (!initialData && name === "firstName") {
                const firstWord = value.trim().split(" ")[0];
                if (firstWord) {
                    newData.password = `${firstWord}@123`;
                } else {
                    newData.password = "";
                }
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
        if (errors[name]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
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
                    if (path) {
                        fieldErrors[path] = issue.message;
                    }
                });
                setErrors(fieldErrors);
                return;
            }

            if (!initialData && !formData.password) {
                setErrors(prev => ({ ...prev, password: "Password is required for new users" }));
                return;
            }

            if (initialData) {
                const { password, ...updateData } = formData;
                const result = await updateUser(initialData.id, updateData);
                if (result?.success) {
                    toast.success("Employee updated successfully");
                    onSuccess();
                } else {
                    toast.error(result?.error || "Failed to update employee");
                }
            } else {
                const result = await createUser(formData);
                if (result?.success) {
                    toast.success("Employee created successfully");
                    onSuccess();
                } else {
                    toast.error(result?.error || "Failed to create employee");
                }
            }
        } catch (error: any) {
            toast.error(error.message || "An error occurred");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <Input
                    label="First Name"
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    error={errors.firstName}
                />
                <Input
                    label="Last Name"
                    name="lastName"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    error={errors.lastName}
                />
            </div>


            <div className="grid grid-cols-2 gap-4">
                <Input
                    label="Email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    error={errors.email}
                />

                {!initialData && (
                    <Input
                        label="Initial Password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleChange}
                        hint="Default password for new user"
                        error={errors.password}
                        suffix={
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="p-1.5 hover:bg-slate-100 rounded-xl transition-colors"
                            >
                                {showPassword ? (
                                    <EyeOff className="w-4 h-4" />
                                ) : (
                                    <Eye className="w-4 h-4" />
                                )}
                            </button>
                        }
                    />
                )}

                <Input
                    label="Phone Number"
                    name="phoneNumber"
                    required
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    error={errors.phoneNumber}
                />

                <DatePickerSimple
                    label="Date of Birth"
                    value={formData.dateOfBirth}
                    onChange={(date) => handleDateChange("dateOfBirth", date)}
                    error={errors.dateOfBirth}
                />

                {user?.role === "admin" && <FormSelect
                    label="Organization"
                    value={formData.organizationId}
                    onValueChange={(value) => handleSelectChange("organizationId", value)}
                    placeholder="Select Organization"
                    error={errors.organizationId}
                    options={organizations?.map((o: any) => ({ label: o.name, value: o.id }))}
                />}

                <FormSelect
                    label="Role"
                    value={formData.role}
                    onValueChange={(value) => handleSelectChange("role", value)}
                    placeholder="Select Role"
                    error={errors.role}
                    options={[
                        { label: "Employee", value: "employee" },
                        { label: "Manager", value: "manager" },
                        { label: "HR", value: "hr" },
                        ...(user?.role === "admin"
                            ? [{ label: "Admin", value: "admin" }]
                            : []),
                    ]}
                />

                <DatePickerSimple
                    label="Date of Joining"
                    value={formData.dateOfJoining}
                    onChange={(date) => handleDateChange("dateOfJoining", date)}
                    error={errors.dateOfJoining}
                />

                <DatePickerSimple
                    label="Date of Exit"
                    value={formData.dateOfExit}
                    onChange={(date) => handleDateChange("dateOfExit", date)}
                    error={errors.dateOfExit}
                />

                <FormSelect
                    label="Department"
                    value={formData.departmentId}
                    required
                    onValueChange={(value) => handleSelectChange("departmentId", value)}
                    placeholder="Select Department"
                    error={errors.departmentId}
                    options={departments?.map((d: any) => ({ label: d.name, value: d.id }))}
                />

                <FormSelect
                    label="Designation"
                    value={formData.designationId}
                    required
                    onValueChange={(value) => handleSelectChange("designationId", value)}
                    placeholder="Select Designation"
                    error={errors.designationId}
                    options={designations?.map((d: any) => ({ label: d.name, value: d.id }))}
                />

                <FormSelect
                    label="Employment Type"
                    value={formData.employmentType}
                    required
                    onValueChange={(value) => handleSelectChange("employmentType", value)}
                    placeholder="Select Type"
                    error={errors.employmentType}
                    options={[
                        { label: "Full Time", value: "full_time" },
                        { label: "Contract", value: "contract" },
                        { label: "Intern", value: "intern" },
                    ]}
                />
            </div>

            <div className="grid grid-cols-3 gap-6 pt-2">
                <div className="flex flex-col space-y-3 p-4 border rounded-lg bg-gray-50/50">
                    <div className="space-y-0.5">
                        <label className="text-sm font-medium text-gray-900">Active Status</label>
                        <p className="text-xs text-muted-foreground">Is this employee active?</p>
                    </div>
                    <Switch
                        checked={formData.isActive}
                        onCheckedChange={(checked) => handleSwitchChange("isActive", checked)}
                    />
                </div>

                <div className="flex flex-col space-y-3 p-4 border rounded-lg bg-gray-50/50">
                    <div className="space-y-0.5">
                        <label className="text-sm font-medium text-gray-900">Staff Status</label>
                        <p className="text-xs text-muted-foreground">Is this user a staff member?</p>
                    </div>
                    <Switch
                        checked={formData.isStaff}
                        onCheckedChange={(checked) => handleSwitchChange("isStaff", checked)}
                    />
                </div>

                <div className="flex flex-col space-y-3 p-4 border rounded-lg bg-gray-50/50">
                    <div className="space-y-0.5">
                        <label className="text-sm font-medium text-gray-900">Verified</label>
                        <p className="text-xs text-muted-foreground">Has their email been verified?</p>
                    </div>
                    <Switch
                        checked={formData.isVerified}
                        onCheckedChange={(checked) => handleSwitchChange("isVerified", checked)}
                    />
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-6">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    disabled={isLoading}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="btn-primary"
                    disabled={isLoading}
                >
                    {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {initialData ? "Update Employee" : "Create Employee"}
                </button>
            </div>
        </form>
    );
}
