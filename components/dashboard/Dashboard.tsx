"use client";

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
} from "lucide-react";
import { StatsCard } from "../admin/StatsCard";
import { PageSkeleton } from "../common/Skeleton";
import { useQuery } from "@apollo/client/react";
import { GET_ADMIN_DASHBOARD_STATS } from "@/lib/graphql/dashboard/queries";
import moment from "moment";
import Image from "next/image";
import Link from "next/link";
import { useStore } from "@/lib/store/useStore";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";

const AdminDashboardCharts = dynamic(
  () =>
    import("@/components/dashboard/AdminDashboardCharts").then((m) => m.AdminDashboardCharts),
  {
    ssr: false,
    loading: () => (
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="h-80 animate-pulse rounded-xl border border-border bg-muted/40" />
        <div className="h-80 animate-pulse rounded-xl border border-border bg-muted/40" />
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

function Panel({
  title,
  children,
  action,
  className,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-xl border border-border bg-card", className)}>
      <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3.5">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function Avatar({
  name,
  src,
  tone = "muted",
}: {
  name: string;
  src?: string | null;
  tone?: "muted" | "amber" | "sky";
}) {
  const toneClass =
    tone === "amber"
      ? "bg-amber-500/10 text-amber-700 dark:text-amber-400"
      : tone === "sky"
        ? "bg-sky-500/10 text-sky-700 dark:text-sky-400"
        : "bg-muted text-muted-foreground";

  const resolved = profileSrc(src);

  return (
    <div
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full text-xs font-medium",
        !resolved && toneClass
      )}
    >
      {resolved ? (
        <Image
          src={resolved}
          alt={name}
          width={36}
          height={36}
          className="h-full w-full object-cover"
          unoptimized
        />
      ) : (
        initials(name)
      )}
    </div>
  );
}

const quickActions = [
  { href: "/employees", label: "Add employee", icon: UserPlus2 },
  { href: "/leaves", label: "Approve leaves", icon: Calendar },
  { href: "/payroll", label: "Run payroll", icon: Banknote },
  { href: "/reports", label: "View reports", icon: TrendingUp },
];

function greetingForHour(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function AdminDashboard() {
  const { data, loading, error } = useQuery<AdminDashboardQuery>(GET_ADMIN_DASHBOARD_STATS);
  const { user } = useStore();

  if (loading && !data) {
    return <PageSkeleton cards={4} />;
  }

  if (error && !data) {
    return (
      <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-6 text-center">
        <p className="text-sm text-destructive">
          Couldn’t load dashboard data. Refresh the page to try again.
        </p>
      </div>
    );
  }

  const stats = data?.adminDashboardStats;
  const employeeGrowthData = stats?.employeeGrowth ?? [];
  const departmentData = stats?.departmentDistribution ?? [];
  const recentActivities = stats?.recentActivities ?? [];
  const upcomingEvents = stats?.upcomingEvents ?? [];
  const wishMessage = stats?.wishMessage;
  const firstName = user?.firstName || "there";
  const now = moment();

  return (
    <div className="page-shell">
      <section className="relative overflow-hidden rounded-2xl border border-border bg-[oklch(0.28_0.04_200)] text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{
            backgroundImage:
              "radial-gradient(circle at 12% 20%, oklch(0.55 0.09 200 / 0.5), transparent 42%), radial-gradient(circle at 88% 80%, oklch(0.4 0.06 220 / 0.35), transparent 40%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="relative z-10 flex flex-col gap-8 p-6 sm:p-8 lg:flex-row lg:items-end lg:justify-between lg:p-10">
          <div className="max-w-2xl space-y-5">
            <div className="space-y-2">
              <p className="text-sm font-medium tracking-wide text-teal-200/80">
                {now.format("dddd, MMM D")}
              </p>
              <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl lg:text-5xl">
                {greetingForHour(now.hour())},{" "}
                <span className="text-teal-200">{firstName}</span>
              </h1>
              <p className="text-sm text-white/65 sm:text-base">
              {[
                user?.designation?.name,
                user?.department?.name,
                user?.organization?.name,
              ]
                .filter(Boolean)
                .join(" · ") || "Admin operations home"}
              </p>
            </div>

            <div className="inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 backdrop-blur-sm">
              <Clock className="h-3.5 w-3.5 text-white/80" />
              <span className="text-sm font-medium">Today · Admin overview</span>
            </div>

            {wishMessage && (
              <div className="rounded-xl border border-white/10 bg-white/8 px-3.5 py-3">
                <p className="text-sm leading-relaxed text-white/80">{wishMessage}</p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
            <Link
              href="/employees"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-white px-5 text-sm font-semibold text-[oklch(0.28_0.04_200)] transition-opacity hover:opacity-95"
            >
              <UserPlus2 className="h-4 w-4" />
              Add employee
            </Link>
            <Link
              href="/leaves"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-white/25 bg-white/5 px-5 text-sm font-medium text-white transition-colors hover:bg-white/10"
            >
              <Calendar className="h-4 w-4" />
              View Leave Requests
            </Link>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatsCard title="Total employees" value={stats?.totalEmployees ?? 0} icon={Users} color="blue" />
        <StatsCard title="Active employees" value={stats?.activeEmployees ?? 0} icon={UserCheck} color="green" />
        <StatsCard title="Pending leave approvals" value={stats?.pendingLeaveApprovals ?? 0} icon={Calendar} color="yellow" />
        <StatsCard title="Attendance rate today" value={`${stats?.todayAttendanceRate ?? 0}%`} icon={Clock} color="blue" />
        <StatsCard title="Pending payroll" value={0} icon={DollarSign} color="purple" />
        <StatsCard title="Pending reviews" value={0} icon={TrendingUp} color="red" />
      </div>

      {user?.role !== "manager" && (
        <AdminDashboardCharts
          employeeGrowthData={employeeGrowthData}
          departmentData={departmentData}
        />
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel title="Recent activity">
          {recentActivities.length > 0 ? (
            <ul className="divide-y divide-border">
              {recentActivities.map((activity) => {
                const isJoin = activity.action?.includes("joined");
                const isCelebrate = activity.action?.includes("celebrates");
                const isLeave = activity.action?.includes("leave");
                const Icon = isJoin ? UserPlus : isCelebrate ? Award : isLeave ? Calendar : Clock;

                return (
                  <li key={activity.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-foreground">
                        <span className="font-medium">{activity.user}</span>{" "}
                        <span className="text-muted-foreground">{activity.action}</span>
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {moment(activity.time).fromNow()}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
              <Clock className="h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No recent activity</p>
            </div>
          )}
        </Panel>

        <Panel title="Upcoming events">
          {upcomingEvents.length > 0 ? (
            <ul className="divide-y divide-border">
              {upcomingEvents.slice(0, 5).map((event) => (
                <li key={event.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <Avatar
                    name={event.user}
                    src={event.profilePicture}
                    tone={event.type === "birthday" ? "amber" : "sky"}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{event.user}</p>
                    <p className="text-xs text-muted-foreground">
                      {event.type === "birthday" ? "Birthday" : "Work anniversary"} ·{" "}
                      {moment(event.date).format("MMM D")}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-md px-2 py-0.5 text-xs font-medium",
                      event.daysUntil === 0
                        ? "bg-destructive/10 text-destructive"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {event.daysUntil === 0 ? "Today" : `${event.daysUntil}d`}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
              <Gift className="h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No upcoming events this month</p>
            </div>
          )}
        </Panel>
      </div>

      <Panel
        title="Upcoming absences"
        action={<span className="text-xs text-muted-foreground">Next 14 days</span>}
      >
        {stats?.upcomingLeaves?.length ? (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {stats.upcomingLeaves.map((leave) => (
              <div
                key={leave.id}
                className="rounded-lg border border-border bg-background p-4"
              >
                <div className="mb-3 flex items-center gap-3">
                  <Avatar name={leave.user} src={leave.profilePicture} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{leave.user}</p>
                    <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                      <span
                        className={cn(
                          "rounded px-1.5 py-0.5 text-[11px] font-medium capitalize",
                          leave.status === "approved"
                            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                            : "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                        )}
                      >
                        {leave.status}
                      </span>
                      <span className="text-[11px] text-muted-foreground">{leave.leaveType}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5 shrink-0" />
                  <span className="inline-flex items-center gap-1.5 text-foreground">
                    {moment(leave.fromDate).format("MMM D")}
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    {moment(leave.toDate).format("MMM D")}
                  </span>
                  <span>· {leave.duration} day{leave.duration === 1 ? "" : "s"}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border py-12 text-center">
            <Calendar className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No upcoming absences in the next 14 days</p>
          </div>
        )}
      </Panel>

      <Panel title="Quick actions">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="flex items-center gap-2.5 rounded-lg border border-border px-3 py-3 text-sm text-foreground transition-colors hover:bg-muted/60"
            >
              <action.icon className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{action.label}</span>
            </Link>
          ))}
        </div>
      </Panel>
    </div>
  );
}
