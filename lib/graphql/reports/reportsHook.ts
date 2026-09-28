import { useQuery } from "@apollo/client/react";
import {
  WORKFORCE_REPORT,
  ATTENDANCE_REPORT,
  LEAVE_REPORT,
  PAYROLL_REPORT,
} from "./queries";
import type {
  ReportFilters,
  WorkforceReport,
  AttendanceReport,
  LeaveReport,
  PayrollReport,
} from "./types";

function filterVars(filters?: ReportFilters) {
  if (!filters) return undefined;
  const cleaned: Record<string, string> = {};
  if (filters.dateFrom) cleaned.dateFrom = filters.dateFrom;
  if (filters.dateTo) cleaned.dateTo = filters.dateTo;
  if (filters.organizationId) cleaned.organizationId = filters.organizationId;
  if (filters.departmentId) cleaned.departmentId = filters.departmentId;
  if (filters.officeLocationId) cleaned.officeLocationId = filters.officeLocationId;
  return Object.keys(cleaned).length ? cleaned : undefined;
}

export function useWorkforceReport(filters?: ReportFilters, skip = false) {
  const { data, loading, error, refetch } = useQuery<{
    workforceReport: WorkforceReport;
  }>(WORKFORCE_REPORT, {
    variables: { filters: filterVars(filters) },
    skip,
    fetchPolicy: "cache-and-network",
  });
  return {
    report: data?.workforceReport,
    isLoading: loading && !data,
    error,
    refetch,
  };
}

export function useAttendanceReport(filters?: ReportFilters, skip = false) {
  const { data, loading, error, refetch } = useQuery<{
    attendanceReport: AttendanceReport;
  }>(ATTENDANCE_REPORT, {
    variables: { filters: filterVars(filters) },
    skip,
    fetchPolicy: "cache-and-network",
  });
  return {
    report: data?.attendanceReport,
    isLoading: loading && !data,
    error,
    refetch,
  };
}

export function useLeaveReport(filters?: ReportFilters, skip = false) {
  const { data, loading, error, refetch } = useQuery<{
    leaveReport: LeaveReport;
  }>(LEAVE_REPORT, {
    variables: { filters: filterVars(filters) },
    skip,
    fetchPolicy: "cache-and-network",
  });
  return {
    report: data?.leaveReport,
    isLoading: loading && !data,
    error,
    refetch,
  };
}

export function usePayrollReport(filters?: ReportFilters, skip = false) {
  const { data, loading, error, refetch } = useQuery<{
    payrollReport: PayrollReport;
  }>(PAYROLL_REPORT, {
    variables: { filters: filterVars(filters) },
    skip,
    fetchPolicy: "cache-and-network",
  });
  return {
    report: data?.payrollReport,
    isLoading: loading && !data,
    error,
    refetch,
  };
}
