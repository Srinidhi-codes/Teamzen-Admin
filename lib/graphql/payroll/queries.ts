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
