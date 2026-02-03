export interface LeaveType {
    id: string;
    name: string;
    code: string;
    description: string;
    maxDaysPerYear: number;
    carryForwardAllowed: boolean;
    carryForwardMaxDays: number;
    accrualFrequency: string;
    accrualDays: number;
    isPaidLeave: boolean;
    requiresApproval: boolean;
    allowEncashment: boolean;
    encashmentRate: number;
    prorateOnJoin: boolean;
    prorateOnExit: boolean;
    prorationBasis: string;
    isActive: boolean;
}

export interface LeaveBalance {
    id: string;
    user: {
        id: string;
        firstName: string;
    };
    leaveType: LeaveType;
    year: number;
    totalEntitled: number;
    used: number;
    pendingApproval: number;
    availableBalance: number;
    carriedForward: number;
    lastAccruedDate: string;
    accrued: number;
    expired: number;
    isLocked: boolean;
    isActive: boolean;
    lockedAt: string;
    lastUpdated: string;
}

export interface LeaveRequest {
    id: string;
    user: {
        id: string;
        firstName: string;
        lastName: string;
    };
    leaveType: LeaveType;
    fromDate: string;
    toDate: string;
    durationDays: number;
    reason: string;
    status: string;
    approvedBy: {
        id: string;
        firstName: string;
    } | null;
    approvalComments: string;
    approvedAt: string;
    createdAt: string;
}

export type LeaveInput = {
    organizationId: string;
};

export type LeaveRequestInput = {
    leaveTypeId: string;
    fromDate: string;
    toDate: string;
    reason: string;
}

export type GetLeaveRequestResponse = {
    getLeaveRequests: LeaveRequest[];
}

export type GetLeaveBalanceResponse = {
    leaveBalance: LeaveBalance[];
}

export type GetLeavesResponse = {
    leaveTypes: LeaveType[];
}