"use client";

import { useState, useEffect } from "react";
import { Building } from "lucide-react";

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
        <div className="bg-card rounded-[2.5rem] shadow-2xl border border-border p-8 animate-fadeIn max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-8 pb-6 border-b border-border/50">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                        <Building className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-foreground tracking-tight">{orgEditData ? "Refine Entity" : "Initialize Entity"}</h2>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-0.5">Core Configuration</p>
                    </div>
                </div>
                <button
                    onClick={onCancel}
                    className="p-3 bg-muted rounded-2xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all active:scale-90"
                >
                    ✕
                </button>
            </div>


            <form id="create-org-form" className="space-y-6" onSubmit={handleSubmit}>
                <div className="w-24 h-24 bg-linear-to-br from-primary to-primary/60 rounded-4xl flex items-center justify-center text-primary-foreground text-4xl font-black shadow-2xl shadow-primary/20 overflow-hidden ring-4 ring-background mb-8 group-hover:scale-105 transition-transform mx-auto">

                    {formData.logo ? (
                        <Image
                            width={100}
                            height={100}
                            src={formData.logo}
                            alt="Profile"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <span>
                            {formData.name ? formData.name.charAt(0).toUpperCase() : "E"}
                        </span>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormInput
                            label="GST Number"
                            name="gstNumber"
                            placeholder="Fiscal ID (GST)"
                            value={formData.gstNumber}
                            onChange={handleChange}
                        />
                        <FormInput
                            label="PAN Number"
                            name="panNumber"
                            placeholder="Tax ID (PAN)"
                            value={formData.panNumber}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">
                            Operational Headquarters
                        </label>
                        <Textarea
                            name="headquartersAddress"
                            rows={3}
                            required
                            className="bg-background border border-border rounded-3xl p-6 text-sm font-medium text-foreground focus:ring-2 focus:ring-primary/20 transition-all outline-none placeholder:text-muted-foreground resize-none w-full"
                            placeholder="Specify full physical location..."
                            value={formData.headquartersAddress}
                            onChange={handleChange}
                        />
                    </div>
                </div>


                <div className="flex justify-end gap-3 pt-8 mt-4 border-t border-border/50">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-8 py-4 text-muted-foreground hover:text-foreground text-[11px] font-black uppercase tracking-widest transition-all active:scale-95"
                        disabled={isCreatingOrganizationLoading}
                    >
                        Dismiss
                    </button>
                    <button
                        type="submit"
                        className="px-10 py-4 bg-primary text-primary-foreground rounded-2xl text-[11px] font-black uppercase tracking-widest hover:opacity-90 transition-all active:scale-95 shadow-xl shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-50"
                        disabled={isCreatingOrganizationLoading}
                    >
                        {isCreatingOrganizationLoading || isUpdatingOrganizationLoading ? (
                            <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        ) : (
                            orgEditData ? "Scale Entity" : "Initialize Entity"
                        )}
                    </button>
                </div>

            </form>
        </div>
    );
}
