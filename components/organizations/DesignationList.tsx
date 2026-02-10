"use client";

import { Designation } from "@/lib/graphql/organization/types";
import { Briefcase, Users, Building2, ArrowRight, Loader2, Edit } from "lucide-react";
import { Switch } from "../ui/switch";
import { toast } from "sonner";
import {
    useGraphQLActivateDesignationMutation,
    useGraphQLSuspendDesignationMutation,
} from "@/lib/graphql/organization/organizationsHook";
import { useStore } from "@/lib/store/useStore";
import { useState } from "react";

interface DesignationListProps {
    designations: Designation[];
    onEdit: (designation: Designation) => void;
}

export default function DesignationList({ designations, onEdit }: DesignationListProps) {
    const { user } = useStore();
    const { activateDesignation } = useGraphQLActivateDesignationMutation();
    const { suspendDesignation } = useGraphQLSuspendDesignationMutation();
    const [togglingId, setTogglingId] = useState<string | null>(null);

    const toggleStatus = async (designation: Designation) => {
        setTogglingId(String(designation.id));
        try {
            const action = designation.isActive ? suspendDesignation : activateDesignation;
            await action(String(designation.id));
            toast.success(`${designation.isActive ? "Suspended" : "Activated"} ${designation.name} successfully`);
        } catch (error: any) {
            toast.error(error.message || "Failed to update status");
        } finally {
            setTogglingId(null);
        }
    };

    const isAuthorized = user?.role === "admin" || user?.role === "hr" || user?.role === "manager";

    if (!designations || designations.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="w-24 h-24 bg-purple-600/10 rounded-4xl flex items-center justify-center mb-8 shadow-inner ring-8 ring-purple-500/5">
                    <Briefcase className="w-10 h-10 text-purple-600 animate-pulse" />
                </div>
                <h3 className="text-premium-h2 mb-4 text-purple-600">Classification Void</h3>
                <p className="text-muted-foreground max-w-sm font-medium leading-relaxed italic">
                    The professional hierarchy is undefined. Create your first designation to classify and structure your workforce.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {designations.map((designation) => (
                <div key={designation.id} className="group premium-card p-0 overflow-hidden hover:scale-102 flex flex-col border-border/50">
                    {/* Header Image/Background */}
                    <div className="h-28 bg-linear-to-br from-purple-500/20 via-purple-500/5 to-background relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full opacity-10">
                            <Briefcase className="w-48 h-48 -rotate-12 translate-x-32 -translate-y-16 text-purple-600" />
                        </div>
                        <div className="absolute top-6 right-6">
                            <div className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl border backdrop-blur-xl shadow-lg ${designation.isActive
                                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                                : "bg-destructive/10 border-destructive/20 text-destructive"
                                }`}>
                                <div className={`w-2 h-2 rounded-full ${designation.isActive ? "bg-emerald-500 shadow-emerald-500/50" : "bg-destructive shadow-destructive/50"} animate-pulse shadow-sm`} />
                                <span className="text-premium-label tracking-[0.15em]">{designation.isActive ? "Operational" : "Suspended"}</span>
                            </div>
                        </div>
                    </div>

                    <div className="px-8 pb-8 flex-1 flex flex-col">
                        {/* Icon & Title */}
                        <div className="-mt-12 mb-8 flex items-end justify-between relative z-10">
                            <div className="flex items-end gap-4 px-1">
                                <div className="w-20 h-20 bg-card border-4 border-background rounded-3xl flex items-center justify-center shadow-2xl group-hover:rotate-6 transition-transform duration-500">
                                    <div className="w-14 h-14 bg-purple-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-purple-500/30">
                                        <Briefcase className="w-7 h-7" />
                                    </div>
                                </div>
                                <div className="mb-1">
                                    <h3 className="text-xl font-black text-foreground tracking-tight leading-none group-hover:text-purple-600 transition-colors uppercase truncate max-w-[180px]">{designation.name}</h3>
                                    <div className="flex items-center gap-2 mt-2">
                                        <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                                        <p className="text-premium-label text-[9px] truncate max-w-[150px]">{designation.organization?.name || "Corporate Hierarchy"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="space-y-5 flex-1 p-1">
                            <div className="bg-muted/20 p-5 rounded-2xl border border-border/30 min-h-[100px] flex flex-col justify-center">
                                <label className="text-premium-label block mb-2 opacity-60">Classification Scope</label>
                                <p className="text-sm font-bold text-foreground/80 leading-relaxed italic line-clamp-2">
                                    {designation.description ? `"${designation.description}"` : "Professional role defining specific responsibilities and hierarchical standing."}
                                </p>
                            </div>
                        </div>

                        {/* Footer Controls */}
                        <div className="mt-8 pt-8 border-t border-border/40">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-purple-600" />
                                    <span className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.3em] italic">Role ID: {designation.id.slice(0, 8)}</span>
                                </div>

                                {isAuthorized && (
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => onEdit(designation)}
                                            className="w-11 h-11 flex items-center justify-center text-muted-foreground hover:text-purple-600 hover:bg-purple-500/5 rounded-2xl transition-all active:scale-90 border border-transparent hover:border-purple-500/20 shadow-sm hover:shadow-md"
                                        >
                                            <Edit className="w-4.5 h-4.5" />
                                        </button>
                                        <div className="px-3 h-11 flex items-center bg-muted/20 rounded-2xl border border-border/50">
                                            {togglingId === String(designation.id) ? (
                                                <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                                            ) : (
                                                <Switch
                                                    checked={designation.isActive}
                                                    onCheckedChange={() => toggleStatus(designation)}
                                                    className="data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-destructive"
                                                />
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button
                                className="w-full py-4.5 px-6 bg-purple-600 text-white font-black text-[11px] uppercase tracking-[0.25em] rounded-2xl shadow-2xl shadow-purple-500/20 hover:opacity-95 hover:-translate-y-1 transition-all active:scale-95 flex items-center justify-center gap-3 group/btn"
                            >
                                <Briefcase className="w-4.5 h-4.5" />
                                <span>Navigate to Workforce</span>
                                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1.5 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
