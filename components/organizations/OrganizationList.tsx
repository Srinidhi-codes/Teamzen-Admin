"use client";

import { Organizations } from "@/types/admin";
import { Users, Edit, Trash2 } from "lucide-react";
import { Card } from "../common/Card";

interface OrganizationListProps {
    organizations: Organizations[];
    onEdit: (org: Organizations) => void;
    onDelete: (id: number | string) => void;
    onViewEmployees: (org: Organizations) => void;
}

export default function OrganizationList({
    organizations,
    onEdit,
    onDelete,
    onViewEmployees,
}: OrganizationListProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {organizations?.map((org) => (
                <Card key={org.id} hover className="border-t-4 border-t-indigo-500">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                            <div className="p-3 bg-indigo-50 rounded-xl">
                                <Users className="w-6 h-6 text-indigo-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">{org.name}</h3>
                                <p className="text-sm text-gray-500 font-medium">
                                    {org.employee_count} employees
                                </p>
                            </div>
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => onEdit(org)}
                                className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                title="Edit"
                            >
                                <Edit className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => onDelete(org.id)}
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-6 line-clamp-2 h-10">
                        {org.description}
                    </p>

                    <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                        <span className="text-xs text-gray-400">ID: {org.id}</span>
                        <button
                            onClick={() => onViewEmployees(org)}
                            className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center"
                        >
                            View Employees &rarr;
                        </button>
                    </div>
                </Card>
            ))}
        </div>
    );
}
