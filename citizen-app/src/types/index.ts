// User Types
export interface User {
  id: string;
  phoneNumber: string;
  name?: string;
  email?: string;
  role: 'citizen' | 'admin' | 'worker';
  language: 'en' | 'hi' | 'ta' | 'te' | 'bn' | 'mr';
  rewardPoints: number;
  createdAt: string;
  profileImage?: string;
}

// Location Types
export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
  area?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

// Issue Categories
export type IssueCategory =
  | 'pothole'
  | 'garbage'
  | 'street_light'
  | 'water_leak'
  | 'sewage'
  | 'road_damage'
  | 'illegal_parking'
  | 'noise_pollution'
  | 'air_pollution'
  | 'encroachment'
  | 'broken_footpath'
  | 'traffic_signal'
  | 'drainage'
  | 'public_toilet'
  | 'other';

export const ISSUE_CATEGORIES: { value: IssueCategory; label: string; icon: string }[] = [
  { value: 'pothole', label: 'Pothole', icon: '🕳️' },
  { value: 'garbage', label: 'Garbage', icon: '🗑️' },
  { value: 'street_light', label: 'Street Light', icon: '💡' },
  { value: 'water_leak', label: 'Water Leak', icon: '💧' },
  { value: 'sewage', label: 'Sewage', icon: '🚰' },
  { value: 'road_damage', label: 'Road Damage', icon: '🛣️' },
  { value: 'illegal_parking', label: 'Illegal Parking', icon: '🚗' },
  { value: 'noise_pollution', label: 'Noise Pollution', icon: '🔊' },
  { value: 'air_pollution', label: 'Air Pollution', icon: '💨' },
  { value: 'encroachment', label: 'Encroachment', icon: '🏗️' },
  { value: 'broken_footpath', label: 'Broken Footpath', icon: '🚶' },
  { value: 'traffic_signal', label: 'Traffic Signal', icon: '🚦' },
  { value: 'drainage', label: 'Drainage', icon: '🌊' },
  { value: 'public_toilet', label: 'Public Toilet', icon: '🚻' },
  { value: 'other', label: 'Other', icon: '📋' },
];

// Complaint Status
export type ComplaintStatus =
  | 'submitted'
  | 'verified'
  | 'assigned'
  | 'in_progress'
  | 'resolved'
  | 'rejected'
  | 'closed';

export const STATUS_CONFIG: Record<ComplaintStatus, { label: string; color: string; bgColor: string }> = {
  submitted: { label: 'Submitted', color: '#2196F3', bgColor: '#E3F2FD' },
  verified: { label: 'Verified', color: '#9C27B0', bgColor: '#F3E5F5' },
  assigned: { label: 'Assigned', color: '#FF9800', bgColor: '#FFF3E0' },
  in_progress: { label: 'In Progress', color: '#FFC107', bgColor: '#FFFDE7' },
  resolved: { label: 'Resolved', color: '#4CAF50', bgColor: '#E8F5E9' },
  rejected: { label: 'Rejected', color: '#F44336', bgColor: '#FFEBEE' },
  closed: { label: 'Closed', color: '#607D8B', bgColor: '#ECEFF1' },
};

// Severity Levels
export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';

export const SEVERITY_CONFIG: Record<SeverityLevel, { label: string; color: string }> = {
  low: { label: 'Low', color: '#4CAF50' },
  medium: { label: 'Medium', color: '#FF9800' },
  high: { label: 'High', color: '#F44336' },
  critical: { label: 'Critical', color: '#9C27B0' },
};

// Complaint Types
export interface StatusEvent {
  status: ComplaintStatus;
  timestamp: string;
  note?: string;
  updatedBy?: string;
}

export interface Complaint {
  id: string;
  citizenId: string;
  category: IssueCategory;
  description?: string;
  severity?: SeverityLevel;
  location: Location;
  imageUri: string;
  beforeImages: string[];
  afterImages: string[];
  status: ComplaintStatus;
  statusHistory: StatusEvent[];
  supporterCount: number;
  supporters: string[];
  upvotes: number;
  upvotedBy: string[]; // Track users who upvoted
  assignedTo?: string;
  workerNotes?: string;
  feedback?: {
    satisfied: boolean;
    comment?: string;
    rating?: number;
  };
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

// Nearby Complaint for duplicate detection
export interface NearbyComplaint {
  complaint: Complaint;
  distance: number; // in meters
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: 'status_update' | 'feedback_request' | 'reward' | 'general';
  complaintId?: string;
  read: boolean;
  createdAt: string;
}

// Reward Types
export interface Reward {
  id: string;
  userId: string;
  points: number;
  reason: string;
  complaintId?: string;
  createdAt: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Auth Types
export interface OTPRequest {
  phoneNumber: string;
}

export interface OTPVerify {
  phoneNumber: string;
  otp: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
}
