"use client";

import React, { useState, useMemo } from "react";
import moment from "moment";
import { AttendanceCorrection } from "@/lib/graphql/attendance/types";
import { AttendanceTimelineBar } from "./AttendanceTimelineBar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  ArrowRight,
  FilePenLine,
  Calendar,
  AlertCircle,
  ChevronRight,
  Check,
  X,
  MessageSquare,
} from "lucide-react";

interface AttendanceRegularizationMasterDetailProps {
  corrections: AttendanceCorrection[];
  isLoading?: boolean;
  onApproveReject: (correctionId: string, status: "approved" | "rejected", comments: string) => Promise<void>;
  className?: string;
}

export function AttendanceRegularizationMasterDetail({
  corrections = [],
  isLoading = false,
  onApproveReject,
  className,
}: AttendanceRegularizationMasterDetailProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [comments, setComments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Status counts
  const counts = useMemo(() => {
    return {
      all: corrections.length,
      pending: corrections.filter((c) => c.status === "pending").length,
      approved: corrections.filter((c) => c.status === "approved").length,
      rejected: corrections.filter((c) => c.status === "rejected").length,
    };
  }, [corrections]);

  // Filtered list
  const filteredCorrections = useMemo(() => {
    return corrections.filter((c) => {
      const matchesStatus = statusFilter === "all" || c.status === statusFilter;
      if (!matchesStatus) return false;

      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      const name = `${c.requestedBy?.firstName || ""} ${c.requestedBy?.lastName || ""}`.toLowerCase();
      const email = (c.requestedBy?.email || "").toLowerCase();
      const reason = (c.reason || "").toLowerCase();
      return name.includes(term) || email.includes(term) || reason.includes(term);
    });
  }, [corrections, statusFilter, searchTerm]);

  // Auto-select first item if none or out of filter
  const effectiveSelected = useMemo(() => {
    if (selectedId) {
      const found = filteredCorrections.find((c) => c.id === selectedId);
      if (found) return found;
    }
    return filteredCorrections[0] || null;
  }, [selectedId, filteredCorrections]);

  const handleAction = async (status: "approved" | "rejected") => {
    if (!effectiveSelected) return;
    try {
      setIsSubmitting(true);
      await onApproveReject(effectiveSelected.id, status, comments);
      setComments("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="h-3 w-3" /> Approved
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 rounded-md border border-destructive/30 bg-destructive/10 px-2 py-0.5 text-[11px] font-semibold text-destructive">
            <XCircle className="h-3 w-3" /> Rejected
          </span>
        );
      case "pending":
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:text-amber-400">
            <Clock className="h-3 w-3" /> Pending Review
          </span>
        );
    }
  };

  return (
    <div className={cn("grid grid-cols-1 lg:grid-cols-12 gap-6", className)}>
      {/* Left Column (Master List) */}
      <div className="lg:col-span-5 flex flex-col rounded-2xl border border-border bg-card shadow-xs overflow-hidden h-[760px]">
        {/* Top Filter and Search Bar */}
        <div className="p-4 border-b border-border/70 bg-muted/20 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by employee or reason…"
              className="w-full h-9 pl-9 pr-3 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
            />
          </div>

          {/* Status Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
            {[
              { id: "all", label: "All", count: counts.all },
              { id: "pending", label: "Pending", count: counts.pending },
              { id: "approved", label: "Approved", count: counts.approved },
              { id: "rejected", label: "Rejected", count: counts.rejected },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id as any)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer",
                  statusFilter === tab.id
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <span>{tab.label}</span>
                <span
                  className={cn(
                    "text-[10px] px-1.5 py-0.2 rounded-full",
                    statusFilter === tab.id
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-muted-foreground/15 text-muted-foreground"
                  )}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Requests List */}
        <div className="flex-1 overflow-y-auto divide-y divide-border/30">
          {filteredCorrections.length === 0 ? (
            <div className="p-12 text-center text-sm text-muted-foreground">
              <FilePenLine className="h-8 w-8 mx-auto mb-2 opacity-30 text-muted-foreground" />
              No regularization requests matching this filter.
            </div>
          ) : (
            filteredCorrections.map((item) => {
              const isSelected = effectiveSelected?.id === item.id;
              const dateLabel = moment(item.attendanceRecord?.attendanceDate).format("ddd, DD MMM YYYY");

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedId(item.id)}
                  className={cn(
                    "p-4 transition-all duration-150 cursor-pointer group flex flex-col gap-2",
                    isSelected
                      ? "bg-primary/10 border-l-4 border-l-primary"
                      : "hover:bg-muted/30"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="h-8 w-8 rounded-lg bg-primary/15 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                        {item.requestedBy?.firstName?.charAt(0) || <User className="h-3.5 w-3.5" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-foreground truncate">
                          {item.requestedBy ? `${item.requestedBy.firstName} ${item.requestedBy.lastName}` : "Employee"}
                        </p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {item.requestedBy?.designation?.name || item.requestedBy?.email || "Staff"}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(item.status)}
                  </div>

                  {/* Date & Timings */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-muted-foreground font-medium flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-primary/70" />
                      {dateLabel}
                    </span>
                    <div className="flex items-center gap-1 font-semibold tabular-nums text-foreground">
                      <span>{item.correctedLoginTime ? moment(item.correctedLoginTime, "HH:mm:ss").format("hh:mm A") : "—"}</span>
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      <span>{item.correctedLogoutTime ? moment(item.correctedLogoutTime, "HH:mm:ss").format("hh:mm A") : "—"}</span>
                    </div>
                  </div>

                  {/* Reason snippet */}
                  {item.reason && (
                    <p className="text-xs text-muted-foreground/80 line-clamp-1 italic">
                      "{item.reason}"
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Column (Detail View) */}
      <div className="lg:col-span-7 flex flex-col rounded-2xl border border-border bg-card shadow-xs overflow-hidden h-[760px]">
        {effectiveSelected ? (
          <div className="flex-1 flex flex-col overflow-y-auto">
            {/* Header */}
            <div className="p-6 border-b border-border/60 bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-base shadow-inner">
                  {effectiveSelected.requestedBy?.firstName?.charAt(0) || <User className="h-5 w-5" />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    {effectiveSelected.requestedBy
                      ? `${effectiveSelected.requestedBy.firstName} ${effectiveSelected.requestedBy.lastName}`
                      : "Employee"}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Requested on {moment(effectiveSelected.createdAt).format("DD MMMM YYYY [at] hh:mm A")}
                  </p>
                </div>
              </div>

              <div>{getStatusBadge(effectiveSelected.status)}</div>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-6 flex-1">
              {/* Date & Shift Context */}
              <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Target Shift Date
                  </span>
                  <span className="text-sm font-bold text-foreground tabular-nums">
                    {moment(effectiveSelected.attendanceRecord?.attendanceDate).format("dddd, DD MMMM YYYY")}
                  </span>
                </div>

                {/* Side-by-side Before & Requested Times */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="rounded-lg border border-border/80 bg-muted/30 p-3 space-y-1">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Originally Logged
                    </span>
                    <div className="flex items-center gap-1.5 text-sm font-bold tabular-nums text-foreground">
                      <span>
                        {effectiveSelected.attendanceRecord?.loginTime
                          ? moment(effectiveSelected.attendanceRecord.loginTime, "HH:mm:ss").format("hh:mm A")
                          : "No In"}
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>
                        {effectiveSelected.attendanceRecord?.logoutTime
                          ? moment(effectiveSelected.attendanceRecord.logoutTime, "HH:mm:ss").format("hh:mm A")
                          : "No Out"}
                      </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      Status: {effectiveSelected.attendanceRecord?.status?.replace(/_/g, " ") || "Pending"}
                    </span>
                  </div>

                  <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 space-y-1">
                    <span className="text-[11px] font-semibold text-primary uppercase tracking-wider">
                      Requested Regularization
                    </span>
                    <div className="flex items-center gap-1.5 text-sm font-bold tabular-nums text-primary">
                      <span>
                        {effectiveSelected.correctedLoginTime
                          ? moment(effectiveSelected.correctedLoginTime, "HH:mm:ss").format("hh:mm A")
                          : "Unchanged"}
                      </span>
                      <ArrowRight className="h-3.5 w-3.5" />
                      <span>
                        {effectiveSelected.correctedLogoutTime
                          ? moment(effectiveSelected.correctedLogoutTime, "HH:mm:ss").format("hh:mm A")
                          : "Unchanged"}
                      </span>
                    </div>
                    <span className="text-[10px] text-primary/80">
                      Standard Office Shift: 09:00 AM – 06:00 PM
                    </span>
                  </div>
                </div>
              </div>

              {/* Day Timeline Visual Comparison */}
              <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Visual Timeline Preview (Requested Correction)
                </h4>
                <div className="h-10 pt-0.5 relative">
                  <AttendanceTimelineBar
                    loginTime={effectiveSelected.correctedLoginTime || effectiveSelected.attendanceRecord?.loginTime}
                    logoutTime={effectiveSelected.correctedLogoutTime || effectiveSelected.attendanceRecord?.logoutTime}
                    attendanceDate={effectiveSelected.attendanceRecord?.attendanceDate}
                    status="present"
                    compact={false}
                    showTimeMarkers={true}
                    interactive={true}
                  />
                </div>
              </div>

              {/* Justification / Reason */}
              <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5 text-primary" />
                  Employee Justification Note
                </span>
                <p className="text-sm text-foreground/90 leading-relaxed italic">
                  "{effectiveSelected.reason || "No explanation provided."}"
                </p>
              </div>

              {/* Admin Decision Actions */}
              {effectiveSelected.status === "pending" ? (
                <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Reviewer Comments / Remarks
                  </label>
                  <textarea
                    rows={2}
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="Add an optional comment for the employee (e.g. Approved per manager email)…"
                    className="w-full rounded-lg border border-border bg-background p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                  <div className="flex items-center gap-2 pt-1">
                    <Button
                      onClick={() => handleAction("approved")}
                      disabled={isSubmitting}
                      className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Approve Regularization
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleAction("rejected")}
                      disabled={isSubmitting}
                      className="gap-1.5 border-destructive/40 text-destructive hover:bg-destructive/10"
                    >
                      <XCircle className="h-4 w-4" />
                      Reject Request
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-border bg-muted/30 p-4 text-xs space-y-1 text-muted-foreground">
                  <p className="font-semibold text-foreground">
                    This regularization request has already been processed as{" "}
                    <span className="capitalize font-bold">{effectiveSelected.status}</span>.
                  </p>
                  {effectiveSelected.approvalComments && (
                    <p>Reviewer Note: "{effectiveSelected.approvalComments}"</p>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
            <Clock className="h-12 w-12 mb-3 opacity-20 text-primary" />
            <p className="text-sm font-semibold text-foreground">Select a Regularization Request</p>
            <p className="text-xs mt-1">
              Choose any request from the list on the left to inspect timings, timeline preview, and approve or reject.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
