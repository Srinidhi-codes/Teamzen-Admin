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

export const CREATE_PAYROLL_RUN = gql`
  mutation CreatePayrollRun($month: Int!, $year: Int!) {
    createPayrollRun(month: $month, year: $year) {
      id
      month
      year
      status
    }
  }
`;

export const PROCESS_PAYROLL_RUN = gql`
  mutation ProcessPayrollRun($payrollRunId: ID!) {
    processPayrollRun(payrollRunId: $payrollRunId) {
      id
      status
      totalGross
      totalDeduction
      totalNetPay
    }
  }
`;

export const CREATE_PAYROLL_ADJUSTMENT = gql`
  mutation CreatePayrollAdjustment(
    $userId: ID!
    $month: Int!
    $year: Int!
    $amount: Decimal!
    $reason: String!
    $adjustmentType: String!
  ) {
    createPayrollAdjustment(
      userId: $userId
      month: $month
      year: $year
      amount: $amount
      reason: $reason
      adjustmentType: $adjustmentType
    ) {
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
  mutation CreateSalaryStructure(
    $name: String!
    $description: String!
    $components: [SalaryStructureComponentInput!]!
  ) {
    createSalaryStructure(
      name: $name
      description: $description
      components: $components
    ) {
      id
      name
    }
  }
`;

export const UPDATE_SALARY_STRUCTURE = gql`
  mutation UpdateSalaryStructure(
    $structureId: ID!
    $name: String!
    $description: String!
    $components: [SalaryStructureComponentInput!]!
  ) {
    updateSalaryStructure(
      structureId: $structureId
      name: $name
      description: $description
      components: $components
    ) {
      id
      name
    }
  }
`;

export const DELETE_SALARY_STRUCTURE = gql`
  mutation DeleteSalaryStructure($structureId: ID!) {
    deleteSalaryStructure(structureId: $structureId)
  }
`;

export const ASSIGN_SALARY_TO_EMPLOYEE = gql`
  mutation AssignSalaryToEmployee(
    $userId: ID!
    $structureId: ID!
    $annualCtc: Decimal!
    $effectiveFrom: String!
  ) {
    assignSalaryToEmployee(
      userId: $userId
      structureId: $structureId
      annualCtc: $annualCtc
      effectiveFrom: $effectiveFrom
    ) {
      id
      annualCtc
      effectiveFrom
      isActive
    }
  }
`;

export const CREATE_SALARY_ADVANCE = gql`
  mutation CreateSalaryAdvance(
    $userId: ID!
    $amount: Decimal!
    $installments: Int!
    $reason: String
    $grantedOn: String
  ) {
    createSalaryAdvance(
      userId: $userId
      amount: $amount
      installments: $installments
      reason: $reason
      grantedOn: $grantedOn
    ) {
      id
      amount
      remainingBalance
      status
    }
  }
`;

export const CANCEL_SALARY_ADVANCE = gql`
  mutation CancelSalaryAdvance($advanceId: ID!) {
    cancelSalaryAdvance(advanceId: $advanceId) {
      id
      status
    }
  }
`;

export const SAVE_EMPLOYEE_COMPONENT_OVERRIDES = gql`
  mutation SaveEmployeeComponentOverrides(
    $employeeSalaryId: ID!
    $overrides: [ComponentOverrideInput!]!
  ) {
    saveEmployeeComponentOverrides(
      employeeSalaryId: $employeeSalaryId
      overrides: $overrides
    ) {
      id
      component {
        id
        name
        code
      }
      isExcluded
      overrideValue
    }
  }
`;

export const UPDATE_PAYROLL_SETTINGS = gql`
  mutation UpdatePayrollSettings(
    $payrollCycleDay: Int!
    $payrollAutoEnabled: Boolean!
  ) {
    updatePayrollSettings(
      payrollCycleDay: $payrollCycleDay
      payrollAutoEnabled: $payrollAutoEnabled
    ) {
      plan
      payrollCycleDay
      payrollAutoEnabled
      canEnablePayrollAuto
    }
  }
`;
