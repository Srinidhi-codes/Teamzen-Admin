"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import {
  Users,
  Clock,
  Calendar,
  DollarSign,
  BarChart3,
  FileSpreadsheet,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";

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

const TAB_CONFIG: Record<
  TabKey,
  {
    label: string;
    description: string;
    icon: any;
    colorClass: string;
  }
> = {
  workforce: {
    label: "Workforce Analytics",
    description: "Headcount growth, hiring vs attrition velocity, and department allocation",
    icon: Users,
    colorClass: "text-sky-500",
  },
  attendance: {
    label: "Attendance Trends",
    description: "Daily presence rates, punctual check-in ratios, and department drilldowns",
    icon: Clock,
    colorClass: "text-teal-500",
  },
  leave: {
    label: "Leave & Absence Flux",
    description: "Absence utilization, category distribution, and request approvals",
    icon: Calendar,
    colorClass: "text-purple-500",
  },
  payroll: {
    label: "Payroll Cost History",
    description: "Disbursement progression, gross vs net pay, and statutory deductions",
    icon: DollarSign,
    colorClass: "text-indigo-500",
  },
};

export default function ReportsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams?.get("tab") as TabKey | null;

  const [tab, setTab] = useState<TabKey>(() => {
    if (tabParam && ["workforce", "attendance", "leave", "payroll"].includes(tabParam)) {
      return tabParam;
    }
    return "workforce";
  });

  useEffect(() => {
    if (tabParam && ["workforce", "attendance", "leave", "payroll"].includes(tabParam) && tabParam !== tab) {
      setTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (nextTab: string) => {
    const k = nextTab as TabKey;
    setTab(k);
    const params = new URLSearchParams(searchParams ? searchParams.toString() : "");
    params.set("tab", k);
    router.replace(`/reports?${params.toString()}`, { scroll: false });
  };

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

  const currentTabConfig = TAB_CONFIG[tab];

  return (
    <div className="w-full space-y-6 pb-10">
      <PageHeader
        title="Executive Reports"
        description={currentTabConfig.description}
      />

      {/* ── Main Tabbed View ────────────────────────────────────────── */}
      <Tabs value={tab} onValueChange={handleTabChange} className="space-y-5">
        <TabsList className="h-auto w-full flex-wrap justify-start gap-1.5 rounded-2xl border border-border bg-card p-1.5 shadow-xs sm:w-fit">
          {(["workforce", "attendance", "leave", "payroll"] as TabKey[]).map((key) => {
            const conf = TAB_CONFIG[key];
            const Icon = conf.icon;
            const isSelected = tab === key;

            return (
              <TabsTrigger
                key={key}
                value={key}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all duration-200 cursor-pointer",
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                )}
              >
                <Icon className={cn("h-4 w-4", isSelected ? "text-primary-foreground" : conf.colorClass)} />
                <span>{conf.label.split(" ")[0]}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* ── Filter Bar ──────────────────────────────────────────────── */}
        <ReportFiltersBar
          filters={filters}
          onChange={setFilters}
          onExport={handleExport}
          exportLabel={`Export ${currentTabConfig.label.split(" ")[0]} CSV`}
        />

        {/* ── Tab Contents ────────────────────────────────────────────── */}
        <div className="space-y-6">
          <TabsContent value="workforce" className="mt-0 space-y-6">
            <WorkforceReportView
              report={workforce.report}
              loading={workforce.isLoading}
              error={workforce.error as Error | null}
            />
          </TabsContent>

          <TabsContent value="attendance" className="mt-0 space-y-6">
            <AttendanceReportView
              report={attendance.report}
              loading={attendance.isLoading}
              error={attendance.error as Error | null}
            />
          </TabsContent>

          <TabsContent value="leave" className="mt-0 space-y-6">
            <LeaveReportView
              report={leave.report}
              loading={leave.isLoading}
              error={leave.error as Error | null}
            />
          </TabsContent>

          <TabsContent value="payroll" className="mt-0 space-y-6">
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
