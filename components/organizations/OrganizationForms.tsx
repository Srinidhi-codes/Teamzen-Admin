"use client";

import { useEffect, useState } from "react";

import {
    useGraphQLCreateOfficeLocationMutation,
    useGraphQLUpdateOfficeLocationMutation,
    useGraphQLDepartmentMutation,
    useGraphQLDesignationMutation,
    useGraphQLOrganizations,
    useGraphQLUpdateDesignationMutation,
    useGraphQLUpdateDepartmentMutation
} from "@/lib/graphql/organization/organizationsHook";
import { toast } from "sonner";
import { Textarea } from "../ui/textarea";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStore } from "@/lib/store/useStore";


interface BaseFormProps {
    onCancel: () => void;
    onSubmit: (data: any) => Promise<void>;
    officeLocationEditData?: any;
    departmentEditData?: any;
    designationEditData?: any;
}

export function AddOfficeForm({ onCancel, onSubmit, officeLocationEditData }: BaseFormProps) {
    const [loading, setLoading] = useState(false);
    const { updateOfficeLocation, isUpdatingOfficeLocationLoading, isUpdatingOfficeLocationError } = useGraphQLUpdateOfficeLocationMutation();
    const { createOfficeLocation, isCreatingOfficeLocationLoading, isCreatingOfficeLocationError } = useGraphQLCreateOfficeLocationMutation();
    const [formData, setFormData] = useState({
        name: "",
        loginTime: "",
        logoutTime: "",
        latitude: "",
        longitude: "",
        address: "",
        state: "",
        city: "",
        zipCode: "",
        geoRadiusMeters: 0,
        country: "",
        isActive: true,
    });

    useEffect(() => {
        if (officeLocationEditData) {
            setFormData({
                name: officeLocationEditData.name || "",
                loginTime: officeLocationEditData.loginTime || "",
                logoutTime: officeLocationEditData.logoutTime || "",
                latitude: officeLocationEditData.latitude || "",
                longitude: officeLocationEditData.longitude || "",
                address: officeLocationEditData.address || "",
                state: officeLocationEditData.state || "",
                city: officeLocationEditData.city || "",
                zipCode: officeLocationEditData.zipCode || "",
                geoRadiusMeters: officeLocationEditData.geoRadiusMeters || 0,
                country: officeLocationEditData.country || "",
                isActive: officeLocationEditData.isActive ?? true,
            })
        }
    }, [officeLocationEditData])


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) || 0 : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (officeLocationEditData) {
                await updateOfficeLocation({
                    ...formData,
                    id: officeLocationEditData.id,
                    organizationId: officeLocationEditData.organizationId,
                });
                toast.success("Office location updated successfully");
            } else {
                await createOfficeLocation({
                    ...formData,
                });
                toast.success("Office location created successfully");
            }

            setFormData({
                name: "",
                loginTime: "",
                logoutTime: "",
                latitude: "",
                longitude: "",
                address: "",
                state: "",
                city: "",
                zipCode: "",
                geoRadiusMeters: 0,
                country: "",
                isActive: true,
            });

            onSubmit(formData);
        } catch (error) {
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 animate-fadeIn mt-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Add Office Location</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
                <Input name="name" label="Name" value={formData?.name} onChange={handleChange} required placeholder="e.g. Headquarters" />

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                    <Textarea
                        name="address"
                        rows={3}
                        required
                        value={formData?.address} onChange={handleChange}
                        className="w-full textarea resize-none"
                        placeholder="Full office address"
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Input name="city" label="City" value={formData?.city} onChange={handleChange} />
                    <Input name="state" label="State" value={formData?.state} onChange={handleChange} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Input name="country" label="Country" value={formData?.country} onChange={handleChange} />
                    <Input name="zipCode" label="Zip Code" value={formData?.zipCode} onChange={handleChange} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Input name="loginTime" label="Login Time" type="time" value={formData?.loginTime} onChange={handleChange} />
                    <Input name="logoutTime" label="Logout Time" type="time" value={formData?.logoutTime} onChange={handleChange} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <Input name="latitude" label="Latitude" type="number" value={formData?.latitude} onChange={handleChange} placeholder="0.000000" />
                    <Input name="longitude" label="Longitude" type="number" value={formData?.longitude} onChange={handleChange} placeholder="0.000000" />
                    <Input name="geoRadiusMeters" label="Geo Radius Meters" type="number" value={formData?.geoRadiusMeters} onChange={handleChange} />
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                    <Button variant={"ghost"} type="button" className="btn-secondary" onClick={onCancel}>Cancel</Button>
                    <Button variant={"ghost"} type="submit" className="btn-primary min-w-[120px]" disabled={loading}>
                        {loading ? "Saving..." : "Save Location"}
                    </Button>
                </div>
            </form>
        </div>
    );
}

