export interface ReportFilters {
  dateFrom?: string;
  dateTo?: string;
  organizationId?: string;
  departmentId?: string;
  officeLocationId?: string;
}

export interface ReportKpi {
  label: string;
  value: string;
  hint?: string | null;
  trend?: string | null;
}

export interface ReportSeriesPoint {
  // Recharts ChartDataInput requires a string index signature
  [key: string]: string | number | null | undefined;
  label: string;
  value: number;
  secondary?: number | null;
  tertiary?: number | null;
}

export interface ReportNamedValue {
  // Recharts ChartDataInput requires a string index signature
  [key: string]: string | number | null | undefined;
  name: string;
  value: number;
  color?: string | null;
}

export interface WorkforceEmployeeRow {
  id: string;
  name: string;
  email: string;
  department?: string | null;
  designation?: string | null;
  employmentType?: string | null;
  dateOfJoining?: string | null;
  dateOfExit?: string | null;
  isActive: boolean;
}

export interface WorkforceReport {
  kpis: ReportKpi[];
  headcountSeries: ReportSeriesPoint[];
  departmentBreakdown: ReportNamedValue[];
  employmentTypeBreakdown: ReportNamedValue[];
  employees: WorkforceEmployeeRow[];
  hires: number;
  exits: number;
  turnoverRate: number;
  activeCount: number;
  inactiveCount: number;
}

export interface AttendanceEmployeeRow {
  id: string;
  name: string;
  email: string;
  department?: string | null;
  presentDays: number;
  lateDays: number;
  absentDays: number;
  leaveDays: number;
  halfDays: number;
  attendanceRate: number;
}

export interface AttendanceReport {
  kpis: ReportKpi[];
  dailySeries: ReportSeriesPoint[];
  statusBreakdown: ReportNamedValue[];
  officeBreakdown: ReportNamedValue[];
  employees: AttendanceEmployeeRow[];
}

export interface LeaveRequestRow {
  id: string;
  employee: string;
  leaveType: string;
  fromDate: string;
  toDate: string;
  durationDays: number;
  status: string;
  department?: string | null;
}

export interface LeaveReport {
  kpis: ReportKpi[];
  typeBreakdown: ReportNamedValue[];
  monthlyFlux: ReportSeriesPoint[];
  utilization: ReportNamedValue[];
  requests: LeaveRequestRow[];
  upcoming: LeaveRequestRow[];
}

export interface PayrollRunRow {
  id: string;
  month: number;
  year: number;
  status: string;
  totalGross: number;
  totalDeduction: number;
  totalNetPay: number;
  label: string;
}

export interface PayrollReport {
  kpis: ReportKpi[];
  monthlySeries: ReportSeriesPoint[];
  departmentCost: ReportNamedValue[];
  runs: PayrollRunRow[];
  advancesOutstanding: number;
  advancesCount: number;
}
