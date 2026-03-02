"use client";

import { useGraphQLOrganization, useGraphQLUpdateOrganizationMutation } from "@/lib/graphql/organization/organizationsHook";
import { Building2, Mail, MapPin, Hash, FileText, CreditCard, Calendar, Users, Edit3, Save, X, ArrowLeft, Loader2, Camera } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Input } from "../common/Input";
import { useStore } from "@/lib/store/useStore";
import api from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import moment from "moment";

interface OrganizationProfileProps {
    id: string;
}

export default function OrganizationProfile({ id }: OrganizationProfileProps) {
    const router = useRouter();
    const { user } = useStore();
    const { organization, isOrganizationLoading, isOrganizationError, refetchOrganization } = useGraphQLOrganization(id);
    const { updateOrganization, isUpdatingOrganizationLoading } = useGraphQLUpdateOrganizationMutation();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<any>({
        name: "",
        gstNumber: "",
        panNumber: "",
        registrationNumber: "",
        headquartersAddress: "",
        logo: ""
    });
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);

    // Initialize form data when entering edit mode
    const handleStartEdit = () => {
        if (!organization) return;
        setFormData({
            id: organization.id,
            name: organization.name,
            gstNumber: organization.gstNumber || "",
            panNumber: organization.panNumber || "",
            registrationNumber: organization.registrationNumber || "",
            headquartersAddress: organization.headquartersAddress || "",
            isActive: organization.isActive,
            logo: organization.logo?.url || ""
        });
        setIsEditing(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setFormData({
            name: "",
            gstNumber: "",
            panNumber: "",
            registrationNumber: "",
            headquartersAddress: "",
            logo: ""
        });
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await updateOrganization(formData);
            toast.success("Organization profile captured and synchronized.");
            await refetchOrganization();
            setIsEditing(false);
        } catch (error: any) {
            toast.error(error.message || "Failed to finalize profile updates.");
        }
    };

    const handleLogoClick = () => {
        if (isEditing) {
            fileInputRef.current?.click();
        }
    };

    const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validation
        if (!file.type.startsWith('image/')) {
            toast.error("Please upload an image file.");
            return;
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            toast.error("Image size should be less than 5MB.");
            return;
        }

        setIsUploading(true);
        const data = new FormData();
        data.append('logo', file);

        try {
            const response = await api.patch(`${API_ENDPOINTS.ORGANIZATIONS}${id}/`, data);

            if (response.data) {
                toast.success("Digital identity asset (logo) updated successfully.");
                await refetchOrganization();
                // Update local state if needed, though refetch handles it
                setFormData({ ...formData, logo: response.data.logo });
            }
        } catch (error: any) {
            console.error("Logo upload failed:", error);
            let errorMsg = "Failed to synchronize digital identity asset.";
            if (error.response?.data) {
                const data = error.response.data;
                const firstKey = Object.keys(data)[0];
                if (firstKey) {
                    const firstErr = data[firstKey];
                    errorMsg += ` ${firstKey}: ${Array.isArray(firstErr) ? firstErr[0] : firstErr}`;
                }
            }
            toast.error(errorMsg);
        } finally {
            setIsUploading(false);
        }
    };

    if (isOrganizationLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 space-y-4">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-muted-foreground animate-pulse font-medium">Retrieving Core Entity Profile...</p>
            </div>
        );
    }

    if (isOrganizationError) {
        return (
            <div className="flex flex-col items-center justify-center p-20 space-y-6">
                <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center text-destructive">
                    <X className="w-8 h-8" />
                </div>
                <div className="text-center">
                    <h3 className="text-xl font-bold text-foreground mb-2">Nexus Connectivity Error</h3>
                    <p className="text-muted-foreground max-w-sm mx-auto">{isOrganizationError.message}</p>
                </div>
                <Button onClick={() => refetchOrganization()} variant="outline" className="rounded-2xl">
                    Retry Synchronization
                </Button>
            </div>
        );
    }

    if (!organization) return (
        <div className="flex flex-col items-center justify-center p-20 text-center">
            <p className="text-muted-foreground italic font-medium">Entity not found in the organizational registry.</p>
            <Button onClick={() => router.back()} variant="link" className="mt-4">Return to Ecosystem</Button>
        </div>
    );

    if (!user) return (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-muted-foreground animate-pulse font-medium">Synchronizing Ecosystem Data...</p>
        </div>
    );

    const isAuthorized = user.role === "admin" || user.role === "superadmin";

    if (!isAuthorized) {
        return (
            <div className="flex flex-col items-center justify-center p-20 space-y-4 bg-card rounded-4xl border border-border shadow-2xl">
                <div className="text-7xl mb-6">🚫</div>
                <h3 className="text-2xl font-black text-foreground tracking-tight mb-2">Access Restricted</h3>
                <p className="text-muted-foreground font-medium max-w-sm mx-auto">This terminal is reserved for administrative architects only.</p>
                <div className="mt-8">
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:scale-105 transition-all"
                    >
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    const isAdmin = isAuthorized;

    return (
        <div className="max-w-6xl mx-auto space-y-10 animate-fade-in pb-20">
            {/* Header / Navigation */}
            <div className="flex items-center justify-between gap-4">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-bold text-xs uppercase tracking-widest group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Return to Ecosystem
                </button>

                {isAdmin && !isEditing && (
                    <Button
                        onClick={handleStartEdit}
                        className="rounded-2xl h-11 px-6 shadow-lg shadow-primary/20 group"
                    >
                        <Edit3 className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" />
                        Refine Profile
                    </Button>
                )}
            </div>

            {/* Main Profile Card */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Left Column: Identity Card */}
                <div className="lg:col-span-1 space-y-10">
                    <div className="premium-card p-0 overflow-hidden group">
                        <div className="h-32 bg-linear-to-br from-primary/20 via-primary/5 to-background relative overflow-hidden">
                            <div className="absolute inset-0 opacity-10">
                                <Building2 className="w-64 h-64 -rotate-12 translate-x-32 -translate-y-16 text-primary" />
                            </div>
                        </div>

                        <div className="px-10 pb-10 text-center relative">
                            <div className="-mt-16 mb-8 mx-auto relative inline-block">
                                <div
                                    onClick={handleLogoClick}
                                    className={`w-32 h-32 bg-card border-8 border-background rounded-4xl flex items-center justify-center shadow-2xl transition-all duration-700 relative overflow-hidden group/logo ${isEditing ? 'cursor-pointer hover:border-primary/30' : ''}`}
                                >
                                    {organization.logo?.url ? (
                                        <img src={organization.logo.url} alt={organization.name} className="w-20 h-20 object-contain group-hover/logo:scale-110 transition-transform" />
                                    ) : (
                                        <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center">
                                            <Building2 className="w-10 h-10 text-primary" />
                                        </div>
                                    )}

                                    {isEditing && (
                                        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white opacity-0 group-hover/logo:opacity-100 transition-opacity">
                                            {isUploading ? (
                                                <Loader2 className="w-6 h-6 animate-spin" />
                                            ) : (
                                                <>
                                                    <Camera className="w-6 h-6 mb-1" />
                                                    <span className="text-[8px] font-black uppercase tracking-tighter">Upload</span>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleLogoChange}
                                    className="hidden"
                                    accept="image/*"
                                />
                                <div className={`absolute bottom-2 right-2 w-8 h-8 rounded-2xl border-4 border-background shadow-lg flex items-center justify-center ${organization.isActive ? 'bg-emerald-500' : 'bg-destructive'}`}>
                                    <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                </div>
                            </div>

                            <h1 className="text-2xl font-black text-foreground tracking-tight mb-2 uppercase">{organization.name}</h1>
                            <p className="text-premium-label text-[9px] mb-8">Ref: {organization.id}</p>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-muted/30 p-4 rounded-3xl border border-border/40">
                                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Workforce</p>
                                    <p className="text-xl font-black text-primary">{organization.employeeCount || 0}</p>
                                </div>
                                <div className="bg-muted/30 p-4 rounded-3xl border border-border/40">
                                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Operational</p>
                                    <p className="text-xl font-black text-primary">Est. {moment(organization.createdAt).format('YYYY')}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="premium-card space-y-6">
                        <h3 className="text-premium-label italic">Organization Status</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">Organization Since</span>
                                <span className="text-xs font-bold text-foreground">{moment(organization.createdAt).format('DD MMM YYYY')}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">Last Synchronization</span>
                                <span className="text-xs font-bold text-foreground">{moment(organization.updatedAt).format('DD MMM YYYY')}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Details & Forms */}
                <div className="lg:col-span-2">
                    {isEditing ? (
                        <div className="premium-card animate-in slide-in-from-right-10 duration-500">
                            <div className="flex items-center justify-between mb-10 pb-6 border-b border-border/40">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                        <Edit3 className="w-5 h-5" />
                                    </div>
                                    <h2 className="text-2xl font-black text-foreground tracking-tight">Configuration Mode</h2>
                                </div>
                                <button onClick={handleCancel} className="text-muted-foreground hover:text-destructive transition-colors">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleSave} className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <Input
                                        label="Organization Name"
                                        placeholder="Enter legal name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="h-14"
                                    />
                                    <Input
                                        label="Registration Number"
                                        placeholder="Reg Number"
                                        value={formData.registrationNumber}
                                        onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                                        className="h-14"
                                    />
                                    <Input
                                        label="GST Number"
                                        placeholder="GST Number"
                                        value={formData.gstNumber}
                                        onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                                        className="h-14"
                                    />
                                    <Input
                                        label="PAN Number"
                                        placeholder="PAN Number"
                                        value={formData.panNumber}
                                        onChange={(e) => setFormData({ ...formData, panNumber: e.target.value })}
                                        className="h-14"
                                    />
                                    <div className="md:col-span-2">
                                        <Input
                                            label="Headquarters"
                                            placeholder="Physical Address"
                                            value={formData.headquartersAddress}
                                            onChange={(e) => setFormData({ ...formData, headquartersAddress: e.target.value })}
                                            className="h-14"
                                        />
                                    </div>
                                </div>

                                <div className="pt-10 flex gap-4 justify-end border-t border-border/40">
                                    <Button type="button" variant="outline" onClick={handleCancel} className="h-12 px-10 rounded-2xl">
                                        Cancel
                                    </Button>
                                    <Button disabled={isUpdatingOrganizationLoading} className="h-12 px-10 rounded-2xl shadow-xl shadow-primary/30">
                                        {isUpdatingOrganizationLoading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Synchronizing...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4 mr-2" />
                                                Save Changes
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    ) : (
                        <div className="space-y-10">
                            {/* HQ Card */}
                            <div className="premium-card">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-inner">
                                        <MapPin className="w-6 h-6" />
                                    </div>
                                    <h2 className="text-2xl font-black text-foreground tracking-tight">Geographic Hub</h2>
                                </div>
                                <div className="bg-muted/20 p-8 rounded-4xl border border-border/40 italic text-lg leading-relaxed text-foreground font-medium">
                                    "{organization.headquartersAddress || "Centralized command coordinates not established."}"
                                </div>
                            </div>

                            {/* Credentials Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <DataBox icon={Hash} label="Licence" value={organization.registrationNumber} color="primary" />
                                <DataBox icon={FileText} label="GST Number" value={organization.gstNumber} color="blue" />
                                <DataBox icon={CreditCard} label="PAN Number" value={organization.panNumber} color="emerald" />
                            </div>

                            {/* Navigation Shortcuts */}
                            <div className="premium-card bg-linear-to-r from-primary/5 to-transparent">
                                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                                    <div>
                                        <h3 className="text-xl font-black tracking-tight mb-2">Workforce Integration</h3>
                                        <p className="text-sm text-muted-foreground font-medium">Coordinate the {organization.employeeCount || 0} active members of this organization.</p>
                                    </div>
                                    <Button onClick={() => router.push('/employees')} className="h-12 px-8 rounded-2xl shadow-lg shadow-primary/20 shrink-0">
                                        Open Directory
                                        <ArrowLeft className="w-4 h-4 ml-3 rotate-180" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function DataBox({ icon: Icon, label, value, color }: { icon: any; label: string; value: string | undefined; color: string }) {
    const colors: any = {
        primary: "bg-primary/10 text-primary border-primary/20 shadow-primary/5",
        blue: "bg-blue-500/10 text-blue-600 border-blue-500/20 shadow-blue-500/5",
        emerald: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 shadow-emerald-500/5"
    };

    return (
        <div className={`premium-card p-6 border ${colors[color]} hover:-translate-y-1 transition-all duration-300`}>
            <div className="flex items-center gap-3 mb-4">
                <Icon className="w-4 h-4 opacity-70" />
                <span className="text-[9px] font-black uppercase tracking-widest opacity-70">{label}</span>
            </div>
            <p className="text-lg font-black tracking-tight text-foreground truncate">{value || "N/A"}</p>
        </div>
    );
}
