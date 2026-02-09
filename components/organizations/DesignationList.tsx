"use client";

import { Card } from "../common/Card";
import { Designation } from "@/lib/graphql/organization/types";
import { Edit, Users, FileText, Shapes, Briefcase, ArrowRight } from "lucide-react";
import { Switch } from "../ui/switch";
import { toast } from "sonner";
import {
    useGraphQLActivateDesignationMutation,
    useGraphQLSuspendDesignationMutation,
} from "@/lib/graphql/organization/organizationsHook";

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
            <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
                <div className="w-24 h-24 bg-purple-50 rounded-full flex items-center justify-center mb-6 animate-pulse-slow">
                    <Shapes className="w-12 h-12 text-purple-400" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Role Hierarchy Empty</h3>
                <p className="text-gray-500 max-w-xs font-medium leading-relaxed">
                    No occupational designations have been classified. Define your first role to initialize the talent architecture.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {designations.map((role) => (
                <div key={role.id} className="group relative">
                    <Card className="rounded-[2.5rem] p-8 bg-white border border-gray-100 shadow-2xl shadow-gray-200/40 hover:translate-y-[-8px] transition-all duration-500 relative overflow-hidden">
                        {/* Decorative background */}
                        <div className="absolute -right-12 -top-12 w-48 h-48 bg-purple-50/50 rounded-full blur-3xl group-hover:bg-purple-100/50 transition-colors"></div>

                        {/* Role Hub */}
                        <div className="flex items-center justify-between mb-8 relative z-10">
                            <div className="flex items-center space-x-4">
                                <div className="p-4 bg-purple-600 rounded-[1.5rem] shadow-xl shadow-purple-200 group-hover:scale-110 transition-transform duration-500">
                                    <Shapes className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-gray-900 tracking-tighter leading-none mb-1 line-clamp-1">{role.name}</h3>
                                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-1">
                                        <Briefcase className="w-3 h-3" /> {role.organization?.name || "Global Entity"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Role Intelligence */}
                        <div className="space-y-4 mb-8 relative z-10">
                            <div className="bg-gray-50/80 p-5 rounded-2xl border border-gray-100 min-h-[100px] flex flex-col justify-center">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Position mandate</label>
                                <p className="text-sm font-bold text-gray-700 leading-relaxed italic line-clamp-2">
                                    {role.description ? `"${role.description}"` : "Professional designation defined for strategic resource allocation and responsibility management."}
                                </p>
                            </div>
                        </div>

                        {/* Footer Controls */}
                        <div className="flex items-center justify-between pt-6 border-t border-gray-50 relative z-10">
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-purple-500" />
                                <span className="text-[10px] font-black text-gray-900 tracking-widest uppercase">ID: {role.id.slice(0, 8)}</span>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => onEdit(role)}
                                    className="p-4 bg-white border border-gray-100 text-gray-400 hover:text-purple-600 hover:border-purple-100 rounded-2xl shadow-sm transition-all"
                                >
                                    <Edit className="w-5 h-5" />
                                </button>
                                <div className="flex items-center px-4 bg-white border border-gray-100 rounded-2xl shadow-sm h-[54px]">
                                    <Switch
                                        checked={role.isActive}
                                        onCheckedChange={() => toggleStatus(role)}
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
