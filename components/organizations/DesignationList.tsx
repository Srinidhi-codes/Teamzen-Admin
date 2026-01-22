"use client";

import { Designation } from "@/types/admin";
import { Users, Edit, Trash2 } from "lucide-react";
import { Card } from "../common/Card";

interface DesignationListProps {
    designations: Designation[];
    onEdit: (designation: Designation) => void;
    onDelete: (id: number | string) => void;
    onViewEmployees: (designation: Designation) => void;
}

export default function DesignationList({
    designations,
    onEdit,
    onDelete,
    onViewEmployees,
}: DesignationListProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {designations?.map((designation) => (
                <Card key={designation.id} hover className="border-t-4 border-t-blue-500">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                            <div className="p-3 bg-blue-50 rounded-xl">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">{designation.name}</h3>
                                <p className="text-sm text-gray-500 font-medium">
                                    {designation.organization?.name}
                                </p>
                            </div>
                        </div>
                        <div className="flex space-x-2">
                            <div className="p-1.5 text-gray-400 rounded-lg">
                                {designation.isActive ? (
                                    <span className="inline-block w-2 h-2 rounded-full bg-blue-600" />
                                ) : (
                                    <span className="inline-block w-2 h-2 rounded-full bg-blue-600" />
                                )}
                            </div>
                            <button
                                onClick={() => onEdit(designation)}
                                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit"
                            >
                                <Edit className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => onDelete(designation.id)}
                                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Delete"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <p className="text-md text-gray-600 mb-6 line-clamp-2 h-10">
                        {designation.description}
                    </p>

                    <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                        <span className="text-xs text-gray-400">ID: {designation.id}</span>
                        <button
                            onClick={() => onViewEmployees(designation)}
                            className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors flex items-center"
                        >
                            View Designation &rarr;
                        </button>
                    </div>
                </Card>
            ))}
        </div>
    );
}
