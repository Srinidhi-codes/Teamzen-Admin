"use client";

import { useMemo, useState } from "react";
import moment from "moment";
import dynamic from "next/dynamic";
import { PageHeader } from "@/components/common/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReportFiltersBar } from "./ReportFiltersBar";
import { useCSVExport } from "@/lib/hooks/useCSVExport";
import {
  useWorkforceReport,
  useAttendanceReport,
  useLeaveReport,
  usePayrollReport,
} from "@/lib/graphql/reports/reportsHook";
import type { ReportFilters } from "@/lib/graphql/reports/types";

const WorkforceReportView = dynamic(
  () => import("./WorkforceReportView").then((m) => m.WorkforceReportView),
  { ssr: false }
);
const AttendanceReportView = dynamic(
  () => import("./AttendanceReportView").then((m) => m.AttendanceReportView),
  { ssr: false }
);
const LeaveReportView = dynamic(
  () => import("./LeaveReportView").then((m) => m.LeaveReportView),
  { ssr: false }
);
const PayrollReportView = dynamic(
  () => import("./PayrollReportView").then((m) => m.PayrollReportView),
  { ssr: false }
);

type TabKey = "workforce" | "attendance" | "leave" | "payroll";

function defaultFilters(): ReportFilters {
  return {
    dateFrom: moment().subtract(90, "days").format("YYYY-MM-DD"),
    dateTo: moment().format("YYYY-MM-DD"),
  };
}

export default function ReportsPage() {
  const [tab, setTab] = useState<TabKey>("workforce");
  const [filters, setFilters] = useState<ReportFilters>(defaultFilters);
  const { exportData } = useCSVExport();

  const workforce = useWorkforceReport(filters, tab !== "workforce");
  const attendance = useAttendanceReport(filters, tab !== "attendance");
  const leave = useLeaveReport(filters, tab !== "leave");
  const payroll = usePayrollReport(filters, tab !== "payroll");

  const handleExport = () => {
    if (tab === "workforce" && workforce.report) {
      exportData(
        workforce.report.employees,
        [
          { accessor: "name", header: "Name" },
          { accessor: "email", header: "Email" },
          { accessor: "department", header: "Department" },
          { accessor: "designation", header: "Designation" },
          { accessor: "employmentType", header: "Employment type" },
          { accessor: "dateOfJoining", header: "Joined" },
          { accessor: "dateOfExit", header: "Exit" },
          { accessor: "isActive", header: "Active" },
        ],
        { filename: "workforce-report" }
      );
    } else if (tab === "attendance" && attendance.report) {
      exportData(
        attendance.report.employees,
        [
          { accessor: "name", header: "Name" },
          { accessor: "email", header: "Email" },
          { accessor: "department", header: "Department" },
          { accessor: "presentDays", header: "Present" },
          { accessor: "lateDays", header: "Late" },
          { accessor: "absentDays", header: "Absent" },
          { accessor: "leaveDays", header: "Leave" },
          { accessor: "halfDays", header: "Half day" },
          { accessor: "attendanceRate", header: "Rate %" },
        ],
        { filename: "attendance-report" }
      );
    } else if (tab === "leave" && leave.report) {
      exportData(
        leave.report.requests,
        [
          { accessor: "employee", header: "Employee" },
          { accessor: "leaveType", header: "Leave type" },
          { accessor: "fromDate", header: "From" },
          { accessor: "toDate", header: "To" },
          { accessor: "durationDays", header: "Days" },
          { accessor: "status", header: "Status" },
          { accessor: "department", header: "Department" },
        ],
        { filename: "leave-report" }
      );
    } else if (tab === "payroll" && payroll.report) {
      exportData(
        payroll.report.runs,
        [
          { accessor: "label", header: "Period" },
          { accessor: "status", header: "Status" },
          { accessor: "totalGross", header: "Gross" },
          { accessor: "totalDeduction", header: "Deductions" },
          { accessor: "totalNetPay", header: "Net" },
        ],
        { filename: "payroll-report" }
      );
    }
  };

  const subtitle = useMemo(() => {
    const map: Record<TabKey, string> = {
      workforce: "Headcount, turnover, and workforce mix",
      attendance: "Presence trends and employee drill-down",
      leave: "Leave mix, utilization, and request flux",
      payroll: "Payroll cost trends and run history",
    };
    return map[tab];
  }, [tab]);

  return (
    <div className="page-shell">
      <PageHeader title="Reports" description={subtitle} />

      <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)}>
        <TabsList className="h-auto w-full flex-wrap justify-start gap-1 rounded-xl border border-border bg-card p-1 sm:w-fit">
          <TabsTrigger value="workforce">Workforce</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="leave">Leave</TabsTrigger>
          <TabsTrigger value="payroll">Payroll</TabsTrigger>
        </TabsList>

        <div className="mt-4">
          <ReportFiltersBar
            filters={filters}
            onChange={setFilters}
            onExport={handleExport}
          />
        </div>

        <div className="mt-4">
          <TabsContent value="workforce" className="mt-0">
            <WorkforceReportView
              report={workforce.report}
              loading={workforce.isLoading}
              error={workforce.error as Error | null}
            />
          </TabsContent>
          <TabsContent value="attendance" className="mt-0">
            <AttendanceReportView
              report={attendance.report}
              loading={attendance.isLoading}
              error={attendance.error as Error | null}
            />
          </TabsContent>
          <TabsContent value="leave" className="mt-0">
            <LeaveReportView
              report={leave.report}
              loading={leave.isLoading}
              error={leave.error as Error | null}
            />
          </TabsContent>
          <TabsContent value="payroll" className="mt-0">
            <PayrollReportView
              report={payroll.report}
              loading={payroll.isLoading}
              error={payroll.error as Error | null}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