export function AddDepartmentForm({ onCancel, onSubmit, departmentEditData }: BaseFormProps) {
    const [loading, setLoading] = useState(false);
    const { createDepartment } = useGraphQLDepartmentMutation();
    const { updateDepartment } = useGraphQLUpdateDepartmentMutation();
    const { organizations } = useGraphQLOrganizations();
    const { user } = useStore();
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        organizationId: "",
        isActive: true
    });

    useEffect(() => {
        if (departmentEditData) {
            setFormData({
                name: departmentEditData.name,
                description: departmentEditData.description,
                organizationId: departmentEditData.organization.id,
                isActive: departmentEditData.isActive
            });
        }
    }, [departmentEditData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDepartmentChange = (value: string) => {
        setFormData(prev => ({ ...prev, organizationId: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const organizationId =
                user?.role === "admin"
                    ? formData.organizationId
                    : (user?.organization?.id || "");

            if (departmentEditData) {
                await updateDepartment({
                    ...formData,
                    id: departmentEditData.id,
                    organizationId,
                });

                toast.success("Department updated successfully");

            } else {
                await createDepartment({
                    name: formData.name,
                    description: formData.description,
                    isActive: formData.isActive,
                    organizationId,
                });

                toast.success("Department created successfully");
                await onSubmit(formData);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setFormData({
                name: "",
                description: "",
                organizationId: "",
                isActive: true
            });
            onSubmit(formData);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 animate-fadeIn mt-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Add Department</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                    name="name"
                    label="Department Name"
                    required
                    placeholder="e.g. Engineering"
                    value={formData.name}
                    onChange={handleChange}
                />

                <div className="space-y-2">
                    {user?.role === "admin" && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Organization</label>

                            <Select value={String(formData.organizationId)} onValueChange={handleDepartmentChange}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Organization" />
                                </SelectTrigger>
                                <SelectContent>
                                    {organizations?.map((org) => (
                                        <SelectItem key={org.id} value={String(org.id)}>
                                            {org.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <Textarea
                        name="description"
                        rows={3}
                        className="w-full resize-none"
                        placeholder="Brief description of the department"
                        value={formData.description}
                        onChange={handleChange}
                    />
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                    <Button variant="ghost" type="button" onClick={onCancel}>Cancel</Button>
                    <Button variant={"ghost"} className="bg-indigo-600 text-white" type="submit" disabled={loading}>
                        {loading ? "Saving..." : "Save Department"}
                    </Button>
                </div>
            </form>
        </div>
    );
}

export function AddDesignationForm({ onCancel, onSubmit, designationEditData }: BaseFormProps) {
    const [loading, setLoading] = useState(false);
    const { createDesignation } = useGraphQLDesignationMutation();
    const { updateDesignation } = useGraphQLUpdateDesignationMutation();
    const { organizations } = useGraphQLOrganizations();
    const { user } = useStore();
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        organizationId: "",
        isActive: true
    });

    useEffect(() => {
        if (designationEditData) {
            setFormData({
                name: designationEditData.name,
                description: designationEditData.description,
                organizationId: designationEditData.organization.id,
                isActive: designationEditData.isActive
            });
        }
    }, [designationEditData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleOrgChange = (value: string) => {
        setFormData(prev => ({ ...prev, organizationId: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const organizationId =
                user?.role === "admin"
                    ? formData.organizationId
                    : (user?.organization?.id || "");

            if (designationEditData) {
                await updateDesignation({
                    ...formData,
                    id: designationEditData.id,
                    organizationId,
                });
                toast.success("Designation updated successfully");
            } else {
                await createDesignation({
                    name: formData.name,
                    description: formData.description,
                    isActive: formData.isActive,
                    organizationId,
                });
                toast.success("Designation created successfully");
            }
            await onSubmit(formData);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 animate-fadeIn mt-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Add Designation</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                    name="name"
                    label="Designation Title"
                    required
                    placeholder="e.g. Senior Developer"
                    value={formData.name}
                    onChange={handleChange}
                />

                <div className="space-y-2">
                    {user?.role === "admin" && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Organization</label>
                            <Select value={String(formData.organizationId)} onValueChange={handleOrgChange}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Organization" />
                                </SelectTrigger>
                                <SelectContent>
                                    {organizations?.map((org) => (
                                        <SelectItem key={org.id} value={String(org.id)}>
                                            {org.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <Textarea
                        name="description"
                        rows={3}
                        className="w-full resize-none"
                        placeholder="Role responsibilities and requirements"
                        value={formData.description}
                        onChange={handleChange}
                    />
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                    <Button variant="ghost" type="button" onClick={onCancel}>Cancel</Button>
                    <Button type="submit" disabled={loading}>
                        {loading ? "Saving..." : "Save Designation"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
