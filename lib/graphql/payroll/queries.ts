import { gql } from "@apollo/client";

export const GET_SALARY_COMPONENTS = gql`
  query GetSalaryComponents {
    salaryComponents {
      id
      name
      code
      componentType
      isTaxable
      isStatutory
      description
    }
  }
`;

export const GET_SALARY_STRUCTURES = gql`
  query GetSalaryStructures {
    salaryStructures {
      id
      name
      description
      isActive
      components {
        id
        component {
          id
          name
          code
          componentType
        }
        calculationType
        value
        baseComponent {
          id
          name
          code
        }
      }
    }
  }
`;

export const GET_PAYROLL_RUNS = gql`
  query GetPayrollRuns {
    payrollRuns {
      id
      month
      year
      status
      totalGross
      totalDeduction
      totalNetPay
      createdAt
      hasLockedPayslips
      draftCount
      publishedCount
      paidCount
    }
  }
`;

export const GET_PAYROLL_RUN_DETAILS = gql`
  query GetPayrollRunDetails($id: ID!) {
    payrollRun(id: $id) {
      id
      month
      year
      status
      totalGross
      totalDeduction
      totalNetPay
      createdAt
      hasLockedPayslips
      draftCount
      publishedCount
      paidCount
      payslips {
        id
        user {
          id
          firstName
          lastName
          email
        }
        designation
        department
        workedDays
        lopDays
        grossEarnings
        totalDeductions
        netPay
        status
        payslipPdf {
          url
        }
      }
    }
  }
`;

export const GET_SALARY_ADVANCES = gql`
  query GetSalaryAdvances($status: String) {
    salaryAdvances(status: $status) {
      id
      amount
      reason
      grantedOn
      installmentsTotal
      installmentAmount
      remainingBalance
      recoveredSoFar
      status
      user {
        id
        firstName
        lastName
        email
      }
    }
  }
`;

export const GET_PAYROLL_SETTINGS = gql`
  query GetPayrollSettings {
    payrollSettings {
      plan
      payrollCycleDay
      payrollAutoEnabled
      canEnablePayrollAuto
    }
  }
`;

export const GET_PAYROLL_SETUP_CHECKLIST = gql`
  query GetPayrollSetupChecklist {
    payrollSetupChecklist {
      components
      structures
      employeesWithCtc
      activeAdvances
      ready
    }
  }
`;

export const GET_ADVANCE_RECOVERY_PREVIEW = gql`
  query GetAdvanceRecoveryPreview {
    advanceRecoveryPreview {
      advanceId
      userId
      userName
      deduct
      remainingAfter
    }
  }
`;
