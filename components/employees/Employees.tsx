"use client";
import { useState } from "react";
import { Plus, Edit, Trash2, Mail, Phone, Download } from "lucide-react";
import { Column, DataTable } from "../admin/DataTable";
import { User } from "@/lib/graphql/users/types";
import { useGraphQLUsers } from "@/lib/graphql/users/userHook";
import EmployeeForm from "./EmployeeForm";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export default function EmployeesPage() {
    const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { users, isUsersLoading, isUsersError, refetchUsers } = useGraphQLUsers();

    // Derived state for modal title
    const isEditing = !!selectedEmployee;

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
        refetchUsers(); // Refresh list after add/update
    };

    const columns: Column<User>[] = [
        {
            key: "id",
            label: "Employee ID",
            sortable: true,
        },
        {
            key: "firstName",
            label: "Name",
            sortable: true,
            render: (user) => (
                <div>
                    <div className="font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                    </div>
                    <div className="text-sm text-gray-500">{user.designation?.name}</div>
                </div>
            ),
        },
        {
            key: "email",
            label: "Contact",
            render: (user) => (
                <div>
                    <div className="flex items-center text-sm text-gray-900">
                        <Mail className="w-4 h-4 mr-1" />
                        {user.email}
                    </div>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                        <Phone className="w-4 h-4 mr-1" />
                        {user.phoneNumber}
                    </div>
                </div>
            ),
        },
        {
            key: "department",
            label: "Department",
            sortable: true,
            render: (user) => (
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800">
                    {user.department?.name}
                </span>
            ),
        },
        {
            key: "employmentType",
            label: "Type",
            sortable: true,
        },
        {
            key: "isActive",
            label: "Status",
            sortable: true,
            render: (user) => (
                <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${user.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                        }`}
                >
                    {user.isActive ? "Active" : "Inactive"}
                </span>
            ),
        },
        {
            key: "actions",
            label: "Actions",
            render: (user) => (
                <div className="flex space-x-2">
                    <button
                        onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            handleEdit(user);
                        }}
                        className="text-indigo-600 hover:text-indigo-900"
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                    <button
                        onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            if (confirm("Are you sure you want to delete this employee?")) {
                                // Handle delete
                            }
                        }}
                        className="text-red-600 hover:text-red-900"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Employee Management</h1>
                    <p className="text-gray-600 mt-1">Manage all employee records and information</p>
                </div>
                <div className="flex space-x-3">
                    <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </button>
                    <button
                        onClick={handleAdd}
                        className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Employee
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="text-sm font-medium text-gray-600">Total Employees</div>
                    <div className="mt-2 text-3xl font-bold text-gray-900">{users?.length || 0}</div>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="text-sm font-medium text-gray-600">Active</div>
                    <div className="mt-2 text-3xl font-bold text-green-600">
                        {users?.filter((e) => e.isActive).length || 0}
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="text-sm font-medium text-gray-600">Departments</div>
                    <div className="mt-2 text-3xl font-bold text-indigo-600">
                        {new Set(users?.map((e) => e.department?.name).filter(Boolean)).size || 0}
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="text-sm font-medium text-gray-600">New This Month</div>
                    <div className="mt-2 text-3xl font-bold text-blue-600">5</div>
                </div>
            </div>

            {/* Employee Icon */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center space-x-4">
                    <img
                        src="https://mgx-backend-cdn.metadl.com/generate/images/429316/2026-01-16/97db9056-15f2-423c-ab7f-50ffe26ff7f2.png"
                        alt="Employee Management"
                        className="w-16 h-16 object-contain"
                    />
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Employee Directory</h3>
                        <p className="text-sm text-gray-600">Complete list of all employees with detailed information</p>
                    </div>
                </div>
            </div>

            {/* Data Table */}
            <DataTable
                data={users || []}
                columns={columns}
                searchPlaceholder="Search by name, email, or employee ID..."
                onRowClick={(employee) => handleEdit(employee)}
            />

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{isEditing ? "Edit Employee" : "Add New Employee"}</DialogTitle>
                        <DialogDescription>
                            {isEditing
                                ? "Make changes to the employee's information here."
                                : "Fill in the details to add a new employee to the system."}
                        </DialogDescription>
                    </DialogHeader>

                    <EmployeeForm
                        initialData={selectedEmployee}
                        onSuccess={handleSuccess}
                        onCancel={handleClose}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}