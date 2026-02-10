import { LeaveType, LeaveBalance, LeaveRequest } from '@/lib/graphql/leaves/types';
import { StateCreator } from 'zustand';

export interface LeaveSlice {
  leaveTypes: LeaveType[];
  leaveBalances: LeaveBalance[];
  leaveRequests: LeaveRequest[];
  setLeaveTypes: (types: LeaveType[]) => void;
  setLeaveBalances: (balances: LeaveBalance[]) => void;
  setLeaveRequests: (requests: LeaveRequest[]) => void;
}

export const createLeaveSlice: StateCreator<LeaveSlice> = (set) => ({
  leaveTypes: [],
  leaveBalances: [],
  leaveRequests: [],
  setLeaveTypes: (leaveTypes) => set({ leaveTypes }),
  setLeaveBalances: (leaveBalances) => set({ leaveBalances }),
  setLeaveRequests: (leaveRequests) => set({ leaveRequests }),
});
