"use client";

import { Card } from "../common/Card";
import { Designation } from "@/lib/graphql/organization/types";
import { Edit, Users, FileText } from "lucide-react";
import { Switch } from "../ui/switch";
import { toast } from "sonner";
import {
    useGraphQLActivateDesignationMutation,
    useGraphQLSuspendDesignationMutation,
} from "@/lib/graphql/organization/organizatioHook";

interface DesignationListProps {
    designations: Designation[];
    onEdit: (designation: Designation) => void;
}

export default function DesignationList({ designations, onEdit }: DesignationListProps) {
    const { activateDesignation } = useGraphQLActivateDesignationMutation();
    const { suspendDesignation } = useGraphQLSuspendDesignationMutation();

    const toggleStatus = async (designation: Designation) => {
        const action = designation.isActive ? suspendDesignation : activateDesignation;
        await action(String(designation.id));
        toast.success(
            `${designation.isActive ? "Suspended" : "Activated"} ${designation.name} successfully`
        );
    };

    if (!designations || designations.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                    <Users className="w-10 h-10 text-blue-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Designations Yet</h3>
                <p className="text-gray-500 max-w-sm">
                    Add job roles to define positions within your organization.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {designations.map((role) => (
                <Card key={role.id} hover className="border-t-4 border-t-blue-500 relative">
                    {/* Status Badge */}
                    <div className="absolute top-4 right-4">
                        <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${role.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                }`}
                        >
                            <span
                                className={`w-1.5 h-1.5 rounded-full mr-1.5 ${role.isActive ? "bg-green-600" : "bg-red-600"
                                    }`}
                            />
                            {role.isActive ? "Active" : "Inactive"}
                        </span>
                    </div>

                    {/* Header */}
                    <div className="flex items-start mb-4 pr-24">
                        <div className="flex items-center space-x-3">
                            <div className="p-3 bg-blue-600 rounded-xl shadow-md">
                                <Users className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{role.name}</h3>
                                {role.organization?.name && (
                                    <p className="text-sm text-gray-500 font-medium mt-1">
                                        {role.organization.name}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    {role.description && (
                        <div className="mb-4 flex items-start gap-2">
                            <FileText className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-gray-600 leading-relaxed line-clamp-2 flex-1">
                                {role.description}
                            </p>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-xs text-gray-400 font-mono">ID: {role.id}</span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => onEdit(role)}
                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                            >
                                <Edit className="w-4 h-4" />
                            </button>
                            <Switch
                                checked={role.isActive}
                                onCheckedChange={() => toggleStatus(role)}
                                className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500"
                            />
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
}
