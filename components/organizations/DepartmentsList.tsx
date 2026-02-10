"use client";

import { Department } from "@/lib/graphql/organization/types";
import { edit, Users, Layers, Building2, ArrowRight, Loader2, Edit } from "lucide-react";
import { Switch } from "../ui/switch";
import { toast } from "sonner";
import {
    useGraphQLActivateDepartmentMutation,
    useGraphQLSuspendDepartmentMutation,
} from "@/lib/graphql/organization/organizationsHook";
import { useStore } from "@/lib/store/useStore";
import { useState } from "react";

interface DepartmentListProps {
    departments: Department[];
    onEdit: (department: Department) => void;
}

export default function DepartmentList({ departments, onEdit }: DepartmentListProps) {
    const { user } = useStore();
    const { activateDepartment } = useGraphQLActivateDepartmentMutation();
    const { suspendDepartment } = useGraphQLSuspendDepartmentMutation();
    const [togglingId, setTogglingId] = useState<string | null>(null);

    const toggleStatus = async (dept: Department) => {
        setTogglingId(String(dept.id));
        try {
            const action = dept.isActive ? suspendDepartment : activateDepartment;
            await action(String(dept.id));
            toast.success(`${dept.isActive ? "Suspended" : "Activated"} ${dept.name} successfully`);
        } catch (error: any) {
            toast.error(error.message || "Failed to update status");
        } finally {
            setTogglingId(null);
        }
    };

    const isAuthorized = user?.role === "admin" || user?.role === "hr" || user?.role === "manager";

    if (!departments || departments.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="w-24 h-24 bg-emerald-600/10 rounded-4xl flex items-center justify-center mb-8 shadow-inner ring-8 ring-emerald-500/5">
                    <Layers className="w-10 h-10 text-emerald-600 animate-pulse" />
                </div>
                <h3 className="text-premium-h2 mb-4 text-emerald-600">Departmental Void</h3>
                <p className="text-muted-foreground max-w-sm font-medium leading-relaxed italic">
                    The organizational matrix has no defined units. Construct your first department to compartmentalize operations.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {departments.map((dept) => (
                <div key={dept.id} className="group premium-card p-0 overflow-hidden hover:scale-102 flex flex-col border-border/50">
                    {/* Header Image/Background */}
                    <div className="h-28 bg-linear-to-br from-emerald-500/20 via-emerald-500/5 to-background relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full opacity-10">
                            <Layers className="w-48 h-48 -rotate-12 translate-x-32 -translate-y-16 text-emerald-600" />
                        </div>
                        <div className="absolute top-6 right-6">
                            <div className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl border backdrop-blur-xl shadow-lg ${dept.isActive
                                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                                : "bg-destructive/10 border-destructive/20 text-destructive"
                                }`}>
                                <div className={`w-2 h-2 rounded-full ${dept.isActive ? "bg-emerald-500 shadow-emerald-500/50" : "bg-destructive shadow-destructive/50"} animate-pulse shadow-sm`} />
                                <span className="text-premium-label tracking-[0.15em]">{dept.isActive ? "Operational" : "Suspended"}</span>
                            </div>
                        </div>
                    </div>

                    <div className="px-8 pb-8 flex-1 flex flex-col">
                        {/* Icon & Title */}
                        <div className="-mt-12 mb-8 flex items-end justify-between relative z-10">
                            <div className="flex items-end gap-4 px-1">
                                <div className="w-20 h-20 bg-card border-4 border-background rounded-3xl flex items-center justify-center shadow-2xl group-hover:rotate-6 transition-transform duration-500">
                                    <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-500/30">
                                        <Layers className="w-7 h-7" />
                                    </div>
                                </div>
                                <div className="mb-1">
                                    <h3 className="text-xl font-black text-foreground tracking-tight leading-none group-hover:text-emerald-600 transition-colors">{dept.name}</h3>
                                    <div className="flex items-center gap-2 mt-2">
                                        <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                                        <p className="text-premium-label text-[9px]">{dept.organization?.name || "Global Entity"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="space-y-5 flex-1 p-1">
                            <div className="bg-muted/20 p-5 rounded-2xl border border-border/30 min-h-[100px] flex flex-col justify-center">
                                <label className="text-premium-label block mb-2 opacity-60">Operational focus</label>
                                <p className="text-sm font-bold text-foreground/80 leading-relaxed italic line-clamp-2">
                                    {dept.description ? `"${dept.description}"` : "Strategic business unit established for core organizational functions."}
                                </p>
                            </div>
                        </div>

                        {/* Footer Controls */}
                        <div className="mt-8 pt-8 border-t border-border/40">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-emerald-500" />
                                    <span className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.3em] italic">Dept ID: {dept.id.slice(0, 8)}</span>
                                </div>

                                {isAuthorized && (
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => onEdit(dept)}
                                            className="w-11 h-11 flex items-center justify-center text-muted-foreground hover:text-emerald-600 hover:bg-emerald-500/5 rounded-2xl transition-all active:scale-90 border border-transparent hover:border-emerald-500/20 shadow-sm hover:shadow-md"
                                        >
                                            <Edit className="w-4.5 h-4.5" />
                                        </button>
                                        <div className="px-3 h-11 flex items-center bg-muted/20 rounded-2xl border border-border/50">
                                            {togglingId === String(dept.id) ? (
                                                <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                                            ) : (
                                                <Switch
                                                    checked={dept.isActive}
                                                    onCheckedChange={() => toggleStatus(dept)}
                                                    className="data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-destructive"
                                                />
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button
                                className="w-full py-4.5 px-6 bg-emerald-600 text-white font-black text-[11px] uppercase tracking-[0.25em] rounded-2xl shadow-2xl shadow-emerald-500/20 hover:opacity-95 hover:-translate-y-1 transition-all active:scale-95 flex items-center justify-center gap-3 group/btn"
                            >
                                <Layers className="w-4.5 h-4.5" />
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
