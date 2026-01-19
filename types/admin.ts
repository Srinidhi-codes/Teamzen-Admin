// Admin Panel Type Definitions

export interface Employee {
  id: number;
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  date_of_birth: string;
  gender: string;
  department: string;
  designation: string;
  employment_type: string;
  date_of_joining: string;
  manager: string;
  role: string;
  is_active: boolean;
  office_location: string;
}

export interface Organizations {
  id: number | string;
  name: string;
  description: string;
  manager_id: number;
  employee_count: number;
  created_at: string;
}

export interface OfficeLocation {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  latitude: number;
  longitude: number;
  loginTime: string;
  logoutTime: string;
  isActive: boolean;
  organization_id: number;
}

export interface Designation {
  id: number;
  name: string;
  isActive: boolean;
  organization?: Organizations;
  description: string;
}

export interface Department {
  id: number;
  name: string;
  isActive: boolean;
  organization?: Organizations;
  description: string;
}

export interface LeaveRequest {
  id: number;
  user_id: number;
  user_name: string;
  leave_type_name: string;
  from_date: string;
  to_date: string;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  applied_date: string;
  approver_comments?: string;
}

export interface AttendanceRecord {
  id: number;
  user_id: number;
  user_name: string;
  date: string;
  check_in: string;
  check_out: string;
  status: 'present' | 'absent' | 'late' | 'half_day';
  working_hours: number;
}

export interface PayrollRun {
  id: number;
  payroll_month: string;
  total_employees: number;
  total_gross_salary: number;
  total_deductions: number;
  total_net_salary: number;
  status: 'draft' | 'calculated' | 'approved' | 'processed';
  created_at: string;
}

export interface PerformanceReview {
  id: number;
  employee_id: number;
  employee_name: string;
  review_period: string;
  reviewer_id: number;
  reviewer_name: string;
  rating: number;
  goals_achieved: number;
  total_goals: number;
  feedback: string;
  status: 'draft' | 'submitted' | 'completed';
  created_at: string;
}

export interface Goal {
  id: number;
  employee_id: number;
  title: string;
  description: string;
  target_date: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'cancelled';
  progress: number;
  created_at: string;
}

export interface DashboardStats {
  total_employees: number;
  active_employees: number;
  pending_leave_approvals: number;
  today_attendance_rate: number;
  pending_payroll_runs: number;
  pending_reviews: number;
}