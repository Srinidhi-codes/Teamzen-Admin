"use client";

import { MapPin, Edit, Trash2, Clock, Navigation, Globe, ArrowRight } from "lucide-react";
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
            <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
                <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mb-6 animate-bounce-slow">
                    <MapPin className="w-12 h-12 text-orange-400" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Geospatial Void</h3>
                <p className="text-gray-500 max-w-xs font-medium leading-relaxed">
                    No physical locations have been established. Deploy your first office to enable regional operations.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {officeLocations.map((office) => (
                <div key={office.id} className="group relative">
                    <Card className="rounded-[2.5rem] p-8 bg-white border border-gray-100 shadow-2xl shadow-gray-200/40 hover:translate-y-[-8px] transition-all duration-500 relative overflow-hidden">
                        {/* Decorative background */}
                        <div className="absolute -right-12 -top-12 w-48 h-48 bg-orange-50/50 rounded-full blur-3xl group-hover:bg-orange-100/50 transition-colors"></div>

                        {/* Location Hub */}
                        <div className="flex items-center justify-between mb-8 relative z-10">
                            <div className="flex items-center space-x-4">
                                <div className="p-4 bg-orange-600 rounded-[1.5rem] shadow-xl shadow-orange-200 group-hover:rotate-6 transition-transform duration-500">
                                    <MapPin className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-gray-900 tracking-tighter leading-none mb-1 line-clamp-1">{office.name}</h3>
                                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-1">
                                        <Globe className="w-3 h-3" /> {office.city}, {office.state}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Operational Details */}
                        <div className="space-y-4 mb-8 relative z-10">
                            <div className="bg-gray-50/80 p-5 rounded-2xl border border-gray-100">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Physical address</label>
                                <p className="text-sm font-bold text-gray-700 leading-relaxed italic">
                                    "{office.address}, {office.city}, {office.zipCode}"
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-4 rounded-2xl bg-orange-50/50 border border-orange-100/50">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Clock className="w-3.5 h-3.5 text-orange-600" />
                                        <span className="text-[10px] font-black text-orange-900 uppercase">Window</span>
                                    </div>
                                    <p className="text-xs font-black text-gray-900 tracking-tight">{office.loginTime} - {office.logoutTime}</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100/50">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Navigation className="w-3.5 h-3.5 text-blue-600" />
                                        <span className="text-[10px] font-black text-blue-900 uppercase">Zone</span>
                                    </div>
                                    <p className="text-xs font-black text-gray-900 tracking-tight">{office.geoRadiusMeters}m Rad</p>
                                </div>
                            </div>
                        </div>

                        {/* Footer Controls */}
                        <div className="flex items-center justify-between pt-6 border-t border-gray-50 relative z-10">
                            <span className="text-[10px] font-black text-gray-300 tracking-widest uppercase italic">COORD: {office.latitude}, {office.longitude}</span>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => onEdit(office)}
                                    className="p-4 bg-white border border-gray-100 text-gray-400 hover:text-orange-600 hover:border-orange-100 rounded-2xl shadow-sm transition-all"
                                >
                                    <Edit className="w-5 h-5" />
                                </button>
                                <div className="flex items-center px-4 bg-white border border-gray-100 rounded-2xl shadow-sm h-[54px]">
                                    <Switch
                                        checked={office.isActive}
                                        onCheckedChange={() => toggleStatus(office)}
                                        className="data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-rose-500"
                                    />
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            ))}
        </div>
    );
}
