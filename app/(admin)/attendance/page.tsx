"use client";

import { useEffect, useState } from "react";
import {
  useApproveOrRejectAttendanceCorrection,
  useGraphQLAttendanceCorrection,
  useGraphQLOrgAttendanceRecords,
} from "@/lib/graphql/attendance/attendanceHooks";
import { ApprovalModal } from "@/components/attendance/ApprovalModal";
import { HeartbeatTimelineModal } from "@/components/attendance/HeartbeatTimelineModal";
import { AttendanceCorrection, AttendanceRecord } from "@/lib/graphql/attendance/types";
import { DataTable, Column } from "@/components/common/DataTable";
import { PageHeader } from "@/components/common/PageHeader";
import moment from "moment";
import {
  Calendar,
  Search,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  User,
  FilePenLine,
  RotateCcw,
  Activity,
  ShieldCheck,
  AlertTriangle,
  ScanFace,
  Layers,
} from "lucide-react";
import { DatePickerSimple } from "@/components/ui/datePicker";
import { Stat } from "@/components/common/Stats";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { SearchInput } from "@/components/common/SearchInput";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { OrganizationFilterSelect } from "@/components/common/OrganizationFilterSelect";
import { useStore } from "@/lib/store/useStore";

export default function AttendancePage() {
  const { user } = useStore();
  const [activeTab, setActiveTab] = useState<"presence" | "corrections">("presence");

  const [startDate, setStartDate] = useState(
    moment().startOf("month").format("YYYY-MM-DD")
  );
  const [endDate, setEndDate] = useState(moment().format("YYYY-MM-DD"));
  const [selectedCorrection, setSelectedCorrection] = useState<AttendanceCorrection | null>(null);
  const [selectedTimelineRecord, setSelectedTimelineRecord] = useState<AttendanceRecord | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [organizationId, setOrganizationId] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const pageSize = 10;
  const [presencePage, setPresencePage] = useState(1);
  const [correctionsPage, setCorrectionsPage] = useState(1);

  // 1. Organization Shift & Presence Logs Query
  const {
    records: presenceRecords,
    total: presenceTotal,
    isLoading: presenceLoading,
    refetch: refetchPresence,
  } = useGraphQLOrgAttendanceRecords({
    page: presencePage,
    pageSize,
    filters: {
      startDate,
      endDate,
      search: debouncedSearchTerm || undefined,
      status: statusFilter === "roaming" ? undefined : statusFilter || undefined,
      roamingOnly: statusFilter === "roaming" ? true : undefined,
      organizationId: organizationId || undefined,
    },
  });

  // 2. Attendance Regularization Corrections Query
  const {
    attendanceCorrections,
    total: correctionsTotal,
    isLoading: correctionsLoading,
    refetchAttendanceCorrections,
  } = useGraphQLAttendanceCorrection({
    page: correctionsPage,
    pageSize,
    filters: {
      search: debouncedSearchTerm || undefined,
      organizationId: organizationId || undefined,
    },
  });

  const loadData = async (start: string, end: string) => {
    if (!start || !end) return;
    await Promise.all([
      refetchPresence({
        page: presencePage,
        pageSize,
        filters: {
          startDate: start,
          endDate: end,
          search: debouncedSearchTerm || undefined,
          status: statusFilter === "roaming" ? undefined : statusFilter || undefined,
          roamingOnly: statusFilter === "roaming" ? true : undefined,
          organizationId: organizationId || undefined,
        },
      }),
      refetchAttendanceCorrections({ startDate: start, endDate: end }),
    ]);
  };

  useEffect(() => {
    loadData(startDate, endDate);
  }, [startDate, endDate]);

  const { approveOrRejectAttendanceCorrection } =
    useApproveOrRejectAttendanceCorrection();

  const handleCorrectionSubmit = async (status: "approved" | "rejected", comments: string) => {
    if (!selectedCorrection) return;
    try {
      await approveOrRejectAttendanceCorrection(selectedCorrection.id!, status, comments);
      setSelectedCorrection(null);
      await loadData(startDate, endDate);
    } catch (err: any) {
      console.error(err);
    }
  };

  // Stats calculation
  const roamingCount = presenceRecords.filter((r) => r.roamingAnomalyDetected).length;
  const verifiedCount = presenceRecords.filter(
    (r) => !r.roamingAnomalyDetected && (r.validHeartbeats || 0) > 0
  ).length;

  const presenceStats = [
    {
      label: "Total shift records",
      value: presenceTotal || 0,
      icon: Calendar,
      color: "text-sky-700 dark:text-sky-400",
      gradient: "bg-sky-500/10",
    },
    {
      label: "Verified presence",
      value: verifiedCount,
      icon: ShieldCheck,
      color: "text-emerald-700 dark:text-emerald-400",
      gradient: "bg-emerald-500/10",
    },
    {
      label: "Roaming flagged",
      value: roamingCount,
      icon: AlertTriangle,
      color: "text-destructive",
      gradient: "bg-destructive/10",
    },
    {
      label: "Pending corrections",
      value: correctionsTotal || 0,
      icon: Clock,
      color: "text-amber-700 dark:text-amber-400",
      gradient: "bg-amber-500/10",
    },
  ];

  // ---------------------------------------------------------------------------
  // Columns: Presence & Heartbeats Table
  // ---------------------------------------------------------------------------
  const presenceColumns: Column<AttendanceRecord>[] = [
    {
      key: "user",
      label: "Employee",
      render: (_: any, row: AttendanceRecord) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
            {row.user?.firstName?.charAt(0) || <User className="h-3.5 w-3.5" />}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">
              {row.user ? `${row.user.firstName} ${row.user.lastName}` : "Member"}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {row.user?.designation?.name || row.user?.email || "—"}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "attendanceDate",
      label: "Date",
      render: (val: string) => (
        <div>
          <p className="text-sm font-medium text-foreground">
            {moment(val).format("DD MMM YYYY")}
          </p>
          <p className="text-xs text-muted-foreground">{moment(val).format("dddd")}</p>
        </div>
      ),
    },
    {
      key: "timing",
      label: "Recorded Shift",
      render: (_: any, row: AttendanceRecord) => (
        <div className="flex flex-col gap-1">
          <div className="inline-flex items-center gap-1.5 text-sm tabular-nums text-foreground">
            <span>{row.loginTime ? moment(row.loginTime, "HH:mm:ss").format("hh:mm A") : "—"}</span>
            <ArrowRight className="h-3 w-3 text-muted-foreground" />
            <span>{row.logoutTime ? moment(row.logoutTime, "HH:mm:ss").format("hh:mm A") : "Active"}</span>
          </div>
          {row.faceVerified && (
            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
              <ScanFace className="h-3 w-3" /> Face Verified
            </span>
          )}
        </div>
      ),
    },
    {
      key: "workedHours",
      label: "Gross Hours",
      render: (val: number | null) => (
        <span className="text-sm font-medium tabular-nums text-muted-foreground">
          {val != null ? `${Number(val).toFixed(2)}h` : "—"}
        </span>
      ),
    },
    {
      key: "effectiveWorkedHours",
      label: "Effective Hours",
      render: (_: any, row: AttendanceRecord) => {
        const gross = Number(row.workedHours) || 0;
        const effective = row.effectiveWorkedHours != null ? Number(row.effectiveWorkedHours) : gross;
        const diff = Math.max(0, Number((gross - effective).toFixed(2)));

        return (
          <div className="flex flex-col gap-0.5">
            <span
              className={cn(
                "text-sm font-bold tabular-nums",
                diff > 0 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"
              )}
            >
              {effective.toFixed(2)}h
            </span>
            {diff > 0 && (
              <span className="text-[10px] font-medium text-destructive">
                -{diff.toFixed(2)}h roaming
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "heartbeats",
      label: "Presence & Heartbeats",
      render: (_: any, row: AttendanceRecord) => {
        const total = row.totalHeartbeats ?? (row.heartbeats?.length || 0);
        const valid = row.validHeartbeats ?? (row.heartbeats?.filter((h) => h.isWithinGeofence).length || 0);
        const pct = total > 0 ? Math.round((valid / total) * 100) : 100;
        const hasAnomaly = row.roamingAnomalyDetected || (total - valid > 1);

        if (total === 0) {
          return <span className="text-xs text-muted-foreground">No pings logged</span>;
        }

        return (
          <div className="flex flex-col gap-1">
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold w-fit",
                hasAnomaly
                  ? "border border-destructive/30 bg-destructive/10 text-destructive"
                  : "border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
              )}
            >
              {hasAnomaly ? <AlertTriangle className="h-3 w-3" /> : <ShieldCheck className="h-3 w-3" />}
              {pct}% ({valid}/{total})
            </span>
            {row.roamingNotes && (
              <span className="text-[10px] text-destructive truncate max-w-[140px]" title={row.roamingNotes}>
                {row.roamingNotes}
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "status",
      label: "Status",
      render: (status: string) => {
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
              "inline-flex rounded-md border px-2 py-0.5 text-[11px] font-medium capitalize",
              map[status] || "bg-muted text-muted-foreground"
            )}
          >
            {status.replace(/_/g, " ")}
          </span>
        );
      },
    },
    {
      key: "actions",
      label: "Actions",
      render: (_: any, row: AttendanceRecord) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSelectedTimelineRecord(row)}
          className="h-8 gap-1.5 text-xs hover:border-primary/50"
        >
          <Activity className="h-3.5 w-3.5 text-primary" />
          Audit Timeline
        </Button>
      ),
    },
  ];

  // ---------------------------------------------------------------------------
  // Columns: Corrections Table
  // ---------------------------------------------------------------------------
  const correctionColumns: Column<AttendanceCorrection>[] = [
    {
      key: "requestedBy",
      label: "Employee",
      render: (_: any, row: AttendanceCorrection) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
            {row.requestedBy?.firstName?.charAt(0) || <User className="h-3.5 w-3.5" />}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">
              {row.requestedBy?.firstName} {row.requestedBy?.lastName}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {row.requestedBy?.designation?.name || "—"}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "attendanceRecord.attendanceDate",
      label: "Date",
      render: (_: any, row: AttendanceCorrection) => (
        <div>
          <p className="text-sm text-foreground">
            {moment(row.attendanceRecord?.attendanceDate).format("DD MMM YYYY")}
          </p>
          <p className="text-xs text-muted-foreground">
            {moment(row.attendanceRecord?.attendanceDate).format("dddd")}
          </p>
        </div>
      ),
    },
    {
      key: "correctionRequest",
      label: "Recorded",
      render: (_: any, row: AttendanceCorrection) => (
        <div className="inline-flex items-center gap-1.5 text-sm tabular-nums text-foreground">
          {row.attendanceRecord?.loginTime
            ? moment(row.attendanceRecord.loginTime, "HH:mm:ss").format("hh:mm A")
            : "—"}
          <ArrowRight className="h-3 w-3 text-muted-foreground" />
          {row.attendanceRecord?.logoutTime
            ? moment(row.attendanceRecord.logoutTime, "HH:mm:ss").format("hh:mm A")
            : "—"}
        </div>
      ),
    },
    {
      key: "loginInfo",
      label: "Requested",
      render: (_: any, row: AttendanceCorrection) => (
        <div className="inline-flex items-center gap-1.5 text-sm tabular-nums text-muted-foreground">
          {row.correctedLoginTime
            ? moment(row.correctedLoginTime, "HH:mm:ss").format("hh:mm A")
            : "—"}
          <ArrowRight className="h-3 w-3" />
          {row.correctedLogoutTime
            ? moment(row.correctedLogoutTime, "HH:mm:ss").format("hh:mm A")
            : "—"}
        </div>
      ),
    },
    {
      key: "reason",
      label: "Reason",
      render: (_: string, row: AttendanceCorrection) => (
        <p className="max-w-[200px] line-clamp-2 text-sm text-muted-foreground">
          {row.reason || "—"}
        </p>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (_: string, row: AttendanceCorrection) => (
        <span
          className={cn(
            "rounded-md px-1.5 py-0.5 text-[11px] font-medium capitalize",
            row.status === "approved"
              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
              : row.status === "rejected"
                ? "bg-destructive/10 text-destructive"
                : row.status === "pending"
                  ? "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                  : "bg-muted text-muted-foreground"
          )}
        >
          {row.status}
        </span>
      ),
    },
    {
      key: "correctionActions",
      label: "Actions",
      render: (_: unknown, row: AttendanceCorrection) => {
        if (row.status === "pending") {
          return (
            <button
              onClick={() => setSelectedCorrection(row)}
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border px-2.5 text-xs font-medium hover:bg-muted"
            >
              <FilePenLine className="h-3.5 w-3.5" />
              Review
            </button>
          );
        }
        return <span className="text-xs text-muted-foreground">Processed</span>;
      },
    },
  ];

  return (
    <div className="page-shell space-y-6">
      <PageHeader
        title="Attendance & Presence Hub"
        description="Monitor verified presence, periodic geo-heartbeats, effective work hours, and regularization requests."
        actions={
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-border bg-muted/50 p-1">
              <button
                onClick={() => setActiveTab("presence")}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all",
                  activeTab === "presence"
                    ? "bg-card text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Activity className="h-3.5 w-3.5 text-primary" />
                Presence Logs & Heartbeats
              </button>
              <button
                onClick={() => setActiveTab("corrections")}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all",
                  activeTab === "corrections"
                    ? "bg-card text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <FilePenLine className="h-3.5 w-3.5" />
                Regularization Requests
                {(correctionsTotal || 0) > 0 && (
                  <span className="rounded-full bg-primary/10 px-1.5 py-0.2 text-[10px] font-bold text-primary">
                    {correctionsTotal}
                  </span>
                )}
              </button>
            </div>
          </div>
        }
      />

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {presenceStats.map((stat, i) => (
          <Stat
            key={i}
            icon={stat.icon}
            label={stat.label}
            value={stat.value}
            color={stat.color}
            gradient={stat.gradient}
          />
        ))}
      </div>

      {/* Filter Toolbar */}
      <div className="rounded-xl border border-border bg-card p-4 sm:p-5 space-y-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-end">
          <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2">
            <DatePickerSimple
              label="Start date"
              value={startDate}
              onChange={(date) => setStartDate(moment(date).format("YYYY-MM-DD"))}
            />
            <DatePickerSimple
              label="End date"
              value={endDate}
              onChange={(date) => setEndDate(moment(date).format("YYYY-MM-DD"))}
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => loadData(startDate, endDate)}
              className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 md:flex-none"
            >
              <Search className="h-4 w-4" />
              Apply
            </button>
            <button
              onClick={() => loadData(startDate, endDate)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
              title="Refresh"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center justify-between">
          <div className="max-w-md flex-1">
            <SearchInput
              placeholder="Search employees by name or email…"
              value={searchTerm}
              onChange={setSearchTerm}
            />
          </div>

          {activeTab === "presence" && (
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { label: "All", value: "" },
                { label: "Present", value: "present" },
                { label: "Late Login", value: "late_login" },
                { label: "Half Day", value: "half_day" },
                { label: "🚩 Roaming Flagged", value: "roaming" },
              ].map((pill) => (
                <button
                  key={pill.value}
                  onClick={() => setStatusFilter(pill.value)}
                  className={cn(
                    "rounded-lg px-2.5 py-1 text-xs font-medium transition-colors border",
                    statusFilter === pill.value
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted/40 text-muted-foreground border-border hover:bg-muted"
                  )}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          )}

          {user?.role === "superadmin" && (
            <OrganizationFilterSelect
              value={organizationId}
              onChange={setOrganizationId}
            />
          )}
        </div>
      </div>

      {/* Main Content Table based on Active Tab */}
      {activeTab === "presence" ? (
        <DataTable
          data={presenceRecords}
          columns={presenceColumns}
          isLoading={presenceLoading}
          total={presenceTotal}
          currentPage={presencePage}
          pageSize={pageSize}
          onPageChange={setPresencePage}
          paginationLabel="attendance records"
        />
      ) : (
        <DataTable
          data={attendanceCorrections}
          columns={correctionColumns}
          isLoading={correctionsLoading}
          total={correctionsTotal}
          currentPage={correctionsPage}
          pageSize={pageSize}
          onPageChange={setCorrectionsPage}
          paginationLabel="corrections"
        />
      )}

      {/* Regularization Approval Modal */}
      {selectedCorrection && (
        <ApprovalModal
          correction={selectedCorrection}
          onClose={() => setSelectedCorrection(null)}
          onSubmit={handleCorrectionSubmit}
        />
      )}

      {/* Periodic Geo-Heartbeat Audit Timeline Modal */}
      {selectedTimelineRecord && (
        <HeartbeatTimelineModal
          record={selectedTimelineRecord}
          onClose={() => setSelectedTimelineRecord(null)}
        />
      )}
    </div>
  );
}
