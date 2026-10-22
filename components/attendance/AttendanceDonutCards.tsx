"use client";

import React, { useMemo } from "react";
import { AttendanceRecord } from "@/lib/graphql/attendance/types";
import { cn } from "@/lib/utils";
import moment from "moment";
import { ArrowUpRight, Clock, Users } from "lucide-react";

interface DonutSlice {
  label: string;
  count: number;
  percentage: number;
  color: string;
  dotColor: string;
}

interface DonutCardData {
  title: string;
  totalEmployees: number;
  slices: DonutSlice[];
  onSliceClick?: (label: string) => void;
}

function SvgDonutChart({ slices, size = 130 }: { slices: DonutSlice[]; size?: number }) {
  const radius = 45;
  const strokeWidth = 20;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  let cumulativeAngle = -90; // Start at 12 o'clock

  const segments = slices.map((slice) => {
    const strokeDasharray = `${(slice.percentage / 100) * circumference} ${circumference}`;
    const transform = `rotate(${cumulativeAngle} ${center} ${center})`;
    cumulativeAngle += (slice.percentage / 100) * 360;

    return {
      ...slice,
      strokeDasharray,
      transform,
    };
  });

  return (
    <div className="relative flex items-center justify-center shrink-0">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="drop-shadow-xs">
        {/* Background track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/40"
        />
        {/* Segments */}
        {segments.map((seg, i) => (
          <circle
            key={i}
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={seg.color}
            strokeWidth={strokeWidth}
            strokeDasharray={seg.strokeDasharray}
            transform={seg.transform}
            strokeLinecap="butt"
            className="transition-all duration-500 hover:opacity-85"
          />
        ))}
      </svg>
    </div>
  );
}

