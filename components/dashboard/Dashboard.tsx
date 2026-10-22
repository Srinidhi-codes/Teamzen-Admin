"use client";

import { useMemo } from "react";
import {
  Users,
  UserCheck,
  Calendar,
  Clock,
  DollarSign,
  TrendingUp,
  Gift,
  UserPlus,
  ArrowRight,
  UserPlus2,
  Banknote,
  Award,
  Sparkles,
  Briefcase,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Activity,
  Layers,
  ArrowUpRight,
} from "lucide-react";
import { PageSkeleton } from "../common/Skeleton";
import { useQuery } from "@apollo/client/react";
import { GET_ADMIN_DASHBOARD_STATS } from "@/lib/graphql/dashboard/queries";
import moment from "moment";
import Image from "next/image";
import Link from "next/link";
import { useStore } from "@/lib/store/useStore";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { EmptyState } from "@/components/common/EmptyState";
import { EmptyImages } from "@/lib/brand-images";

const AdminDashboardCharts = dynamic(
  () =>
    import("@/components/dashboard/AdminDashboardCharts").then((m) => m.AdminDashboardCharts),
  {
    ssr: false,
    loading: () => (
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="h-80 animate-pulse rounded-2xl border border-border bg-muted/40" />
        <div className="h-80 animate-pulse rounded-2xl border border-border bg-muted/40" />
      </div>
    ),
  }
);

type DashboardStatPoint = {
  month: string;
  value: number;
};

type DepartmentDistributionPoint = {
  name: string;
  value: number;
  color: string;
};

type RecentActivity = {
  id: string;
  user: string;
  action: string;
  time: string;
};

type UpcomingEvent = {
  id: string;
  user: string;
  type: string;
  date: string;
  profilePicture?: string | null;
  daysUntil: number;
};

type UpcomingLeave = {
  id: string;
  user: string;
  profilePicture?: string | null;
  leaveType: string;
  fromDate: string;
  toDate: string;
  duration: number;
  status: string;
};

type AdminDashboardStats = {
  totalEmployees: number;
  activeEmployees: number;
  pendingLeaveApprovals: number;
  todayAttendanceRate: number;
  employeeGrowth: DashboardStatPoint[];
  departmentDistribution: DepartmentDistributionPoint[];
  recentActivities: RecentActivity[];
  upcomingEvents: UpcomingEvent[];
  upcomingLeaves: UpcomingLeave[];
  wishMessage?: string | null;
};

type AdminDashboardQuery = {
  adminDashboardStats: AdminDashboardStats;
};

type DayPeriod = "morning" | "noon" | "evening" | "night";

function periodForHour(hour: number): DayPeriod {
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "noon";
  if (hour >= 17 && hour < 21) return "evening";
  return "night";
}

const periodHero: Record<
  DayPeriod,
  { src: string; dark: boolean; timeLabel: string }
> = {
  morning: {
    src: "/images/hero/morning.webp",
    dark: false,
    timeLabel: "Morning Focus",
  },
  noon: {
    src: "/images/hero/noon.webp",
    dark: false,
    timeLabel: "Midday Command",
  },
  evening: {
    src: "/images/hero/evening.webp",
    dark: true,
    timeLabel: "Twilight Wrap-Up",
  },
  night: {
    src: "/images/hero/night.webp",
    dark: true,
    timeLabel: "Night Operations",
  },
};

function profileSrc(url?: string | null) {
  if (!url) return null;
  return url.startsWith("http")
    ? url
    : `${process.env.NEXT_PUBLIC_API_URL || ""}${url}`;
}

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
}

