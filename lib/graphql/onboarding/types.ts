export type OnboardingOverview = {
  total: number;
  invited: number;
  preboarding: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  pendingVerifications: number;
  overdueTasks: number;
};

export type OnboardingTask = {
  id: string;
  title: string;
  description: string;
  assigneeRole: string;
  phase: string;
  status: string;
  dueAt?: string | null;
  isRequired: boolean;
  requiresDocumentCategory: string;
  sortOrder: number;
  notes: string;
  assigneeId?: string | null;
  assigneeName?: string | null;
  completedAt?: string | null;
};

export type EmployeeDocument = {
  id: string;
  category: string;
  title: string;
  fileName: string;
  fileUrl?: string | null;
  verificationStatus: string;
  rejectionReason: string;
  expiryDate?: string | null;
  aiSuggestedCategory: string;
  aiConfidence?: number | null;
  createdAt: string;
  verifiedAt?: string | null;
};

export type OfferLetter = {
  id: string;
  subject: string;
  bodyHtml: string;
  pdfUrl: string;
  signedPdfUrl?: string;
  signedUploadedAt?: string | null;
  status: string;
  source?: string;
  includeCtcAnnexure?: boolean;
  annualCtc?: number | null;
  acceptedName: string;
  acceptedAt?: string | null;
};

export type EmployeeOnboarding = {
  id: string;
  status: string;
  progressPct: number;
  joinDate?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  activatedAt?: string | null;
  notes: string;
  organizationId: string;
  userId: string;
  userEmail: string;
  userName: string;
  departmentName?: string | null;
  designationName?: string | null;
  templateId?: string | null;
  templateName?: string | null;
  tasks: OnboardingTask[];
  documents: EmployeeDocument[];
  offerLetter?: OfferLetter | null;
};

export type TaskDefinition = {
  id: string;
  title: string;
  description: string;
  assigneeRole: string;
  phase: string;
  dueOffsetDays: number;
  requiresDocumentCategory: string;
  isRequired: boolean;
  sortOrder: number;
};

export type OnboardingTemplate = {
  id: string;
  name: string;
  description: string;
  organizationId: string;
  departmentId?: string | null;
  designationId?: string | null;
  employmentType: string;
  isDefault: boolean;
  itContactId?: string | null;
  taskDefinitions: TaskDefinition[];
};

export type LetterTemplate = {
  id: string;
  name: string;
  letterType: string;
  subject: string;
  bodyHtml: string;
  isDefault: boolean;
  organizationId: string;
};

export const ONBOARDING_LIST_FIELDS = `
  id
  status
  progressPct
  joinDate
  startedAt
  completedAt
  activatedAt
  notes
  organizationId
  userId
  userEmail
  userName
  departmentName
  designationName
  templateId
  templateName
`;

export const ONBOARDING_DETAIL_FIELDS = `
  ${ONBOARDING_LIST_FIELDS}
  tasks {
    id
    title
    description
    assigneeRole
    phase
    status
    dueAt
    isRequired
    requiresDocumentCategory
    sortOrder
    notes
    assigneeId
    assigneeName
    completedAt
  }
  documents {
    id
    category
    title
    fileName
    fileUrl
    verificationStatus
    rejectionReason
    expiryDate
    aiSuggestedCategory
    aiConfidence
    createdAt
    verifiedAt
  }
  offerLetter {
    id
    subject
    bodyHtml
    pdfUrl
    signedPdfUrl
    signedUploadedAt
    status
    source
    updatedAt
    includeCtcAnnexure
    annualCtc
    acceptedName
    acceptedAt
  }
`;
