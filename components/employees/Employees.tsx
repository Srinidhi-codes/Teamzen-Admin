"use client";
import { useState } from "react";
import { Plus, Edit, Trash2, Mail, Phone, Download } from "lucide-react";
import { Column } from "../admin/DataTable";
import { DataTable } from "../common/DataTable";
import { Employee } from "@/types/admin";

// Mock data - replace with actual API calls
const mockEmployees: Employee[] = [
    {
        id: 1,
        employee_id: "EMP001",
        first_name: "John",
        last_name: "Doe",
        email: "john.doe@company.com",
        phone_number: "9876543210",
        date_of_birth: "1990-05-15",
        gender: "Male",
        department: "Engineering",
        designation: "Senior Developer",
        employment_type: "Full-time",
        date_of_joining: "2020-01-15",
        manager: "Jane Smith",
        role: "employee",
        is_active: true,
        office_location: "Bangalore",
    },
    {
        id: 2,
        employee_id: "EMP002",
        first_name: "Jane",
        last_name: "Smith",
        email: "jane.smith@company.com",
        phone_number: "9876543211",
        date_of_birth: "1988-08-22",
        gender: "Female",
        department: "Engineering",
        designation: "Engineering Manager",
        employment_type: "Full-time",
        date_of_joining: "2018-03-10",
        manager: "CEO",
        role: "manager",
        is_active: true,
        office_location: "Bangalore",
    },
    {
        id: 3,
        employee_id: "EMP003",
        first_name: "Mike",
        last_name: "Johnson",
        email: "mike.johnson@company.com",
        phone_number: "9876543212",
        date_of_birth: "1992-11-30",
        gender: "Male",
        department: "Sales",
        designation: "Sales Executive",
        employment_type: "Full-time",
        date_of_joining: "2021-06-01",
        manager: "Sarah Williams",
        role: "employee",
        is_active: true,
        office_location: "Mumbai",
    },
];

export default function EmployeesPage() {
    const [employees] = useState<Employee[]>(mockEmployees);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);

    const columns: Column<Employee>[] = [
        {
            key: "employee_id",
            label: "Employee ID",
            sortable: true,
        },
        {
            key: "first_name",
            label: "Name",
            sortable: true,
            render: (employee) => (
                <div>
                    <div className="font-medium text-gray-900">
                        {employee.first_name} {employee.last_name}
                    </div>
                    <div className="text-sm text-gray-500">{employee.designation}</div>
                </div>
            ),
        },
        {
            key: "email",
            label: "Contact",
            render: (employee) => (
                <div>
                    <div className="flex items-center text-sm text-gray-900">
                        <Mail className="w-4 h-4 mr-1" />
                        {employee.email}
                    </div>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                        <Phone className="w-4 h-4 mr-1" />
                        {employee.phone_number}
                    </div>
                </div>
            ),
        },
        {
            key: "department",
            label: "Department",
            sortable: true,
            render: (employee) => (
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800">
                    {employee.department}
                </span>
            ),
        },
        {
            key: "employment_type",
            label: "Type",
            sortable: true,
        },
        {
            key: "is_active",
            label: "Status",
            sortable: true,
            render: (employee) => (
                <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${employee.is_active
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                        }`}
                >
                    {employee.is_active ? "Active" : "Inactive"}
                </span>
            ),
        },
        {
            key: "actions",
            label: "Actions",
            render: (employee) => (
                <div className="flex space-x-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEmployee(employee);
                        }}
                        className="text-indigo-600 hover:text-indigo-900"
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                    <button
                        onClick={(e) => {
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
                        onClick={() => setShowAddModal(true)}
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
                    <div className="mt-2 text-3xl font-bold text-gray-900">{employees.length}</div>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="text-sm font-medium text-gray-600">Active</div>
                    <div className="mt-2 text-3xl font-bold text-green-600">
                        {employees.filter((e) => e.is_active).length}
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="text-sm font-medium text-gray-600">Departments</div>
                    <div className="mt-2 text-3xl font-bold text-indigo-600">
                        {new Set(employees.map((e) => e.department)).size}
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
                data={employees}
                columns={columns}
                searchPlaceholder="Search by name, email, or employee ID..."
                onRowClick={(employee) => setSelectedEmployee(employee)}
            />

            {/* Add Employee Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Add New Employee</h2>
                        <form className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        First Name *
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Last Name *
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email *
                                    </label>
                                    <input
                                        type="email"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Phone Number *
                                    </label>
                                    <input
                                        type="tel"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Department *
                                    </label>
                                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                        <option value="">Select Department</option>
                                        <option value="Engineering">Engineering</option>
                                        <option value="Sales">Sales</option>
                                        <option value="Marketing">Marketing</option>
                                        <option value="HR">HR</option>
                                        <option value="Finance">Finance</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Designation *
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Date of Joining *
                                    </label>
                                    <input
                                        type="date"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Employment Type *
                                    </label>
                                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                        <option value="">Select Type</option>
                                        <option value="Full-time">Full-time</option>
                                        <option value="Part-time">Part-time</option>
                                        <option value="Contract">Contract</option>
                                        <option value="Intern">Intern</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                >
                                    Add Employee
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}