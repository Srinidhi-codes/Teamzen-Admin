export interface User {
  id: string;
  email: string;
  username: string;

  firstName: string;
  lastName: string;
  phoneNumber?: string | null;

  role: "superadmin" | "admin" | "hr" | "manager" | "employee";
  isActive: boolean;
  isVerified: boolean;
  /** True when a non-cancelled onboarding record exists */
  onboardingStarted?: boolean;
  isStaff: boolean;

  dateOfJoining?: string | null;
  dateOfExit?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;

  profilePictureUrl?: string | null;

  employeeId?: string | null;
  employmentType?: "full_time" | "contract" | "intern";
  faceEnrolled?: boolean;
  faceEnrolledAt?: string | null;
  isPresentToday?: boolean;
  isOnLeaveToday?: boolean;
  todayAttendanceStatus?: "present" | "on_leave" | "absent" | string;

  organization?: {
    id: string;
    name: string;
    plan?: "free" | "pro" | "elite" | string;
    planExpiresAt?: string | null;
    daysUntilPlanExpiry?: number | null;
    accent?: string | null;
    logo?: {
      url: string;
    } | null;
  } | null;

  hasSeenOnboarding: boolean;
  hasSeenAiOnboarding: boolean;
  emailLoginAlerts?: boolean;

  manager?: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;

  department?: {
    id: string;
    name: string;
  } | null;

  designation?: {
    id: string;
    name: string;
  } | null;

  officeLocation?: {
    id: string;
    name: string;
    address: string;
  } | null;

  bankAccountNumber?: string | null;
  bankIfscCode?: string | null;
  panNumber?: string | null;
  aadharNumber?: string | null;
  uanNumber?: string | null;
  hierarchyLevel?: number;
  hierarchyLabel?: string;
  isManager?: boolean;
  salaryDetails?: {
    id: string;
    salaryStructure: {
      id: string;
      name: string;
      components?: {
        id: string;
        component: {
          id: string;
          name: string;
          code: string;
          componentType: string;
        };
        calculationType: string;
        value: number;
      }[];
    };
    annualCtc: number;
    effectiveFrom: string;
    isActive: boolean;
    componentOverrides?: {
      id: string;
      component: { id: string; name: string; code: string };
      isExcluded: boolean;
      overrideValue: number | null;
    }[];
  } | null;
}

export interface UserFilterInput {
  search?: string;
  isActive?: boolean;
  organizationId?: string;
  isManager?: boolean;
  maxHierarchyLevel?: number;
  roles?: string[];
  includeAdmins?: boolean;
}

export interface PromoteEmployeeInput {
  userId: string;
  newRole?: string;
  newHierarchyLevel?: number;
  newDesignationId?: string;
  newDepartmentId?: string;
  newManagerId?: string;
  annualCtc?: number;
  effectiveDate?: string;
  promotionNotes?: string;
  makeManager?: boolean;
}

export interface PromoteEmployeeResponse {
  promoteEmployee: {
    success: boolean;
    user?: User | null;
    error?: string | null;
    message?: string | null;
  };
}

export type UserResponse = User[];

export interface SecurityLog {
  id: string;
  latitude: number | null;
  longitude: number | null;
}

export interface SecurityLogResponse {
  mySecurityLogs: {
    results: SecurityLog[];
  };
}