export function AttendanceDonutCards({
  records = [],
  totalEmployees,
  onFilterSelect,
}: {
  records: AttendanceRecord[];
  totalEmployees?: number;
  onFilterSelect?: (filter: string) => void;
}) {
  const { workStarted, workFinished } = useMemo(() => {
    const total = totalEmployees || records.length || 0;
    if (total === 0 && records.length === 0) {
      // Clean representative defaults if records empty
      return {
        workStarted: {
          title: "Attendance - work started",
          totalEmployees: 0,
          slices: [
            { label: "Early", count: 0, percentage: 0, color: "#86efac", dotColor: "bg-emerald-300" },
            { label: "On time", count: 0, percentage: 0, color: "#10b981", dotColor: "bg-emerald-500" },
            { label: "Late", count: 0, percentage: 0, color: "#fbbf24", dotColor: "bg-amber-400" },
            { label: "Off work", count: 0, percentage: 0, color: "#f87171", dotColor: "bg-rose-400" },
          ],
        },
        workFinished: {
          title: "Attendance - work finished",
          totalEmployees: 0,
          slices: [
            { label: "Early", count: 0, percentage: 0, color: "#fbbf24", dotColor: "bg-amber-400" },
            { label: "On time", count: 0, percentage: 0, color: "#10b981", dotColor: "bg-emerald-500" },
            { label: "Late", count: 0, percentage: 0, color: "#86efac", dotColor: "bg-emerald-300" },
            { label: "Off work", count: 0, percentage: 0, color: "#f87171", dotColor: "bg-rose-400" },
          ],
        },
      };
    }

    let startedEarly = 0;
    let startedOnTime = 0;
    let startedLate = 0;
    let startedOffWork = 0;

    let finishedEarly = 0;
    let finishedOnTime = 0;
    let finishedLate = 0;
    let finishedOffWork = 0;

    const baseCount = Math.max(records.length, total);

    records.forEach((r) => {
      // Work Started classification (Shift start 09:00:00)
      if (!r.loginTime || r.status === "absent") {
        startedOffWork++;
      } else {
        const [h, m] = r.loginTime.split(":").map(Number);
        const loginMin = h * 60 + (m || 0);
        if (loginMin < 535) {
          // Before 08:55 AM
          startedEarly++;
        } else if (loginMin <= 555) {
          // 08:55 to 09:15 AM
          startedOnTime++;
        } else {
          // After 09:15 AM
          startedLate++;
        }
      }

      // Work Finished classification (Shift end 18:00:00)
      if (!r.logoutTime) {
        if (!r.loginTime || r.status === "absent") {
          finishedOffWork++;
        } else {
          // Active shift in progress
          finishedOnTime++;
        }
      } else {
        const [h, m] = r.logoutTime.split(":").map(Number);
        const logoutMin = h * 60 + (m || 0);
        if (logoutMin < 1065) {
          // Before 05:45 PM
          finishedEarly++;
        } else if (logoutMin <= 1095) {
          // 05:45 to 06:15 PM
          finishedOnTime++;
        } else {
          // Overtime / Late out (After 06:15 PM)
          finishedLate++;
        }
      }
    });

    const calcPct = (cnt: number) => (baseCount > 0 ? Math.round((cnt / baseCount) * 100) : 0);

    const startedSlices: DonutSlice[] = [
      { label: "Early", count: startedEarly, percentage: calcPct(startedEarly), color: "#86efac", dotColor: "bg-emerald-300" },
      { label: "On time", count: startedOnTime, percentage: calcPct(startedOnTime), color: "#10b981", dotColor: "bg-emerald-500" },
      { label: "Late", count: startedLate, percentage: calcPct(startedLate), color: "#fbbf24", dotColor: "bg-amber-400" },
      { label: "Off work", count: startedOffWork, percentage: calcPct(startedOffWork), color: "#f87171", dotColor: "bg-rose-400" },
    ];

    const finishedSlices: DonutSlice[] = [
      { label: "Early", count: finishedEarly, percentage: calcPct(finishedEarly), color: "#fbbf24", dotColor: "bg-amber-400" },
      { label: "On time", count: finishedOnTime, percentage: calcPct(finishedOnTime), color: "#10b981", dotColor: "bg-emerald-500" },
      { label: "Late", count: finishedLate, percentage: calcPct(finishedLate), color: "#86efac", dotColor: "bg-emerald-300" },
      { label: "Off work", count: finishedOffWork, percentage: calcPct(finishedOffWork), color: "#f87171", dotColor: "bg-rose-400" },
    ];

    return {
      workStarted: {
        title: "Attendance - work started",
        totalEmployees: baseCount,
        slices: startedSlices,
      },
      workFinished: {
        title: "Attendance - work finished",
        totalEmployees: baseCount,
        slices: finishedSlices,
      },
    };
  }, [records, totalEmployees]);

  const renderCard = (card: DonutCardData) => (
    <div className="flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-xs transition-all hover:shadow-md">
      {/* Card Header */}
      <div className="flex items-center justify-between border-b border-border/50 pb-3 mb-4">
        <h3 className="text-sm font-bold tracking-tight text-foreground flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          {card.title}
        </h3>
        <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
          <Users className="h-3.5 w-3.5" />
          {card.totalEmployees} employees
        </span>
      </div>

      {/* Main Content: Table + Donut */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
        {/* Total Badge Column */}
        <div className="flex sm:flex-col items-center justify-center shrink-0 text-center gap-1">
          <span className="text-3xl font-extrabold text-foreground tabular-nums">
            {card.totalEmployees}
          </span>
          <span className="text-xs font-medium text-muted-foreground">employees</span>
        </div>

        {/* Breakdown Table */}
        <div className="flex-1 w-full overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border/40 text-muted-foreground">
                <th className="pb-1.5 font-semibold">Event</th>
                <th className="pb-1.5 text-right font-semibold">Events#</th>
                <th className="pb-1.5 text-right font-semibold">Empl/day</th>
                <th className="pb-1.5 text-right font-semibold">%</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {card.slices.map((slice) => (
                <tr
                  key={slice.label}
                  onClick={() => onFilterSelect && onFilterSelect(slice.label.toLowerCase())}
                  className="hover:bg-muted/40 cursor-pointer transition-colors"
                >
                  <td className="py-1.5 font-medium flex items-center gap-2">
                    <span className={cn("h-2.5 w-2.5 rounded-sm shrink-0", slice.dotColor)} />
                    <span className="text-foreground">{slice.label}</span>
                  </td>
                  <td className="py-1.5 text-right tabular-nums text-foreground/80 font-medium">
                    {slice.count}
                  </td>
                  <td className="py-1.5 text-right tabular-nums text-foreground/80 font-medium">
                    {slice.count}
                  </td>
                  <td className="py-1.5 text-right tabular-nums font-semibold text-foreground">
                    {slice.percentage}%
                  </td>
                </tr>
              ))}
              <tr className="font-bold text-foreground border-t border-border/70">
                <td className="pt-2">Total</td>
                <td className="pt-2 text-right tabular-nums">{card.totalEmployees}</td>
                <td className="pt-2 text-right tabular-nums">{card.totalEmployees}</td>
                <td className="pt-2 text-right tabular-nums">100%</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* SVG Donut Chart */}
        <div className="shrink-0 flex items-center justify-center">
          <SvgDonutChart slices={card.slices} size={110} />
        </div>
      </div>

      {/* Footer link */}
      <div className="mt-4 pt-2.5 border-t border-border/40 flex justify-end">
        <button
          type="button"
          onClick={() => onFilterSelect && onFilterSelect("all")}
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline cursor-pointer"
        >
          More info
          <ArrowUpRight className="h-3 w-3" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {renderCard(workStarted)}
      {renderCard(workFinished)}
    </div>
  );
}
