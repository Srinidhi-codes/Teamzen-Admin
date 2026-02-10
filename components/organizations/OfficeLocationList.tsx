"use client";

import { MapPin, Edit, Clock, Navigation, Globe, ArrowRight, Users, Loader2 } from "lucide-react";
import { OfficeLocation } from "@/lib/graphql/organization/types";
import { useGraphQLActivateOfficeLocationMutation, useGraphQLSuspendOfficeLocationMutation } from "@/lib/graphql/organization/organizationsHook";
import { Switch } from "../ui/switch";
import { toast } from "sonner";
import { useStore } from "@/lib/store/useStore";
import { useState } from "react";

interface OfficeLocationListProps {
    officeLocations: OfficeLocation[];
    onEdit: (org: OfficeLocation) => void;
}

export default function OfficeLocationList({
    officeLocations,
    onEdit,
}: OfficeLocationListProps) {
    const { user } = useStore();
    const { activateOfficeLocation } = useGraphQLActivateOfficeLocationMutation()
    const { suspendOfficeLocation } = useGraphQLSuspendOfficeLocationMutation()
    const [togglingId, setTogglingId] = useState<string | null>(null);

    const toggleStatus = async (office: OfficeLocation) => {
        setTogglingId(String(office.id));
        try {
            const action = office.isActive ? suspendOfficeLocation : activateOfficeLocation;
            await action(String(office.id));
            toast.success(`${office.isActive ? "Suspended" : "Activated"} ${office.name} successfully`);
        } catch (error: any) {
            toast.error(error.message || "Failed to update status");
        } finally {
            setTogglingId(null);
        }
    };

    const isAuthorized = user?.role === "admin" || user?.role === "hr" || user?.role === "manager";

    if (!officeLocations || officeLocations.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="w-24 h-24 bg-orange-600/10 rounded-4xl flex items-center justify-center mb-8 shadow-inner ring-8 ring-orange-500/5">
                    <MapPin className="w-10 h-10 text-orange-600 animate-pulse" />
                </div>
                <h3 className="text-premium-h2 mb-4 text-orange-600">Geospatial Void</h3>
                <p className="text-muted-foreground max-w-sm font-medium leading-relaxed italic">
                    No physical locations have been established. Deploy your first office to enable regional operations.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {officeLocations.map((office) => (
                <div key={office.id} className="group premium-card p-0 overflow-hidden hover:scale-102 flex flex-col border-border/50">
                    {/* Header Image/Background */}
                    <div className="h-28 bg-linear-to-br from-orange-500/20 via-orange-500/5 to-background relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full opacity-10">
                            <MapPin className="w-48 h-48 -rotate-12 translate-x-32 -translate-y-16 text-orange-600" />
                        </div>
                        <div className="absolute top-6 right-6">
                            <div className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl border backdrop-blur-xl shadow-lg ${office.isActive
                                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                                : "bg-destructive/10 border-destructive/20 text-destructive"
                                }`}>
                                <div className={`w-2 h-2 rounded-full ${office.isActive ? "bg-emerald-500 shadow-emerald-500/50" : "bg-destructive shadow-destructive/50"} animate-pulse shadow-sm`} />
                                <span className="text-premium-label tracking-[0.15em]">{office.isActive ? "Operational" : "Suspended"}</span>
                            </div>
                        </div>
                    </div>

                    <div className="px-8 pb-8 flex-1 flex flex-col">
                        {/* Icon & Title */}
                        <div className="-mt-12 mb-8 flex items-end justify-between relative z-10">
                            <div className="flex items-end gap-4 px-1">
                                <div className="w-20 h-20 bg-card border-4 border-background rounded-3xl flex items-center justify-center shadow-2xl group-hover:rotate-6 transition-transform duration-500">
                                    <div className="w-14 h-14 bg-orange-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-orange-500/30">
                                        <MapPin className="w-7 h-7" />
                                    </div>
                                </div>
                                <div className="mb-1">
                                    <h3 className="text-xl font-black text-foreground tracking-tight leading-none group-hover:text-orange-600 transition-colors">{office.name}</h3>
                                    <div className="flex items-center gap-2 mt-2">
                                        <Globe className="w-3.5 h-3.5 text-muted-foreground" />
                                        <p className="text-premium-label text-[9px]">{office.city}, {office.state}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="space-y-5 flex-1 p-1">
                            <div className="bg-muted/20 p-5 rounded-2xl border border-border/30 min-h-[100px] flex flex-col justify-center">
                                <label className="text-premium-label block mb-2 opacity-60">Physical address</label>
                                <p className="text-sm font-bold text-foreground/80 leading-relaxed italic line-clamp-2">
                                    "{office.address}{office.city ? `, ${office.city}` : ""}{office.zipCode ? `, ${office.zipCode}` : ""}"
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-2xl bg-orange-500/5 border border-orange-500/10">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Clock className="w-3.5 h-3.5 text-orange-600" />
                                        <span className="text-[9px] font-black text-orange-900/60 dark:text-orange-400 uppercase tracking-widest">Window</span>
                                    </div>
                                    <p className="text-premium-data opacity-90">{office.loginTime} - {office.logoutTime}</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Navigation className="w-3.5 h-3.5 text-blue-600" />
                                        <span className="text-[9px] font-black text-blue-900/60 dark:text-blue-400 uppercase tracking-widest">Zone</span>
                                    </div>
                                    <p className="text-premium-data opacity-90">{office.geoRadiusMeters}m Rad</p>
                                </div>
                            </div>
                        </div>

                        {/* Footer Controls */}
                        <div className="mt-8 pt-8 border-t border-border/40">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-orange-600" />
                                    <span className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.3em] italic">Office ID: {office.id.slice(0, 8)}</span>
                                </div>

                                {isAuthorized && (
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => onEdit(office)}
                                            className="w-11 h-11 flex items-center justify-center text-muted-foreground hover:text-orange-600 hover:bg-orange-500/5 rounded-2xl transition-all active:scale-90 border border-transparent hover:border-orange-500/20 shadow-sm hover:shadow-md"
                                        >
                                            <Edit className="w-4.5 h-4.5" />
                                        </button>
                                        <div className="px-3 h-11 flex items-center bg-muted/20 rounded-2xl border border-border/50">
                                            {togglingId === String(office.id) ? (
                                                <Loader2 className="w-4 h-4 animate-spin text-orange-600" />
                                            ) : (
                                                <Switch
                                                    checked={office.isActive}
                                                    onCheckedChange={() => toggleStatus(office)}
                                                    className="data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-destructive"
                                                />
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button
                                className="w-full py-4.5 px-6 bg-orange-600 text-white font-black text-[11px] uppercase tracking-[0.25em] rounded-2xl shadow-2xl shadow-orange-500/20 hover:opacity-95 hover:-translate-y-1 transition-all active:scale-95 flex items-center justify-center gap-3 group/btn"
                            >
                                <MapPin className="w-4.5 h-4.5" />
                                <span>View Location Details</span>
                                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1.5 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
