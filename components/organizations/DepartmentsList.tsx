"use client";

import { Card } from "../common/Card";
import { Department } from "@/lib/graphql/organization/types";
import { Edit, Users, FileText } from "lucide-react";
import { Switch } from "../ui/switch";
import { toast } from "sonner";
import {
    useGraphQLActivateDepartmentMutation,
    useGraphQLSuspendDepartmentMutation,
} from "@/lib/graphql/organization/organizationsHook";

interface DepartmentListProps {
    departments: Department[];
    onEdit: (department: Department) => void;
}

export default function DepartmentList({ departments, onEdit }: DepartmentListProps) {
    const { activateDepartment } = useGraphQLActivateDepartmentMutation();
    const { suspendDepartment } = useGraphQLSuspendDepartmentMutation();

    const toggleStatus = async (dept: Department) => {
        const action = dept.isActive ? suspendDepartment : activateDepartment;
        await action(String(dept.id));
        toast.success(`${dept.isActive ? "Suspended" : "Activated"} ${dept.name} successfully`);
    };

    if (!departments || departments.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center mb-4">
                    <Users className="w-10 h-10 text-yellow-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Departments Yet</h3>
                <p className="text-gray-500 max-w-sm">
                    Add a department to organize teams in your organization.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((dept) => (
                <Card key={dept.id} hover className="border-t-4 border-t-yellow-500 relative">
                    {/* Status Badge */}
                    <div className="absolute top-4 right-4">
                        <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${dept.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                }`}
                        >
                            <span
                                className={`w-1.5 h-1.5 rounded-full mr-1.5 ${dept.isActive ? "bg-green-600" : "bg-red-600"
                                    }`}
                            />
                            {dept.isActive ? "Active" : "Inactive"}
                        </span>
                    </div>

                    {/* Header */}
                    <div className="flex items-start mb-4 pr-24">
                        <div className="flex items-center space-x-3">
                            <div className="p-3 bg-yellow-600 rounded-xl shadow-md">
                                <Users className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{dept.name}</h3>
                                {dept.organization?.name && (
                                    <p className="text-sm text-gray-500 font-medium mt-1">
                                        {dept.organization.name}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    {dept.description && (
                        <div className="mb-4 flex items-start gap-2">
                            <FileText className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                            <p className="text-sm text-gray-600 leading-relaxed line-clamp-2 flex-1">
                                {dept.description}
                            </p>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-xs text-gray-400 font-mono">ID: {dept.id}</span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => onEdit(dept)}
                                className="p-2 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-all duration-200"
                                title="Edit Department"
                            >
                                <Edit className="w-4 h-4" />
                            </button>
                            <Switch
                                checked={dept.isActive}
                                onCheckedChange={() => toggleStatus(dept)}
                                className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500"
                            />
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
}
