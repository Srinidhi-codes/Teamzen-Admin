import { gql } from "@apollo/client";

const REPORT_FILTERS = `
  $filters: ReportFilterInput
`;

const KPI_FIELDS = `
  kpis { label value hint trend }
`;

const SERIES_FIELDS = `
  label value secondary tertiary
`;

const NAMED_FIELDS = `
  name value color
`;

export const WORKFORCE_REPORT = gql`
  query WorkforceReport(${REPORT_FILTERS}) {
    workforceReport(filters: $filters) {
      ${KPI_FIELDS}
      headcountSeries { ${SERIES_FIELDS} }
      departmentBreakdown { ${NAMED_FIELDS} }
      employmentTypeBreakdown { ${NAMED_FIELDS} }
      hires
      exits
      turnoverRate
      activeCount
      inactiveCount
      employees {
        id
        name
        email
        department
        designation
        employmentType
        dateOfJoining
        dateOfExit
        isActive
      }
    }
  }
`;

export const ATTENDANCE_REPORT = gql`
  query AttendanceReport(${REPORT_FILTERS}) {
    attendanceReport(filters: $filters) {
      ${KPI_FIELDS}
      dailySeries { ${SERIES_FIELDS} }
      statusBreakdown { ${NAMED_FIELDS} }
      officeBreakdown { ${NAMED_FIELDS} }
      employees {
        id
        name
        email
        department
        presentDays
        lateDays
        absentDays
        leaveDays
        halfDays
        attendanceRate
      }
    }
  }
`;

export const LEAVE_REPORT = gql`
  query LeaveReport(${REPORT_FILTERS}) {
    leaveReport(filters: $filters) {
      ${KPI_FIELDS}
      typeBreakdown { ${NAMED_FIELDS} }
      monthlyFlux { ${SERIES_FIELDS} }
      utilization { ${NAMED_FIELDS} }
      requests {
        id
        employee
        leaveType
        fromDate
        toDate
        durationDays
        status
        department
      }
      upcoming {
        id
        employee
        leaveType
        fromDate
        toDate
        durationDays
        status
        department
      }
    }
  }
`;

export const PAYROLL_REPORT = gql`
  query PayrollReport(${REPORT_FILTERS}) {
    payrollReport(filters: $filters) {
      ${KPI_FIELDS}
      monthlySeries { ${SERIES_FIELDS} }
      departmentCost { ${NAMED_FIELDS} }
      advancesOutstanding
      advancesCount
      runs {
        id
        month
        year
        status
        totalGross
        totalDeduction
        totalNetPay
        label
      }
    }
  }
`;
