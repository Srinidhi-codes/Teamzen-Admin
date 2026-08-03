export interface NamedCount {
  name: string;
  value: number;
}

export interface PerformanceOverview {
  activeCycles: number;
  pendingReviews: number;
  completedReviews: number;
  completionRate: number;
  goalsTotal: number;
  goalsOnTrack: number;
  goalsAtRisk: number;
  goalsCompleted: number;
  ratingDistribution: NamedCount[];
  goalByDepartment: NamedCount[];
}

export interface PerformanceCycle {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: string;
  organizationId: string;
  reviewCount: number;
  completedReviews: number;
  goalCount: number;
}

export interface PerformanceGoal {
  id: string;
  title: string;
  description: string;
  target: string;
  progress: number;
  status: string;
  dueDate?: string | null;
  userId: string;
  userName: string;
  department?: string | null;
  cycleId?: string | null;
  cycleName?: string | null;
}

export interface PerformanceReview {
  id: string;
  cycleId: string;
  cycleName: string;
  employeeId: string;
  employeeName: string;
  reviewerId?: string | null;
  reviewerName?: string | null;
  selfScore?: number | null;
  managerScore?: number | null;
  selfComments: string;
  managerComments: string;
  status: string;
  department?: string | null;
}
