"use client";

import { Department } from "@/types/admin";
import { Users, Edit, Trash2 } from "lucide-react";
import { Card } from "../common/Card";

interface DepartmentListProps {
    departments: Department[];
    onEdit: (org: Department) => void;
    onDelete: (id: number) => void;
    onViewEmployees: (org: Department) => void;
}

export default function DepartmentList({
    departments,
    onEdit,
    onDelete,
    onViewEmployees,
}: DepartmentListProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments?.map((department) => (
                <Card key={department.id} hover className="border-t-4 border-t-yellow-500">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                            <div className="p-3 bg-yellow-50 rounded-xl">
                                <Users className="w-6 h-6 text-yellow-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">{department.name}</h3>
                                <p className="text-sm text-gray-500 font-medium">
                                    {department.organization?.name}
                                </p>
                            </div>
                        </div>
                        <div className="flex space-x-2">
                            <div className="p-1.5 text-gray-400 rounded-lg">
                                {department.isActive ? (
                                    <span className="inline-block w-2 h-2 rounded-full bg-green-600" />
                                ) : (
                                    <span className="inline-block w-2 h-2 rounded-full bg-red-600" />
                                )}
                            </div>
                            <button
                                onClick={() => onEdit(department)}
                                className="p-1.5 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                                title="Edit"
                            >
                                <Edit className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => onDelete(department.id)}
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <p className="text-md text-gray-600 mb-6 line-clamp-2 h-10">
                        {department.description}
                    </p>

                    <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                        <span className="text-xs text-gray-400">ID: {department.id}</span>
                        <button
                            onClick={() => onViewEmployees(department)}
                            className="text-sm font-semibold text-yellow-600 hover:text-yellow-800 transition-colors flex items-center"
                        >
                            View Departments &rarr;
                        </button>
                    </div>
                </Card>
            ))}
        </div>
    );
}
