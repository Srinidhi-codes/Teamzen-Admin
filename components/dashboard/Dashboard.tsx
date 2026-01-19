'use client'
import { Users, UserCheck, Calendar, Clock, DollarSign, TrendingUp } from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { StatsCard } from "../admin/StatsCard";

// Mock data - replace with actual API calls
const stats = {
    total_employees: 248,
    active_employees: 235,
    pending_leave_approvals: 12,
    today_attendance_rate: 94.5,
    pending_payroll_runs: 1,
    pending_reviews: 8,
};

const employeeGrowthData = [
    { month: "Jan", employees: 200 },
    { month: "Feb", employees: 215 },
    { month: "Mar", employees: 225 },
    { month: "Apr", employees: 235 },
    { month: "May", employees: 240 },
    { month: "Jun", employees: 248 },
];

const departmentData = [
    { name: "Engineering", value: 85, color: "#4F46E5" },
    { name: "Sales", value: 52, color: "#10B981" },
    { name: "Marketing", value: 38, color: "#F59E0B" },
    { name: "HR", value: 25, color: "#EF4444" },
    { name: "Finance", value: 28, color: "#8B5CF6" },
    { name: "Operations", value: 20, color: "#06B6D4" },
];

const leaveData = [
    { month: "Jan", approved: 45, rejected: 5, pending: 8 },
    { month: "Feb", approved: 52, rejected: 3, pending: 6 },
    { month: "Mar", approved: 48, rejected: 4, pending: 10 },
    { month: "Apr", approved: 55, rejected: 2, pending: 7 },
    { month: "May", approved: 60, rejected: 6, pending: 9 },
    { month: "Jun", approved: 58, rejected: 4, pending: 12 },
];

const recentActivities = [
    { id: 1, user: "John Doe", action: "submitted leave request", time: "2 hours ago" },
    { id: 2, user: "Jane Smith", action: "updated profile", time: "3 hours ago" },
    { id: 3, user: "Mike Johnson", action: "checked in", time: "4 hours ago" },
    { id: 4, user: "Sarah Williams", action: "completed performance review", time: "5 hours ago" },
    { id: 5, user: "Admin", action: "processed payroll for June", time: "1 day ago" },
];

export default function AdminDashboard() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                    <p className="text-gray-600 mt-1">Welcome back! Here's what's happening today.</p>
                </div>
                <div className="text-sm text-gray-600">
                    Last updated: {new Date().toLocaleString()}
                </div>
            </div>

            {/* Hero Image */}
            <div className="relative h-48 rounded-lg overflow-hidden">
                <img
                    src="https://mgx-backend-cdn.metadl.com/generate/images/429316/2026-01-16/374f44ac-712d-4b97-b5c1-c91e69449ed7.png"
                    alt="Admin Dashboard"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-r from-indigo-900/80 to-transparent flex items-center">
                    <div className="px-8 text-white">
                        <h2 className="text-2xl font-bold">HRMS Control Center</h2>
                        <p className="mt-2">Manage your entire workforce from one place</p>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatsCard
                    title="Total Employees"
                    value={stats.total_employees}
                    icon={Users}
                    color="blue"
                    trend={{ value: "+3.2% from last month", isPositive: true }}
                />
                <StatsCard
                    title="Active Today"
                    value={stats.active_employees}
                    icon={UserCheck}
                    color="green"
                    trend={{ value: `${stats.today_attendance_rate}% attendance`, isPositive: true }}
                />
                <StatsCard
                    title="Pending Leave Approvals"
                    value={stats.pending_leave_approvals}
                    icon={Calendar}
                    color="yellow"
                />
                <StatsCard
                    title="Attendance Rate"
                    value={`${stats.today_attendance_rate}%`}
                    icon={Clock}
                    color="green"
                />
                <StatsCard
                    title="Pending Payroll"
                    value={stats.pending_payroll_runs}
                    icon={DollarSign}
                    color="purple"
                />
                <StatsCard
                    title="Pending Reviews"
                    value={stats.pending_reviews}
                    icon={TrendingUp}
                    color="red"
                />
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Employee Growth Chart */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Employee Growth</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={employeeGrowthData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="employees" stroke="#4F46E5" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Department Distribution */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={departmentData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {departmentData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Leave Trends */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Leave Request Trends</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={leaveData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="approved" fill="#10B981" />
                            <Bar dataKey="rejected" fill="#EF4444" />
                            <Bar dataKey="pending" fill="#F59E0B" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Recent Activities */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
                    <div className="space-y-4">
                        {recentActivities.map((activity) => (
                            <div key={activity.id} className="flex items-start space-x-3 pb-3 border-b border-gray-100 last:border-0">
                                <div className="flex-shrink-0 w-2 h-2 mt-2 bg-indigo-500 rounded-full"></div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-gray-900">
                                        <span className="font-medium">{activity.user}</span> {activity.action}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button className="p-4 border-2 border-indigo-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition text-center">
                        <Users className="w-8 h-8 mx-auto text-indigo-600 mb-2" />
                        <span className="text-sm font-medium text-gray-900">Add Employee</span>
                    </button>
                    <button className="p-4 border-2 border-green-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition text-center">
                        <Calendar className="w-8 h-8 mx-auto text-green-600 mb-2" />
                        <span className="text-sm font-medium text-gray-900">Approve Leaves</span>
                    </button>
                    <button className="p-4 border-2 border-purple-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition text-center">
                        <DollarSign className="w-8 h-8 mx-auto text-purple-600 mb-2" />
                        <span className="text-sm font-medium text-gray-900">Run Payroll</span>
                    </button>
                    <button className="p-4 border-2 border-orange-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition text-center">
                        <TrendingUp className="w-8 h-8 mx-auto text-orange-600 mb-2" />
                        <span className="text-sm font-medium text-gray-900">View Reports</span>
                    </button>
                </div>
            </div>
        </div>
    );
}