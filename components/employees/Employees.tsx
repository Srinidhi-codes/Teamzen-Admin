"use client";

import { useState, useEffect } from "react";
import {
    Plus,
    Edit,
    Trash2,
    Mail,
    Phone,
    Download,
    UserPlus,
    Search,
    MoreVertical,
    ShieldCheck,
    Globe,
    UserX,
    Calendar,
    Users,
    Building2,
    UserCheck as UserCheckIcon
} from "lucide-react";

import { Stat } from "@/components/common/Stats";

import { DataTable, Column } from "../common/DataTable";
import { User } from "@/lib/graphql/users/types";
import { useGraphQLUsers } from "@/lib/graphql/users/userHook";
import { useDebounce } from "@/lib/hooks/useDebounce";
import EmployeeForm from "./EmployeeForm";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { SearchInput } from "@/components/ui/search";

export default function EmployeesPage() {
    const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    const { users, total, isUsersLoading, refetchUsers } = useGraphQLUsers({
        page: currentPage,
        pageSize: pageSize,
        filters: {
            search: debouncedSearchTerm
        }
    });

    const isEditing = !!selectedEmployee;
    const totalPages = Math.ceil((total || 0) / pageSize);

    // Reset to first page when searching
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearchTerm]);

    const handleEdit = (user: User) => {
        setSelectedEmployee(user);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setSelectedEmployee(null);
        setIsModalOpen(true);
    };

    const handleClose = () => {
        setIsModalOpen(false);
        setSelectedEmployee(null);
    };

    const handleSuccess = () => {
        handleClose();
        refetchUsers();
    };

    const statsList = [
        {
            label: "Total Employees",
            value: users?.length || 0,
            icon: Users,
            color: "text-blue-500",
            gradient: "bg-blue-500/10",
            index: "01"
        },
        {
            label: "Active Employees",
            value: users?.filter((e) => e.isActive).length || 0,
            icon: UserCheckIcon,
            color: "text-emerald-500",
            gradient: "bg-emerald-500/10",
            index: "02"
        },
        {
            label: "New Employees",
            value: users?.filter(u => {
                const joinDate = new Date(u.dateOfJoining || "");
                const monthAgo = new Date();
                monthAgo.setMonth(monthAgo.getMonth() - 1);
                return joinDate > monthAgo;
            }).length || 0,
            icon: UserPlus,
            color: "text-fuchsia-500",
            gradient: "bg-fuchsia-500/10",
            index: "03"
        },
        {
            label: "Inactive Employees",
            value: users?.filter((e) => !e.isActive).length || 0,
            icon: UserX,
            color: "text-rose-500",
            gradient: "bg-rose-500/10",
            index: "04"
        },
    ];




    const columns: Column<User>[] = [
        {
            key: "firstName",
            label: "Employee",
            render: (val: any, user: User) => (
                <div className="flex items-center gap-4 py-1">
                    <div className="relative group">
                        <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black text-xs shadow-inner">
                            {user.firstName.charAt(0)}
                        </div>
                    </div>
                    <div>
                        <div className="font-bold text-foreground text-[0.95rem] leading-none mb-1 group-hover:text-primary transition-colors">
                            {user.firstName} {user.lastName}
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">ID: {user.id.substring(0, 8).toUpperCase()}</span>
                            <span className="w-1 h-1 rounded-full bg-border" />
                            <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{user.designation?.name || 'Talent'}</span>
                        </div>
                    </div>

                </div>
            ),
        },
        {
            key: "email",
            label: "CONNECTIVITY",
            render: (val: any, user: User) => (
                <div className="space-y-1.5 py-1">
                    <div className="flex items-center gap-2 group/link">
                        <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover/link:bg-primary group-hover/link:text-primary-foreground transition-all">
                            <Mail className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-semibold text-foreground/70 truncate max-w-[160px] tracking-tight">{user.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                            <Phone className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-bold text-muted-foreground/60 tracking-tighter">{user.phoneNumber}</span>
                    </div>

                </div>
            ),
        },
        {
            key: "department",
            label: "DEPARTMENT",
            render: (val: any, user: User) => (
                <div className="flex flex-col gap-1.5 py-1">
                    <div className="flex items-center gap-2">
                        <Building2 className="w-3.5 h-3.5 text-muted-foreground/60" />
                        <span className="text-xs font-black uppercase tracking-widest text-foreground">{user.department?.name || 'General'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="w-3.5 h-3.5 text-muted-foreground/60" />
                        <span className="text-[10px] font-bold py-0.5 px-2 bg-muted rounded-lg text-muted-foreground uppercase tracking-wider">
                            {user.employmentType?.replace('_', ' ') || 'Part Time'}
                        </span>
                    </div>

                </div>
            ),
        },
        {
            key: "isActive",
            label: "STATUS",
            render: (val: any, user: User) => (
                <div className="py-1">
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl border ${user.isActive
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                        : "bg-destructive/10 border-destructive/20 text-destructive"
                        }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${user.isActive ? "bg-emerald-500" : "bg-destructive"} shadow-xs`} />
                        <span className="text-[10px] font-black uppercase tracking-widest">
                            {user.isActive ? "Active" : "Inactive"}
                        </span>
                    </div>
                </div>

            ),
        },
        {
            key: "actions",
            label: "",
            render: (val: any, user: User) => (
                <div className="flex items-center justify-end gap-2 pr-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(user);
                        }}
                        className="p-2.5 rounded-xl bg-card border border-border shadow-sm text-muted-foreground hover:text-primary hover:border-primary/20 hover:bg-primary/5 transition-all duration-300"
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                    <button
                        className="p-2.5 rounded-xl bg-card border border-border shadow-sm text-muted-foreground hover:text-destructive hover:border-destructive/20 hover:bg-destructive/5 transition-all duration-300"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>

                </div>
            ),
        },
    ];


    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Executive Summary */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20 animate-bounce-slow">
                            <Users className="w-5 h-5" />
                        </div>
                        <h1 className="text-3xl font-black text-foreground tracking-tight">Talent Ecosystem</h1>
                    </div>
                    <p className="text-muted-foreground font-medium tracking-tight pl-13">Powering the heartbeat of our organizational intelligence.</p>
                </div>


                <div className="flex items-center gap-4">
                    <button className="btn-secondary flex items-center gap-3">
                        <Download className="w-4 h-4" />
                        Export Data
                    </button>
                    <button
                        onClick={handleAdd}
                        className="btn-primary flex items-center gap-3"
                    >
                        <UserPlus className="w-4 h-4" />
                        Add Employee
                    </button>
                </div>


            </div>

            {/* Smart Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {statsList.map((stat, i) => (
                    <Stat
                        key={i}
                        icon={stat.icon}
                        label={stat.label}
                        value={stat.value}
                        color={stat.color}
                        gradient={stat.gradient}
                        index={stat.index}
                    />

                ))}
            </div>



            {/* Intelligence search & Filter */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card/50 p-6 rounded-4xl backdrop-blur-md border border-border/50 shadow-xl">

                <div className="relative w-full md:max-w-md group">
                    <SearchInput
                        placeholder="Scan for identifiers, names or connectivity..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onSearch={() => { }}
                    />
                </div>
                <div className="flex items-center gap-3">
                    <button className="p-4 bg-muted hover:bg-muted/80 border border-border rounded-2xl text-muted-foreground hover:text-primary transition-colors shadow-sm">
                        <Globe className="w-5 h-5" />
                    </button>
                    <button className="px-6 py-3.5 bg-muted hover:bg-muted/80 border border-border rounded-2xl text-muted-foreground font-bold text-[10px] uppercase tracking-widest shadow-sm hover:border-primary/30 transition-all">
                        Deep Filters
                    </button>
                </div>

            </div>

            {/* Main Repository */}
            <DataTable
                data={users || []}
                columns={columns}
                isLoading={isUsersLoading}
                onRowClick={(employee: User) => handleEdit(employee)}
                // Pagination
                total={total}
                currentPage={currentPage}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                paginationLabel="talent"
            />

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-3xl rounded-4xl p-0 overflow-hidden border-none shadow-3xl">
                    <div className="bg-linear-to-br border-b from-primary/20 via-background to-background p-8 text-premium-h2 relative">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Users className="w-32 h-32 rotate-12" />
                        </div>
                        <DialogHeader>
                            <DialogTitle className="text-3xl font-black tracking-tight">{isEditing ? "Update Employee" : "Create New Employee"}</DialogTitle>
                            <DialogDescription className="text-sm font-semibold">
                                {isEditing
                                    ? "Updating core intelligence parameters for this individual."
                                    : "Establishing new workspace presence within the ecosystem."}
                            </DialogDescription>

                        </DialogHeader>
                    </div>

                    <div className="p-8 bg-background max-h-[75vh] overflow-y-auto">

                        <EmployeeForm
                            initialData={selectedEmployee}
                            onSuccess={handleSuccess}
                            onCancel={handleClose}
                        />
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
