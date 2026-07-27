"use client";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Download, Info } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { cn } from "@/lib/utils";

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
  { name: "Sick leave", value: 145, color: "oklch(0.55 0.2 25)" },
  { name: "Casual leave", value: 220, color: "oklch(0.7 0.15 70)" },
  { name: "Earned leave", value: 180, color: "oklch(0.6 0.14 150)" },
  { name: "Maternity", value: 25, color: "oklch(0.55 0.12 280)" },
  { name: "Paternity", value: 15, color: "oklch(0.6 0.1 220)" },
];

const payrollData = [
  { month: "Jan", gross: 12500000, deductions: 1800000, net: 10700000 },
  { month: "Feb", gross: 12800000, deductions: 1850000, net: 10950000 },
  { month: "Mar", gross: 13200000, deductions: 1900000, net: 11300000 },
  { month: "Apr", gross: 13500000, deductions: 1950000, net: 11550000 },
  { month: "May", gross: 13800000, deductions: 2000000, net: 11800000 },
  { month: "Jun", gross: 14200000, deductions: 2050000, net: 12150000 },
];

const chartTooltipStyle = {
  backgroundColor: "var(--card)",
  borderColor: "var(--border)",
  borderRadius: "8px",
  fontSize: "12px",
  color: "var(--foreground)",
  boxShadow: "none",
};

function Panel({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-xl border border-border bg-card", className)}>
      <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3.5">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
          title="Export coming soon"
        >
          <Download className="h-3.5 w-3.5" />
          Export
        </button>
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

export default function ReportsPage() {
  return (
    <div className="page-shell">
      <PageHeader
        title="Reports"
        description="Workforce, attendance, leave, and payroll trends."
      />

      <div className="flex items-start gap-2.5 rounded-xl border border-border bg-muted/40 px-4 py-3">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Charts below use sample data for layout preview. Live reporting will connect to your
          organization data in a later release.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">Turnover rate</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">2.8%</p>
          <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-400">
            ↓ 0.5% vs last quarter
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">Avg leave days / employee</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">12.5</p>
          <p className="mt-1 text-xs text-muted-foreground">Per year</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">Avg salary</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">₹57,258</p>
          <p className="mt-1 text-xs text-sky-700 dark:text-sky-400">↑ ₹2,500 vs last month</p>
        </div>
      </div>

      <Panel title="Employee headcount">
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={employeeData} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="4 4" />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
              />
              <Tooltip contentStyle={chartTooltipStyle} />
              <Legend />
              <Line
                type="monotone"
                dataKey="headcount"
                stroke="var(--primary)"
                strokeWidth={2}
                dot={false}
                name="Headcount"
              />
              <Line
                type="monotone"
                dataKey="new"
                stroke="oklch(0.6 0.14 150)"
                strokeWidth={2}
                dot={false}
                name="New hires"
              />
              <Line
                type="monotone"
                dataKey="left"
                stroke="oklch(0.55 0.2 25)"
                strokeWidth={2}
                dot={false}
                name="Exits"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel title="Weekly attendance">
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceData} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="4 4" />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Legend />
                <Bar dataKey="present" fill="oklch(0.6 0.14 150)" name="Present" radius={[4, 4, 0, 0]} />
                <Bar dataKey="late" fill="oklch(0.7 0.15 70)" name="Late" radius={[4, 4, 0, 0]} />
                <Bar dataKey="absent" fill="oklch(0.55 0.2 25)" name="Absent" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Leave types">
          <div className="flex h-[280px] flex-col gap-4 sm:flex-row sm:items-center">
            <div className="h-[200px] w-full sm:h-full sm:w-1/2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={leaveTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {leaveTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={chartTooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="w-full space-y-2 sm:w-1/2">
              {leaveTypeData.map((entry) => (
                <li
                  key={entry.name}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="truncate text-muted-foreground">{entry.name}</span>
                  </span>
                  <span className="shrink-0 tabular-nums text-foreground">{entry.value}</span>
                </li>
              ))}
            </ul>
          </div>
        </Panel>
      </div>

      <Panel title="Payroll trends">
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={payrollData} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="4 4" />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                tickFormatter={(v) => `₹${(v / 1000000).toFixed(0)}M`}
              />
              <Tooltip
                contentStyle={chartTooltipStyle}
                formatter={(value?: number) =>
                  `₹${(((value as number) || 0) / 1000000).toFixed(2)}M`
                }
              />
              <Legend />
              <Bar dataKey="gross" fill="var(--primary)" name="Gross" radius={[4, 4, 0, 0]} />
              <Bar
                dataKey="deductions"
                fill="oklch(0.55 0.2 25)"
                name="Deductions"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="net"
                fill="oklch(0.6 0.14 150)"
                name="Net"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>
    </div>
  );
}
