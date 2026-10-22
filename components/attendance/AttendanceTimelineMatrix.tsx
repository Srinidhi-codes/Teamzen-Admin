"use client";

import React, { useState } from "react";
import moment from "moment";
import { AttendanceRecord } from "@/lib/graphql/attendance/types";
import { AttendanceTimelineBar } from "./AttendanceTimelineBar";
import { cn } from "@/lib/utils";
import {
  User,
  Clock,
  ScanFace,
  ChevronRight,
  Calendar,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  SlidersHorizontal,
  BarChart3,
} from "lucide-react";

interface AttendanceTimelineMatrixProps {
  records: AttendanceRecord[];
  isLoading?: boolean;
  selectedDate?: string;
  onSelectRecord?: (record: AttendanceRecord) => void;
  onOpenReport?: (employeeId: string) => void;
  shiftStart?: string;
  shiftEnd?: string;
  className?: string;
}

export function AttendanceTimelineMatrix({
  records = [],
  isLoading = false,
  selectedDate,
  onSelectRecord,
  onOpenReport,
  shiftStart = "09:00:00",
  shiftEnd = "18:00:00",
  className,
}: AttendanceTimelineMatrixProps) {
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);

  // Curated major hour ticks for the 24-hour ruler to prevent text collision
  const majorHours = [
    { hour: 0, label: "12 AM" },
    { hour: 3, label: "3 AM" },
    { hour: 6, label: "6 AM" },
    { hour: 9, label: "9 AM", isShift: true },
    { hour: 12, label: "12 PM" },
    { hour: 15, label: "3 PM" },
    { hour: 18, label: "6 PM", isShift: true },
    { hour: 21, label: "9 PM" },
  ];

  // All 24 hours for subtle background tick marks
  const allHours = Array.from({ length: 24 }, (_, i) => i);

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-5 w-44 rounded bg-muted animate-pulse" />
          <div className="h-4 w-32 rounded bg-muted animate-pulse" />
        </div>
        <div className="space-y-3 pt-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="h-10 w-36 sm:w-44 rounded-lg bg-muted/60 animate-pulse" />
              <div className="h-8 flex-1 rounded-lg bg-muted/40 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const renderStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      present: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
      late_login: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
      early_logout: "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20",
      half_day: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20",
      absent: "bg-destructive/10 text-destructive border-destructive/20",
    };
    return (
      <span
        className={cn(
          "inline-flex rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
          map[status] || "bg-muted text-muted-foreground border-border"
        )}
      >
        {status.replace(/_/g, " ")}
      </span>
    );
  };

  return (
    <div className={cn("rounded-2xl border border-border bg-card shadow-xs overflow-hidden", className)}>
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border/60 bg-muted/20 px-4 sm:px-6 py-4 gap-3">
        <div>
          <h3 className="text-sm sm:text-base font-bold tracking-tight text-foreground flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            Active/idle timeline
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            24-hour visual activity map
          </p>
        </div>

        {selectedDate && (
          <div className="inline-flex items-center gap-2 rounded-lg border border-border/80 bg-background/80 px-3 py-1.5 text-xs font-semibold tabular-nums text-foreground shadow-xs w-fit">
            <span>{moment(selectedDate).format("DD MMM, dddd")}</span>
            <span className="text-muted-foreground">·</span>
            <span className="text-primary">{records.length} records</span>
          </div>
        )}
      </div>

      {/* Desktop/Tablet Horizontal Matrix View (hidden on mobile) */}
      <div className="hidden md:block overflow-x-auto">
        <div className="min-w-[760px] p-6 space-y-2">
          {/* Top 24-Hour Ruler Axis */}
          <div className="flex items-center pb-2 border-b border-border/40 select-none">
            {/* Left Header Column Spacer for Employee info */}
            <div className="w-48 shrink-0 pr-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Employee
            </div>

            {/* Right Ruler Axis across 24h with curated non-colliding ticks */}
            <div className="flex-1 relative h-6">
              {/* Subtle ticks for all 24 hours */}
              {allHours.map((h) => {
                const leftPct = (h / 24) * 100;
                const isShiftPeak = h === 9 || h === 18;
                return (
                  <div
                    key={h}
                    style={{ left: `${leftPct}%` }}
                    className="absolute -translate-x-1/2 bottom-0 flex flex-col items-center"
                  >
                    <span
                      className={cn(
                        "w-px",
                        isShiftPeak ? "h-2.5 bg-primary font-bold" : "h-1 bg-border/60"
                      )}
                    />
                  </div>
                );
              })}

              {/* Labeled text nodes for major intervals only (Zero Collision) */}
              {majorHours.map((t) => {
                const leftPct = (t.hour / 24) * 100;
                return (
                  <div
                    key={t.hour}
                    style={{ left: `${leftPct}%` }}
                    className="absolute -translate-x-1/2 top-0 flex flex-col items-center pointer-events-none"
                  >
                    <span
                      className={cn(
                        "text-[10px] tabular-nums whitespace-nowrap",
                        t.isShift ? "font-bold text-foreground" : "text-muted-foreground/70"
                      )}
                    >
                      {t.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Timeline Rows */}
          {records.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No attendance records logged for this filter criteria.
            </div>
          ) : (
            <div className="divide-y divide-border/20 pt-1">
              {records.map((record) => {
                const isHovered = hoveredRowId === record.id;
                const fullName = record.user
                  ? `${record.user.firstName} ${record.user.lastName}`
                  : "Member";

                return (
                  <div
                    key={record.id}
                    onMouseEnter={() => setHoveredRowId(record.id)}
                    onMouseLeave={() => setHoveredRowId(null)}
                    onClick={() => onSelectRecord && onSelectRecord(record)}
                    className={cn(
                      "flex items-center h-12 px-2 rounded-xl transition-colors cursor-pointer group relative",
                      isHovered ? "bg-muted/40" : "hover:bg-muted/20"
                    )}
                  >
                    {/* Left Column: Employee details */}
                    <div className="w-48 shrink-0 pr-4 flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                        {record.user?.firstName?.charAt(0) || <User className="h-3.5 w-3.5" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                          {fullName}
                        </p>
                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground truncate">
                          <span>
                            {record.loginTime
                              ? moment(record.loginTime, "HH:mm:ss").format("hh:mm A")
                              : "No punch"}
                          </span>
                          {record.faceVerified && (
                            <ScanFace className="h-2.5 w-2.5 text-emerald-600 shrink-0" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Visual Timeline Bar with subtle grid background */}
                    <div className="flex-1 relative pl-2 h-6 flex items-center">
                      {/* Subtle vertical shift guideline wires */}
                      <div className="absolute inset-0 pointer-events-none flex">
                        {allHours.map((h) => (
                          <div
                            key={h}
                            style={{ left: `${(h / 24) * 100}%` }}
                            className="absolute inset-y-0 w-px border-l border-border/20"
                          />
                        ))}
                      </div>

                      {/* 24-Hour Timeline Bar */}
                      <AttendanceTimelineBar
                        loginTime={record.loginTime}
                        logoutTime={record.logoutTime}
                        attendanceDate={record.attendanceDate}
                        status={record.status}
                        shiftStart={shiftStart}
                        shiftEnd={shiftEnd}
                        workedHours={record.workedHours}
                        effectiveWorkedHours={record.effectiveWorkedHours}
                        roamingAnomalyDetected={record.roamingAnomalyDetected}
                        outOfFenceHeartbeats={record.outOfFenceHeartbeats}
                        compact={false}
                        showTimeMarkers={false}
                        interactive={true}
                      />
                    </div>

                    {/* Quick Report Trigger on Hover */}
                    {record.user?.id && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onOpenReport) {
                            onOpenReport(record.user!.id);
                          } else {
                            window.location.href = `/attendance/report?employeeId=${record.user!.id}`;
                          }
                        }}
                        className={cn(
                          "h-7 w-7 rounded-lg border border-border bg-background hover:bg-primary hover:text-primary-foreground hover:border-primary flex items-center justify-center shrink-0 ml-1.5 transition-all cursor-pointer shadow-xs",
                          isHovered ? "opacity-100" : "opacity-0 pointer-events-none md:opacity-0"
                        )}
                        title="View Complete Attendance Report"
                      >
                        <BarChart3 className="h-3.5 w-3.5" />
                      </button>
                    )}

                    {/* Arrow hint on hover */}
                    <ChevronRight
                      className={cn(
                        "h-4 w-4 text-muted-foreground/40 shrink-0 ml-1 transition-transform",
                        isHovered && "translate-x-0.5 text-primary"
                      )}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Mobile-Optimized Timeline Cards View (< 768px / md:hidden) */}
      <div className="block md:hidden p-4 space-y-3">
        {records.length === 0 ? (
          <div className="py-10 text-center text-sm text-muted-foreground">
            No attendance records logged for this filter criteria.
          </div>
        ) : (
          records.map((record) => {
            const fullName = record.user
              ? `${record.user.firstName} ${record.user.lastName}`
              : "Member";
            const role = record.user?.designation?.name || record.user?.email || "Employee";

            let workedHoursDisplay = record.workedHours
              ? `${Number(record.workedHours).toFixed(1)}h`
              : "0.0h";
            const isLive = !record.logoutTime && record.loginTime;

            return (
              <div
                key={record.id}
                onClick={() => onSelectRecord && onSelectRecord(record)}
                className="rounded-xl border border-border/80 bg-card p-4 shadow-xs space-y-3 cursor-pointer transition-all hover:border-primary/50"
              >
                {/* Employee Header Row */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                      {record.user?.firstName?.charAt(0) || <User className="h-4 w-4" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-foreground truncate">{fullName}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{role}</p>
                    </div>
                  </div>
                  {renderStatusBadge(record.status)}
                </div>

                {/* Check In / Out Timing Grid */}
                <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-muted/20 border border-border/40 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider block">
                      Check In
                    </span>
                    <span className="font-semibold tabular-nums text-foreground">
                      {record.loginTime
                        ? moment(record.loginTime, "HH:mm:ss").format("hh:mm A")
                        : "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider block">
                      Check Out
                    </span>
                    <span className="font-semibold tabular-nums text-foreground">
                      {record.logoutTime
                        ? moment(record.logoutTime, "HH:mm:ss").format("hh:mm A")
                        : isLive
                          ? "Active Session"
                          : "—"}
                    </span>
                  </div>
                </div>

                {/* Full-width 24-Hour Timeline Bar with Time Markers */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-semibold text-muted-foreground">
                    <span>Day Timeline (24h)</span>
                    <span>Shift: 09:00 AM – 06:00 PM</span>
                  </div>
                  <div className="h-10 pt-0.5 relative">
                    <AttendanceTimelineBar
                      loginTime={record.loginTime}
                      logoutTime={record.logoutTime}
                      attendanceDate={record.attendanceDate}
                      status={record.status}
                      shiftStart={shiftStart}
                      shiftEnd={shiftEnd}
                      workedHours={record.workedHours}
                      effectiveWorkedHours={record.effectiveWorkedHours}
                      roamingAnomalyDetected={record.roamingAnomalyDetected}
                      outOfFenceHeartbeats={record.outOfFenceHeartbeats}
                      compact={false}
                      showTimeMarkers={true}
                      interactive={true}
                    />
                  </div>
                </div>

                {/* Footer Metrics & Tap to Inspect */}
                <div className="flex items-center justify-between pt-1 border-t border-border/40 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground tabular-nums">
                      {workedHoursDisplay}
                    </span>
                    {record.faceVerified && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-600 font-medium">
                        <ScanFace className="h-3 w-3" /> Face
                      </span>
                    )}
                    {record.roamingAnomalyDetected && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] text-amber-600 font-medium">
                        <AlertTriangle className="h-3 w-3" /> Roaming
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {record.user?.id && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onOpenReport) {
                            onOpenReport(record.user!.id);
                          } else {
                            window.location.href = `/attendance/report?employeeId=${record.user!.id}`;
                          }
                        }}
                        className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/60 px-2 py-0.5 text-[11px] font-semibold text-foreground hover:bg-muted"
                      >
                        <BarChart3 className="h-3 w-3 text-primary" />
                        Report
                      </button>
                    )}

                    <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-primary">
                      Inspect
                      <ChevronRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Legend & Summary Footer */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-t border-border/50 bg-muted/20 px-4 sm:px-6 py-3 text-xs gap-3">
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <span className="font-semibold text-foreground">Timeline Legend:</span>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-xs bg-emerald-500 shadow-xs" />
            <span className="text-muted-foreground">Present / Active Work</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-xs bg-rose-500 shadow-xs" />
            <span className="text-muted-foreground">Office Hour Deficit (Late In / Early Out)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-xs bg-muted/60 border border-border" />
            <span className="text-muted-foreground">Off Shift / Idle</span>
          </div>
        </div>

        <span className="text-[11px] text-muted-foreground">
          Shift Hours: {moment(shiftStart, "HH:mm:ss").format("hh:mm A")} – {moment(shiftEnd, "HH:mm:ss").format("hh:mm A")}
        </span>
      </div>
    </div>
  );
}
