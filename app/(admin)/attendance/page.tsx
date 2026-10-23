"use client";

import { useEffect, useState, useMemo } from "react";
import {
  useApproveOrRejectAttendanceCorrection,
  useGraphQLAttendanceCorrection,
  useGraphQLOrgAttendanceRecords,
  useApproveOrRejectOffHoursAttendance,
} from "@/lib/graphql/attendance/attendanceHooks";
import { ApprovalModal } from "@/components/attendance/ApprovalModal";
import { HeartbeatTimelineModal } from "@/components/attendance/HeartbeatTimelineModal";
import { AttendanceTimelineBar } from "@/components/attendance/AttendanceTimelineBar";
import { AttendanceDonutCards } from "@/components/attendance/AttendanceDonutCards";
import { AttendanceTimelineMatrix } from "@/components/attendance/AttendanceTimelineMatrix";
import { AttendanceDetailDrawer } from "@/components/attendance/AttendanceDetailDrawer";
import { AttendanceRegularizationMasterDetail } from "@/components/attendance/AttendanceRegularizationMasterDetail";
import { AttendanceCorrection, AttendanceRecord } from "@/lib/graphql/attendance/types";
import { DataTable, Column } from "@/components/common/DataTable";
import { PageHeader } from "@/components/common/PageHeader";
import moment from "moment";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  LayoutGrid,
  Table as TableIcon,
  ChevronRight,
  Layers,
  BarChart3,
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
  const router = useRouter();
  const { user } = useStore();
  const [activeTab, setActiveTab] = useState<"timeline" | "presence" | "corrections">("timeline");

  const [startDate, setStartDate] = useState(moment().format("YYYY-MM-DD"));
  const [endDate, setEndDate] = useState(moment().format("YYYY-MM-DD"));
  const [selectedCorrection, setSelectedCorrection] = useState<AttendanceCorrection | null>(null);
  const [selectedTimelineRecord, setSelectedTimelineRecord] = useState<AttendanceRecord | null>(null);
  const [inspectedRecord, setInspectedRecord] = useState<AttendanceRecord | null>(null);

  const handleOpenReport = (employeeId: string) => {
    router.push(`/attendance/report?employeeId=${employeeId}`);
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [organizationId, setOrganizationId] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const [timelinePage, setTimelinePage] = useState(1);
  const [presencePage, setPresencePage] = useState(1);
  const [correctionsPage, setCorrectionsPage] = useState(1);

  // Timeline view explicitly paginates 10 per page, Presence table paginates 20 per page
  const activePage = activeTab === "timeline" ? timelinePage : presencePage;
  const activePageSize = activeTab === "timeline" ? 10 : 20;

  const buildPresenceFilters = (start: string, end: string) => ({
    startDate: start,
    endDate: end,
    search: debouncedSearchTerm || undefined,
    status: ["roaming", "pending_approval", "off_hours", "weekend_work"].includes(statusFilter)
      ? undefined
      : statusFilter || undefined,
    roamingOnly: statusFilter === "roaming" ? true : undefined,
    approvalStatus: statusFilter === "pending_approval" ? "pending" : undefined,
    isOffHours: statusFilter === "off_hours" ? true : undefined,
    isWeekendWork: statusFilter === "weekend_work" ? true : undefined,
    organizationId: organizationId || undefined,
  });

  // 1. Organization Shift & Presence Logs Query
  const {
    records: presenceRecords,
    total: presenceTotal,
    isLoading: presenceLoading,
    refetch: refetchPresence,
  } = useGraphQLOrgAttendanceRecords({
    page: activePage,
    pageSize: activePageSize,
    filters: buildPresenceFilters(startDate, endDate),
  });

  // 2. Attendance Regularization Corrections Query
  const {
    attendanceCorrections,
    total: correctionsTotal,
    isLoading: correctionsLoading,
    refetchAttendanceCorrections,
  } = useGraphQLAttendanceCorrection({
    page: correctionsPage,
    pageSize: 50,
    filters: {
      search: debouncedSearchTerm || undefined,
      organizationId: organizationId || undefined,
    },
  });

  const { approveOrReject: approveOffHours, loading: approvingOffHours } =
    useApproveOrRejectOffHoursAttendance();

  const handleApproveOffHours = async (record: AttendanceRecord, status: "approved" | "rejected") => {
    try {
      await approveOffHours(record.id, status);
      await refetchPresence(buildPresenceFilters(startDate, endDate) as any);
      if (inspectedRecord?.id === record.id) {
        setInspectedRecord(null);
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  const loadData = async (start: string, end: string) => {
    if (!start || !end) return;
    await Promise.all([
      refetchPresence({
        page: activePage,
        pageSize: activePageSize,
        filters: buildPresenceFilters(start, end),
      }),
      refetchAttendanceCorrections({ startDate: start, endDate: end }),
    ]);
  };

  useEffect(() => {
    setTimelinePage(1);
    setPresencePage(1);
    loadData(startDate, endDate);
  }, [startDate, endDate, statusFilter, debouncedSearchTerm, organizationId]);

  // Refetch when tab changes so page size switches smoothly between 10 (timeline) and 20 (table)
  useEffect(() => {
    refetchPresence({
      page: activePage,
      pageSize: activePageSize,
      filters: buildPresenceFilters(startDate, endDate),
    });
  }, [activeTab]);

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

  const handleMasterDetailCorrectionSubmit = async (
    correctionId: string,
    status: "approved" | "rejected",
    comments: string
  ) => {
    await approveOrRejectAttendanceCorrection(correctionId, status, comments);
    await loadData(startDate, endDate);
  };

  // Stats calculation
  const roamingCount = presenceRecords.filter((r) => r.roamingAnomalyDetected).length;
  const verifiedCount = presenceRecords.filter(
    (r) => !r.roamingAnomalyDetected && (r.validHeartbeats || 0) > 0
  ).length;
  const pendingApprovalsCount = presenceRecords.filter((r) => r.approvalStatus === "pending").length;

  const presenceStats = [
    {
      label: "Total shift records",
      value: presenceTotal || presenceRecords.length || 0,
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
      label: "Pending shift approvals",
      value: pendingApprovalsCount,
      icon: Clock,
      color: "text-amber-700 dark:text-amber-400",
      gradient: "bg-amber-500/10",
    },
    {
      label: "Roaming flagged",
      value: roamingCount,
      icon: AlertTriangle,
      color: "text-destructive",
      gradient: "bg-destructive/10",
    },
  ];

  // ---------------------------------------------------------------------------
  // Columns: Presence & Heartbeats Table (Enhanced with Compact Timeline Bar)
  // ---------------------------------------------------------------------------
  const presenceColumns: Column<AttendanceRecord>[] = [
    {
      key: "user",
      label: "Employee",
      render: (_: any, row: AttendanceRecord) => (
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => setInspectedRecord(row)}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            {row.user?.firstName?.charAt(0) || <User className="h-3.5 w-3.5" />}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
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
      key: "timeline",
      label: "Visual Day Timeline",
      render: (_: any, row: AttendanceRecord) => (
        <div className="w-52 h-6 flex items-center">
          <AttendanceTimelineBar
            loginTime={row.loginTime}
            logoutTime={row.logoutTime}
            attendanceDate={row.attendanceDate}
            status={row.status}
            workedHours={row.workedHours}
            effectiveWorkedHours={row.effectiveWorkedHours}
            roamingAnomalyDetected={row.roamingAnomalyDetected}
            outOfFenceHeartbeats={row.outOfFenceHeartbeats}
            compact={true}
            showTimeMarkers={false}
            interactive={true}
            onClick={() => setInspectedRecord(row)}
          />
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
      key: "effectiveWorkedHours",
      label: "Effective Hours",
      render: (_: any, row: AttendanceRecord) => {
        let gross = Number(row.workedHours) || 0;
        let effective = row.effectiveWorkedHours != null ? Number(row.effectiveWorkedHours) : gross;
        const isShiftActive = !row.logoutTime && row.loginTime;

        if (isShiftActive && row.loginTime && row.attendanceDate) {
          const loginDateTime = moment(`${row.attendanceDate} ${row.loginTime}`, "YYYY-MM-DD HH:mm:ss");
          const now = moment();
          gross = Math.max(0, now.diff(loginDateTime, "hours", true));
          
          const outOfFence = row.outOfFenceHeartbeats || 0;
          if (outOfFence > 0) {
            const roamingHours = outOfFence * 0.33;
            const excessRoaming = Math.max(0, roamingHours - 1.0);
            effective = Math.max(0, gross - excessRoaming);
          } else {
            effective = gross;
          }
        }

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
      label: "Presence Telemetry",
      render: (_: any, row: AttendanceRecord) => {
        const officeRadius = row.officeLocation?.geoRadiusMeters || 200;
        const total = row.totalHeartbeats ?? (row.heartbeats?.length || 0);
        const valid = row.validHeartbeats ?? (row.heartbeats?.filter((h) => h.isWithinGeofence).length || 0);
        const isFarCheckIn = row.loginDistance != null && row.loginDistance > officeRadius;
        const pct = total > 0 ? Math.round((valid / total) * 100) : (isFarCheckIn ? 0 : 100);
        const hasAnomaly = row.roamingAnomalyDetected || (total - valid > 0) || isFarCheckIn;

        if (total === 0 && !isFarCheckIn) {
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
              {total > 0 ? `${pct}% (${valid}/${total})` : `0% (${Math.round((row.loginDistance || 0) / 100) / 10}km away)`}
            </span>
          </div>
        );
      },
    },
    {
      key: "status",
      label: "Status & Shift Approval",
      render: (_: any, row: AttendanceRecord) => {
        const map: Record<string, string> = {
          present: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
          late_login: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
          early_logout: "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20",
          half_day: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20",
          absent: "bg-destructive/10 text-destructive border-destructive/20",
        };
        return (
          <div className="flex flex-col gap-1">
            <span
              className={cn(
                "inline-flex rounded-md border px-2 py-0.5 text-[11px] font-medium capitalize w-fit",
                map[row.status] || "bg-muted text-muted-foreground"
              )}
            >
              {row.status.replace(/_/g, " ")}
            </span>
            {row.approvalStatus === "pending" && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded px-1.5 py-0.5 w-fit">
                <Clock className="h-2.5 w-2.5" />
                {row.isWeekendWork ? "Weekend Pending" : "Off-Hours Pending"}
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "actions",
      label: "Actions",
      render: (_: any, row: AttendanceRecord) => (
        <div className="flex items-center gap-1.5 flex-wrap" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setInspectedRecord(row)}
            className="h-8 gap-1 text-xs hover:border-primary/50"
            title="Inspect Day Timeline"
          >
            <Activity className="h-3.5 w-3.5 text-primary" />
            Inspect
          </Button>

          {row.approvalStatus === "pending" && (
            <>
              <Button
                variant="default"
                size="sm"
                onClick={() => handleApproveOffHours(row, "approved")}
                disabled={approvingOffHours}
                className="h-8 gap-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-2.5"
                title="Approve weekend/off-hours attendance"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Approve
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleApproveOffHours(row, "rejected")}
                disabled={approvingOffHours}
                className="h-8 gap-1 text-xs border-destructive/40 text-destructive hover:bg-destructive/10 px-2.5"
                title="Reject and mark absent"
              >
                <XCircle className="h-3.5 w-3.5" />
                Reject
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="page-shell space-y-6">
      <PageHeader
        title="Attendance Management"
        description="Monitor verified presence and regularization requests."
        actions={
          <div className="flex items-center gap-2 max-w-full">
            <div className="flex rounded-xl border border-border bg-muted/50 p-1 shadow-xs max-w-full overflow-x-auto">
              <button
                onClick={() => setActiveTab("timeline")}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0",
                  activeTab === "timeline"
                    ? "bg-card text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Clock className="h-3.5 w-3.5 text-primary" />
                Timeline View
              </button>
              <button
                onClick={() => setActiveTab("presence")}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0",
                  activeTab === "presence"
                    ? "bg-card text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <TableIcon className="h-3.5 w-3.5 text-primary" />
                Presence Logs
              </button>
              <button
                onClick={() => setActiveTab("corrections")}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0",
                  activeTab === "corrections"
                    ? "bg-card text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <FilePenLine className="h-3.5 w-3.5 text-primary" />
                Regularization Requests
                {(correctionsTotal || 0) > 0 && (
                  <span className="rounded-full bg-primary/10 px-1.5 py-0.2 text-[10px] font-bold text-primary">
                    {correctionsTotal}
                  </span>
                )}
              </button>
            </div>

            <Link
              href="/attendance/report"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-primary/20 bg-primary/10 hover:bg-primary/20 px-3 py-1.5 text-xs font-bold text-primary transition-all cursor-pointer whitespace-nowrap shadow-xs"
              title="Open full Employee Attendance & Compliance Report"
            >
              <BarChart3 className="h-3.5 w-3.5" />
              Employee Reports
            </Link>
          </div>
        }
      />

      {/* Top Work Started & Work Finished Donut Analytics Cards (Reference Image Inspired) */}
      <AttendanceDonutCards
        records={presenceRecords}
        totalEmployees={presenceTotal || presenceRecords.length}
        onFilterSelect={(filter) => {
          if (filter === "all") setStatusFilter("");
          else if (filter === "late") setStatusFilter("late_login");
          else if (filter === "early") setStatusFilter("early_logout");
          else if (filter === "off work") setStatusFilter("absent");
        }}
      />

      {/* Quick Presence Stats Cards */}
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

      {/* Date & Filter Toolbar */}
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 space-y-4 shadow-xs">
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

          {/* Quick Date Presets */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => {
                const today = moment().format("YYYY-MM-DD");
                setStartDate(today);
                setEndDate(today);
              }}
              className={cn(
                "px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer",
                startDate === moment().format("YYYY-MM-DD") && endDate === moment().format("YYYY-MM-DD")
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted/40 text-muted-foreground border-border hover:bg-muted"
              )}
            >
              Today
            </button>
            <button
              onClick={() => {
                const yesterday = moment().subtract(1, "day").format("YYYY-MM-DD");
                setStartDate(yesterday);
                setEndDate(yesterday);
              }}
              className={cn(
                "px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer",
                startDate === moment().subtract(1, "day").format("YYYY-MM-DD") && endDate === moment().subtract(1, "day").format("YYYY-MM-DD")
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted/40 text-muted-foreground border-border hover:bg-muted"
              )}
            >
              Yesterday
            </button>
            <button
              onClick={() => {
                setStartDate(moment().startOf("month").format("YYYY-MM-DD"));
                setEndDate(moment().format("YYYY-MM-DD"));
              }}
              className={cn(
                "px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer",
                startDate === moment().startOf("month").format("YYYY-MM-DD")
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted/40 text-muted-foreground border-border hover:bg-muted"
              )}
            >
              This Month
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => loadData(startDate, endDate)}
              className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90 md:flex-none shadow-xs cursor-pointer"
            >
              <Search className="h-4 w-4" />
              Apply
            </button>
            <button
              onClick={() => loadData(startDate, endDate)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
              title="Refresh"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center justify-between">
          <div className="max-w-md flex-1">
            <SearchInput
              placeholder="Search employees by name, email or designation…"
              value={searchTerm}
              onChange={setSearchTerm}
            />
          </div>

          {activeTab !== "corrections" && (
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { label: "All", value: "" },
                { label: "Present", value: "present" },
                { label: "Late Login", value: "late_login" },
                { label: "Early Logout", value: "early_logout" },
                { label: "Pending Approval", value: "pending_approval" },
                { label: "Off-Hours", value: "off_hours" },
                { label: "Weekend Work", value: "weekend_work" },
                { label: "Roaming Flagged", value: "roaming" },
              ].map((pill) => (
                <button
                  key={pill.value}
                  onClick={() => setStatusFilter(pill.value)}
                  className={cn(
                    "rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors border cursor-pointer",
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

      {/* Main Tab Content */}
      {activeTab === "timeline" ? (
        <AttendanceTimelineMatrix
          records={presenceRecords}
          isLoading={presenceLoading}
          selectedDate={startDate === endDate ? startDate : undefined}
          onSelectRecord={(rec) => setInspectedRecord(rec)}
          onOpenReport={handleOpenReport}
          total={presenceTotal}
          currentPage={timelinePage}
          pageSize={10}
          onPageChange={setTimelinePage}
        />
      ) : activeTab === "presence" ? (
        <DataTable
          data={presenceRecords}
          columns={presenceColumns}
          isLoading={presenceLoading}
          total={presenceTotal}
          currentPage={presencePage}
          pageSize={20}
          onPageChange={setPresencePage}
          onRowClick={(row) => {
            if (row.user?.id) {
              handleOpenReport(row.user.id);
            }
          }}
          paginationLabel="attendance records"
        />
      ) : (
        <AttendanceRegularizationMasterDetail
          corrections={attendanceCorrections}
          isLoading={correctionsLoading}
          onApproveReject={handleMasterDetailCorrectionSubmit}
        />
      )}

      {/* Detailed Day Timeline Inspector Drawer */}
      {inspectedRecord && (
        <AttendanceDetailDrawer
          record={inspectedRecord}
          onClose={() => setInspectedRecord(null)}
          onOpenAuditModal={(rec) => setSelectedTimelineRecord(rec)}
          onOpenReport={handleOpenReport}
          onApproveOffHours={handleApproveOffHours}
          isApproving={approvingOffHours}
        />
      )}

      {/* Regularization Approval Modal (Fallback) */}
      {selectedCorrection && (
        <ApprovalModal
          correction={selectedCorrection}
          onClose={() => setSelectedCorrection(null)}
          onSubmit={handleCorrectionSubmit}
        />
      )}

      {/* Periodic Geo-Heartbeat Breadcrumb Modal */}
      {selectedTimelineRecord && (
        <HeartbeatTimelineModal
          record={selectedTimelineRecord}
          onClose={() => setSelectedTimelineRecord(null)}
        />
      )}
    </div>
  );
}
