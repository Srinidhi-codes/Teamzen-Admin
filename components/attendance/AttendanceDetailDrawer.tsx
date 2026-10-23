"use client";

import React from "react";
import moment from "moment";
import {
  X,
  User,
  Clock,
  Calendar,
  MapPin,
  ShieldCheck,
  AlertTriangle,
  ScanFace,
  TrendingUp,
  Activity,
  CheckCircle2,
  XCircle,
  ExternalLink,
  BarChart3,
} from "lucide-react";
import { AttendanceRecord } from "@/lib/graphql/attendance/types";
import { AttendanceTimelineBar } from "./AttendanceTimelineBar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface AttendanceDetailDrawerProps {
  record: AttendanceRecord | null;
  onClose: () => void;
  onOpenAuditModal?: (record: AttendanceRecord) => void;
  onOpenReport?: (employeeId: string) => void;
  onOpenReportModal?: (employeeId: string) => void;
  onApproveOffHours?: (record: AttendanceRecord, status: "approved" | "rejected") => void;
  isApproving?: boolean;
}

export function AttendanceDetailDrawer({
  record,
  onClose,
  onOpenAuditModal,
  onOpenReport,
  onOpenReportModal,
  onApproveOffHours,
  isApproving = false,
}: AttendanceDetailDrawerProps) {
  const router = useRouter();
  if (!record) return null;

  const officeRadius = record.officeLocation?.geoRadiusMeters || 200;
  const totalPings = record.totalHeartbeats ?? (record.heartbeats?.length || 0);
  const validPings = record.validHeartbeats ?? (record.heartbeats?.filter((h) => h.isWithinGeofence).length || 0);
  const outOfFence = record.outOfFenceHeartbeats ?? Math.max(0, totalPings - validPings);

  const isShiftActive = !record.logoutTime && record.loginTime;
  let grossHours = Number(record.workedHours) || 0;
  let effectiveHours = record.effectiveWorkedHours != null ? Number(record.effectiveWorkedHours) : grossHours;

  if (isShiftActive && record.loginTime && record.attendanceDate) {
    const loginDateTime = moment(`${record.attendanceDate} ${record.loginTime}`, "YYYY-MM-DD HH:mm:ss");
    const now = moment();
    grossHours = Math.max(0, now.diff(loginDateTime, "hours", true));
    effectiveHours = outOfFence > 0 ? Math.max(0, grossHours - Math.max(0, outOfFence * 0.33 - 1.0)) : grossHours;
  }

  const roamingDiscrepancy = Math.max(0, Number((grossHours - effectiveHours).toFixed(2)));

  // Calculate arrival & departure diffs against standard 09:00 - 18:00
  let arrivalStatus = "On Time";
  let arrivalColor = "text-emerald-600 dark:text-emerald-400";
  if (record.loginTime) {
    const [h, m] = record.loginTime.split(":").map(Number);
    const loginMin = h * 60 + (m || 0);
    if (loginMin < 535) {
      arrivalStatus = `${540 - loginMin}m Early`;
      arrivalColor = "text-emerald-600 dark:text-emerald-400";
    } else if (loginMin > 555) {
      arrivalStatus = `${loginMin - 540}m Late`;
      arrivalColor = "text-rose-600 dark:text-rose-400";
    }
  }

  let departureStatus = record.logoutTime ? "On Time" : isShiftActive ? "Currently Active" : "No Logout";
  let departureColor = "text-muted-foreground";
  if (record.logoutTime) {
    const [h, m] = record.logoutTime.split(":").map(Number);
    const logoutMin = h * 60 + (m || 0);
    if (logoutMin < 1065) {
      departureStatus = `${1080 - logoutMin}m Early Exit`;
      departureColor = "text-rose-600 dark:text-rose-400";
    } else if (logoutMin > 1095) {
      departureStatus = `${logoutMin - 1080}m Overtime`;
      departureColor = "text-emerald-600 dark:text-emerald-400";
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shadow-inner">
              {record.user?.firstName?.charAt(0) || <User className="h-4 w-4" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-foreground">
                  {record.user ? `${record.user.firstName} ${record.user.lastName}` : "Employee"}
                </h2>
                <span className="rounded-md border border-border bg-muted/60 px-2 py-0.5 text-[11px] font-medium capitalize text-foreground">
                  {record.status.replace(/_/g, " ")}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {record.user?.designation?.name || record.user?.email || "Member"} ·{" "}
                {moment(record.attendanceDate).format("dddd, DD MMMM YYYY")}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto px-6 py-5 space-y-6">
          {/* Detailed 24h Day Timeline Bar */}
          <div className="rounded-xl border border-border bg-card p-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
              <span className="flex items-center gap-1.5 text-foreground">
                <Clock className="h-3.5 w-3.5 text-primary" />
                24-Hour Day Timeline
              </span>
              <span>Office Shift: 09:00 AM – 06:00 PM</span>
            </div>

            <div className="h-10 pt-0.5 relative">
              <AttendanceTimelineBar
                loginTime={record.loginTime}
                logoutTime={record.logoutTime}
                attendanceDate={record.attendanceDate}
                status={record.status}
                workedHours={record.workedHours}
                effectiveWorkedHours={record.effectiveWorkedHours}
                roamingAnomalyDetected={record.roamingAnomalyDetected}
                outOfFenceHeartbeats={record.outOfFenceHeartbeats}
                compact={false}
                showTimeMarkers={true}
                interactive={true}
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2 text-[11px] text-muted-foreground border-t border-border/40">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-xs bg-emerald-500" />
                Present
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-xs bg-rose-500" />
                Office Hours Deficit
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-xs bg-muted/60 border border-border" />
                Off Shift
              </span>
            </div>
          </div>

          {/* Shift Compliance & Timing Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl border border-border bg-card p-3 shadow-xs">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Check In
              </span>
              <p className="mt-1 text-base font-bold text-foreground tabular-nums">
                {record.loginTime ? moment(record.loginTime, "HH:mm:ss").format("hh:mm A") : "—"}
              </p>
              <span className={cn("text-[11px] font-semibold", arrivalColor)}>
                {arrivalStatus}
              </span>
            </div>

            <div className="rounded-xl border border-border bg-card p-3 shadow-xs">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Check Out
              </span>
              <p className="mt-1 text-base font-bold text-foreground tabular-nums">
                {record.logoutTime ? moment(record.logoutTime, "HH:mm:ss").format("hh:mm A") : isShiftActive ? "Active" : "—"}
              </p>
              <span className={cn("text-[11px] font-semibold", departureColor)}>
                {departureStatus}
              </span>
            </div>

            <div className="rounded-xl border border-border bg-card p-3 shadow-xs">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Gross Hours
              </span>
              <p className="mt-1 text-base font-bold text-foreground tabular-nums">
                {grossHours.toFixed(2)}h
              </p>
              <span className="text-[11px] text-muted-foreground">Total logged</span>
            </div>

            <div className="rounded-xl border border-border bg-card p-3 shadow-xs">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Effective Hours
              </span>
              <p
                className={cn(
                  "mt-1 text-base font-bold tabular-nums",
                  roamingDiscrepancy > 0
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-emerald-600 dark:text-emerald-400"
                )}
              >
                {effectiveHours.toFixed(2)}h
              </p>
              <span className="text-[11px] text-muted-foreground">
                {roamingDiscrepancy > 0 ? `-${roamingDiscrepancy.toFixed(2)}h roaming` : "Verified"}
              </span>
            </div>
          </div>

          {/* Anomaly callout if roaming flagged */}
          {record.roamingAnomalyDetected && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-destructive">
                  Discrepancy / Roaming Flagged
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {record.roamingNotes ||
                    `User was detected outside the office geofence for ${outOfFence} pings. Work hours have been adjusted.`}
                </p>
              </div>
            </div>
          )}

          {/* Verification & Geofence Details */}
          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Presence Telemetry & Geofence
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30">
                <span className="text-muted-foreground">Assigned Office</span>
                <span className="font-semibold text-foreground">
                  {record.officeLocation?.name || "Corporate HQ"} ({officeRadius}m)
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30">
                <span className="text-muted-foreground">Check-in Distance</span>
                <span className="font-semibold text-foreground">
                  {record.loginDistance != null ? `${record.loginDistance}m` : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30">
                <span className="text-muted-foreground">Face Verification</span>
                <span
                  className={cn(
                    "font-semibold flex items-center gap-1",
                    record.faceVerified ? "text-emerald-600" : "text-muted-foreground"
                  )}
                >
                  <ScanFace className="h-3.5 w-3.5" />
                  {record.faceVerified ? "Verified Match" : "Not Enrolled / Skipped"}
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30">
                <span className="text-muted-foreground">Periodic Geo-Heartbeats</span>
                <span className="font-semibold text-foreground">
                  {validPings} valid / {totalPings} total ({totalPings > 0 ? Math.round((validPings / totalPings) * 100) : 100}%)
                </span>
              </div>
            </div>
          </div>

          {/* Pending Shift Approval Callout */}
          {record.approvalStatus === "pending" && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                  {record.isWeekendWork ? "Weekend Shift Approval Required" : "Off-Hours Shift Approval Required"}
                </h4>
              </div>
              <p className="text-xs text-muted-foreground">
                This employee marked attendance outside standard office schedule. Review the timings and approve or reject this punch.
              </p>
              {onApproveOffHours && (
                <div className="flex items-center gap-2 pt-1">
                  <Button
                    size="sm"
                    onClick={() => onApproveOffHours(record, "approved")}
                    disabled={isApproving}
                    className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Approve Shift
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onApproveOffHours(record, "rejected")}
                    disabled={isApproving}
                    className="gap-1.5 border-destructive/40 text-destructive hover:bg-destructive/10"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    Reject Shift
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-6 py-3.5 bg-muted/20">
          <div className="flex items-center gap-2 flex-wrap">
            {onOpenAuditModal && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onOpenAuditModal(record)}
                className="gap-1.5 text-xs"
              >
                <Activity className="h-3.5 w-3.5 text-primary" />
                GPS Breadcrumbs
              </Button>
            )}
          </div>

          <Button variant="outline" size="sm" onClick={onClose} className="ml-auto">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
