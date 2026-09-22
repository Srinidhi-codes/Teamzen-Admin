"use client";

import { useEffect, useState } from "react";
import {
  useApproveOrRejectAttendanceCorrection,
  useGraphQLAttendanceCorrection,
} from "@/lib/graphql/attendance/attendanceHooks";
import { ApprovalModal } from "@/components/attendance/ApprovalModal";
import { AttendanceCorrection } from "@/lib/graphql/attendance/types";
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
} from "lucide-react";
import { DatePickerSimple } from "@/components/ui/datePicker";
import { Stat } from "@/components/common/Stats";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { SearchInput } from "@/components/common/SearchInput";
import { cn } from "@/lib/utils";
import { OrganizationFilterSelect } from "@/components/common/OrganizationFilterSelect";
import { useStore } from "@/lib/store/useStore";

export default function AttendancePage() {
  const { user } = useStore();
  const [startDate, setStartDate] = useState(
    moment().startOf("month").format("YYYY-MM-DD")
  );
  const [endDate, setEndDate] = useState(moment().format("YYYY-MM-DD"));
  const [selected, setSelected] = useState<AttendanceCorrection | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [organizationId, setOrganizationId] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const pageSize = 10;
  const [currentPage, setCurrentPage] = useState(1);

  const {
    attendanceCorrections,
    total,
    isLoading,
    refetchAttendanceCorrections,
  } = useGraphQLAttendanceCorrection({
    page: currentPage,
    pageSize,
    filters: {
      search: debouncedSearchTerm || undefined,
      organizationId: organizationId || undefined,
    },
  });

  const loadAttendance = async (start: string, end: string) => {
    if (!start || !end) return;
    await refetchAttendanceCorrections({ startDate: start, endDate: end });
  };

  useEffect(() => {
    loadAttendance(startDate, endDate);
  }, [startDate, endDate]);

  const { approveOrRejectAttendanceCorrection } =
    useApproveOrRejectAttendanceCorrection();

  const handleSubmit = async (status: "approved" | "rejected", comments: string) => {
    if (!selected) return;
    try {
      await approveOrRejectAttendanceCorrection(selected.id!, status, comments);
      setSelected(null);
      refetchAttendanceCorrections({ startDate, endDate });
    } catch (err: any) {
      console.error(err);
    }
  };

  const statsList = [
    {
      label: "Total requests",
      value: total || 0,
      icon: Calendar,
      color: "text-sky-700 dark:text-sky-400",
      gradient: "bg-sky-500/10",
    },
    {
      label: "Pending",
      value: attendanceCorrections.filter((c) => c.status === "pending").length,
      icon: Clock,
      color: "text-amber-700 dark:text-amber-400",
      gradient: "bg-amber-500/10",
    },
    {
      label: "Approved",
      value: attendanceCorrections.filter((c) => c.status === "approved").length,
      icon: CheckCircle2,
      color: "text-emerald-700 dark:text-emerald-400",
      gradient: "bg-emerald-500/10",
    },
    {
      label: "Rejected",
      value: attendanceCorrections.filter((c) => c.status === "rejected").length,
      icon: XCircle,
      color: "text-destructive",
      gradient: "bg-destructive/10",
    },
  ];

  const columns: Column<AttendanceCorrection>[] = [
    {
      key: "requestedBy",
      label: "Employee",
      render: (_: any, row: AttendanceCorrection) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-xs font-medium text-foreground">
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
              onClick={() => setSelected(row)}
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
    <div className="page-shell">
      <PageHeader
        title="Attendance corrections"
        description="Review and process regularization requests."
        actions={
          <p className="text-xs text-muted-foreground">
            {moment(startDate).format("MMM D")} – {moment(endDate).format("MMM D, YYYY")}
          </p>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statsList.map((stat, i) => (
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

      <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
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
              onClick={() => loadAttendance(startDate, endDate)}
              className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 md:flex-none"
            >
              <Search className="h-4 w-4" />
              Apply
            </button>
            <button
              onClick={() => refetchAttendanceCorrections({ startDate, endDate })}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
              title="Refresh"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="max-w-md flex-1">
            <SearchInput
              placeholder="Search employees…"
              value={searchTerm}
              onChange={setSearchTerm}
            />
          </div>
          {user?.role === "superadmin" && (
            <OrganizationFilterSelect
              value={organizationId}
              onChange={setOrganizationId}
            />
          )}
        </div>
      </div>

      <DataTable
        data={attendanceCorrections}
        columns={columns}
        isLoading={isLoading}
        total={total}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        paginationLabel="corrections"
      />

      {selected && (
        <ApprovalModal
          correction={selected}
          onClose={() => setSelected(null)}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
