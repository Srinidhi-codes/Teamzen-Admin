"use client";

import { useCSVExport } from "@/lib/hooks/useCSVExport";
import { CSVColumn } from "@/lib/utils/csvExport";

import { useState, useEffect } from "react";
import {
    Edit,
    Mail,
    Phone,
    Download,
    UserPlus,
    ShieldCheck,
    Globe,
    UserX,
    Users,
    Building2,
    UserCheck as UserCheckIcon,
    RotateCcw
} from "lucide-react";

import { Stat } from "@/components/common/Stats";

import { User } from "@/lib/graphql/users/types";
import { useGraphQLUsers, useGraphQLUserStatusMutations } from "@/lib/graphql/users/userHook";
import { useDebounce } from "@/lib/hooks/useDebounce";
import EmployeeForm from "./EmployeeForm";
import EmployeeCard from "./EmployeeCard";
import { PaginationControls } from "../common/PaginationControls";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { SearchInput } from "@/components/common/SearchInput";
import Image from "next/image";

export default function EmployeesPage() {
    const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    const pageSize = 12; // Increased for better grid layout
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    const { users, total, isUsersLoading, refetchUsers } = useGraphQLUsers({
        page: currentPage,
        pageSize: pageSize,
        filters: {
            search: debouncedSearchTerm
        }
    });
    const { updateUserStatus, isUpdatingUserStatus } = useGraphQLUserStatusMutations();
    const { exportData } = useCSVExport<User>();

    const handleStatusToggle = async (userId: string, newStatus: boolean) => {
        try {
            await updateUserStatus({ userId, isActive: newStatus });
            refetchUsers();
        } catch (err) {
            console.error("Error updating user status:", err);
        }
    };

    const isEditing = !!selectedEmployee;

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

    // Define CSV columns for employee export
    const employeeCSVColumns: CSVColumn<User>[] = [
        { header: "Employee ID", accessor: "employeeId" },
        { header: "First Name", accessor: "firstName" },
        { header: "Last Name", accessor: "lastName" },
        { header: "Email", accessor: "email" },
        { header: "Phone Number", accessor: "phoneNumber" },
        { header: "Department", accessor: "department.name" },
        { header: "Designation", accessor: "designation.name" },
        { header: "Organization", accessor: "organization.name" },
        {
            header: "Employment Type",
            accessor: "employmentType",
            formatter: (value) => value?.replace('_', ' ').toUpperCase() || ""
        },
        {
            header: "Role",
            accessor: (value) => value?.role?.toUpperCase() || ""
        },
        {
            header: "Status",
            accessor: (user) => user.isActive ? "Active" : "Inactive"
        },
        { header: "Date of Joining", accessor: "dateOfJoining" },
        { header: "Date of Birth", accessor: "dateOfBirth" },
        {
            header: "Manager",
            accessor: (user) => user.manager
                ? `${user.manager.firstName} ${user.manager.lastName}`
                : ""
        },
        { header: "Bank Account Number", accessor: "bankAccountNumber" },
        { header: "Bank IFSC Code", accessor: "bankIfscCode" },
        { header: "PAN Number", accessor: "panNumber" },
        { header: "Aadhar Number", accessor: "aadharNumber" },
        { header: "UAN Number", accessor: "uanNumber" }
    ];

    const handleExportCSV = () => {
        exportData(users || [], employeeCSVColumns, {
            filename: "employees",
            includeTimestamp: true
        });
    };

    const statsList = [
        {
            label: "Total Employees",
            value: total || 0,
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

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Executive Summary */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex flex-col lg:flex-row justify-between items-center gap-10 pl-5">
                    <div className="relative">
                        <div className="absolute -left-4 top-0 w-1 h-full bg-primary rounded-full shadow-sm shadow-primary/20" />
                        <h1 className="text-3xl font-black text-foreground tracking-tight">Employee Ecosystem</h1>
                        <p className="text-premium-label mt-2 opacity-60">Powering the heartbeat of our organizational intelligence.</p>
                    </div>
                </div>


                <div className="flex flex-wrap items-center gap-4">
                    <button
                        onClick={handleExportCSV}
                        className="btn-secondary flex items-center gap-3"
                    >
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
                    <button
                        onClick={() => refetchUsers()}
                        className="p-3.5 bg-muted/50 hover:bg-primary/10 hover:text-primary border border-border rounded-2xl transition-all active:rotate-180 duration-500"
                        title="Synchronize Data"
                    >
                        <RotateCcw className="w-5 h-5" />
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
                        onChange={setSearchTerm}
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

            {/* Main Repository - Card Grid */}
            <div className="space-y-6">
                {isUsersLoading ? (
                    <div className="flex flex-col items-center justify-center py-32 space-y-6">
                        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                        <p className="text-premium-label animate-pulse">Synchronizing Data Matrix...</p>
                    </div>
                ) : users && users.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {users.map((employee) => (
                                <EmployeeCard
                                    key={employee.id}
                                    employee={employee}
                                    onEdit={handleEdit}
                                    onStatusToggle={handleStatusToggle}
                                />
                            ))}
                        </div>

                        <PaginationControls
                            total={total || 0}
                            currentPage={currentPage}
                            pageSize={pageSize}
                            onPageChange={setCurrentPage}
                            paginationLabel="talent"
                        />
                    </>
                ) : (
                    <div className="premium-card text-center max-w-2xl mx-auto py-16 animate-in zoom-in-95 duration-500">
                        <div className="w-24 h-24 bg-muted rounded-[3rem] flex items-center justify-center mx-auto mb-8 shadow-inner border border-border/50">
                            <svg className="w-12 h-12 text-muted-foreground/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                        </div>
                        <h3 className="text-premium-h2 mb-2">Zero Identifiers Detected</h3>
                        <p className="text-muted-foreground font-medium leading-relaxed max-w-sm mx-auto">The requested data set is currently empty or doesn't match the current filters.</p>
                    </div>
                )}
            </div>

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
                            key={selectedEmployee?.id || "new-employee"}
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
