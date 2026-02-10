"use client";

import { Users, Edit, Building2, FileText, CreditCard, Hash, ArrowRight, Loader2 } from "lucide-react";
import { Switch } from "../ui/switch";
import { toast } from "sonner";
import { useStore } from "@/lib/store/useStore";
import {
    useGraphQLActivateOrganizationMutation,
    useGraphQLSuspendOrganizationMutation,
} from "@/lib/graphql/organization/organizationsHook";
import { Organization } from "@/lib/graphql/organization/types";
import { useState } from "react";

interface Props {
    organizations: Organization[];
    onEdit: (org: Organization) => void;
    onViewEmployees: (org: Organization) => void;
}

const DetailRow = ({ icon: Icon, label, value }: { icon: any; label: string; value: string }) => (
    <div className="flex items-start gap-4 p-3 rounded-2xl hover:bg-muted/50 transition-all duration-300 group/row">
        <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0 shadow-inner group-hover/row:scale-110 transition-transform">
            <Icon className="w-4.5 h-4.5 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-premium-label mb-0.5">{label}</p>
            <p className="text-premium-data truncate">{value}</p>
        </div>
    </div>
);


export default function OrganizationList({ organizations, onEdit, onViewEmployees }: Props) {
    const { activateOrganization } = useGraphQLActivateOrganizationMutation();
    const { suspendOrganization } = useGraphQLSuspendOrganizationMutation();
    const { user } = useStore();
    const [togglingId, setTogglingId] = useState<string | null>(null);

    const toggleStatus = async (org: Organization) => {
        setTogglingId(String(org.id));
        try {
            const action = org.isActive ? suspendOrganization : activateOrganization;
            await action(String(org.id));
            toast.success(`${org.isActive ? "Suspended" : "Activated"} ${org.name} successfully`);
        } catch (error: any) {
            toast.error(error.message || "Failed to update status");
        } finally {
            setTogglingId(null);
        }
    };

    if (!organizations?.length)
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="w-24 h-24 bg-primary/10 rounded-4xl flex items-center justify-center mb-8 shadow-inner ring-8 ring-primary/5">
                    <Building2 className="w-10 h-10 text-primary animate-pulse" />
                </div>
                <h3 className="text-premium-h2 mb-4">No Entities Found</h3>
                <p className="text-muted-foreground max-w-sm font-medium leading-relaxed italic">
                    The ecosystem is currently vacant. Begin by establishing your first organizational presence.
                </p>
            </div>
        );


    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {organizations.map((org) => (
                <div key={org.id} className="group premium-card p-0 overflow-hidden hover:scale-102 flex flex-col border-border/50">
                    {/* Header Image/Background */}
                    <div className="h-28 bg-linear-to-br from-primary/20 via-primary/5 to-background relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full opacity-10">
                            <Building2 className="w-48 h-48 -rotate-12 translate-x-32 -translate-y-16" />
                        </div>
                        <div className="absolute top-6 right-6">
                            <div className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl border backdrop-blur-xl shadow-lg ${org.isActive
                                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                                : "bg-destructive/10 border-destructive/20 text-destructive"
                                }`}>
                                <div className={`w-2 h-2 rounded-full ${org.isActive ? "bg-emerald-500 shadow-emerald-500/50" : "bg-destructive shadow-destructive/50"} animate-pulse shadow-sm`} />
                                <span className="text-premium-label tracking-[0.15em]">{org.isActive ? "Operational" : "Suspended"}</span>
                            </div>
                        </div>
                    </div>

                    <div className="px-8 pb-8 flex-1 flex flex-col">
                        {/* Icon & Title */}
                        <div className="-mt-12 mb-8 flex items-end justify-between relative z-10">
                            <div className="flex items-end gap-4 px-1">
                                <div className="w-20 h-20 bg-card border-4 border-background rounded-3xl flex items-center justify-center shadow-2xl group-hover:rotate-6 transition-transform duration-500">
                                    <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center text-primary-foreground shadow-xl shadow-primary/30">
                                        <Building2 className="w-7 h-7" />
                                    </div>
                                </div>
                                <div className="mb-1">
                                    <h3 className="text-xl font-black text-foreground tracking-tight leading-none group-hover:text-primary transition-colors truncate max-w-[180px]">{org.name}</h3>
                                    <div className="flex items-center gap-2 mt-2">
                                        <Users className="w-3.5 h-3.5 text-muted-foreground" />
                                        <p className="text-premium-label text-[9px]">{org.employeeCount || 0} Core Users</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="space-y-5 flex-1 p-1">
                            {org.headquartersAddress && (
                                <p className="text-sm text-muted-foreground/80 line-clamp-2 leading-relaxed font-medium italic mb-4 bg-muted/20 p-4 rounded-2xl border border-border/30">
                                    "{org.headquartersAddress}"
                                </p>
                            )}

                            <div className="space-y-2">
                                {org.registrationNumber && (
                                    <DetailRow icon={Hash} label="Licence ID" value={org.registrationNumber} />
                                )}
                                {org.gstNumber && <DetailRow icon={FileText} label="Fiscal ID" value={org.gstNumber} />}
                                {org.panNumber && <DetailRow icon={CreditCard} label="Payment ID" value={org.panNumber} />}
                            </div>
                        </div>

                        {/* Footer / Controls */}
                        <div className="mt-8 pt-8 border-t border-border/40">
                            <div className="flex items-center justify-between mb-6">
                                <span className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.3em]">Ref: {org.id.substring(0, 8)}</span>
                                {user?.role === "admin" && (
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => onEdit(org)}
                                            className="w-11 h-11 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-2xl transition-all active:scale-90 border border-transparent hover:border-primary/20 shadow-sm hover:shadow-md"
                                        >
                                            <Edit className="w-4.5 h-4.5" />
                                        </button>
                                        <div className="px-3 h-11 flex items-center bg-muted/20 rounded-2xl border border-border/50">
                                            {togglingId === String(org.id) ? (
                                                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                            ) : (
                                                <Switch
                                                    checked={org.isActive}
                                                    onCheckedChange={() => toggleStatus(org)}
                                                    className="data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-destructive"
                                                />
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => onViewEmployees(org)}
                                className="w-full py-4.5 px-6 bg-primary text-primary-foreground font-black text-[11px] uppercase tracking-[0.25em] rounded-2xl shadow-2xl shadow-primary/20 hover:opacity-95 hover:-translate-y-1 transition-all active:scale-95 flex items-center justify-center gap-3 group/btn"
                            >
                                <Users className="w-4.5 h-4.5" />
                                <span>Navigate to Workforce</span>
                                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1.5 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div >
            ))
            }
        </div >
    );
}
