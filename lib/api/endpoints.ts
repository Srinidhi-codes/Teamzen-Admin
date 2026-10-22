export const API_ENDPOINTS = {
  // Auth
  REGISTER: "/auth/register/",
  LOGIN: "/auth/login/",
  LOGOUT: "/users/logout/",
  REFRESH: "/auth/refresh/",

  // New Auth Endpoints
  OTP_SEND: "/users/auth/otp/send/",
  OTP_VERIFY: "/users/auth/otp/verify/",
  TOTP_SETUP: "/users/auth/totp/setup/",
  TOTP_ENABLE: "/users/auth/totp/enable/",
  TOTP_DISABLE: "/users/auth/totp/disable/",
  TOTP_VERIFY: "/users/auth/totp/verify/",
  GOOGLE_LOGIN: "/users/auth/google/",
  SESSIONS: "/users/auth/sessions/",
  LOGOUT_DEVICE: "/users/auth/sessions/logout-device/",
  LOGOUT_ALL_OTHERS: "/users/auth/sessions/logout-all-others/",

  // Users
  USERS: "/users/",
  USER_ME: "/users/me/",
  USER_UPDATE: "/users/update_profile/",

  // Leaves
  LEAVE_TYPES: "/leaves/types/",
  LEAVE_REQUESTS: "/leaves/requests/",
  LEAVE_BALANCES: "/leaves/balance/",

  // Attendance
  ATTENDANCE: "/attendance/records/",
  CHECK_IN: "/attendance/records/check_in/",
  CHECK_OUT: "/attendance/records/check_out/",

  // Payroll
  SALARY_STRUCTURES: "/payroll/salary-structures/",
  PAYROLL_RUNS: "/payroll/runs/",
  PAYROLL_RECORDS: "/payroll/records/",
  PAYROLL_IMPORT_UPLOAD: "/payroll/import/upload/",
  PAYSLIP_BULK_UPLOAD: "/payroll/payslips/bulk-upload/",
  payslipTemplateDemo: (id: string | number) =>
    `/payroll/payslip-templates/${id}/demo/`,
  payslipTemplatePreview: (id: string | number) =>
    `/payroll/payslip-templates/${id}/preview/`,
  payrollBankExport: (runId: string | number, format: string) =>
    `/payroll/runs/${runId}/bank-export/?bank_format=${encodeURIComponent(format)}`,

  // AI Policies
  POLICIES: "/ai/policies/",
  SMART_CHAT: "/ai/chat/",
  AI_CONFIG: "/ai/ai-config/",
  FORMAT_TEXT: "/ai/format-text/",
  FEEDBACK_ATTACHMENTS: "/feedback/attachments/",
  ONBOARDING_OFFER_UPLOAD: "/onboarding/offers/upload/",
  ONBOARDING_SIGNED_OFFER_UPLOAD: "/onboarding/offers/signed/upload/",

  // Organizations
  ORGANIZATIONS: "/organizations/",
};
