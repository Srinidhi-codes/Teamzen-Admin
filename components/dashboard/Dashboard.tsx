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
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-foreground tracking-tight">Admin Dashboard</h1>
                    <p className="text-muted-foreground font-medium mt-1">Welcome back! Here's what's happening today.</p>
                </div>
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest bg-muted px-3 py-1 rounded-lg">
                    Last updated: {new Date().toLocaleString()}
                </div>
            </div>


            {/* Hero Section */}
            <div className="relative h-56 rounded-4xl overflow-hidden border border-primary/20 shadow-2xl shadow-primary/10 group">
                <img
                    src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200"
                    alt="Admin Dashboard"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-linear-to-r from-background via-background/60 to-transparent flex items-center">
                    <div className="px-12 max-w-lg">
                        <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground mb-4 shadow-lg shadow-primary/30">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <h2 className="text-3xl font-black text-foreground tracking-tight leading-tight">HRMS Control Center</h2>
                        <p className="mt-3 text-muted-foreground font-medium text-lg italic">"Operational excellence is the precursor to organizational success."</p>
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
                <div className="bg-card rounded-4xl border border-border p-8 shadow-xl shadow-primary/5 hover:shadow-primary/10 transition-shadow">
                    <h3 className="text-xl font-black text-foreground mb-6 uppercase tracking-tight flex items-center gap-2">
                        <div className="w-1.5 h-6 bg-primary rounded-full" />
                        Employee Growth
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={employeeGrowthData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                            <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
                            <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                            <Tooltip
                                contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '12px', color: 'var(--foreground)' }}
                                itemStyle={{ color: 'var(--primary)' }}
                            />
                            <Legend />
                            <Line type="monotone" dataKey="employees" stroke="var(--primary)" strokeWidth={4} dot={{ r: 6, fill: 'var(--primary)' }} activeDot={{ r: 8, strokeWidth: 0 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Department Distribution */}
                <div className="bg-card rounded-4xl border border-border p-8 shadow-xl shadow-primary/5 hover:shadow-primary/10 transition-shadow">
                    <h3 className="text-xl font-black text-foreground mb-6 uppercase tracking-tight flex items-center gap-2">
                        <div className="w-1.5 h-6 bg-primary rounded-full" />
                        Departmental Hub
                    </h3>

                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={departmentData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {departmentData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '12px' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>


            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Leave Trends */}
                <div className="bg-card rounded-4xl border border-border p-8 shadow-xl shadow-primary/5 hover:shadow-primary/10 transition-shadow">
                    <h3 className="text-xl font-black text-foreground mb-6 uppercase tracking-tight flex items-center gap-2">
                        <div className="w-1.5 h-6 bg-primary rounded-full" />
                        Leave Request Flux
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={leaveData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                            <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
                            <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                            <Tooltip
                                contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '12px' }}
                            />
                            <Legend />
                            <Bar dataKey="approved" fill="#10B981" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="rejected" fill="#EF4444" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="pending" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>


                {/* Recent Activities */}
                <div className="bg-card rounded-4xl border border-border p-8 shadow-xl shadow-primary/5 hover:shadow-primary/10 transition-shadow">
                    <h3 className="text-xl font-black text-foreground mb-6 uppercase tracking-tight flex items-center gap-2">
                        <div className="w-1.5 h-6 bg-primary rounded-full" />
                        Activity Stream
                    </h3>
                    <div className="space-y-4">
                        {recentActivities.map((activity) => (
                            <div key={activity.id} className="flex items-start space-x-4 p-4 rounded-2xl hover:bg-muted/50 transition-colors group">
                                <div className="shrink-0 w-2.5 h-2.5 mt-2 bg-primary rounded-full shadow-lg shadow-primary/50 group-hover:animate-pulse"></div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-foreground">
                                        <span className="font-black text-primary">{activity.user}</span> <span className="text-muted-foreground font-medium">{activity.action}</span>
                                    </p>
                                    <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest mt-1.5 flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {activity.time}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>


            {/* Quick Actions */}
            <div className="bg-card rounded-4xl border border-border p-8 shadow-xl shadow-primary/5">
                <h3 className="text-xl font-black text-foreground mb-8 uppercase tracking-tight flex items-center gap-2">
                    <div className="w-1.5 h-6 bg-primary rounded-full" />
                    Strategic Actions
                </h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    <button className="group p-6 border border-border rounded-3xl hover:border-primary/50 hover:bg-primary/5 transition-all duration-500 text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-2 opacity-5 translate-x-1 translate-y-[-1] group-hover:translate-x-0 group-hover:translate-y-0 transition-transform">
                            <Users className="w-12 h-12" />
                        </div>
                        <div className="w-12 h-12 mx-auto bg-blue-500/10 text-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-inner">
                            <Users className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-black text-foreground uppercase tracking-widest">Add Employee</span>
                    </button>
                    <button className="group p-6 border border-border rounded-3xl hover:border-primary/50 hover:bg-primary/5 transition-all duration-500 text-center relative overflow-hidden">
                        <div className="w-12 h-12 mx-auto bg-emerald-500/10 text-emerald-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-inner">
                            <Calendar className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-black text-foreground uppercase tracking-widest">Approve Leaves</span>
                    </button>
                    <button className="group p-6 border border-border rounded-3xl hover:border-primary/50 hover:bg-primary/5 transition-all duration-500 text-center relative overflow-hidden">
                        <div className="w-12 h-12 mx-auto bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-inner">
                            <DollarSign className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-black text-foreground uppercase tracking-widest">Run Payroll</span>
                    </button>
                    <button className="group p-6 border border-border rounded-3xl hover:border-primary/50 hover:bg-primary/5 transition-all duration-500 text-center relative overflow-hidden">
                        <div className="w-12 h-12 mx-auto bg-amber-500/10 text-amber-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-inner">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-black text-foreground uppercase tracking-widest">View Reports</span>
                    </button>
                </div>
            </div>

        </div>
    );
}