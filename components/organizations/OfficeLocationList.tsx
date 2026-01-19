"use client";

import { OfficeLocation } from "@/types/admin";
import { Users, Edit, Trash2 } from "lucide-react";
import { Card } from "../common/Card";

interface OfficeLocationListProps {
    officeLocations: OfficeLocation[];
    onEdit: (org: OfficeLocation) => void;
    onDelete: (id: number) => void;
    onViewEmployees: (org: OfficeLocation) => void;
}

export default function OfficeLocationList({
    officeLocations,
    onEdit,
    onDelete,
    onViewEmployees,
}: OfficeLocationListProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {officeLocations?.map((office) => (
                <Card key={office.id} hover className="border-t-4 border-t-orange-500">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                            <div className="p-3 bg-orange-50 rounded-xl">
                                <Users className="w-6 h-6 text-orange-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">{office.name}</h3>
                                <p className="text-sm text-gray-500 font-medium">
                                    {office.address}, {office.city}, {office.state} - {office.zipCode}
                                </p>
                            </div>
                        </div>
                        <div className="flex space-x-2">
                            <div className="p-1.5 text-gray-400 rounded-lg">
                                {office.isActive ? (
                                    <span className="inline-block w-2 h-2 rounded-full bg-green-600" />
                                ) : (
                                    <span className="inline-block w-2 h-2 rounded-full bg-red-600" />
                                )}
                            </div>

                            <button
                                onClick={() => onEdit(office)}
                                className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                title="Edit"
                            >
                                <Edit className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => onDelete(office.id)}
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                    <div className="flex justify-between gap-2 px-5">
                        <div>
                            <p className="text-md text-gray-600 mb-6 line-clamp-2 h-10">
                                Longitude: {office.longitude}°
                            </p>
                            <p className="text-md text-gray-600 mb-6 line-clamp-2 h-10">
                                Latitude: {office.latitude}°
                            </p>
                        </div>
                        <div>
                            <p className="text-md text-gray-600 mb-6 line-clamp-2 h-10">
                                Login Time: {office.loginTime} AM
                            </p>
                            <p className="text-md text-gray-600 mb-6 line-clamp-2 h-10">
                                Logout Time: {office.logoutTime} PM
                            </p>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                        <button
                            onClick={() => onViewEmployees(office)}
                            className="text-sm font-semibold text-orange-600 hover:text-orange-800 transition-colors flex items-center"
                        >
                            View Office Locations
                        </button>
                    </div>
                </Card>
            ))}
        </div>
    );
}
