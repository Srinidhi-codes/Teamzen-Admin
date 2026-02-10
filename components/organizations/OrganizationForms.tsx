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
    const { updateOfficeLocation, isUpdatingOfficeLocationLoading } = useGraphQLUpdateOfficeLocationMutation();
    const { createOfficeLocation, isCreatingOfficeLocationLoading } = useGraphQLCreateOfficeLocationMutation();
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
        geoRadiusMeters: 100,
        country: "",
        isActive: true,
        organizationId: officeLocationEditData.organizationId || officeLocationEditData.organization?.id || "",
    });

    const { organizations } = useGraphQLOrganizations();
    const { user } = useStore();

    useEffect(() => {
        if (officeLocationEditData) {
            setFormData({
                name: officeLocationEditData.name || "",
                loginTime: officeLocationEditData.loginTime || "",
                logoutTime: officeLocationEditData.logoutTime || "",
                latitude: String(officeLocationEditData.latitude || ""),
                longitude: String(officeLocationEditData.longitude || ""),
                address: officeLocationEditData.address || "",
                state: officeLocationEditData.state || "",
                city: officeLocationEditData.city || "",
                zipCode: officeLocationEditData.zipCode || "",
                geoRadiusMeters: officeLocationEditData.geoRadiusMeters || 100,
                country: officeLocationEditData.country || "",
                isActive: officeLocationEditData.isActive ?? true,
                organizationId: officeLocationEditData.organizationId || officeLocationEditData.organization?.id || "",
            })
        }
    }, [officeLocationEditData])

    const handleOrgChange = (value: string) => {
        setFormData(prev => ({ ...prev, organizationId: value }));
    };


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) || 0 : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const organizationId =
                user?.role === "admin"
                    ? formData.organizationId
                    : (user?.organization?.id || "");

            // Ensure data types are correct for the GraphQL input
            const payload = {
                ...formData,
                latitude: String(formData.latitude),
                longitude: String(formData.longitude),
                geoRadiusMeters: Math.round(Number(formData.geoRadiusMeters)),
                organizationId: organizationId || formData.organizationId
            };

            if (officeLocationEditData) {
                await updateOfficeLocation({
                    ...payload,
                    id: officeLocationEditData.id,
                });
                toast.success("Office location updated successfully");
            } else {
                await createOfficeLocation(payload);
                toast.success("Office location created successfully");
            }

            await onSubmit(formData);

            // Cleanup state after successful submission
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
                geoRadiusMeters: 100,
                country: "",
                isActive: true,
                organizationId: "",
            });
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Failed to process office location request");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Input name="name" label="Name" value={formData?.name} onChange={handleChange} required placeholder="e.g. Headquarters" />

            <div className="space-y-4">
                {user?.role === "admin" && (
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Organization</label>

                        <Select value={String(formData.organizationId)} onValueChange={handleOrgChange}>
                            <SelectTrigger className="h-11 rounded-xl">
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
                <Input name="latitude" label="Latitude" type="number" step="any" value={formData?.latitude} onChange={handleChange} placeholder="0.000000" />
                <Input name="longitude" label="Longitude" type="number" step="any" value={formData?.longitude} onChange={handleChange} placeholder="0.000000" />
                <Input name="geoRadiusMeters" label="Geo Radius Meters" type="number" value={formData?.geoRadiusMeters} onChange={handleChange} />
            </div>

            <div className="flex justify-end gap-3 pt-8 mt-4 border-t border-border/50">
                <Button variant={"outline"} type="button" className="px-8 h-11 rounded-xl" onClick={onCancel}>Cancel</Button>
                <Button variant={"default"} type="submit" className="px-8 h-11 rounded-xl min-w-[140px]" disabled={loading || isCreatingOfficeLocationLoading || isUpdatingOfficeLocationLoading}>
                    {loading ? "Processing..." : officeLocationEditData ? "Refine Location" : "Deploy Location"}
                </Button>
            </div>
        </form>
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
                name: departmentEditData.name || "",
                description: departmentEditData.description || "",
                organizationId: String(departmentEditData.organizationId || departmentEditData.organization?.id || ""),
                isActive: departmentEditData.isActive ?? true
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

            const payload = {
                ...formData,
                organizationId: organizationId || formData.organizationId
            };

            if (departmentEditData) {
                await updateDepartment({
                    ...payload,
                    id: departmentEditData.id,
                });
                toast.success("Department optimized successfully");
            } else {
                await createDepartment(payload);
                toast.success("Business unit established successfully");
            }
            await onSubmit(formData);
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Failed to architect business unit");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Input
                name="name"
                label="Department Name"
                required
                placeholder="e.g. Engineering"
                value={formData.name}
                onChange={handleChange}
            />

            <div className="space-y-4">
                {user?.role === "admin" && (
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Organization</label>

                        <Select value={String(formData.organizationId)} onValueChange={handleDepartmentChange}>
                            <SelectTrigger className="h-11 rounded-xl">
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

            <div className="flex justify-end gap-3 pt-8 mt-4 border-t border-border/50">
                <Button variant="outline" type="button" className="px-8 h-11 rounded-xl" onClick={onCancel}>Cancel</Button>
                <Button variant="default" className="px-8 h-11 rounded-xl min-w-[140px]" type="submit" disabled={loading}>
                    {loading ? "Processing..." : departmentEditData ? "Update Unit" : "Save Unit"}
                </Button>
            </div>
        </form>
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
                name: designationEditData.name || "",
                description: designationEditData.description || "",
                organizationId: String(designationEditData.organizationId || designationEditData.organization?.id || ""),
                isActive: designationEditData.isActive ?? true
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

            const payload = {
                ...formData,
                organizationId: organizationId || formData.organizationId
            };

            if (designationEditData) {
                await updateDesignation({
                    ...payload,
                    id: designationEditData.id,
                });
                toast.success("Designation refined successfully");
            } else {
                await createDesignation(payload);
                toast.success("Professional role classified successfully");
            }
            await onSubmit(formData);
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Failed to classify professional role");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Input
                name="name"
                label="Designation Title"
                required
                placeholder="e.g. Senior Developer"
                value={formData.name}
                onChange={handleChange}
            />

            <div className="space-y-4">
                {user?.role === "admin" && (
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Organization</label>
                        <Select value={String(formData.organizationId)} onValueChange={handleOrgChange}>
                            <SelectTrigger className="h-11 rounded-xl">
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

            <div className="flex justify-end gap-3 pt-8 mt-4 border-t border-border/50">
                <Button variant="outline" type="button" className="px-8 h-11 rounded-xl" onClick={onCancel}>Cancel</Button>
                <Button variant="default" className="px-8 h-11 rounded-xl min-w-[140px]" type="submit" disabled={loading}>
                    {loading ? "Processing..." : designationEditData ? "Update Designation" : "Save Designation"}
                </Button>
            </div>
        </form>
    );
}
