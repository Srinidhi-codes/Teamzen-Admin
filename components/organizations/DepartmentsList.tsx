"use client";

import { Card } from "../common/Card";
import { Department } from "@/lib/graphql/organization/types";
import { Edit, Users, FileText, Layers, Building2, ArrowRight } from "lucide-react";
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
            <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
                <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mb-6 animate-pulse-slow">
                    <Layers className="w-12 h-12 text-emerald-400" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Departmental Void</h3>
                <p className="text-gray-500 max-w-xs font-medium leading-relaxed">
                    The organizational matrix has no defined units. Construct your first department to compartmentalize operations.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {departments.map((dept) => (
                <div key={dept.id} className="group relative">
                    <Card className="rounded-[2.5rem] p-8 bg-white border border-gray-100 shadow-2xl shadow-gray-200/40 hover:translate-y-[-8px] transition-all duration-500 relative overflow-hidden">
                        {/* Decorative background */}
                        <div className="absolute -right-12 -top-12 w-48 h-48 bg-emerald-50/50 rounded-full blur-3xl group-hover:bg-emerald-100/50 transition-colors"></div>

                        {/* Department Hub */}
                        <div className="flex items-center justify-between mb-8 relative z-10">
                            <div className="flex items-center space-x-4">
                                <div className="p-4 bg-emerald-600 rounded-[1.5rem] shadow-xl shadow-emerald-200 group-hover:scale-110 transition-transform duration-500">
                                    <Layers className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-gray-900 tracking-tighter leading-none mb-1 line-clamp-1">{dept.name}</h3>
                                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-1">
                                        <Building2 className="w-3 h-3" /> {dept.organization?.name || "Global Entity"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Unit Intel */}
                        <div className="space-y-4 mb-8 relative z-10">
                            <div className="bg-gray-50/80 p-5 rounded-2xl border border-gray-100 min-h-[100px] flex flex-col justify-center">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Operational focus</label>
                                <p className="text-sm font-bold text-gray-700 leading-relaxed italic line-clamp-2">
                                    {dept.description ? `"${dept.description}"` : "Strategic business unit established for core organizational functions."}
                                </p>
                            </div>
                        </div>

                        {/* Footer Controls */}
                        <div className="flex items-center justify-between pt-6 border-t border-gray-50 relative z-10">
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-emerald-500" />
                                <span className="text-[10px] font-black text-gray-900 tracking-widest uppercase">Dept ID: {dept.id}</span>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => onEdit(dept)}
                                    className="p-4 bg-white border border-gray-100 text-gray-400 hover:text-emerald-600 hover:border-emerald-100 rounded-2xl shadow-sm transition-all"
                                >
                                    <Edit className="w-5 h-5" />
                                </button>
                                <div className="flex items-center px-4 bg-white border border-gray-100 rounded-2xl shadow-sm h-[54px]">
                                    <Switch
                                        checked={dept.isActive}
                                        onCheckedChange={() => toggleStatus(dept)}
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
