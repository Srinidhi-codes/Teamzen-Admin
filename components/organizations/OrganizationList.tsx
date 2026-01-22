"use client";

import { Users, Edit, Building2, FileText, CreditCard, Hash } from "lucide-react";
import { Card } from "../common/Card";
import { Switch } from "../ui/switch";
import { toast } from "sonner";
import { useStore } from "@/lib/store/useStore";
import {
    useGraphQLActivateOrganizationMutation,
    useGraphQLSuspendOrganizationMutation,
} from "@/lib/graphql/organization/organizatioHook";
import { Organization } from "@/lib/graphql/organization/types";

interface Props {
    organizations: Organization[];
    onEdit: (org: Organization) => void;
    onViewEmployees: (org: Organization) => void;
}

const DetailRow = ({ icon: Icon, label, value }: { icon: any; label: string; value: string }) => (
    <div className="flex items-start gap-2">
        <Icon className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 mb-0.5">{label}</p>
            <p className="text-sm font-medium text-gray-900 truncate">{value}</p>
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
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                    <Building2 className="w-10 h-10 text-indigo-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Organizations Yet</h3>
                <p className="text-gray-500 max-w-sm">
                    Get started by creating your first organization to manage your company structure.
                </p>
            </div>
        );

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {organizations.map((org) => (
                <Card key={org.id} hover className="border-t-4 border-t-indigo-500 relative overflow-hidden group">
                    {/* Status */}
                    <div className="absolute top-4 right-4">
                        <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${org.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                }`}
                        >
                            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${org.isActive ? "bg-green-600" : "bg-red-600"}`} />
                            {org.isActive ? "Active" : "Inactive"}
                        </span>
                    </div>

                    {/* Header */}
                    <div className="flex items-start mb-4 pr-24">
                        <div className="flex items-center space-x-3">
                            <div className="p-3 bg-indigo-600 rounded-xl shadow-md">
                                <Building2 className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{org.name}</h3>
                                <div className="flex items-center gap-1.5 mt-1">
                                    <Users className="w-3.5 h-3.5 text-gray-400" />
                                    <p className="text-sm text-gray-500 font-medium">{org.employeeCount || 0} employees</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="min-h-[15vh]">
                        {/* Description */}
                        {org.headquartersAddress && (
                            <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed mb-4">{org.headquartersAddress}</p>
                        )}

                        {/* Details */}
                        <div className="space-y-2.5 mb-4">
                            {org.registrationNumber && (
                                <DetailRow icon={Hash} label="Registration No." value={org.registrationNumber} />
                            )}
                            {org.gstNumber && <DetailRow icon={FileText} label="GST Number" value={org.gstNumber} />}
                            {org.panNumber && <DetailRow icon={CreditCard} label="PAN Number" value={org.panNumber} />}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
                        <span className="text-xs text-gray-400 font-mono">ID: {org.id}</span>

                        {user?.role === "admin" && (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => onEdit(org)}
                                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                >
                                    <Edit className="w-4 h-4" />
                                </button>

                                <Switch
                                    checked={org.isActive}
                                    onCheckedChange={() => toggleStatus(org)}
                                    className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500"
                                />
                            </div>
                        )}
                    </div>

                    {/* Employees Button */}
                    <button
                        onClick={() => onViewEmployees(org)}
                        className="w-full mt-3 py-2.5 px-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-lg transition-all flex items-center justify-center gap-2 group"
                    >
                        <Users className="w-4 h-4" />
                        <span>View Employees</span>
                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </button>
                </Card>
            ))}
        </div>
    );
}
