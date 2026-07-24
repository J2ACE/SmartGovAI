import { 
  Complaint, 
  User, 
  ApiResponse, 
  NearbyComplaint, 
  Notification,
  IssueCategory,
  ComplaintStatus 
} from '../types';
import { storage } from '../utils/storage';
import { locationService } from './locationService';

// Base API URL - replace with actual backend URL
const API_BASE_URL = 'https://api.reportapp.example.com';

// Simulated delay for demo purposes
const simulateDelay = (ms: number = 1000) => 
  new Promise(resolve => setTimeout(resolve, ms));

// Generate unique IDs
const generateId = () => `CMP${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

// Mock data store (in production, this would be the backend)
let mockComplaints: Complaint[] = [];
let mockUsers: Map<string, User> = new Map();

export const api = {
  // ==================== AUTH ====================
  
  async requestOTP(phoneNumber: string): Promise<ApiResponse<{ otpSent: boolean }>> {
    await simulateDelay(1000);
    
    // In production, this would send an actual OTP via SMS
    console.log(`OTP sent to ${phoneNumber}: 123456`);
    
    return {
      success: true,
      data: { otpSent: true },
      message: 'OTP sent successfully',
    };
  },

  async verifyOTP(phoneNumber: string, otp: string): Promise<ApiResponse<{ user: User; token: string }>> {
    await simulateDelay(1000);

    // For demo, accept any 6-digit OTP or "123456"
    if (otp.length !== 6) {
      return {
        success: false,
        error: 'Invalid OTP format',
      };
    }

    // Create or get user
    let user = mockUsers.get(phoneNumber);
    if (!user) {
      user = {
        id: `USR${Date.now()}`,
        phoneNumber,
        role: 'citizen',
        language: 'en',
        rewardPoints: 0,
        createdAt: new Date().toISOString(),
      };
      mockUsers.set(phoneNumber, user);
    }

    const token = `token_${Date.now()}_${Math.random().toString(36)}`;

    return {
      success: true,
      data: { user, token },
      message: 'Login successful',
    };
  },

  async updateProfile(userId: string, updates: Partial<User>): Promise<ApiResponse<User>> {
    await simulateDelay(500);

    const user = Array.from(mockUsers.values()).find(u => u.id === userId);
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    const updatedUser = { ...user, ...updates };
    mockUsers.set(user.phoneNumber, updatedUser);

    return {
      success: true,
      data: updatedUser,
    };
  },

  // ==================== COMPLAINTS ====================

  async createComplaint(
    complaint: Omit<Complaint, 'id' | 'status' | 'statusHistory' | 'supporterCount' | 'supporters' | 'upvotes' | 'upvotedBy' | 'createdAt' | 'updatedAt'>
  ): Promise<ApiResponse<Complaint>> {
    await simulateDelay(1500);

    const newComplaint: Complaint = {
      ...complaint,
      id: generateId(),
      status: 'submitted',
      statusHistory: [
        {
          status: 'submitted',
          timestamp: new Date().toISOString(),
          note: 'Complaint registered successfully',
        },
      ],
      supporterCount: 1,
      supporters: [complaint.citizenId],
      upvotes: 0,
      upvotedBy: [], // Initialize empty upvotedBy array
      beforeImages: [complaint.imageUri],
      afterImages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockComplaints.unshift(newComplaint);
    await storage.addComplaint(newComplaint);

    return {
      success: true,
      data: newComplaint,
      message: 'Complaint submitted successfully',
    };
  },

  async getMyComplaints(userId: string): Promise<ApiResponse<Complaint[]>> {
    await simulateDelay(800);

    // First try to get from local storage
    let complaints = await storage.getComplaints();
    
    // Filter complaints by user
    const userComplaints = complaints.filter(
      c => c.citizenId === userId || c.supporters.includes(userId)
    );

    // Also include mock complaints
    const mockUserComplaints = mockComplaints.filter(
      c => c.citizenId === userId || c.supporters.includes(userId)
    );

    // Merge and deduplicate
    const allComplaints = [...userComplaints];
    mockUserComplaints.forEach(mc => {
      if (!allComplaints.find(c => c.id === mc.id)) {
        allComplaints.push(mc);
      }
    });

    // Sort by date
    allComplaints.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return {
      success: true,
      data: allComplaints,
    };
  },

  async getComplaintById(complaintId: string): Promise<ApiResponse<Complaint>> {
    await simulateDelay(500);

    const complaint = mockComplaints.find(c => c.id === complaintId);
    if (!complaint) {
      // Try local storage
      const localComplaints = await storage.getComplaints();
      const localComplaint = localComplaints.find(c => c.id === complaintId);
      
      if (!localComplaint) {
        return { success: false, error: 'Complaint not found' };
      }
      return { success: true, data: localComplaint };
    }

    return { success: true, data: complaint };
  },

  async getNearbyComplaints(
    latitude: number,
    longitude: number,
    radiusMeters: number = 100,
    category?: IssueCategory
  ): Promise<ApiResponse<NearbyComplaint[]>> {
    await simulateDelay(800);

    // Get all complaints from storage and mock
    const localComplaints = await storage.getComplaints();
    const allComplaints = [...mockComplaints, ...localComplaints];

    // Filter by location and optionally by category
    const nearbyComplaints: NearbyComplaint[] = [];

    for (const complaint of allComplaints) {
      if (complaint.status === 'resolved' || complaint.status === 'closed') {
        continue; // Skip resolved complaints
      }

      if (category && complaint.category !== category) {
        continue; // Skip if category doesn't match
      }

      const distance = locationService.calculateDistance(
        latitude,
        longitude,
        complaint.location.latitude,
        complaint.location.longitude
      );

      if (distance <= radiusMeters) {
        nearbyComplaints.push({
          complaint,
          distance,
        });
      }
    }

    // Sort by distance
    nearbyComplaints.sort((a, b) => a.distance - b.distance);

    return {
      success: true,
      data: nearbyComplaints,
    };
  },

  async supportComplaint(complaintId: string, userId: string): Promise<ApiResponse<Complaint>> {
    await simulateDelay(500);

    const complaint = mockComplaints.find(c => c.id === complaintId);
    if (!complaint) {
      return { success: false, error: 'Complaint not found' };
    }

    if (!complaint.supporters.includes(userId)) {
      complaint.supporters.push(userId);
      complaint.supporterCount = complaint.supporters.length;
      complaint.updatedAt = new Date().toISOString();
    }

    return {
      success: true,
      data: complaint,
      message: 'You have been added as a supporter',
    };
  },

  async upvoteComplaint(complaintId: string, userId: string): Promise<ApiResponse<Complaint>> {
    await simulateDelay(300);

    const complaint = mockComplaints.find(c => c.id === complaintId);
    if (!complaint) {
      return { success: false, error: 'Complaint not found' };
    }

    // Check if user has already upvoted
    if (complaint.upvotedBy?.includes(userId)) {
      return { 
        success: false, 
        error: 'You have already upvoted this complaint',
        data: complaint
      };
    }

    complaint.upvotes += 1;
    complaint.upvotedBy = [...(complaint.upvotedBy || []), userId];
    complaint.updatedAt = new Date().toISOString();

    return {
      success: true,
      data: complaint,
    };
  },

  async submitFeedback(
    complaintId: string,
    satisfied: boolean,
    comment?: string,
    rating?: number
  ): Promise<ApiResponse<Complaint>> {
    await simulateDelay(500);

    const complaint = mockComplaints.find(c => c.id === complaintId);
    if (!complaint) {
      return { success: false, error: 'Complaint not found' };
    }

    complaint.feedback = {
      satisfied,
      comment,
      rating,
    };
    complaint.status = 'closed';
    complaint.statusHistory.push({
      status: 'closed',
      timestamp: new Date().toISOString(),
      note: satisfied ? 'Citizen satisfied with resolution' : 'Citizen not satisfied',
    });
    complaint.updatedAt = new Date().toISOString();

    return {
      success: true,
      data: complaint,
      message: 'Feedback submitted successfully',
    };
  },

  // ==================== NOTIFICATIONS ====================

  async getNotifications(userId: string): Promise<ApiResponse<Notification[]>> {
    await simulateDelay(500);

    const notifications = await storage.getNotifications();
    const userNotifications = notifications.filter(n => n.userId === userId);

    return {
      success: true,
      data: userNotifications,
    };
  },

  async markNotificationRead(notificationId: string): Promise<ApiResponse<void>> {
    await storage.markNotificationRead(notificationId);
    return { success: true };
  },

  // ==================== REWARDS ====================

  async getRewardPoints(userId: string): Promise<ApiResponse<{ points: number; history: any[] }>> {
    await simulateDelay(300);

    const user = Array.from(mockUsers.values()).find(u => u.id === userId);
    
    return {
      success: true,
      data: {
        points: user?.rewardPoints || 0,
        history: [],
      },
    };
  },

  // ==================== OFFLINE SYNC ====================

  async syncOfflineComplaints(): Promise<ApiResponse<{ synced: number; failed: number }>> {
    const queue = await storage.getOfflineQueue();
    let synced = 0;
    let failed = 0;

    for (const item of queue) {
      try {
        const result = await this.createComplaint(item as any);
        if (result.success) {
          await storage.removeFromOfflineQueue((item as any).offlineId);
          synced++;
        } else {
          failed++;
        }
      } catch (error) {
        failed++;
      }
    }

    return {
      success: true,
      data: { synced, failed },
    };
  },
};

// Initialize with some demo data
export const initializeDemoData = () => {
  const demoComplaints: Complaint[] = [
    {
      id: 'CMP001DEMO',
      citizenId: 'demo_user',
      category: 'pothole',
      description: 'Large pothole near the bus stop causing accidents',
      severity: 'high',
      location: {
        latitude: 28.6139,
        longitude: 77.2090,
        address: 'Near India Gate, New Delhi',
        area: 'Central Delhi',
        city: 'New Delhi',
        state: 'Delhi',
        pincode: '110001',
      },
      imageUri: 'https://example.com/pothole.jpg',
      beforeImages: ['https://example.com/pothole.jpg'],
      afterImages: [],
      status: 'in_progress',
      statusHistory: [
        { status: 'submitted', timestamp: '2024-01-01T10:00:00Z', note: 'Complaint registered' },
        { status: 'verified', timestamp: '2024-01-01T12:00:00Z', note: 'Verified by supervisor' },
        { status: 'assigned', timestamp: '2024-01-01T14:00:00Z', note: 'Assigned to road repair team' },
        { status: 'in_progress', timestamp: '2024-01-02T09:00:00Z', note: 'Work started' },
      ],
      supporterCount: 15,
      supporters: ['user1', 'user2', 'user3'],
      upvotes: 25,
      upvotedBy: ['user1', 'user2', 'user3', 'user5'], // Track upvoted users
      assignedTo: 'worker123',
      createdAt: '2024-01-01T10:00:00Z',
      updatedAt: '2024-01-02T09:00:00Z',
    },
    {
      id: 'CMP002DEMO',
      citizenId: 'demo_user',
      category: 'garbage',
      description: 'Garbage dump not cleared for a week',
      severity: 'medium',
      location: {
        latitude: 28.6229,
        longitude: 77.2190,
        address: 'Connaught Place, New Delhi',
        area: 'Central Delhi',
        city: 'New Delhi',
        state: 'Delhi',
        pincode: '110001',
      },
      imageUri: 'https://example.com/garbage.jpg',
      beforeImages: ['https://example.com/garbage.jpg'],
      afterImages: ['https://example.com/garbage_cleaned.jpg'],
      status: 'resolved',
      statusHistory: [
        { status: 'submitted', timestamp: '2024-01-05T08:00:00Z', note: 'Complaint registered' },
        { status: 'verified', timestamp: '2024-01-05T10:00:00Z', note: 'Verified' },
        { status: 'assigned', timestamp: '2024-01-05T11:00:00Z', note: 'Assigned to sanitation team' },
        { status: 'in_progress', timestamp: '2024-01-05T14:00:00Z', note: 'Cleanup started' },
        { status: 'resolved', timestamp: '2024-01-05T17:00:00Z', note: 'Area cleaned successfully' },
      ],
      supporterCount: 8,
      supporters: ['user4', 'user5'],
      upvotes: 12,
      upvotedBy: ['user4', 'user6', 'user7'], // Track upvoted users
      assignedTo: 'worker456',
      createdAt: '2024-01-05T08:00:00Z',
      updatedAt: '2024-01-05T17:00:00Z',
      resolvedAt: '2024-01-05T17:00:00Z',
    },
  ];

  mockComplaints = demoComplaints;
};

// Auto-initialize demo data
initializeDemoData();
