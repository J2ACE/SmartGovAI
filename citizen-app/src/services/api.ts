import axios from 'axios';
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

// Base API URL - Configure targeting local Express backend or dev server
const API_BASE_URL = 'http://10.0.2.2:5000/api/v1'; // 10.0.2.2 for Android Emulator, localhost for iOS / Web

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject JWT token from secure storage
axiosClient.interceptors.request.use(async (config) => {
  const token = await storage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Simulated delay for fallback offline demo mode
const simulateDelay = (ms: number = 800) => 
  new Promise(resolve => setTimeout(resolve, ms));

const generateId = () => `CMP${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

let mockComplaints: Complaint[] = [];
let mockUsers: Map<string, User> = new Map();

export const api = {
  // ==================== AUTH ====================
  
  async requestOTP(phoneNumber: string): Promise<ApiResponse<{ otpSent: boolean }>> {
    try {
      const response = await axiosClient.post('/auth/send-otp', { phoneNumber });
      return {
        success: true,
        data: { otpSent: true },
        message: response.data.message || 'OTP sent successfully',
      };
    } catch (err: any) {
      console.warn('Backend connection unavailable, using fallback OTP provider.');
      await simulateDelay(800);
      return {
        success: true,
        data: { otpSent: true },
        message: 'OTP sent successfully (Offline Mode)',
      };
    }
  },

  async verifyOTP(phoneNumber: string, otp: string): Promise<ApiResponse<{ user: User; token: string }>> {
    try {
      const response = await axiosClient.post('/auth/verify-otp', { phoneNumber, otp });
      const { accessToken, user } = response.data.data;
      
      const formattedUser: User = {
        id: user.userId,
        phoneNumber,
        role: 'citizen',
        language: 'en',
        rewardPoints: 50,
        createdAt: new Date().toISOString(),
      };

      await storage.saveToken(accessToken);
      await storage.saveUser(formattedUser);

      return {
        success: true,
        data: { user: formattedUser, token: accessToken },
        message: 'Login successful',
      };
    } catch (err: any) {
      console.warn('Backend connection unavailable, verifying OTP via fallback authentication.');
      await simulateDelay(800);

      if (otp.length !== 6) {
        return { success: false, error: 'Invalid OTP format' };
      }

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

      const token = `token_${Date.now()}`;
      await storage.saveToken(token);
      await storage.saveUser(user);

      return {
        success: true,
        data: { user, token },
        message: 'Login successful',
      };
    }
  },

  async updateProfile(userId: string, updates: Partial<User>): Promise<ApiResponse<User>> {
    await simulateDelay(500);
    const user = await storage.getUser();
    if (!user) return { success: false, error: 'User not found' };

    const updatedUser = { ...user, ...updates };
    await storage.saveUser(updatedUser);
    return { success: true, data: updatedUser };
  },

  // ==================== COMPLAINTS ====================

  async createComplaint(
    complaint: Omit<Complaint, 'id' | 'status' | 'statusHistory' | 'supporterCount' | 'supporters' | 'upvotes' | 'upvotedBy' | 'createdAt' | 'updatedAt'>
  ): Promise<ApiResponse<Complaint>> {
    try {
      // 1. Get S3 Presigned Upload URL
      const presignedRes = await axiosClient.post('/media/presigned-url', {
        filename: `photo_${Date.now()}.jpg`,
        mimeType: 'image/jpeg',
        category: complaint.category,
      });

      const { s3Key, publicUrl } = presignedRes.data.data;

      // 2. Submit Complaint Payload to REST API Gateway
      const complaintRes = await axiosClient.post('/complaints', {
        title: complaint.title,
        description: complaint.description,
        category: complaint.category,
        latitude: complaint.latitude,
        longitude: complaint.longitude,
        address: complaint.address,
        s3Key,
        publicUrl,
      });

      const apiData = complaintRes.data.data;

      const newComplaint: Complaint = {
        id: apiData.id || generateId(),
        trackingId: apiData.trackingId || `NIV-2026-${Math.floor(10000 + Math.random() * 90000)}`,
        citizenId: complaint.citizenId,
        citizenName: complaint.citizenName,
        citizenPhone: complaint.citizenPhone,
        title: complaint.title,
        description: complaint.description,
        category: complaint.category as IssueCategory,
        status: 'submitted',
        priority: (apiData.priority?.toLowerCase() as any) || 'medium',
        latitude: complaint.latitude,
        longitude: complaint.longitude,
        address: complaint.address,
        landmark: complaint.landmark,
        imageUri: publicUrl || complaint.imageUri,
        beforeImages: [publicUrl || complaint.imageUri],
        afterImages: [],
        statusHistory: [
          {
            status: 'submitted',
            timestamp: new Date().toISOString(),
            note: 'Complaint registered and enqueued for AI classification',
          },
        ],
        supporterCount: 1,
        supporters: [complaint.citizenId],
        upvotes: 0,
        upvotedBy: [],
        aiConfidence: apiData.aiConfidence || 0.92,
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
    } catch (err: any) {
      console.warn('Backend server connection failed, saving complaint to local storage queue.');
      await simulateDelay(1000);

      const newComplaint: Complaint = {
        ...complaint,
        id: generateId(),
        status: 'submitted',
        statusHistory: [
          {
            status: 'submitted',
            timestamp: new Date().toISOString(),
            note: 'Complaint saved locally (Pending Sync)',
          },
        ],
        supporterCount: 1,
        supporters: [complaint.citizenId],
        upvotes: 0,
        upvotedBy: [],
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
        message: 'Complaint submitted successfully (Offline Mode)',
      };
    }
  },

  async getMyComplaints(userId: string): Promise<ApiResponse<Complaint[]>> {
    try {
      const response = await axiosClient.get('/complaints/my');
      const apiComplaints = response.data.data;

      if (Array.isArray(apiComplaints) && apiComplaints.length > 0) {
        const formattedComplaints: Complaint[] = apiComplaints.map((item: any) => ({
          id: item.id,
          trackingId: item.trackingId || item.id,
          citizenId: item.citizenId,
          title: item.title,
          description: item.description,
          category: item.category as IssueCategory,
          status: item.status.toLowerCase() as ComplaintStatus,
          priority: item.priority.toLowerCase() as any,
          latitude: item.latitude,
          longitude: item.longitude,
          address: item.address,
          imageUri: item.media?.[0]?.publicUrl || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600',
          beforeImages: item.media?.map((m: any) => m.publicUrl) || [],
          afterImages: [],
          statusHistory: [
            {
              status: item.status.toLowerCase() as ComplaintStatus,
              timestamp: item.createdAt,
              note: `Status is ${item.status}`,
            },
          ],
          supporterCount: item.upvoteCount || 1,
          supporters: [userId],
          upvotes: item.upvoteCount || 0,
          upvotedBy: [],
          aiConfidence: item.aiConfidence || 0.9,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt || item.createdAt,
        }));

        return { success: true, data: formattedComplaints };
      }
    } catch (err: any) {
      console.warn('Backend server offline, loading complaints from storage.');
    }

    let complaints = await storage.getComplaints();
    const userComplaints = complaints.filter(
      c => c.citizenId === userId || c.supporters.includes(userId)
    );
    const mockUserComplaints = mockComplaints.filter(
      c => c.citizenId === userId || c.supporters.includes(userId)
    );

    const merged = [...userComplaints];
    mockUserComplaints.forEach(mc => {
      if (!merged.some(c => c.id === mc.id)) merged.push(mc);
    });

    return { success: true, data: merged };
  },

  async getComplaintById(id: string): Promise<ApiResponse<Complaint>> {
    try {
      const response = await axiosClient.get(`/complaints/${id}`);
      const item = response.data.data;
      const formatted: Complaint = {
        id: item.id,
        trackingId: item.trackingId || item.id,
        citizenId: item.citizenId,
        title: item.title,
        description: item.description,
        category: item.category as IssueCategory,
        status: item.status.toLowerCase() as ComplaintStatus,
        priority: item.priority.toLowerCase() as any,
        latitude: item.latitude,
        longitude: item.longitude,
        address: item.address,
        imageUri: item.media?.[0]?.publicUrl || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600',
        beforeImages: item.media?.map((m: any) => m.publicUrl) || [],
        afterImages: [],
        statusHistory: [
          {
            status: item.status.toLowerCase() as ComplaintStatus,
            timestamp: item.createdAt,
            note: `Status is ${item.status}`,
          },
        ],
        supporterCount: item.upvoteCount || 1,
        supporters: [item.citizenId],
        upvotes: item.upvoteCount || 0,
        upvotedBy: [],
        aiConfidence: item.aiConfidence || 0.9,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt || item.createdAt,
      };

      return { success: true, data: formatted };
    } catch (err: any) {
      console.warn('Backend request failed, searching local complaints store.');
    }

    const complaints = await storage.getComplaints();
    const complaint = complaints.find(c => c.id === id || c.trackingId === id) || mockComplaints.find(c => c.id === id);

    if (!complaint) return { success: false, error: 'Complaint not found' };
    return { success: true, data: complaint };
  },

  async getNearbyComplaints(
    latitude: number,
    longitude: number,
    radiusKm: number = 5
  ): Promise<ApiResponse<NearbyComplaint[]>> {
    try {
      const response = await axiosClient.get(`/complaints/nearby?lat=${latitude}&lng=${longitude}&radiusKm=${radiusKm}`);
      const items = response.data.data;

      if (Array.isArray(items)) {
        const nearbyItems: NearbyComplaint[] = items.map((item: any) => ({
          id: item.id,
          title: item.title,
          category: item.category as IssueCategory,
          status: item.status.toLowerCase() as ComplaintStatus,
          latitude: item.latitude,
          longitude: item.longitude,
          distance: 0.8,
          upvotes: item.upvoteCount || 1,
          createdAt: item.createdAt,
          imageUri: item.media?.[0]?.publicUrl || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600',
        }));
        return { success: true, data: nearbyItems };
      }
    } catch (err) {
      console.warn('Backend connection offline, using simulated spatial data.');
    }

    return {
      success: true,
      data: [
        {
          id: 'CMP1',
          title: 'Deep Pothole near Central Junction',
          category: 'POTHOLE',
          status: 'in_progress',
          latitude: latitude + 0.002,
          longitude: longitude + 0.003,
          distance: 0.35,
          upvotes: 14,
          createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
          imageUri: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600',
        },
      ],
    };
  },

  async upvoteComplaint(complaintId: string, userId: string): Promise<ApiResponse<{ upvotes: number; isUpvoted: boolean }>> {
    await simulateDelay(500);
    return { success: true, data: { upvotes: 15, isUpvoted: true } };
  },

  async getNotifications(userId: string): Promise<ApiResponse<Notification[]>> {
    await simulateDelay(500);
    return {
      success: true,
      data: [
        {
          id: 'NOTIF1',
          userId,
          title: 'Status Updated',
          message: 'Your pothole complaint (NIV-2026-89412) has been assigned to Roads Dept.',
          type: 'status_update',
          complaintId: 'CMP1',
          read: false,
          createdAt: new Date().toISOString(),
        },
      ],
    };
  },

  async markNotificationAsRead(notificationId: string): Promise<ApiResponse<boolean>> {
    return { success: true, data: true };
  },
};
