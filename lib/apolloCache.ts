import type { InMemoryCacheConfig } from "@apollo/client";

/**
 * Apollo cache field policies for admin GraphQL.
 * Default: cache-first so route changes reuse cached data without a loading flash.
 * Queries that need fresh data can opt into cache-and-network locally.
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
          keyArgs: ["organizationId"],
        },
        salaryComponents: {
          keyArgs: ["organizationId"],
        },
        payrollRuns: {
          keyArgs: ["organizationId"],
        },
        salaryAdvances: {
          keyArgs: ["status", "organizationId"],
        },
        payrollSettings: {
          keyArgs: ["organizationId"],
        },
        payrollSetupChecklist: {
          keyArgs: ["organizationId"],
        },
        payslipTemplates: {
          keyArgs: ["organizationId"],
          merge(_existing, incoming) {
            return incoming;
          },
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
    PayslipTemplate: {
      keyFields: ["id"],
    },
  },
};

export const apolloDefaultOptions = {
  watchQuery: {
    fetchPolicy: "cache-first" as const,
    nextFetchPolicy: "cache-first" as const,
  },
  query: {
    fetchPolicy: "cache-first" as const,
  },
  mutate: {
    awaitRefetchQueries: false,
  },
};
