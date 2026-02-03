"use client";

import { MapPin, Edit, Trash2, Clock, Navigation } from "lucide-react";
import { Card } from "../common/Card";
import { OfficeLocation } from "@/lib/graphql/organization/types";
import { useGraphQLActivateOfficeLocationMutation, useGraphQLSuspendOfficeLocationMutation } from "@/lib/graphql/organization/organizationsHook";
import { Switch } from "../ui/switch";
import { Button } from "../ui/button";
import { toast } from "sonner";

interface OfficeLocationListProps {
    officeLocations: OfficeLocation[];
    onEdit: (org: OfficeLocation) => void;
}

export default function OfficeLocationList({
    officeLocations,
    onEdit,
}: OfficeLocationListProps) {

    const { activateOfficeLocation } = useGraphQLActivateOfficeLocationMutation()
    const { suspendOfficeLocation } = useGraphQLSuspendOfficeLocationMutation()

    const toggleStatus = async (office: OfficeLocation) => {
        const action = office.isActive ? suspendOfficeLocation : activateOfficeLocation;
        await action(String(office.id));
        toast.success(`${office.isActive ? "Suspended" : "Activated"} ${office.name} successfully`);
    };

    if (!officeLocations || officeLocations.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mb-4">
                    <MapPin className="w-10 h-10 text-orange-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Office Locations Yet</h3>
                <p className="text-gray-500 max-w-sm">
                    Add your first office location to manage different work sites.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {officeLocations.map((office) => (
                <Card key={office.id} hover className="border-t-4 border-t-orange-500 relative">
                    {/* Status Badge */}
                    <div className="absolute top-4 right-4">
                        <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${office.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                                }`}
                        >
                            <span
                                className={`w-1.5 h-1.5 rounded-full mr-1.5 ${office.isActive ? "bg-green-600" : "bg-red-600"
                                    }`}
                            />
                            {office.isActive ? "Active" : "Inactive"}
                        </span>
                    </div>

                    {/* Header */}
                    <div className="flex items-start mb-4 pr-24">
                        <div className="flex items-center space-x-3">
                            <div className="p-3 bg-linear-to-br from-orange-500 to-orange-600 rounded-xl shadow-md">
                                <MapPin className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 line-clamp-1">
                                    {office.name}
                                </h3>
                                <p className="text-sm text-gray-500 font-medium mt-1">
                                    {office.city}, {office.state}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Address */}
                    <div className="mb-4">
                        <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                            {office.address}, {office.city}, {office.state} - {office.zipCode}
                        </p>
                    </div>

                    {/* Office Details */}
                    <div className="space-y-2.5 mb-4">
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400 shrink-0" />
                            <div className="flex-1">
                                <p className="text-xs text-gray-500">Working Hours</p>
                                <p className="text-sm font-medium text-gray-900">
                                    {office.loginTime} - {office.logoutTime}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Navigation className="w-4 h-4 text-gray-400 shrink-0" />
                            <div className="flex-1">
                                <p className="text-xs text-gray-500">Coordinates</p>
                                <p className="text-sm font-medium text-gray-900 font-mono">
                                    {office?.latitude}°, {office?.longitude}°
                                </p>
                            </div>
                        </div>

                        {office?.geoRadiusMeters && (
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 flex items-center justify-center shrink-0">
                                    <div className="w-2.5 h-2.5 rounded-full border-2 border-gray-400" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-gray-500">Geo-fence Radius</p>
                                    <p className="text-sm font-medium text-gray-900">
                                        {office?.geoRadiusMeters} meters
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-xs text-gray-400 font-mono">ID: {office.id}</span>
                        <div className="flex items-center gap-2">
                            <Button
                                onClick={() => onEdit(office)}
                                variant={"ghost"}
                                className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all duration-200"
                                title="Edit Office"
                            >
                                <Edit className="w-4 h-4" />
                            </Button>
                            <Switch
                                checked={office.isActive}
                                onCheckedChange={() => toggleStatus(office)}
                                className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500"
                            />
                        </div>
                    </div>

                    {/* View Employees Button */}

                </Card>
            ))}
        </div>
    );
}