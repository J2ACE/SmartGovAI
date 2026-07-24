// ==========================================
// SmartGovAI (Nivaranam) - Shared Data Contracts
// ==========================================

export enum Role {
  CITIZEN = 'CITIZEN',
  DEPARTMENT_HEAD = 'DEPARTMENT_HEAD',
  DIVISION_ADMIN = 'DIVISION_ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

export enum ComplaintStatus {
  SUBMITTED = 'SUBMITTED',
  AI_PROCESSING = 'AI_PROCESSING',
  VERIFIED = 'VERIFIED',
  ASSIGNED = 'ASSIGNED',
  ACCEPTED = 'ACCEPTED',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CITIZEN_FEEDBACK = 'CITIZEN_FEEDBACK',
  CLOSED = 'CLOSED',
  REJECTED = 'REJECTED',
  ARCHIVED = 'ARCHIVED',
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  EMERGENCY = 'EMERGENCY',
}

export enum SubmissionSource {
  MOBILE_APP = 'MOBILE_APP',
  WHATSAPP_BOT = 'WHATSAPP_BOT',
  WEB_PORTAL = 'WEB_PORTAL',
}

export interface UserDTO {
  id: string;
  phoneNumber?: string | null;
  email?: string | null;
  fullName: string;
  role: Role;
  cityId?: string | null;
  divisionId?: string | null;
  departmentId?: string | null;
  avatarUrl?: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface ComplaintMediaDTO {
  id: string;
  complaintId: string;
  s3Key: string;
  publicUrl: string;
  mediaType: string;
  fileSizeBytes: number;
  mimeType: string;
  createdAt: string;
}

export interface StatusHistoryDTO {
  id: string;
  complaintId: string;
  status: ComplaintStatus;
  comment?: string | null;
  changedById: string;
  createdAt: string;
}

export interface ComplaintDTO {
  id: string;
  trackingId: string;
  citizenId: string;
  assignedOfficerId?: string | null;
  departmentId?: string | null;
  divisionId?: string | null;
  contractorId?: string | null;
  title: string;
  description: string;
  category: string;
  status: ComplaintStatus;
  priority: Priority;
  source: SubmissionSource;
  latitude: number;
  longitude: number;
  address: string;
  landmark?: string | null;
  aiConfidence: number;
  aiDetectedCategory?: string | null;
  aiIsDuplicate: boolean;
  duplicateOfId?: string | null;
  upvoteCount: number;
  resolvedAt?: string | null;
  resolutionProofUrl?: string | null;
  resolutionComment?: string | null;
  rating?: number | null;
  feedbackComment?: string | null;
  createdAt: string;
  updatedAt: string;
  media?: ComplaintMediaDTO[];
  statusHistory?: StatusHistoryDTO[];
}

export interface AIPredictionResponse {
  category: string;
  confidence: number;
  priority: Priority;
  isDuplicate: boolean;
  boundingBoxes: Array<{
    label: string;
    confidence: number;
    bbox: [number, number, number, number];
  }>;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}
