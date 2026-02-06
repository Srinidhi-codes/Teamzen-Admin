import { User } from "../users/types";

export interface AttendanceRecord {

  id: string;
  attendanceDate: string;

  loginTime?: string | null;
  logoutTime?: string | null;
  loginDistance?: number;
  logoutDistance?: number;

  status: "present" | "absent" | "half_day" | "leave" | "holiday";
  workedHours?: number | null;

  isWithinGeofence: boolean;
  remarks?: string | null;

  correctionStatus?: string;
  correctionId?: string;
  correctionReason?: string;
  approvalComment?: string;
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

export type GetAttendanceResponse = {
  myAttendance: AttendanceRecord[];
};

export type GetAttendanceCorrectionsResponse = {
  attendanceCorrections: AttendanceCorrection[];
};

export type GetAttendanceVars = {
  input?: AttendanceInput;
};