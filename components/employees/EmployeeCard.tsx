"use client";

import { User } from "@/lib/graphql/users/types";
import {
    Mail,
    Phone,
    Building2,
    ShieldCheck,
    Edit,
    UserX,
    UserCheck as UserCheckIcon,
    MoreVertical,
    Compass
} from "lucide-react";
import { Switch } from "../ui/switch";
import Image from "next/image";
import { useStore } from "@/lib/store/useStore";

interface EmployeeCardProps {
    employee: User;
    onEdit: (employee: User) => void;
    onStatusToggle: (userId: string, newStatus: boolean) => void;
}

export default function EmployeeCard({ employee, onEdit, onStatusToggle }: EmployeeCardProps) {
    const { user: currentUser } = useStore();
    const isAdminOrHr = currentUser?.role === 'admin' || currentUser?.role === 'hr';

    return (
        <div className="group premium-card p-0 overflow-hidden hover:scale-102 flex flex-col border-border/50 transition-all duration-500">
            {/* Header / Banner */}
            <div className="h-24 bg-linear-to-br from-primary/20 via-primary/5 to-background relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10">
                    <Building2 className="w-48 h-48 -rotate-12 translate-x-32 -translate-y-16" />
                </div>
                <div className="absolute top-4 right-4">
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl border backdrop-blur-xl shadow-sm ${employee.isActive
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                        : "bg-destructive/10 border-destructive/20 text-destructive"
                        }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${employee.isActive ? "bg-emerald-500" : "bg-destructive"} shadow-xs`} />
                        <span className="text-[10px] font-black uppercase tracking-widest">
                            {employee.isActive ? "Active" : "Inactive"}
                        </span>
                    </div>
                </div>
            </div>

            <div className="px-6 pb-6 flex-1 flex flex-col">
                {/* Profile Picture & Basic Info */}
                <div className="-mt-10 mb-6 flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-20 h-20 bg-card border-4 border-background rounded-3xl flex items-center justify-center shadow-2xl overflow-hidden relative">
                            {employee.profilePictureUrl ? (
                                <Image src={employee.profilePictureUrl} alt={employee.firstName} fill className="object-cover" />
                            ) : (
                                <div className="w-full h-full bg-primary/10 text-primary flex items-center justify-center font-black text-2xl">
                                    {employee.firstName.charAt(0)}
                                </div>
                            )}
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-foreground tracking-tight leading-none truncate max-w-[150px]">
                                {employee.firstName} {employee.lastName}
                            </h3>
                            <p className="text-[10px] font-bold text-primary uppercase tracking-widest mt-1.5">
                                {employee.designation?.name || 'Talent'}
                            </p>
                        </div>
                    </div>

                    {isAdminOrHr && (
                        <button
                            onClick={() => onEdit(employee)}
                            className="p-2 rounded-xl bg-card border border-border shadow-sm text-muted-foreground hover:text-primary hover:border-primary/20 hover:bg-primary/5 transition-all"
                        >
                            <Edit className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Details */}
                <div className="space-y-4 flex-1">
                    <div className="grid grid-cols-1 gap-3">
                        <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-muted/30 border border-border/50 group/item hover:bg-muted/50 transition-colors">
                            <div className="w-8 h-8 rounded-lg bg-card flex items-center justify-center text-primary shadow-sm">
                                <Mail className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 leading-none mb-1">Email</p>
                                <p className="text-xs font-bold text-foreground truncate">{employee.email}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-muted/30 border border-border/50 group/item hover:bg-muted/50 transition-colors">
                            <div className="w-8 h-8 rounded-lg bg-card flex items-center justify-center text-primary shadow-sm">
                                <Phone className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 leading-none mb-1">Phone</p>
                                <p className="text-xs font-bold text-foreground truncate">{employee.phoneNumber || 'N/A'}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-muted/30 border border-border/50 group/item hover:bg-muted/50 transition-colors">
                            <div className="w-8 h-8 rounded-lg bg-card flex items-center justify-center text-primary shadow-sm">
                                <Building2 className="w-4 shadow-sm" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 leading-none mb-1">Department</p>
                                <p className="text-xs font-bold text-foreground truncate">{employee.department?.name || 'General'}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-muted/30 border border-border/50 group/item hover:bg-muted/50 transition-colors">
                            <div className="w-8 h-8 rounded-lg bg-card flex items-center justify-center text-primary shadow-sm">
                                <Compass className="w-4 h-4 shadow-sm" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 leading-none mb-1">Office</p>
                                <p className="text-xs font-bold text-foreground truncate">{employee.officeLocation?.name || 'Main Office'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-muted-foreground/60" />
                            <span className="text-[10px] font-bold py-1 px-2.5 bg-muted rounded-lg text-muted-foreground uppercase tracking-wider">
                                {employee.employmentType?.replace('_', ' ') || 'Part Time'}
                            </span>
                        </div>
                        <span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">
                            ID: {employee.id.substring(0, 8).toUpperCase()}
                        </span>
                    </div>
                </div>

                {/* Footer Controls */}
                {isAdminOrHr && (
                    <div className="mt-6 pt-5 border-t border-border/40 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">System Access</span>
                            <Switch
                                checked={employee.isActive}
                                onCheckedChange={(checked) => onStatusToggle(employee.id, checked)}
                            />
                        </div>
                        <p className="text-[10px] font-bold text-muted-foreground/40">
                            Joined {employee.dateOfJoining ? new Date(employee.dateOfJoining).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : 'N/A'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
