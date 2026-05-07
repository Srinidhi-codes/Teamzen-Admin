import { gql } from "@apollo/client";

export const PUBLISH_PAYSLIPS = gql`
  mutation PublishPayslips($payrollRunId: ID!) {
    publishPayslips(payrollRunId: $payrollRunId)
  }
`;

export const EXECUTE_PAYROLL_PAYOUT = gql`
  mutation ExecutePayrollPayout($payrollRunId: ID!) {
    executePayrollPayout(payrollRunId: $payrollRunId)
  }
`;

export const INITIATE_PAYROLL_RUN = gql`
  mutation InitiatePayrollRun($month: Int!, $year: Int!) {
    initiatePayrollRun(month: $month, year: $year) {
      id
      month
      year
      status
    }
  }
`;

export const CREATE_PAYROLL_ADJUSTMENT = gql`
  mutation CreatePayrollAdjustment($userId: ID!, $month: Int!, $year: Int!, $amount: Decimal!, $reason: String!, $adjustmentType: String!) {
    createPayrollAdjustment(userId: $userId, month: $month, year: $year, amount: $amount, reason: $reason, adjustmentType: $adjustmentType) {
      id
      reason
      amount
      adjustmentType
    }
  }
`;

export const DELETE_PAYROLL_RUN = gql`
  mutation DeletePayrollRun($payrollRunId: ID!) {
    deletePayrollRun(payrollRunId: $payrollRunId)
  }
`;

export const CREATE_SALARY_COMPONENT = gql`
  mutation CreateSalaryComponent($data: SalaryComponentInput!) {
    createSalaryComponent(data: $data) {
      id
      name
      code
    }
  }
`;

export const CREATE_SALARY_STRUCTURE = gql`
  mutation CreateSalaryStructure($name: String!, $description: String!, $components: [SalaryStructureComponentInput!]!) {
    createSalaryStructure(name: $name, description: $description, components: $components) {
      id
      name
    }
  }
`;

export const ASSIGN_SALARY_TO_EMPLOYEE = gql`
  mutation AssignSalaryToEmployee($userId: ID!, $structureId: ID!, $annualCtc: Decimal!, $effectiveFrom: String!) {
    assignSalaryToEmployee(userId: $userId, structureId: $structureId, annualCtc: $annualCtc, effectiveFrom: $effectiveFrom)
  }
`;
