import type { InMemoryCacheConfig } from "@apollo/client";

/**
 * Apollo cache field policies for admin GraphQL.
 * Enables cache-and-network: show cached data instantly, refresh in background.
 */
export const apolloCacheConfig: InMemoryCacheConfig = {
  typePolicies: {
    Query: {
      fields: {
        me: {
          merge: true,
        },
        adminDashboardStats: {
          keyArgs: false,
        },
        myAttendance: {
          keyArgs: ["input"],
        },
        attendanceCorrections: {
          keyArgs: ["page", "pageSize", "filters", "sort", "input"],
        },
        allUsers: {
          keyArgs: ["page", "pageSize", "filters", "sort"],
        },
        getLeaveRequests: {
          keyArgs: ["approvalsOnly", "search"],
        },
        leaveBalance: {
          keyArgs: ["allOrg", "search"],
        },
        leaveTypes: {
          keyArgs: ["search"],
        },
        companyHolidays: {
          keyArgs: ["search"],
        },
        organizations: {
          keyArgs: ["search"],
        },
        organization: {
          keyArgs: ["id"],
        },
        officelocations: {
          keyArgs: ["search"],
        },
        departments: {
          keyArgs: ["search"],
        },
        designations: {
          keyArgs: ["search"],
        },
        myNotifications: {
          keyArgs: ["level", "isRead", "page", "pageSize"],
        },
        unreadNotificationCount: {
          keyArgs: ["level"],
        },
        salaryStructures: {
          keyArgs: false,
        },
        salaryComponents: {
          keyArgs: false,
        },
        payrollRuns: {
          keyArgs: false,
        },
      },
    },
    User: {
      keyFields: ["id"],
    },
    AttendanceRecord: {
      keyFields: ["id"],
    },
    AttendanceCorrection: {
      keyFields: ["id"],
    },
  },
};

export const apolloDefaultOptions = {
  watchQuery: {
    fetchPolicy: "cache-and-network" as const,
    nextFetchPolicy: "cache-first" as const,
  },
  mutate: {
    awaitRefetchQueries: true,
  },
};
