"use client";

import { useState, useEffect } from "react";
import { Building } from "lucide-react";
import { useGraphQLOrganizationMutation, useGraphQLUpdateOrganizationMutation } from "@/lib/graphql/organization/organizationsHook";
import { toast } from "sonner";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Input } from "../common/Input";
import { Camera, Loader2 } from "lucide-react";
import api from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";

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
    const [isUploading, setIsUploading] = useState(false);
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
                // Clean up logo URL if it's an absolute URL from the backend
                let cleanedLogo = formData.logo || "";
                if (cleanedLogo.includes('/media/')) {
                    cleanedLogo = cleanedLogo.split('/media/')[1];
                }

                await updateOrganization({
                    ...formData,
                    id: orgEditData.id,
                    logo: cleanedLogo
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

    const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !orgEditData) return;

        if (!file.type.startsWith('image/')) {
            toast.error("Please upload an image file.");
            return;
        }

        setIsUploading(true);
        const data = new FormData();
        data.append('logo', file);

        try {
            const response = await api.patch(`${API_ENDPOINTS.ORGANIZATIONS}${orgEditData.id}/`, data);
            if (response.data) {
                setFormData(prev => ({ ...prev, logo: response.data.logo }));
                toast.success("Logo updated successfully");
            }
        } catch (error: any) {
            toast.error("Failed to upload logo");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <form id="create-org-form" className="space-y-8" onSubmit={handleSubmit}>
            <div className="relative group/logo mx-auto w-fit">
                <div 
                    onClick={() => orgEditData && document.getElementById('logo-upload')?.click()}
                    className={`w-28 h-28 bg-linear-to-br from-primary to-primary/60 rounded-4xl flex items-center justify-center text-primary-foreground text-4xl font-black shadow-2xl shadow-primary/20 overflow-hidden ring-8 ring-background mb-10 group-hover:scale-105 transition-transform ${orgEditData ? 'cursor-pointer' : ''}`}
                >
                    {formData.logo ? (
                        <img
                            src={formData.logo}
                            alt="Profile"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <span>
                            {formData.name ? formData.name.charAt(0).toUpperCase() : "E"}
                        </span>
                    )}
                    
                    {orgEditData && (
                        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white opacity-0 group-hover/logo:opacity-100 transition-opacity">
                            {isUploading ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                                <>
                                    <Camera className="w-6 h-6 mb-1" />
                                    <span className="text-[8px] font-black uppercase tracking-tighter">Change</span>
                                </>
                            )}
                        </div>
                    )}
                </div>
                <input
                    id="logo-upload"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleLogoChange}
                    disabled={isUploading}
                />
            </div>

            <div className="space-y-6">
                <Input
                    label="Organization Name"
                    name="name"
                    required
                    placeholder="e.g. Acme Corp"
                    value={formData.name}
                    onChange={handleChange}
                    maxLength={255}
                    hint={`${formData.name.length}/255 characters`}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                        label="Fiscal identifier (GST)"
                        name="gstNumber"
                        placeholder="GST Number"
                        value={formData.gstNumber}
                        onChange={handleChange}
                        maxLength={50}
                        hint={`${formData.gstNumber.length}/50`}
                    />
                    <Input
                        label="Financial Identifier (PAN)"
                        name="panNumber"
                        placeholder="PAN Number"
                        value={formData.panNumber}
                        onChange={handleChange}
                        maxLength={50}
                        hint={`${formData.panNumber.length}/50`}
                    />
                </div>

                <Input
                    label="Registration Number"
                    name="registrationNumber"
                    placeholder="Official Registration ID"
                    value={formData.registrationNumber}
                    onChange={handleChange}
                    maxLength={100}
                    hint={`${formData.registrationNumber.length}/100`}
                />

                <div className="space-y-3">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">
                        Operational Headquarters
                    </label>
                    <Textarea
                        name="headquartersAddress"
                        rows={3}
                        required
                        className="bg-background border border-border rounded-3xl p-6 text-sm font-medium text-foreground focus:ring-2 focus:ring-primary/20 transition-all outline-none placeholder:text-muted-foreground resize-none w-full shadow-inner"
                        placeholder="Specify full physical location..."
                        value={formData.headquartersAddress}
                        onChange={handleChange}
                    />
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-8 mt-4 border-t border-border/50">
                <Button
                    variant="outline"
                    type="button"
                    onClick={onCancel}
                    className="px-8 h-12"
                    disabled={isCreatingOrganizationLoading}
                >
                    Dismiss
                </Button>
                <Button
                    type="submit"
                    className="px-10 h-12 min-w-[160px]"
                    disabled={isCreatingOrganizationLoading || isUpdatingOrganizationLoading}
                >
                    {isCreatingOrganizationLoading || isUpdatingOrganizationLoading ? (
                        <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    ) : (
                        orgEditData ? "Update Entity" : "Scale Entity"
                    )}
                </Button>
            </div>
        </form>
    );
}
