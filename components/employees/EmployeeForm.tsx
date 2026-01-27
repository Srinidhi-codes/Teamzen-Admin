"use client";

import { useState, useEffect } from "react";
import { FormInput } from "../common/FormInput";
import { useGraphQLUserMutations } from "@/lib/graphql/users/userHook";
import { toast } from "sonner";
import { User } from "@/lib/graphql/users/types";
import { Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { FormSelect } from "../common/FormSelect";
import { z } from "zod";
import { useStore } from "@/lib/store/useStore";
import { useGraphQLDepartments, useGraphQLDesignations, useGraphQLOrganizations } from "@/lib/graphql/organization/organizatioHook";
import { DatePickerSimple } from "../ui/datePicker";
import moment from "moment";


interface EmployeeFormProps {
    initialData?: User | null;
    onSuccess: () => void;
    onCancel: () => void;
}

const employeeSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().optional(),
    phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
    role: z.string().min(1, "Role is required"),
    dateOfJoining: z.string().min(1, "Date of joining is required"),
    dateOfExit: z.string().optional(),
    employmentType: z.string().min(1, "Employment type is required"),
    isActive: z.boolean().default(true),
    departmentId: z.string().optional(),
    designationId: z.string().optional(),
    isStaff: z.boolean().default(false),
    isVerified: z.boolean().default(false),
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
        password: "DefaultPassword123!",
        phoneNumber: "",
        role: "employee",
        dateOfJoining: "",
        dateOfExit: "",
        employmentType: "full_time",
        isActive: true,
        departmentId: "",
        designationId: "",
        isStaff: true,
        isVerified: true,
        managerId: "",
        organizationId: "",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const { user } = useStore();
    const { createUser, updateUser, isCreatingUser, isUpdatingUser } = useGraphQLUserMutations();
    const { organizations } = useGraphQLOrganizations();
    const { designations } = useGraphQLDesignations();
    const { departments } = useGraphQLDepartments();
    const isLoading = isCreatingUser || isUpdatingUser;

    useEffect(() => {
        if (initialData) {
            setFormData({
                firstName: initialData.firstName || "",
                lastName: initialData.lastName || "",
                email: initialData.email || "",
                dateOfBirth: initialData.dateOfBirth || "",
                password: "", // Don't preserve password on edit
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
    console.log("InitialData:", initialData);
    console.log("FormData:", formData);
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            // Validate form
            const validationResult = employeeSchema.safeParse(formData);
            if (!validationResult.success) {
                const fieldErrors: Record<string, string> = {};
                const resultError = validationResult.error as any;
                resultError.errors.forEach((error: any) => {
                    if (error.path[0]) {
                        fieldErrors[error.path[0].toString()] = error.message;
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
                <FormInput
                    label="First Name"
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    error={errors.firstName}
                />
                <FormInput
                    label="Last Name"
                    name="lastName"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    error={errors.lastName}
                />
            </div>


            <div className="grid grid-cols-2 gap-4">
                <FormInput
                    label="Email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    error={errors.email}
                />

                {!initialData && (
                    <FormInput
                        label="Initial Password"
                        name="password"
                        type="password"
                        required
                        value={formData.password}
                        onChange={handleChange}
                        hint="Default password for new user"
                        error={errors.password}
                    />
                )}

                <FormInput
                    label="Phone Number"
                    name="phoneNumber"
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

                {user.role === "admin" && <FormSelect
                    label="Organization"
                    value={formData.organizationId}
                    onValueChange={(value) => handleSelectChange("organizationId", value)}
                    placeholder="Select Organization"
                    error={errors.organizationId}
                    required
                    options={organizations?.map(o => ({ label: o.name, value: o.id }))}
                />}

                <FormSelect
                    label="Role"
                    value={formData.role}
                    onValueChange={(value) => handleSelectChange("role", value)}
                    placeholder="Select Role"
                    error={errors.role}
                    required
                    options={[
                        { label: "Employee", value: "employee" },
                        { label: "Manager", value: "manager" },
                        { label: "HR", value: "hr" },
                        ...(user.role === "admin"
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
                    onValueChange={(value) => handleSelectChange("departmentId", value)}
                    placeholder="Select Department"
                    options={departments?.map(d => ({ label: d.name, value: d.id }))}
                />

                <FormSelect
                    label="Designation"
                    value={formData.designationId}
                    onValueChange={(value) => handleSelectChange("designationId", value)}
                    placeholder="Select Designation"
                    error={errors.designationId}
                    required
                    options={designations?.map(d => ({ label: d.name, value: d.id }))}
                />

                <FormSelect
                    label="Employment Type"
                    value={formData.employmentType}
                    onValueChange={(value) => handleSelectChange("employmentType", value)}
                    placeholder="Select Type"
                    error={errors.employmentType}
                    required
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
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center"
                    disabled={isLoading}
                >
                    {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {initialData ? "Update Employee" : "Create Employee"}
                </button>
            </div>
        </form>
    );
}