function greetingForHour(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function AdminDashboard() {
  const { data, loading, error } = useQuery<AdminDashboardQuery>(GET_ADMIN_DASHBOARD_STATS, {
    pollInterval: 30000,
  });
  const { user } = useStore();
  const { resolvedTheme } = useTheme();

  const now = useMemo(() => moment(), []);
  const period = periodForHour(now.hour());
  const heroMeta = periodHero[period];
  const dark = resolvedTheme === "dark";
  const isDarkBg = dark || heroMeta.dark;

  if (loading && !data) {
    return <PageSkeleton cards={4} />;
  }

  if (error && !data) {
    return (
      <div className="rounded-2xl border border-destructive/20 bg-destructive/5 px-6 py-12 text-center">
        <AlertCircle className="mx-auto h-10 w-10 text-destructive mb-3" />
        <h3 className="text-base font-semibold text-foreground">Couldn’t load dashboard data</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Refresh the page or check network connection.
        </p>
      </div>
    );
  }

  const stats = data?.adminDashboardStats;
  const employeeGrowthData = stats?.employeeGrowth ?? [];
  const departmentData = stats?.departmentDistribution ?? [];
  const recentActivities = stats?.recentActivities ?? [];
  const upcomingEvents = stats?.upcomingEvents ?? [];
  const upcomingLeaves = stats?.upcomingLeaves ?? [];
  const wishMessage = stats?.wishMessage;
  const firstName = user?.firstName || "Admin";

  const attendanceRate = stats?.todayAttendanceRate ?? 0;
  const pendingLeaves = stats?.pendingLeaveApprovals ?? 0;

  return (
    <div className="w-full space-y-7 pb-10">
      {/* ── 1. 3D Architectural Executive Workspace Hero Banner ───────────────────────── */}
      <section
        className={cn(
          "relative overflow-hidden rounded-3xl shadow-xl border border-border/40 -mx-4 -mt-6 sm:-mx-6 lg:-mx-8 mb-6 min-h-[320px] lg:min-h-[350px]",
          isDarkBg ? "bg-[#0b0f17]" : "bg-[#f1f5f9]"
        )}
      >
        <Image
          src={heroMeta.src}
          alt="3D Executive Workspace"
          aria-hidden
          fill
          priority
          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 100vw, 1280px"
          className="hero-art object-cover object-center transition-all duration-700"
          unoptimized
        />

        {/* Ambient Gradient Scrim for crisp text legibility */}
        <div
          className={cn(
            "pointer-events-none absolute inset-0 z-[1]",
            isDarkBg
              ? "bg-gradient-to-r from-slate-950/80 via-slate-950/45 via-50% to-transparent"
              : "bg-gradient-to-r from-white/85 via-white/50 via-50% to-transparent"
          )}
        />
        <div
          className={cn(
            "pointer-events-none absolute inset-0 z-[2] bg-gradient-to-t",
            isDarkBg
              ? "from-slate-950/50 via-transparent to-transparent"
              : "from-white/45 via-transparent to-transparent"
          )}
        />

        {/* Hero Content Area */}
        <div className="relative z-10 flex min-h-[320px] lg:min-h-[350px] flex-col justify-between p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            {/* Left Content */}
            <div className="max-w-2xl space-y-4">
              {/* Date & Period Live Chip */}
              <div
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-3.5 py-1 shadow-xs backdrop-blur-md text-xs font-semibold",
                  isDarkBg
                    ? "border-white/20 bg-slate-950/65 text-white"
                    : "border-slate-300/80 bg-white/85 text-slate-800"
                )}
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#38ABB1] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#38ABB1]"></span>
                </span>
                <span className="uppercase tracking-wider text-[11px] font-bold">
                  {now.format("dddd, MMMM D")}
                </span>
                <span className="opacity-40">•</span>
                <span className="text-[#38ABB1] font-semibold">{heroMeta.timeLabel}</span>
                </div>

              {/* Headline */}
              <div className="space-y-1.5">
                <h1
                  className={cn(
                    "text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-balance leading-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]",
                    isDarkBg ? "text-white" : "text-slate-900"
                  )}
                >
                  {greetingForHour(now.hour())},{" "}
                  <span className="bg-gradient-to-r from-[#38ABB1] via-teal-300 to-cyan-200 bg-clip-text text-transparent drop-shadow-sm">
                    {firstName}
                  </span>
                </h1>
                <p
                  className={cn(
                    "text-xs sm:text-sm font-medium flex flex-wrap items-center gap-2 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]",
                    isDarkBg ? "text-slate-200" : "text-slate-600"
                  )}
                >
                  <span>{user?.designation?.name || "Company Administrator"}</span>
                  <span className="opacity-30">•</span>
                  <span>{user?.organization?.name || "Enterprise Portal"}</span>
                </p>
              </div>


              {/* Wish / Celebration Alert */}
              {wishMessage && (
                <div
                  className={cn(
                    "flex items-start gap-2.5 rounded-xl border px-3.5 py-2.5 backdrop-blur-md shadow-xs animate-in fade-in-50",
                    isDarkBg
                      ? "border-white/15 bg-white/10 text-white"
                      : "border-slate-200 bg-white/90 text-slate-800"
                  )}
                >
                  <Sparkles className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-xs font-medium leading-relaxed">{wishMessage}</p>
                </div>
              )}
            </div>

            {/* Right Stat Chip Summary */}
            <div className="hidden lg:flex flex-col gap-3 min-w-[220px]">
              <div className="rounded-2xl border border-white/15 bg-black/40 backdrop-blur-md p-4 text-white space-y-2">
                <div className="flex items-center justify-between text-xs text-white/70 font-semibold uppercase tracking-wider">
                  <span>Attendance Rate</span>
                  <span className="text-emerald-400 font-bold">{attendanceRate}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(attendanceRate, 100)}%` }}
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-white/15 bg-black/40 backdrop-blur-md p-4 text-white flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-white/60 uppercase font-bold tracking-wider">
                    Total Roster
                  </p>
                  <p className="text-2xl font-extrabold text-white mt-0.5 tabular-nums">
                    {stats?.totalEmployees || 0}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary">
                  <Users className="h-5 w-5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Executive KPI Cards Grid ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Employees */}
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-xs transition-all hover:shadow-md hover:border-foreground/30 group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Roster
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary dark:text-primary border border-primary/20 group-hover:scale-105 transition-transform">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <p className="text-2xl font-extrabold text-foreground tabular-nums">
              {stats?.totalEmployees ?? 0}
            </p>
            <span className="text-[11px] font-semibold text-primary flex items-center gap-0.5">
              <TrendingUp className="h-3 w-3" />
              Active
            </span>
          </div>
          <Link
            href="/employees"
            className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-primary"
          >
            Manage roster <ArrowRight className="h-2.5 w-2.5" />
          </Link>
        </div>

        {/* Active Workforce */}
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-xs transition-all hover:shadow-md hover:border-foreground/30 group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Active Staff
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary dark:text-primary border border-primary/20 group-hover:scale-105 transition-transform">
              <UserCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <p className="text-2xl font-extrabold text-foreground tabular-nums">
              {stats?.activeEmployees ?? 0}
            </p>
            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Verified
            </span>
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground truncate">
            Current active accounts
          </p>
        </div>

        {/* Attendance Rate */}
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-xs transition-all hover:shadow-md hover:border-foreground/30 group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Today Attendance
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary dark:text-primary border border-primary/20 group-hover:scale-105 transition-transform">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <p className="text-2xl font-extrabold text-foreground tabular-nums">
              {attendanceRate}%
            </p>
            <span className="text-[11px] font-semibold text-muted-foreground">
              Live rate
            </span>
          </div>
          <div className="mt-3 h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-teal-500 rounded-full transition-all"
              style={{ width: `${Math.min(attendanceRate, 100)}%` }}
            />
          </div>
        </div>

        {/* Pending Leaves */}
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-xs transition-all hover:shadow-md hover:border-foreground/30 group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Leave Queue
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary dark:text-primary border border-primary/20 group-hover:scale-105 transition-transform">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <p className="text-2xl font-extrabold text-foreground tabular-nums">
              {pendingLeaves}
            </p>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border",
                pendingLeaves > 0
                  ? "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30 animate-pulse"
                  : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
              )}
            >
              {pendingLeaves > 0 ? "Needs Review" : "Clear"}
            </span>
          </div>
          <Link
            href="/leaves"
            className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:text-primary"
          >
            Review requests <ArrowRight className="h-2.5 w-2.5" />
          </Link>
        </div>
      </div>

      {/* ── 3. Visual Charts & Trends ───────────────────────────────────────────── */}
      {user?.role !== "manager" && (
        <AdminDashboardCharts
          employeeGrowthData={employeeGrowthData}
          departmentData={departmentData}
        />
      )}

      {/* ── 4. Activity Stream & Upcoming Milestones ────────────────────────────── */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Recent Activity Live Feed */}
        <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm flex flex-col">
          <div className="flex items-center justify-between border-b border-border/70 bg-muted/20 px-5 py-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
                <Activity className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Recent Activity</h3>
                <p className="text-[11px] text-muted-foreground">Real-time organizational updates</p>
              </div>
            </div>
            <Link
              href="/notifications"
              className="text-xs font-semibold text-primary hover:underline"
            >
              View All
            </Link>
          </div>

          <div className="flex-1">
            {recentActivities.length > 0 ? (
              <ul className="divide-y divide-border">
                {recentActivities.slice(0, 7).map((activity) => {
                  const action = (activity.action || "").toLowerCase();
                  const isLeave = action.includes("leave");
                  const isAnniv =
                    action.includes("celebrate") ||
                    action.includes("anniversary") ||
                    action.includes("birthday");
                  const isJoin = action.includes("joined") || action.includes("onboard");
                  const isPromote = action.includes("promote");

                  const Icon = isLeave
                    ? Calendar
                    : isAnniv
                    ? Award
                    : isJoin
                    ? UserPlus
                    : isPromote
                    ? TrendingUp
                    : Clock;

                  const category = isLeave
                    ? "Leave"
                    : isAnniv
                    ? "Milestone"
                    : isJoin
                    ? "Team"
                    : isPromote
                    ? "Promotion"
                    : "Attendance";

                  const href = activity.id?.includes("notif")
                    ? "/notifications"
                    : isLeave || activity.id?.includes("leave")
                    ? "/leaves"
                    : isJoin || activity.id?.includes("employee")
                    ? "/employees"
                    : "/attendance";

                  return (
                    <li key={activity.id}>
                      <Link
                        href={href}
                        className="grid grid-cols-[2.5rem_1fr_auto] items-start gap-3 px-5 py-3.5 transition-colors hover:bg-muted/40 sm:grid-cols-[2.75rem_1fr_7.5rem] sm:items-center sm:px-6"
                      >
                        <span
                          className={cn(
                            "mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg sm:mt-0",
                            isLeave && "bg-sky-500/10 text-sky-600 dark:text-sky-400",
                            isAnniv && "bg-amber-500/10 text-amber-600 dark:text-amber-400",
                            isJoin && "bg-violet-500/10 text-violet-600 dark:text-violet-400",
                            isPromote && "bg-teal-500/10 text-teal-600 dark:text-teal-400",
                            !isLeave &&
                              !isAnniv &&
                              !isJoin &&
                              !isPromote &&
                              "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </span>

                        <div className="min-w-0">
                          <p className="text-sm font-medium leading-snug text-foreground">
                            {activity.user ? `${activity.user} ` : ""}
                            <span className="font-normal text-muted-foreground">
                              {activity.action}
                            </span>
                          </p>
                          <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground/80">
                            {category}
                          </p>
                        </div>

                        <time className="text-right text-xs tabular-nums text-muted-foreground sm:self-center">
                          {moment(activity.time).fromNow()}
                        </time>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center h-full">
                <Clock className="h-8 w-8 text-muted-foreground/35" />
                <p className="text-sm text-muted-foreground">Nothing new yet</p>
              </div>
            )}
          </div>
        </section>

        {/* Upcoming Events & Celebrations */}
        <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm flex flex-col">
          <div className="flex items-center justify-between border-b border-border/70 bg-muted/20 px-5 py-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary dark:text-primary border border-primary/20">
                <Gift className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Upcoming Milestones</h3>
                <p className="text-[11px] text-muted-foreground">Birthdays, anniversaries, and holidays</p>
              </div>
            </div>
            <span className="rounded-full border border-border bg-muted px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
              This Month
            </span>
          </div>

          <div className="flex-1 flex flex-col">
            {upcomingEvents.length > 0 ? (
              <div className="p-5">
                <ul className="divide-y divide-border/60">
                  {upcomingEvents.slice(0, 5).map((event) => {
                    const resolvedImg = profileSrc(event.profilePicture);
                    const isToday = event.daysUntil === 0;

                    return (
                      <li
                        key={event.id}
                        className="flex items-center gap-3.5 py-3 first:pt-0 last:pb-0 transition-colors hover:bg-muted/30 px-2 rounded-xl"
                      >
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-border bg-muted shadow-xs flex items-center justify-center">
                          {resolvedImg ? (
                            <Image
                              src={resolvedImg}
                              alt={event.user}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-primary/10 text-xs font-bold text-primary">
                              {initials(event.user)}
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-bold text-foreground">
                            {event.user}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-muted-foreground">
                            <span className="capitalize font-medium">
                              {event.type.replace("_", " ")}
                            </span>
                            <span>•</span>
                            <span className="font-mono">{moment(event.date).format("MMM D")}</span>
                          </div>
                        </div>

                        <span
                          className={cn(
                            "shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-wider uppercase border",
                            isToday
                              ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30 animate-pulse"
                              : "bg-muted text-muted-foreground border-border"
                          )}
                        >
                          {isToday ? "Today!" : `In ${event.daysUntil}d`}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : (
              <EmptyState
                src={EmptyImages.events}
                title="No celebrations"
                description="Birthdays, work anniversaries, and holidays this month will show up here."
                size="compact"
                className="flex-1 h-full min-h-[300px] sm:min-h-[340px] w-full border-0 rounded-none shadow-none"
                contentClassName="justify-start pt-8 sm:pt-10 pl-6 sm:pl-8 pr-2 w-[58%] max-w-[250px]"
                headingClassName="text-base sm:text-lg font-bold tracking-tight text-slate-900 leading-snug"
                descriptionClassName="mt-1.5 text-xs sm:text-sm font-medium leading-relaxed text-slate-600/95 max-w-[190px]"
                imageClassName="object-cover object-bottom"
              />
            )}
          </div>
        </section>
      </div>

      {/* ── 5. Upcoming Absences Radar ──────────────────────────────────────────── */}
      <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border/70 bg-muted/20 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary dark:text-primary border border-primary/20">
              <Calendar className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Absence Radar</h3>
              <p className="text-[11px] text-muted-foreground">Approved time-off & planned leaves</p>
            </div>
          </div>
          <span className="rounded-full border border-border bg-muted/50 px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
            Next 14 Days
          </span>
        </div>

        <div>
          {upcomingLeaves.length > 0 ? (
            <div className="p-5">
              <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2 xl:grid-cols-3">
                {upcomingLeaves.map((leave) => {
                  const resolvedImg = profileSrc(leave.profilePicture);

                  return (
                    <div
                      key={leave.id}
                      className="relative rounded-xl border border-border/70 bg-muted/20 p-4 transition-all hover:border-primary/40 hover:bg-muted/40"
                    >
                      <div className="mb-3 flex items-center gap-3">
                        <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-xl border border-border bg-muted shadow-xs flex items-center justify-center">
                          {resolvedImg ? (
                            <Image
                              src={resolvedImg}
                              alt={leave.user}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-primary/10 text-xs font-bold text-primary">
                              {initials(leave.user)}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-bold text-foreground">{leave.user}</p>
                          <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                            <span
                              className={cn(
                                "rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                                leave.status === "approved"
                                  ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                                  : "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                              )}
                            >
                              {leave.status}
                            </span>
                            <span className="text-[11px] text-muted-foreground font-medium">
                              {leave.leaveType}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-border/50 pt-2.5 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5 font-semibold text-foreground">
                          <Clock className="h-3.5 w-3.5 text-primary" />
                          {moment(leave.fromDate).format("MMM D")}
                          <ArrowRight className="h-3 w-3 text-muted-foreground/60" />
                          {moment(leave.toDate).format("MMM D")}
                        </span>
                        <span className="font-mono text-[11px] font-bold text-muted-foreground">
                          {leave.duration} day{leave.duration === 1 ? "" : "s"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <EmptyState
              src={EmptyImages.leaves}
              title="All team members are present"
              description="No upcoming absences or scheduled leaves in the next 14 days. Everyone is active and accounted for."
              size="compact"
              className="w-full border-0 rounded-none min-h-[260px] sm:min-h-[290px] shadow-none"
              contentClassName="justify-center px-6 py-8 sm:px-10 w-[60%] sm:w-[48%]"
              headingClassName="text-base sm:text-lg font-bold tracking-tight text-slate-900 leading-snug"
              descriptionClassName="mt-1.5 text-xs sm:text-sm font-medium leading-relaxed text-slate-600/95 max-w-sm"
              imageClassName="object-cover object-bottom"
            />
          )}
        </div>
      </section>

      {/* ── 6. Executive Quick Launchpad ────────────────────────────────────────── */}
      <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground">Quick Launchpad</h3>
          </div>
          <span className="text-xs text-muted-foreground">Frequent Operations</span>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Link
            href="/employees"
            className="group flex flex-col justify-between rounded-xl border border-border bg-muted/20 p-4 transition-all hover:bg-muted/60 hover:border-primary/40 shadow-xs"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary dark:text-primary border border-primary/20 group-hover:scale-105 transition-transform">
                <UserPlus2 className="h-4 w-4" />
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <div className="mt-3">
              <p className="text-xs font-bold text-foreground">Employees</p>
              <p className="text-[11px] text-muted-foreground">Add & update staff</p>
            </div>
          </Link>

          <Link
            href="/onboarding"
            className="group flex flex-col justify-between rounded-xl border border-border bg-muted/20 p-4 transition-all hover:bg-muted/60 hover:border-primary/40 shadow-xs"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary dark:text-primary border border-primary/20 group-hover:scale-105 transition-transform">
                <Briefcase className="h-4 w-4" />
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <div className="mt-3">
              <p className="text-xs font-bold text-foreground">Onboarding</p>
              <p className="text-[11px] text-muted-foreground">Start new hire portal</p>
            </div>
          </Link>

          <Link
            href="/payroll"
            className="group flex flex-col justify-between rounded-xl border border-border bg-muted/20 p-4 transition-all hover:bg-muted/60 hover:border-primary/40 shadow-xs"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary dark:text-primary border border-primary/20 group-hover:scale-105 transition-transform">
                <Banknote className="h-4 w-4" />
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <div className="mt-3">
              <p className="text-xs font-bold text-foreground">Payroll</p>
              <p className="text-[11px] text-muted-foreground">Execute salary runs</p>
            </div>
          </Link>

          <Link
            href="/reports"
            className="group flex flex-col justify-between rounded-xl border border-border bg-muted/20 p-4 transition-all hover:bg-muted/60 hover:border-primary/40 shadow-xs"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary dark:text-primary border border-primary/20 group-hover:scale-105 transition-transform">
                <FileSpreadsheet className="h-4 w-4" />
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <div className="mt-3">
              <p className="text-xs font-bold text-foreground">Reports</p>
              <p className="text-[11px] text-muted-foreground">Analytics & export</p>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}
