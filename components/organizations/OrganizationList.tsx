"use client";

import { Users, Edit, Building2, FileText, CreditCard, Hash } from "lucide-react";
import { Card } from "../common/Card";
import { Switch } from "../ui/switch";
import { toast } from "sonner";
import { useStore } from "@/lib/store/useStore";
import {
    useGraphQLActivateOrganizationMutation,
    useGraphQLSuspendOrganizationMutation,
} from "@/lib/graphql/organization/organizationsHook";
import { Organization } from "@/lib/graphql/organization/types";

interface Props {
    organizations: Organization[];
    onEdit: (org: Organization) => void;
    onViewEmployees: (org: Organization) => void;
}

const DetailRow = ({ icon: Icon, label, value }: { icon: any; label: string; value: string }) => (
    <div className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-muted/50 transition-colors">
        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
            <Icon className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">{label}</p>
            <p className="text-sm font-bold text-foreground truncate">{value}</p>
        </div>
    </div>
);


export default function OrganizationList({ organizations, onEdit, onViewEmployees }: Props) {
    const { activateOrganization } = useGraphQLActivateOrganizationMutation();
    const { suspendOrganization } = useGraphQLSuspendOrganizationMutation();
    const { user } = useStore();

    const toggleStatus = async (org: Organization) => {
        const action = org.isActive ? suspendOrganization : activateOrganization;
        await action(String(org.id));
        toast.success(`${org.isActive ? "Suspended" : "Activated"} ${org.name} successfully`);
    };

    if (!organizations?.length)
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-700">
                <div className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center mb-6 shadow-inner ring-4 ring-primary/5">
                    <Building2 className="w-10 h-10 text-primary animate-pulse" />
                </div>
                <h3 className="text-xl font-black text-foreground mb-3 tracking-tight">No Entities Found</h3>
                <p className="text-muted-foreground max-w-sm font-medium leading-relaxed">
                    The ecosystem is currently vacant. Begin by establishing your first organizational presence.
                </p>
            </div>
        );


    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {organizations.map((org) => (
                <div key={org.id} className="group bg-card rounded-[2.5rem] border border-border hover:border-primary/20 shadow-xl shadow-border/5 overflow-hidden transition-all duration-500 hover:scale-[1.02] flex flex-col">
                    {/* Header Image/Background */}
                    <div className="h-24 bg-linear-to-br from-primary/20 to-primary/5 relative">
                        <div className="absolute top-4 right-4">
                            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl border backdrop-blur-md shadow-sm ${org.isActive
                                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                                : "bg-destructive/10 border-destructive/20 text-destructive"
                                }`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${org.isActive ? "bg-emerald-500" : "bg-destructive"} animate-pulse`} />
                                <span className="text-[10px] font-black uppercase tracking-widest">{org.isActive ? "Operational" : "Suspended"}</span>
                            </div>
                        </div>
                    </div>

                    <div className="px-8 pb-8 flex-1 flex flex-col">
                        {/* Icon & Title */}
                        <div className="-mt-10 mb-6 flex items-end justify-between relative z-10">
                            <div className="flex items-end gap-3 px-2">
                                <div className="w-16 h-16 bg-card border-[3px] border-background rounded-[1.5rem] flex items-center justify-center shadow-2xl group-hover:rotate-6 transition-transform">
                                    <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
                                        <Building2 className="w-6 h-6" />
                                    </div>
                                </div>
                                <div className="mb-1">
                                    <h3 className="text-lg font-black text-foreground tracking-tight leading-none group-hover:text-primary transition-colors">{org.name}</h3>
                                    <div className="flex items-center gap-1.5 mt-1">
                                        <Users className="w-3 h-3 text-muted-foreground" />
                                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{org.employeeCount || 0} Core Users</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="space-y-4 flex-1">
                            {org.headquartersAddress && (
                                <p className="text-sm text-foreground/60 line-clamp-2 leading-relaxed font-medium italic mb-2">"{org.headquartersAddress}"</p>
                            )}

                            <div className="grid grid-cols-1 gap-2">
                                {org.registrationNumber && (
                                    <DetailRow icon={Hash} label="Licence ID" value={org.registrationNumber} />
                                )}
                                {org.gstNumber && <DetailRow icon={FileText} label="Fiscal ID" value={org.gstNumber} />}
                                {org.panNumber && <DetailRow icon={CreditCard} label="Payment ID" value={org.panNumber} />}
                            </div>
                        </div>

                        {/* Footer / Controls */}
                        <div className="mt-8 pt-6 border-t border-border/50">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">Ref: {org.id.substring(0, 8)}</span>
                                {user?.role === "admin" && (
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => onEdit(org)}
                                            className="p-3 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-2xl transition-all active:scale-90"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <Switch
                                            checked={org.isActive}
                                            onCheckedChange={() => toggleStatus(org)}
                                            className="data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-destructive"
                                        />
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => onViewEmployees(org)}
                                className="w-full py-4 px-6 bg-primary text-primary-foreground font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-primary/10 hover:opacity-90 hover:-translate-y-1 transition-all active:scale-95 flex items-center justify-center gap-2 group/btn"
                            >
                                <Users className="w-4 h-4" />
                                <span>Navigate to Workforce</span>
                                <span className="group-hover/btn:translate-x-1 transition-transform animate-pulse">→</span>
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>

    );
}
