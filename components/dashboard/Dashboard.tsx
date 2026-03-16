'use client'
import { Users, UserCheck, Calendar, Clock, DollarSign, TrendingUp, Cake, Gift, PartyPopper, Star, Award, UserPlus, ArrowRight } from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { StatsCard } from "../admin/StatsCard";
import { useQuery } from "@apollo/client/react";
import { GET_ADMIN_DASHBOARD_STATS } from "@/lib/graphql/dashboard/queries";
import moment from "moment";
import Image from "next/image";
import Link from "next/link";
import { useStore } from "@/lib/store/useStore";

export default function AdminDashboard() {
    const { data, loading, error } = useQuery(GET_ADMIN_DASHBOARD_STATS);
    const { user } = useStore();

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                <p className="text-muted-foreground font-medium animate-pulse">Loading Analytics...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 bg-red-500/10 border border-red-500/20 rounded-4xl text-center">
                <p className="text-red-500 font-bold">Failed to load dashboard data. Please try again.</p>
            </div>
        );
    }

    const stats = (data as any)?.adminDashboardStats || {};
    const employeeGrowthData = stats.employeeGrowth || [];
    const departmentData = stats.departmentDistribution || [];
    const leaveData = stats.leaveFlux || [];
    const recentActivities = stats.recentActivities || [];
    const upcomingEvents = stats.upcomingEvents || [];
    const wishMessage = stats.wishMessage;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">Admin Dashboard</h1>
                    <p className="text-muted-foreground font-medium mt-1 text-sm sm:text-base">Welcome back! Here's what's happening today.</p>
                </div>
                <div className="w-fit text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-muted px-3 py-1.5 rounded-lg border border-border/50">
                    Last updated: {new Date().toLocaleString()}
                </div>
            </div>

            {/* Wish Message Banner */}
            {wishMessage && (
                <div className="relative overflow-hidden bg-linear-to-r from-primary/20 via-primary/10 to-transparent border border-primary/30 rounded-3xl sm:rounded-4xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 animate-in slide-in-from-top-4 duration-1000">
                    <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                        <PartyPopper className="w-32 h-32 rotate-12" />
                    </div>
                    <div className="shrink-0 w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/30">
                        <Cake className="w-7 h-7" />
                    </div>
                    <div className="relative z-10 text-center sm:text-left">
                        <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight mb-1">Congratulations!</h2>
                        <p className="text-base sm:text-lg font-medium text-muted-foreground">{wishMessage}</p>
                    </div>
                </div>
            )}


            {/* Hero Section */}
            <div className="relative h-48 sm:h-56 rounded-3xl sm:rounded-4xl overflow-hidden border border-primary/20 shadow-2xl shadow-primary/10 group">
                <img
                    src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200"
                    alt="Admin Dashboard"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-linear-to-r from-background via-background/60 sm:to-transparent flex items-center">
                    <div className="px-6 sm:px-12 max-w-lg">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground mb-4 shadow-lg shadow-primary/30">
                            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight leading-tight">HRMS Control Center</h2>
                        <p className="mt-2 sm:mt-3 text-muted-foreground font-medium text-base sm:text-lg italic">"Operational excellence is the precursor to organizational success."</p>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatsCard
                    title="Total Employees"
                    value={stats.totalEmployees}
                    icon={Users}
                    color="blue"
                />
                <StatsCard
                    title="Active Employees"
                    value={stats.activeEmployees}
                    icon={UserCheck}
                    color="green"
                />
                <StatsCard
                    title="Pending Leave Approvals"
                    value={stats.pendingLeaveApprovals}
                    icon={Calendar}
                    color="yellow"
                />
                <StatsCard
                    title="Attendance Rate"
                    value={`${stats.todayAttendanceRate}%`}
                    icon={Clock}
                    color="green"
                />
                <StatsCard
                    title="Pending Payroll"
                    value={0}
                    icon={DollarSign}
                    color="purple"
                />
                <StatsCard
                    title="Pending Reviews"
                    value={0}
                    icon={TrendingUp}
                    color="red"
                />
            </div>


            {/* Charts Row 1 */}
            {user?.role !== "manager" && <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Employee Growth Chart */}
                <div className="bg-card rounded-3xl sm:rounded-4xl border border-border p-4 sm:p-8 shadow-xl shadow-primary/5 hover:shadow-primary/10 transition-shadow">
                    <h3 className="text-lg sm:text-xl font-black text-foreground mb-6 uppercase tracking-tight flex items-center gap-2">
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
                            <Line type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={4} dot={{ r: 6, fill: 'var(--primary)' }} activeDot={{ r: 8, strokeWidth: 0 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Department Distribution */}
                <div className="bg-card rounded-3xl sm:rounded-4xl border border-border p-4 sm:p-8 shadow-xl shadow-primary/5 hover:shadow-primary/10 transition-shadow">
                    <h3 className="text-lg sm:text-xl font-black text-foreground mb-6 uppercase tracking-tight flex items-center gap-2">
                        <div className="w-1.5 h-6 bg-primary rounded-full" />
                        Departmental Hub
                    </h3>

                    <div className="h-[300px] w-full">
                        {departmentData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
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
                                        {departmentData.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '12px', color: 'var(--card-foreground)' }}
                                        itemStyle={{ color: 'var(--primary)' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 animate-in fade-in zoom-in duration-700">
                                <div className="p-4 rounded-full bg-muted/20 border border-border/50 shadow-inner">
                                    <Users className="w-10 h-10 text-muted-foreground/40" />
                                </div>
                                <p className="text-sm text-muted-foreground font-medium tracking-wide">No departmental data available</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>}


            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Leave Trends */}
                <div className="bg-card rounded-3xl sm:rounded-4xl border border-border p-4 sm:p-8 shadow-xl shadow-primary/5 hover:shadow-primary/10 transition-shadow">
                    <h3 className="text-lg sm:text-xl font-black text-foreground mb-6 uppercase tracking-tight flex items-center gap-2">
                        <div className="w-1.5 h-6 bg-primary rounded-full" />
                        Leave Request Flux
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={leaveData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                            <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
                            <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                            <Tooltip
                                contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '12px', color: 'var(--card-foreground)' }}
                                itemStyle={{ color: 'var(--card-foreground)' }}
                            />
                            <Legend />
                            <Bar dataKey="approved" fill="#10B981" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="rejected" fill="#EF4444" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="pending" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>


                {/* Recent Activities */}
                <div className="bg-card rounded-3xl sm:rounded-4xl border border-border p-4 sm:p-8 shadow-xl shadow-primary/5 hover:shadow-primary/10 transition-shadow">
                    <h3 className="text-lg sm:text-xl font-black text-foreground mb-6 uppercase tracking-tight flex items-center gap-2">
                        <div className="w-1.5 h-6 bg-primary rounded-full" />
                        Activity Stream
                    </h3>
                    <div className="space-y-4">
                        {recentActivities.length > 0 ? (
                            recentActivities.map((activity: any) => (
                                <div key={activity.id} className="flex items-start space-x-4 p-4 rounded-2xl hover:bg-muted/50 transition-colors group">
                                    <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform ${activity.action.includes("joined") ? "bg-blue-500/10 text-blue-600" :
                                        activity.action.includes("celebrates") ? "bg-amber-500/10 text-amber-600" :
                                            activity.action.includes("requested") ? "bg-purple-500/10 text-purple-600" :
                                                "bg-primary/10 text-primary"
                                        }`}>
                                        {activity.action.includes("joined") ? <UserPlus className="w-5 h-5" /> :
                                            activity.action.includes("celebrates") ? <Award className="w-5 h-5" /> :
                                                activity.action.includes("leave") ? <Calendar className="w-5 h-5" /> :
                                                    <Clock className="w-5 h-5" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-foreground">
                                            <span className="font-black text-primary">{activity.user}</span> <span className="text-muted-foreground font-medium">{activity.action}</span>
                                        </p>
                                        <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest mt-1.5 flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {moment(activity.time).fromNow()}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
                                <Clock className="w-12 h-12 text-muted-foreground/30" />
                                <p className="text-sm text-muted-foreground font-medium">No recent activities found</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-col gap-6 lg:flex-row">
                    {/* Upcoming Celebrations */}
                    <div className="w-full h-full bg-card rounded-3xl sm:rounded-4xl border border-border p-4 sm:p-8 shadow-xl shadow-primary/5 hover:shadow-primary/10 transition-shadow">
                        <h3 className="text-lg sm:text-xl font-black text-foreground mb-6 uppercase tracking-tight flex items-center gap-2">
                            <div className="w-1.5 h-6 bg-amber-500 rounded-full" />
                            Upcoming Celebrations
                        </h3>
                        <div className="space-y-4">
                            {upcomingEvents.length > 0 ? (
                                upcomingEvents.slice(0, 5).map((event: any) => (
                                    <div key={event.id} className="flex items-center space-x-4 p-4 rounded-2xl bg-muted/30 hover:bg-muted/50 transition-all group">
                                        <div className={`shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner overflow-hidden ${!event.profilePicture ? (event.type === 'birthday' ? 'bg-amber-500/10 text-amber-600' : 'bg-blue-500/10 text-blue-600') : ''
                                            }`}>
                                            {event.profilePicture ? (
                                                <Image
                                                    src={event.profilePicture.startsWith('http') ? event.profilePicture : `${process.env.NEXT_PUBLIC_API_URL || ''}${event.profilePicture}`}
                                                    alt={event.user}
                                                    width={48}
                                                    height={48}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <span className="text-sm font-black uppercase">
                                                    {event.user.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-black text-foreground truncate">{event.user}</p>
                                            <p className="text-xs text-muted-foreground font-medium">
                                                {event.type === 'birthday' ? 'Birthday' : 'Work Anniversary'} • {moment(event.date).format('MMM D')}
                                            </p>
                                        </div>
                                        <div className="shrink-0">
                                            <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-tighter ${event.daysUntil === 0 ? 'bg-red-500 text-white animate-pulse' : 'bg-muted text-muted-foreground'
                                                }`}>
                                                {event.daysUntil === 0 ? 'Today' : `In ${event.daysUntil} days`}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
                                    <Gift className="w-12 h-12 text-muted-foreground/30" />
                                    <p className="text-sm text-muted-foreground font-medium">No upcoming events this month</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Upcoming Team Absences */}
                <div className="w-full h-full bg-card rounded-3xl sm:rounded-4xl border border-border p-4 sm:p-8 shadow-xl shadow-primary/5 hover:shadow-primary/10 mb-10 sm:mb-20">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                        <h3 className="text-lg sm:text-xl font-black text-foreground uppercase tracking-tight flex items-center gap-2">
                            <div className="w-1.5 h-6 bg-primary rounded-full" />
                            Upcoming Absences
                        </h3>
                        <div className="px-4 py-1.5 bg-muted rounded-full">
                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Next 14 Days</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {stats.upcomingLeaves?.length > 0 ? (
                            stats.upcomingLeaves.map((leave: any) => (
                                <div key={leave.id} className="group p-6 bg-muted/20 border border-border/50 rounded-3xl hover:bg-muted/40 hover:border-primary/30 transition-all duration-300">
                                    <div className="flex items-center gap-4 mb-5">
                                        <div className="w-12 h-12 rounded-2xl bg-background border border-border/50 overflow-hidden flex items-center justify-center">
                                            {leave.profilePicture ? (
                                                <Image
                                                    src={leave.profilePicture.startsWith('http') ? leave.profilePicture : `${process.env.NEXT_PUBLIC_API_URL || ''}${leave.profilePicture}`}
                                                    alt={leave.user}
                                                    width={48}
                                                    height={48}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <span className="text-sm font-black text-primary">{leave.user.split(' ').map((n: string) => n[0]).join('')}</span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-black text-foreground truncate">{leave.user}</h4>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest ${leave.status === 'approved' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
                                                    }`}>
                                                    {leave.status}
                                                </span>
                                                <span className="text-[9px] font-bold text-muted-foreground/60 uppercase">{leave.leaveType}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between bg-background/50 p-4 rounded-2xl border border-border/40">
                                        <div className="flex items-center gap-3">
                                            <Calendar className="w-4 h-4 text-primary opacity-40" />
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-foreground flex items-center gap-2">
                                                    {moment(leave.fromDate).format("MMM DD")}
                                                    <ArrowRight className="w-2 h-2 opacity-30" />
                                                    {moment(leave.toDate).format("MMM DD")}
                                                </span>
                                                <span className="text-[9px] font-bold text-muted-foreground uppercase">{leave.duration} Operational Day(s)</span>
                                            </div>
                                        </div>
                                        <Clock className="w-4 h-4 text-primary opacity-20 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full py-16 text-center border-2 border-dashed border-border/50 rounded-4xl">
                                <Calendar className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                                <p className="text-sm text-muted-foreground font-medium italic">Full team presence indicated for the upcoming cycle.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>


            {/* Quick Actions */}
            <div className="bg-card rounded-3xl sm:rounded-4xl border border-border p-6 sm:p-8 shadow-xl shadow-primary/5">
                <h3 className="text-lg sm:text-xl font-black text-foreground mb-8 uppercase tracking-tight flex items-center gap-2">
                    <div className="w-1.5 h-6 bg-primary rounded-full" />
                    Strategic Actions
                </h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    <Link href="/employees" className="group p-6 border border-border rounded-3xl hover:border-primary/50 hover:bg-primary/5 transition-all duration-500 text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-2 opacity-5 translate-x-1 translate-y-[-1] group-hover:translate-x-0 group-hover:translate-y-0 transition-transform">
                            <Users className="w-12 h-12" />
                        </div>
                        <div className="w-12 h-12 mx-auto bg-blue-500/10 text-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-inner">
                            <Users className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-black text-foreground uppercase tracking-widest">Add Employee</span>
                    </Link>
                    <Link href="/leaves" className="group p-6 border border-border rounded-3xl hover:border-primary/50 hover:bg-primary/5 transition-all duration-500 text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-2 opacity-5 translate-x-1 translate-y-[-1] group-hover:translate-x-0 group-hover:translate-y-0 transition-transform">
                            <Calendar className="w-12 h-12" />
                        </div>
                        <div className="w-12 h-12 mx-auto bg-emerald-500/10 text-emerald-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-inner">
                            <Calendar className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-black text-foreground uppercase tracking-widest">Approve Leaves</span>
                    </Link>
                    <Link href="/payroll" className="group p-6 border border-border rounded-3xl hover:border-primary/50 hover:bg-primary/5 transition-all duration-500 text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-2 opacity-5 translate-x-1 translate-y-[-1] group-hover:translate-x-0 group-hover:translate-y-0 transition-transform">
                            <DollarSign className="w-12 h-12" />
                        </div>
                        <div className="w-12 h-12 mx-auto bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-inner">
                            <DollarSign className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-black text-foreground uppercase tracking-widest">Run Payroll</span>
                    </Link>
                    <Link href="/reports" className="group p-4 sm:p-6 border border-border rounded-3xl hover:border-primary/50 hover:bg-primary/5 transition-all duration-500 text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-2 opacity-5 translate-x-1 translate-y-[-1] group-hover:translate-x-0 group-hover:translate-y-0 transition-transform">
                            <TrendingUp className="w-10 h-10 sm:w-12 sm:h-12" />
                        </div>
                        <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto bg-amber-500/10 text-amber-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-inner text-[10px]">
                            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <span className="text-[10px] font-black text-foreground uppercase tracking-widest leading-tight block">View Reports</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
