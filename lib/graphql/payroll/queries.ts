import { gql } from "@apollo/client";

export const GET_SALARY_COMPONENTS = gql`
  query GetSalaryComponents($organizationId: ID) {
    salaryComponents(organizationId: $organizationId) {
      id
      name
      code
      componentType
      isTaxable
      isStatutory
      description
      organization {
        id
        name
      }
    }
  }
`;

export const GET_SALARY_STRUCTURES = gql`
  query GetSalaryStructures($organizationId: ID) {
    salaryStructures(organizationId: $organizationId) {
      id
      name
      description
      isActive
      organization {
        id
        name
      }
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
  query GetPayrollRuns($organizationId: ID) {
    payrollRuns(organizationId: $organizationId) {
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
      organization {
        id
        name
      }
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
  query GetSalaryAdvances($status: String, $organizationId: ID) {
    salaryAdvances(status: $status, organizationId: $organizationId) {
      id
      amount
      reason
      grantedOn
      installmentsTotal
      installmentAmount
      remainingBalance
      recoveredSoFar
      status
      organization {
        id
        name
      }
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
  query GetPayrollSettings($organizationId: ID) {
    payrollSettings(organizationId: $organizationId) {
      plan
      payrollCycleDay
      payrollAutoEnabled
      canEnablePayrollAuto
    }
  }
`;

export const GET_PAYROLL_SETUP_CHECKLIST = gql`
  query GetPayrollSetupChecklist($organizationId: ID) {
    payrollSetupChecklist(organizationId: $organizationId) {
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
