"use client"
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Download, Calendar } from "lucide-react";

const employeeData = [
    { month: "Jan", headcount: 200, new: 15, left: 5 },
    { month: "Feb", headcount: 215, new: 18, left: 3 },
    { month: "Mar", headcount: 225, new: 12, left: 2 },
    { month: "Apr", headcount: 235, new: 14, left: 4 },
    { month: "May", headcount: 240, new: 10, left: 5 },
    { month: "Jun", headcount: 248, new: 13, left: 5 },
];

const attendanceData = [
    { day: "Mon", present: 235, absent: 13, late: 8 },
    { day: "Tue", present: 240, absent: 8, late: 5 },
    { day: "Wed", present: 238, absent: 10, late: 6 },
    { day: "Thu", present: 242, absent: 6, late: 4 },
    { day: "Fri", present: 230, absent: 18, late: 12 },
];

const leaveTypeData = [
    { name: "Sick Leave", value: 145, color: "#EF4444" },
    { name: "Casual Leave", value: 220, color: "#F59E0B" },
    { name: "Earned Leave", value: 180, color: "#10B981" },
    { name: "Maternity", value: 25, color: "#8B5CF6" },
    { name: "Paternity", value: 15, color: "#06B6D4" },
];

const payrollData = [
    { month: "Jan", gross: 12500000, deductions: 1800000, net: 10700000 },
    { month: "Feb", gross: 12800000, deductions: 1850000, net: 10950000 },
    { month: "Mar", gross: 13200000, deductions: 1900000, net: 11300000 },
    { month: "Apr", gross: 13500000, deductions: 1950000, net: 11550000 },
    { month: "May", gross: 13800000, deductions: 2000000, net: 11800000 },
    { month: "Jun", gross: 14200000, deductions: 2050000, net: 12150000 },
];

export default function ReportsPage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
                    <p className="text-gray-600 mt-1">Comprehensive insights and data analysis</p>
                </div>
                <div className="flex space-x-3">
                    <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                        <Calendar className="w-4 h-4 mr-2" />
                        Date Range
                    </button>
                    <button className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                        <Download className="w-4 h-4 mr-2" />
                        Export All
                    </button>
                </div>
            </div>

            {/* Analytics Background */}
            <div className="relative h-32 rounded-lg overflow-hidden">
                <img
                    src="https://mgx-backend-cdn.metadl.com/generate/images/429316/2026-01-16/048ca731-ac81-4cb7-971d-735ed858f6f0.png"
                    alt="Analytics"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/70 to-transparent flex items-center">
                    <div className="px-8 text-white">
                        <h2 className="text-xl font-bold">Data-Driven Insights</h2>
                        <p className="mt-1 text-sm">Make informed decisions with real-time analytics</p>
                    </div>
                </div>
            </div>

            {/* Employee Reports */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Employee Headcount Trends</h3>
                    <button className="text-sm text-indigo-600 hover:text-indigo-800">
                        <Download className="w-4 h-4 inline mr-1" />
                        Export
                    </button>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={employeeData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="headcount" stroke="#4F46E5" strokeWidth={2} name="Total Employees" />
                        <Line type="monotone" dataKey="new" stroke="#10B981" strokeWidth={2} name="New Hires" />
                        <Line type="monotone" dataKey="left" stroke="#EF4444" strokeWidth={2} name="Exits" />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Attendance & Leave Reports */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Attendance Report */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Weekly Attendance</h3>
                        <button className="text-sm text-indigo-600 hover:text-indigo-800">
                            <Download className="w-4 h-4 inline mr-1" />
                            Export
                        </button>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={attendanceData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="day" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="present" fill="#10B981" name="Present" />
                            <Bar dataKey="late" fill="#F59E0B" name="Late" />
                            <Bar dataKey="absent" fill="#EF4444" name="Absent" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Leave Type Distribution */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Leave Type Distribution</h3>
                        <button className="text-sm text-indigo-600 hover:text-indigo-800">
                            <Download className="w-4 h-4 inline mr-1" />
                            Export
                        </button>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={leaveTypeData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {leaveTypeData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Payroll Report */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Payroll Trends (₹)</h3>
                    <button className="text-sm text-indigo-600 hover:text-indigo-800">
                        <Download className="w-4 h-4 inline mr-1" />
                        Export
                    </button>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={payrollData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value: number) => `₹${(value / 1000000).toFixed(2)}M`} />
                        <Legend />
                        <Bar dataKey="gross" fill="#4F46E5" name="Gross Salary" />
                        <Bar dataKey="deductions" fill="#EF4444" name="Deductions" />
                        <Bar dataKey="net" fill="#10B981" name="Net Salary" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Report Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h4 className="text-sm font-medium text-gray-600 mb-2">Turnover Rate</h4>
                    <p className="text-3xl font-bold text-gray-900">2.8%</p>
                    <p className="text-sm text-green-600 mt-2">↓ 0.5% from last quarter</p>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h4 className="text-sm font-medium text-gray-600 mb-2">Avg Leave Days/Employee</h4>
                    <p className="text-3xl font-bold text-gray-900">12.5</p>
                    <p className="text-sm text-gray-500 mt-2">Per year</p>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h4 className="text-sm font-medium text-gray-600 mb-2">Avg Salary</h4>
                    <p className="text-3xl font-bold text-gray-900">₹57,258</p>
                    <p className="text-sm text-blue-600 mt-2">↑ ₹2,500 from last month</p>
                </div>
            </div>
        </div>
    );
}