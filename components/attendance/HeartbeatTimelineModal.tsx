"use client";

import React from "react";
import moment from "moment";
import {
  X,
  MapPin,
  Clock,
  ShieldCheck,
  AlertTriangle,
  BatteryCharging,
  Compass,
  CheckCircle2,
  ExternalLink,
  Activity,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AttendanceRecord, AttendanceHeartbeat } from "@/lib/graphql/attendance/types";
import { cn } from "@/lib/utils";

interface HeartbeatTimelineModalProps {
  record: AttendanceRecord;
  onClose: () => void;
}

export function HeartbeatTimelineModal({ record, onClose }: HeartbeatTimelineModalProps) {
  const heartbeats = record.heartbeats || [];
  const total = record.totalHeartbeats ?? heartbeats.length;
  const valid = record.validHeartbeats ?? heartbeats.filter((h) => h.isWithinGeofence).length;
  const outOfFence = record.outOfFenceHeartbeats ?? (total - valid);

  const presencePct = total > 0 ? Math.round((valid / total) * 100) : 100;
  const hasAnomaly = record.roamingAnomalyDetected || outOfFence > 1;

  const grossHours = Number(record.workedHours) || 0;
  const effectiveHours = record.effectiveWorkedHours != null ? Number(record.effectiveWorkedHours) : grossHours;
  const discrepancy = Math.max(0, Number((grossHours - effectiveHours).toFixed(2)));

  const formatHours = (hrs: number) => {
    const h = Math.floor(hrs);
    const m = Math.round((hrs - h) * 60);
    return `${h}h ${m}m`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-inner">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-foreground">
                  Heartbeat Audit Timeline
                </h2>
                {hasAnomaly ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-destructive/30 bg-destructive/10 px-2 py-0.5 text-[11px] font-semibold text-destructive">
                    <AlertTriangle className="h-3 w-3" />
                    Roaming Flagged
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                    <ShieldCheck className="h-3 w-3" />
                    Verified On-Premise
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {record.user ? `${record.user.firstName} ${record.user.lastName} · ` : ""}
                {moment(record.attendanceDate).format("dddd, DD MMMM YYYY")}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="overflow-y-auto px-6 py-5 space-y-6">
          {/* Shift & Effective Hours Overview Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl border border-border bg-card p-3 shadow-xs">
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Gross Shift
              </span>
              <p className="mt-1 text-lg font-bold text-foreground tabular-nums">
                {formatHours(grossHours)}
              </p>
              <span className="text-[10px] text-muted-foreground">
                {record.loginTime ? moment(record.loginTime, "HH:mm:ss").format("hh:mm A") : "—"} →{" "}
                {record.logoutTime ? moment(record.logoutTime, "HH:mm:ss").format("hh:mm A") : "Active"}
              </span>
            </div>

            <div className="rounded-xl border border-border bg-card p-3 shadow-xs">
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Effective Hours
              </span>
              <p
                className={cn(
                  "mt-1 text-lg font-bold tabular-nums",
                  effectiveHours < 4 && grossHours >= 4
                    ? "text-destructive"
                    : "text-emerald-600 dark:text-emerald-400"
                )}
              >
                {formatHours(effectiveHours)}
              </p>
              <span className="text-[10px] text-muted-foreground">
                Verified on-premises
              </span>
            </div>

            <div className="rounded-xl border border-border bg-card p-3 shadow-xs">
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Roaming Deducted
              </span>
              <p className={cn("mt-1 text-lg font-bold tabular-nums", discrepancy > 0 ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground")}>
                {discrepancy > 0 ? `-${formatHours(discrepancy)}` : "0h 0m"}
              </p>
              <span className="text-[10px] text-muted-foreground">
                Beyond 1h break grace
              </span>
            </div>

            <div className="rounded-xl border border-border bg-card p-3 shadow-xs">
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                In-Fence Ratio
              </span>
              <p className="mt-1 text-lg font-bold text-foreground tabular-nums">
                {presencePct}%
              </p>
              <span className="text-[10px] text-muted-foreground">
                {valid} of {total} pings inside
              </span>
            </div>
          </div>

          {/* Anomaly Callout if Detected */}
          {hasAnomaly && (
            <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-3.5 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-destructive">
                  Discrepancy / Roaming Anomaly Detected
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {record.roamingNotes ||
                    `Employee was detected outside the office geofence for ${outOfFence} periodic checks. Effective worked hours have been adjusted.`}
                </p>
              </div>
            </div>
          )}

          {/* Presence Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Presence Distribution</span>
              <span className="font-medium text-foreground">
                {valid} In-Office / {outOfFence} Away
              </span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden flex">
              <div
                style={{ width: `${presencePct}%` }}
                className="bg-emerald-500 transition-all duration-500"
                title={`${valid} In-fence pings`}
              />
              <div
                style={{ width: `${100 - presencePct}%` }}
                className="bg-destructive transition-all duration-500"
                title={`${outOfFence} Out-of-fence pings`}
              />
            </div>
          </div>

          {/* Heartbeat Breadcrumbs Timeline */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-primary" />
                Periodic Breadcrumbs ({heartbeats.length} recorded)
              </h3>
              {record.officeLocation && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  Office: {record.officeLocation.name} (Radius: {record.officeLocation.geoRadiusMeters || 200}m)
                </span>
              )}
            </div>

            {heartbeats.length === 0 ? (
              <div className="rounded-xl border border-border bg-muted/20 p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  No periodic background heartbeats logged for this session yet.
                </p>
              </div>
            ) : (
              <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                {heartbeats.map((hb, index) => {
                  const mapUrl = `https://www.google.com/maps?q=${hb.latitude},${hb.longitude}`;
                  return (
                    <div key={hb.id || index} className="relative flex items-start justify-between gap-4 text-sm group">
                      {/* Node Dot */}
                      <span
                        className={cn(
                          "absolute -left-6 top-1 h-3 w-3 rounded-full border-2 border-card ring-2 transition-all",
                          hb.isMocked
                            ? "bg-destructive ring-destructive/30"
                            : hb.isWithinGeofence
                              ? "bg-emerald-500 ring-emerald-500/30"
                              : "bg-destructive ring-destructive/30"
                        )}
                      />

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground tabular-nums">
                            {moment(hb.timestamp).format("hh:mm A")}
                          </span>
                          <span
                            className={cn(
                              "inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider",
                              hb.isMocked
                                ? "bg-destructive/10 text-destructive border border-destructive/20"
                                : hb.isWithinGeofence
                                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                                  : "bg-destructive/10 text-destructive border border-destructive/20"
                            )}
                          >
                            {hb.isMocked
                              ? "Mock GPS"
                              : hb.isWithinGeofence
                                ? "Inside Office"
                                : "Outside Office"}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Compass className="h-3 w-3" />
                            {hb.distanceMeters}m from office
                          </span>
                          {hb.accuracyMeters != null && (
                            <span>±{Math.round(hb.accuracyMeters)}m precision</span>
                          )}
                          {hb.batteryLevel != null && (
                            <span className="flex items-center gap-1">
                              <BatteryCharging className="h-3 w-3" />
                              {Math.round(hb.batteryLevel * 100)}%
                            </span>
                          )}
                        </div>
                      </div>

                      {/* External Map Link */}
                      <a
                        href={mapUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors shrink-0 mt-0.5"
                      >
                        View map
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-border px-6 py-3.5 bg-muted/20">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
