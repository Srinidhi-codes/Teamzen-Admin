import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { UserSlice, createUserSlice } from './slices/userSlice';
import { LeaveSlice, createLeaveSlice } from './slices/leaveSlice';
import { AttendanceSlice, createAttendanceSlice } from './slices/attendanceSlice';
import { OrganizationSlice, createOrganizationSlice } from './slices/organizationSlice';
import { ThemeSlice, createThemeSlice } from './slices/themeSlice';


// Combine all slice types
type StoreState = UserSlice & LeaveSlice & AttendanceSlice & OrganizationSlice & ThemeSlice;


export const useStore = create<StoreState>()(
  persist(
    (...a) => ({
      ...createUserSlice(...a),
      ...createLeaveSlice(...a),
      ...createAttendanceSlice(...a),
      ...createOrganizationSlice(...a),
      ...createThemeSlice(...a),
    }),

    {
      name: 'payroll-app-storage', // unique name for localStorage key
      storage: createJSONStorage(() => localStorage),
      // Optional: Only persist user session, not temporary leave/attendance data if preferred
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        accent: state.accent,
        // Add others if persistence is desired
      }),

    }
  )
);
