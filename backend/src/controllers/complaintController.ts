import { Request, Response } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { enqueueComplaintJob } from '../queues/complaintQueue';
import { routeComplaintAutomatically } from '../services/routingService';

export const createComplaintSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Title is required'),
    description: z.string().min(5, 'Description must be at least 5 characters'),
    category: z.string().min(1, 'Category is required'),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    address: z.string().min(1, 'Address is required'),
    s3Key: z.string().min(1, 'Uploaded image S3 Key is required'),
    publicUrl: z.string().url('Valid public URL is required'),
  }),
});

const mockComplaintsStore: any[] = [
  {
    id: 'complaint-001',
    trackingId: 'NIV-2026-89412',
    citizenId: 'citizen-9876543210',
    citizenName: 'Citizen User',
    title: 'Severe Road Pothole near Main Junction',
    description: 'Deep pothole causing vehicle damage and traffic slowdown.',
    category: 'POTHOLE',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    source: 'MOBILE_APP',
    latitude: 28.65,
    longitude: 77.20,
    address: 'SV Road, Connaught Place, North Division',
    aiConfidence: 0.96,
    upvoteCount: 12,
    departmentId: 'dept-roads-01',
    departmentName: 'Road Department',
    divisionId: 'division-north-01',
    divisionName: 'North Division',
    createdAt: new Date().toISOString(),
    statusHistory: [
      { status: 'PENDING', timestamp: new Date(Date.now() - 86400000).toISOString(), note: 'Submitted by citizen' },
      { status: 'APPROVED', timestamp: new Date(Date.now() - 43200000).toISOString(), note: 'Verified by Division Admin' },
      { status: 'IN_PROGRESS', timestamp: new Date(Date.now() - 3600000).toISOString(), note: 'Assigned to Metro Construction' }
    ],
    media: [
      {
        id: 'media-001',
        s3Key: 'complaints/pothole/12345.jpg',
        publicUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600',
        mediaType: 'IMAGE',
      },
    ],
  },
  {
    id: 'complaint-002',
    trackingId: 'NIV-2026-89413',
    citizenId: 'citizen-9876543211',
    citizenName: 'Citizen User',
    title: 'Overflowing Waste Dump on Market Road',
    description: 'Uncollected garbage creating bad odor and unhygienic conditions.',
    category: 'GARBAGE_DUMP',
    status: 'PENDING',
    priority: 'MEDIUM',
    source: 'MOBILE_APP',
    latitude: 28.60,
    longitude: 77.22,
    address: 'Market Yard, Dadar East, Central Division',
    aiConfidence: 0.88,
    upvoteCount: 5,
    departmentId: 'dept-sanitation-01',
    departmentName: 'Sanitation Department',
    divisionId: 'division-central-01',
    divisionName: 'Central Division',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    statusHistory: [
      { status: 'PENDING', timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), note: 'Submitted by citizen' }
    ],
    media: [
      {
        id: 'media-002',
        s3Key: 'complaints/garbage/12346.jpg',
        publicUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=600',
        mediaType: 'IMAGE',
      },
    ],
  },
];

export const createComplaint = async (req: AuthenticatedRequest, res: Response) => {
  const { title, description, category, latitude, longitude, address, s3Key, publicUrl } = req.body;
  const citizenId = req.user?.userId || 'citizen-9876543210';
  const citizenName = req.user?.fullName || 'Citizen User';

  const trackingId = `NIV-2026-${Math.floor(10000 + Math.random() * 90000)}`;

  // Automated Department & Region Routing Computation
  const routing = routeComplaintAutomatically(category, latitude, longitude);

  const newComplaint = {
    id: `complaint-${Date.now()}`,
    trackingId,
    citizenId,
    citizenName,
    title,
    description,
    category,
    status: 'PENDING',
    priority: 'MEDIUM',
    source: 'MOBILE_APP',
    latitude,
    longitude,
    address,
    departmentId: routing.departmentId,
    departmentName: routing.departmentName,
    divisionId: routing.divisionId,
    divisionName: routing.divisionName,
    aiConfidence: 0.94,
    upvoteCount: 1,
    createdAt: new Date().toISOString(),
    statusHistory: [
      { status: 'PENDING', timestamp: new Date().toISOString(), note: 'Registered & auto-assigned' }
    ],
    media: [{ id: `media-${Date.now()}`, s3Key, publicUrl, mediaType: 'IMAGE' }],
  };

  mockComplaintsStore.unshift(newComplaint);

  console.log(`📢 [NOTIFY REGIONAL HEAD]: ${routing.divisionName} Head notified of ${trackingId}`);
  console.log(`📢 [NOTIFY DEPT HEAD]: ${routing.departmentName} Head notified of ${trackingId}`);

  // Enqueue Async Job for AI Inference & Push Notification Dispatch
  enqueueComplaintJob({
    complaintId: newComplaint.id,
    trackingId,
    s3Key,
    category,
    latitude,
    longitude,
  });

  return res.status(202).json({
    success: true,
    message: `Complaint submitted successfully to ${routing.divisionName} (${routing.departmentName}).`,
    data: newComplaint,
  });
};

export const getMyComplaints = async (req: AuthenticatedRequest, res: Response) => {
  const citizenId = req.user?.userId;
  const userComplaints = mockComplaintsStore.filter((c) => c.citizenId === citizenId || true);

  return res.status(200).json({
    success: true,
    data: userComplaints,
  });
};

export const getComplaintById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const complaint = mockComplaintsStore.find((c) => c.id === id || c.trackingId === id);

  if (!complaint) {
    return res.status(404).json({ success: false, error: 'Complaint not found.' });
  }

  return res.status(200).json({
    success: true,
    data: complaint,
  });
};

export const getNearbyComplaints = async (req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    data: mockComplaintsStore,
  });
};

export const updateComplaintStatus = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { status, comment } = req.body;

  const complaint = mockComplaintsStore.find((c) => c.id === id || c.trackingId === id);
  if (!complaint) {
    return res.status(404).json({ success: false, error: 'Complaint not found.' });
  }

  complaint.status = status;
  if (!complaint.statusHistory) complaint.statusHistory = [];
  complaint.statusHistory.push({
    status,
    timestamp: new Date().toISOString(),
    note: comment || `Status updated to ${status}`
  });

  if (comment) complaint.resolutionComment = comment;

  console.log(`⚡ [REALTIME SYNC]: ${complaint.trackingId} status updated to ${status}`);

  return res.status(200).json({
    success: true,
    message: `Complaint status updated to ${status}`,
    data: complaint,
  });
};
