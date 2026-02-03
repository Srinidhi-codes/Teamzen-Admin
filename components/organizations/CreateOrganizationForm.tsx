"use client";

import { useState, useEffect } from "react";
import { FormInput } from "../common/FormInput";
import { useGraphQLOrganizationMutation, useGraphQLUpdateOrganizationMutation } from "@/lib/graphql/organization/organizationsHook";
import Image from "next/image";
import { toast } from "sonner";
import { Textarea } from "../ui/textarea";

interface CreateOrganizationFormProps {
    orgEditData?: any;
    onCancel: () => void;
    onSubmit: (data: any) => Promise<void>;
}

export default function CreateOrganizationForm({
    orgEditData,
    onCancel,
    onSubmit,
}: CreateOrganizationFormProps) {
    const [formData, setFormData] = useState({
        name: "",
        gstNumber: "",
        panNumber: "",
        headquartersAddress: "",
        logo: null as string | null,
        registrationNumber: "",
        isActive: true,
    });

    useEffect(() => {
        if (orgEditData) {
            setFormData({
                name: orgEditData.name || "",
                gstNumber: orgEditData.gstNumber || "",
                panNumber: orgEditData.panNumber || "",
                headquartersAddress: orgEditData.headquartersAddress || orgEditData.description || "",
                logo: orgEditData.logo?.url || null,
                registrationNumber: orgEditData.registrationNumber || "",
                isActive: orgEditData.isActive ?? true,
            })
        }
    }, [orgEditData])

    const { createOrganization, isCreatingOrganizationLoading, isCreatingOrganizationError } = useGraphQLOrganizationMutation();
    const { updateOrganization, isUpdatingOrganizationLoading, isUpdatingOrganizationError } = useGraphQLUpdateOrganizationMutation();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (orgEditData) {
                await updateOrganization({
                    ...formData,
                    id: orgEditData.id,
                    logo: formData.logo || "" // backend expects string
                });
                toast.success("Organization updated successfully");
            } else {
                await createOrganization({
                    ...formData,
                    logo: formData.logo || ""
                });
                toast.success("Organization created successfully");
            }

            // Reset form
            setFormData({
                name: "",
                gstNumber: "",
                panNumber: "",
                headquartersAddress: "",
                logo: null,
                registrationNumber: "",
                isActive: true,
            });

            // Notify parent to close
            onSubmit(formData);
        } catch (error) {
            // Error is handled by the hook's onError
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 animate-fadeIn">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Create New Organization</h2>
                <button
                    onClick={onCancel}
                    className="text-gray-400 hover:text-gray-500"
                >
                    ✕
                </button>
            </div>

            <form id="create-org-form" className="space-y-6" onSubmit={handleSubmit}>
                <div className="w-22 h-22 bg-linear-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center text-white text-5xl font-bold shadow-2xl overflow-hidden">
                    {formData.logo ? (
                        <Image
                            width={100}
                            height={100}
                            src={formData.logo}
                            alt="Profile"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <>
                            {formData.name ? formData.name.charAt(0).toUpperCase() : "N/A"}
                        </>
                    )}
                </div>
                <div className="space-y-5">
                    <FormInput
                        label="Organization Name"
                        name="name"
                        required
                        placeholder="e.g. Acme Corp"
                        value={formData.name}
                        onChange={handleChange}
                    />

                    {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <FormInput
                            label="City"
                            name="city"
                            placeholder="City"
                            value={formData.city}
                            onChange={handleChange}
                        />
                        <FormInput
                            label="State"
                            name="state"
                            placeholder="State"
                            value={formData.state}
                            onChange={handleChange}
                        />
                        <FormInput
                            label="Country"
                            name="country"
                            placeholder="Country"
                            onChange={handleChange}
                            value={formData.country}
                        />
                    </div> */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {/* <FormInput
                            label="Zip Code"
                            name="zipCode"
                            placeholder="zip code"
                            value={formData.zipCode}
                            onChange={handleChange}
                        /> */}
                        <FormInput
                            label="GST Number"
                            name="gstNumber"
                            placeholder="GST Number"
                            value={formData.gstNumber}
                            onChange={handleChange}
                        />
                        <FormInput
                            label="PAN Number"
                            name="panNumber"
                            placeholder="PAN Number"
                            value={formData.panNumber}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Headquarters Address
                        </label>
                        <Textarea
                            name="headquartersAddress"
                            rows={3}
                            required
                            placeholder="Enter full address"
                            value={formData.headquartersAddress}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="btn-secondary"
                        disabled={isCreatingOrganizationLoading}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="btn-primary min-w-[140px]"
                        disabled={isCreatingOrganizationLoading}
                    >
                        {isCreatingOrganizationLoading ? "Saving..." : "Save Organization"}
                    </button>
                </div>
            </form>
        </div>
    );
}
