import { AttendanceRecord, AttendanceCorrection } from '@/lib/graphql/attendance/types';
import { StateCreator } from 'zustand';

export interface AttendanceSlice {
  attendanceRecords: AttendanceRecord[];
  attendanceCorrections: AttendanceCorrection[];
  isCheckedIn: boolean;
  setAttendanceRecords: (records: AttendanceRecord[]) => void;
  setAttendanceCorrections: (corrections: AttendanceCorrection[]) => void;
  setCheckInStatus: (status: boolean) => void;
  checkIn: () => void;
  checkOut: () => void;
}

export const createAttendanceSlice: StateCreator<AttendanceSlice> = (set) => ({
  attendanceRecords: [],
  attendanceCorrections: [],
  isCheckedIn: false,
  setAttendanceRecords: (attendanceRecords) => set({ attendanceRecords }),
  setAttendanceCorrections: (attendanceCorrections) => set({ attendanceCorrections }),
  setCheckInStatus: (isCheckedIn) => set({ isCheckedIn }),
  checkIn: () => set({ isCheckedIn: true }),
  checkOut: () => set({ isCheckedIn: false }),
});
