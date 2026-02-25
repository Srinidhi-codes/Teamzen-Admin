import { gql } from "@apollo/client";

export const GET_ADMIN_DASHBOARD_STATS = gql`
  query GetAdminDashboardStats {
    adminDashboardStats {
      totalEmployees
      activeEmployees
      pendingLeaveApprovals
      todayAttendanceRate
      employeeGrowth {
        month
        value
      }
      departmentDistribution {
        name
        value
        color
      }
      leaveFlux {
        month
        approved
        rejected
        pending
      }
      recentActivities {
        id
        user
        action
        time
      }
    }
  }
`;
