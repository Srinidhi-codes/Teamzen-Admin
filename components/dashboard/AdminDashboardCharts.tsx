"use client";

import { Users, TrendingUp, Building2 } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { cn } from "@/lib/utils";

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number | string; color?: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  const title = label || item.name;
  return (
    <div className="rounded-xl border border-border/80 bg-popover/95 backdrop-blur-md px-3 py-2 text-xs text-popover-foreground shadow-xl">
      <div className="flex items-center gap-2">
        {item.color ? (
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-full shadow-xs"
            style={{ backgroundColor: item.color }}
          />
        ) : null}
        <span className="font-semibold text-foreground">{title}</span>
        <span className="font-mono font-bold text-primary tabular-nums">{item.value}</span>
      </div>
    </div>
  );
}

function Panel({
  title,
  subtitle,
  icon: Icon,
  badge,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  icon?: any;
  badge?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:shadow-md", className)}>
      <div className="flex items-center justify-between gap-3 border-b border-border/70 bg-muted/20 px-5 py-4">
        <div className="flex items-center gap-2.5">
          {Icon && (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
              <Icon className="h-4 w-4" />
            </div>
          )}
          <div>
            <h2 className="text-sm font-bold tracking-tight text-foreground">{title}</h2>
            {subtitle && <p className="text-[11px] text-muted-foreground">{subtitle}</p>}
          </div>
        </div>
        {badge}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

type GrowthPoint = { month: string; value: number };
type DeptPoint = { name: string; value: number; color: string };

export function AdminDashboardCharts({
  employeeGrowthData,
  departmentData,
}: {
  employeeGrowthData: GrowthPoint[];
  departmentData: DeptPoint[];
}) {
  const totalEmployeesInDepts = departmentData.reduce((acc, curr) => acc + (curr.value || 0), 0);

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      {/* ── Employee Growth Area Chart ────────────────────────────────────── */}
      <Panel
        title="Employee Growth"
        subtitle="Month-over-month active workforce expansion"
        icon={TrendingUp}
        badge={
          <span className="inline-flex items-center gap-1 rounded-full border border-teal-500/20 bg-teal-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-teal-600 dark:text-teal-400">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-pulse" />
            Active Trend
          </span>
        }
      >
        <div className="h-[270px] w-full">
          {employeeGrowthData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={employeeGrowthData} margin={{ top: 12, right: 12, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="adminColorGrowth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38ABB1" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#38ABB1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" opacity={0.6} />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  dy={8}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  allowDecimals={false}
                />
                <Tooltip content={<ChartTooltip />} cursor={{ stroke: "#38ABB1", strokeWidth: 1, strokeDasharray: "3 3" }} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#38ABB1"
                  strokeWidth={2.5}
                  fill="url(#adminColorGrowth)"
                  dot={{ r: 3, fill: "#38ABB1", strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: "#38ABB1", stroke: "var(--background)", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-muted-foreground">
              <TrendingUp className="h-8 w-8 opacity-40" />
              <p className="text-xs">No historical growth recorded yet.</p>
            </div>
          )}
        </div>
      </Panel>

      {/* ── Department Breakdown Donut ────────────────────────────────────── */}
      <Panel
        title="Department Allocation"
        subtitle="Workforce headcount distribution by team"
        icon={Building2}
        badge={
          <span className="rounded-full border border-border bg-muted/50 px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
            {departmentData.length} Departments
          </span>
        }
      >
        <div className="h-[270px] w-full">
          {departmentData.length > 0 ? (
            <div className="flex h-full flex-col gap-4 sm:flex-row sm:items-center">
              <div className="relative h-[190px] w-full sm:h-full sm:w-1/2 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={departmentData}
                      cx="50%"
                      cy="50%"
                      innerRadius={56}
                      outerRadius={84}
                      paddingAngle={3}
                      dataKey="value"
                      nameKey="name"
                    >
                      {departmentData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          stroke="var(--card)"
                          strokeWidth={2}
                          className="transition-all hover:opacity-80"
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center Badge in Donut */}
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-xl font-extrabold text-foreground tracking-tight tabular-nums">
                    {totalEmployeesInDepts}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                    Staff
                  </span>
                </div>
              </div>

              {/* Department Legend Items */}
              <ul className="custom-scrollbar max-h-[220px] w-full space-y-2 overflow-y-auto pr-2 sm:w-1/2">
                {departmentData.map((entry, index) => {
                  const percentage = totalEmployeesInDepts > 0
                    ? ((entry.value / totalEmployeesInDepts) * 100).toFixed(0)
                    : "0";
                  return (
                    <li
                      key={`${entry.name}-${index}`}
                      className="flex items-center justify-between gap-3 rounded-lg border border-border/40 bg-muted/20 px-2.5 py-1.5 text-xs transition-colors hover:bg-muted/50"
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full shadow-xs"
                          style={{ backgroundColor: entry.color }}
                        />
                        <span className="truncate font-medium text-foreground">{entry.name}</span>
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="font-bold tabular-nums text-foreground">{entry.value}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">({percentage}%)</span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-muted-foreground">
              <Users className="h-8 w-8 opacity-40" />
              <p className="text-xs">No department data available</p>
            </div>
          )}
        </div>
      </Panel>
    </div>
  );
}
