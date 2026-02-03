"use client";

import { useState, useEffect } from "react";
import {
    Plus,
    Edit,
    Trash2,
    Mail,
    Phone,
    Download,
    Users,
    UserCheck,
    Building2,
    UserPlus,
    Search,
    MoreVertical,
    ShieldCheck,
    Globe,
    UserX
} from "lucide-react";
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

    const stats = [
        {
            label: "Total Employees",
            count: users?.length || 0,
            icon: Users,
            color: "indigo",
            trend: "+12.5%",
            bg: "bg-indigo-50",
            text: "text-indigo-600"
        },
        {
            label: "Active Employees",
            count: users?.filter((e) => e.isActive).length || 0,
            icon: UserCheck,
            color: "emerald",
            trend: "98% Efficiency",
            bg: "bg-emerald-50",
            text: "text-emerald-600"
        },
        {
            label: "New Employees",
            count: users?.filter(u => {
                const joinDate = new Date(u.dateOfJoining || "");
                const monthAgo = new Date();
                monthAgo.setMonth(monthAgo.getMonth() - 1);
                return joinDate > monthAgo;
            }).length || 0,
            icon: UserPlus,
            color: "fuchsia",
            trend: "This Month",
            bg: "bg-fuchsia-50",
            text: "text-fuchsia-600"
        },
        {
            label: "Inactive Employees",
            count: users?.filter((e) => !e.isActive).length || 0,
            icon: UserX,
            color: "red",
            trend: "Inactive",
            bg: "bg-red-50",
            text: "text-red-600"
        },
    ];

    const columns: Column<User>[] = [
        {
            key: "firstName",
            label: "Employee",
            render: (val: any, user: User) => (
                <div className="flex items-center gap-4 py-1">
                    <div className="relative group">
                        <div className="w-11 h-11 rounded-2xl border-2 border-white bg-linear-to-r from-indigo-200 to-indigo-500 shadow-md flex items-center justify-center text-black font-bold text-lg overflow-hidden hover:scale-110 transition-transform duration-300">
                            {user.firstName[0]}{user.lastName[0]}
                        </div>
                        {user.isActive && (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center">
                                <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                            </div>
                        )}
                    </div>
                    <div>
                        <div className="font-bold text-slate-900 text-[0.95rem] leading-none mb-1 group-hover:text-indigo-600 transition-colors">
                            {user.firstName} {user.lastName}
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">ID: {user.id.substring(0, 8).toUpperCase()}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-200" />
                            <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">{user.designation?.name || 'Talent'}</span>
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
                        <div className="w-6 h-6 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover/link:bg-indigo-600 group-hover/link:text-white transition-all">
                            <Mail className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-semibold text-slate-600 truncate max-w-[160px] tracking-tight">{user.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                            <Phone className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-bold text-slate-400 tracking-tighter">{user.phoneNumber}</span>
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
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-xs font-black uppercase tracking-widest text-slate-900">{user.department?.name || 'General'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-[10px] font-bold py-0.5 px-2 bg-slate-100 rounded-lg text-slate-500 uppercase tracking-wider">
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
                        ? "bg-emerald-50/50 border-emerald-100 text-emerald-700"
                        : "bg-rose-50/50 border-rose-100 text-rose-700"
                        }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${user.isActive ? "bg-emerald-500" : "bg-rose-500"} shadow-xs`} />
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
                        className="p-2.5 rounded-xl bg-white border border-slate-100 shadow-sm text-slate-400 hover:text-indigo-600 hover:border-indigo-100 hover:bg-indigo-50 transition-all duration-300"
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                    <button
                        className="p-2.5 rounded-xl bg-white border border-slate-100 shadow-sm text-slate-400 hover:text-rose-600 hover:border-rose-100 hover:bg-rose-50 transition-all duration-300"
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
                        <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200 animate-bounce-slow">
                            <Users className="w-5 h-5" />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Talent Ecosystem</h1>
                    </div>
                    <p className="text-slate-500 font-medium tracking-tight pl-13">Powering the heartbeat of our organizational intelligence.</p>
                </div>

                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-6 py-3.5 bg-white border border-slate-200 rounded-2xl text-slate-600 font-bold text-sm hover:border-indigo-200 hover:bg-indigo-50 transition-all duration-300 shadow-sm">
                        <Download className="w-4 h-4" />
                        Export Data
                    </button>
                    <button
                        onClick={handleAdd}
                        className="flex items-center gap-2 px-8 py-3.5 bg-indigo-600 text-white rounded-2xl font-bold text-sm hover:bg-indigo-700 hover:scale-105 transition-all duration-500 shadow-xl"
                    >
                        <UserPlus className="w-4 h-4" />
                        Add Employee
                    </button>
                </div>
            </div>

            {/* Smart Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="group relative bg-white rounded-[2.5rem] p-6 border border-slate-100 hover:shadow-indigo-200/50 shadow-xl shadow-slate-200/50 overflow-hidden hover:scale-102 transition-all duration-500">
                        <div className="absolute top-0 right-0 p-4 opacity-5 transition-opacity">
                            <stat.icon className="w-24 h-24 rotate-12" />
                        </div>

                        <div className="flex items-center gap-4 mb-4">
                            <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.text} flex items-center justify-center shadow-inner`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">Metric 0{i + 1}</div>
                        </div>

                        <div className="space-y-1">
                            <div className="text-4xl font-black text-slate-900 tabular-nums tracking-tighter">{stat.count}</div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</span>
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${stat.bg} ${stat.text}`}>{stat.trend}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Intelligence search & Filter */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/50 p-6 rounded-[2.5rem] backdrop-blur-md border border-white shadow-xl">
                <div className="relative w-full md:max-w-md group">
                    <SearchInput
                        placeholder="Scan for identifiers, names or connectivity..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onSearch={() => { }}
                    />
                </div>
                <div className="flex items-center gap-3">
                    <button className="p-4 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-indigo-600 transition-colors shadow-sm">
                        <Globe className="w-5 h-5" />
                    </button>
                    <button className="px-6 py-3.5 bg-white border-2 border-slate-100 rounded-2xl text-slate-500 font-bold text-xs uppercase tracking-widest shadow-sm hover:border-slate-300 transition-all">
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
                <DialogContent className="sm:max-w-3xl rounded-md p-0 overflow-hidden border-none shadow-3xl">
                    <div className="bg-linear-to-br from-indigo-600 to-indigo-800 p-8 text-white relative">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Users className="w-32 h-32 rotate-12" />
                        </div>
                        <DialogHeader>
                            <DialogTitle className="text-3xl font-black tracking-tight">{isEditing ? "Update Employee" : "Create New Employee"}</DialogTitle>
                            <DialogDescription className="text-indigo-100 font-medium">
                                {isEditing
                                    ? "Updating core intelligence parameters for this individual."
                                    : "Establishing new workspace presence within the ecosystem."}
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    <div className="p-8 bg-slate-50 max-h-[75vh] overflow-y-auto">
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
