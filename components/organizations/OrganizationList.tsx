"use client";

import { Users, Edit, Building2, FileText, CreditCard, Hash, ArrowRight, ExternalLink } from "lucide-react";
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
    <div className="flex items-start gap-4 p-3 rounded-2xl bg-gray-50/50 border border-transparent hover:border-gray-100 transition-all group/row">
        <div className="bg-white p-2 rounded-xl shadow-xs group-hover/row:scale-110 transition-transform">
            <Icon className="w-4 h-4 text-indigo-500" />
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
            <p className="text-sm font-bold text-gray-900 truncate tracking-tight">{value}</p>
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
            <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
                <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-6 animate-pulse-slow">
                    <Building2 className="w-12 h-12 text-indigo-400" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Ecosystem Void</h3>
                <p className="text-gray-500 max-w-xs font-medium leading-relaxed">
                    The organizational structure is currently empty. Initialize your first entity to begin mapping.
                </p>
            </div>
        );

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {organizations.map((org) => (
                <div key={org.id} className="group relative">
                    <Card className="rounded-[2.5rem] p-8 bg-white border border-gray-100 shadow-2xl shadow-gray-200/40 hover:translate-y-[-8px] transition-all duration-500 relative overflow-hidden backdrop-blur-3xl">
                        {/* Decorative background element */}
                        <div className="absolute -right-12 -top-12 w-48 h-48 bg-indigo-50/50 rounded-full blur-3xl group-hover:bg-indigo-100/50 transition-colors"></div>

                        {/* Status Hub */}
                        <div className="flex items-center justify-between mb-8 relative z-10">
                            <div className="flex items-center space-x-4">
                                <div className="p-4 bg-gray-900 rounded-[1.5rem] shadow-xl shadow-black/10 group-hover:scale-110 transition-transform duration-500">
                                    <Building2 className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-gray-900 tracking-tighter leading-none mb-1 line-clamp-1">{org.name}</h3>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${org.isActive ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${org.isActive ? "text-emerald-600" : "text-rose-600"}`}>
                                            {org.isActive ? "Station active" : "Offline"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Data Grid */}
                        <div className="space-y-3 mb-8 relative z-10">
                            <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100/50 mb-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Users className="w-5 h-5 text-indigo-600" />
                                    <span className="text-sm font-black text-indigo-900 uppercase tracking-tight">Workforce</span>
                                </div>
                                <span className="text-2xl font-black text-indigo-600">{org.employeeCount || 0}</span>
                            </div>

                            {org.registrationNumber && (
                                <DetailRow icon={Hash} label="Inventory ID" value={org.registrationNumber} />
                            )}
                            {org.gstNumber && <DetailRow icon={FileText} label="Identity Signature" value={org.gstNumber} />}
                        </div>

                        {/* Intelligence Hub Transition */}
                        <div className="flex items-center gap-3 relative z-10 pt-4 border-t border-gray-50">
                            <button
                                onClick={() => onViewEmployees(org)}
                                className="flex-1 flex items-center justify-between px-6 py-4 bg-gray-50 hover:bg-indigo-600 text-gray-900 hover:text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-300 group/btn"
                            >
                                <span>Access workforce</span>
                                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                            </button>

                            {user?.role === "admin" && (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => onEdit(org)}
                                        className="p-4 bg-white border border-gray-100 text-gray-400 hover:text-indigo-600 hover:border-indigo-100 rounded-2xl shadow-sm transition-all"
                                    >
                                        <Edit className="w-5 h-5" />
                                    </button>
                                    <div className="flex items-center px-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
                                        <Switch
                                            checked={org.isActive}
                                            onCheckedChange={() => toggleStatus(org)}
                                            className="data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-rose-500"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            ))}
        </div>
    );
}
