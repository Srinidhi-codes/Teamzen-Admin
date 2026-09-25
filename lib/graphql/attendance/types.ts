import { User } from "../users/types";

export interface AttendanceHeartbeat {
  id: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  distanceMeters: number;
  isWithinGeofence: boolean;
  accuracyMeters?: number | null;
  isMocked: boolean;
  batteryLevel?: number | null;
}

export interface AttendanceRecord {
  id: string;
  attendanceDate: string;

  loginTime?: string | null;
  logoutTime?: string | null;
  loginDistance?: number;
  logoutDistance?: number;

  status: "present" | "absent" | "half_day" | "leave" | "holiday" | "late_login" | "early_logout";
  workedHours?: number | null;
  effectiveWorkedHours?: number | null;
  totalHeartbeats?: number;
  validHeartbeats?: number;
  outOfFenceHeartbeats?: number;
  roamingAnomalyDetected?: boolean;
  roamingNotes?: string | null;
  heartbeats?: AttendanceHeartbeat[];
  user?: User;

  isWithinGeofence: boolean;
  faceVerified?: boolean;
  faceMatchScore?: number | null;
  checkInSelfieUrl?: string | null;
  checkOutSelfieUrl?: string | null;
  remarks?: string | null;

  correctionStatus?: string;
  correctionId?: string;
  correctionReason?: string;
  approvalComment?: string;

  loginLatitude?: number | null;
  loginLongitude?: number | null;
  logoutLatitude?: number | null;
  logoutLongitude?: number | null;
  officeLocation?: {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    geoRadiusMeters: number;
  } | null;
}

export interface AttendanceCorrection {
  id: string;
  attendanceRecord: AttendanceRecord;
  reason: string;
  status: "pending" | "approved" | "rejected";

  correctedLoginTime?: string | null;
  correctedLogoutTime?: string | null;

  approvalComments?: string | null;
  createdAt?: string;
  requestedBy: User;
}

export type AttendanceInput = {
  startDate?: string;
  endDate?: string;
};

export type OrgAttendanceFilterInput = {
  date?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  status?: string;
  roamingOnly?: boolean;
  organizationId?: string;
};

export type GetOrgAttendanceRecordsResponse = {
  orgAttendanceRecords: {
    results: AttendanceRecord[];
    total: number;
    page: number;
    pageSize: number;
  };
};

export type GetAttendanceResponse = {
  myAttendance: AttendanceRecord[];
};

export type GetAttendanceCorrectionsResponse = {
  attendanceCorrections: {
    results: AttendanceCorrection[];
    total: number;
    page: number;
    pageSize: number;
  };
};

export type GetAttendanceVars = {
  status?: string;
  input?: AttendanceInput;
};