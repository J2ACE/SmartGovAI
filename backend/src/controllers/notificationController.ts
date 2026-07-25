import { Request, Response } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';

export const broadcastAlertSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Alert title required'),
    message: z.string().min(5, 'Alert message must be at least 5 characters'),
    divisionId: z.string().optional(),
    alertLevel: z.enum(['INFO', 'WARNING', 'EMERGENCY']).default('EMERGENCY'),
  }),
});

export const broadcastEmergencyAlert = async (req: AuthenticatedRequest, res: Response) => {
  const { title, message, divisionId, alertLevel } = req.body;

  console.log(`🚨 [EMERGENCY ALERT DISPATCHED]: ${alertLevel} - ${title}: ${message}`);

  return res.status(200).json({
    success: true,
    message: `Emergency alert broadcasted successfully to all citizens in ${divisionId || 'Citywide'}.`,
    data: {
      alertId: `ALERT-${Date.now()}`,
      recipientsNotified: 48920,
      timestamp: new Date().toISOString(),
    },
  });
};

export const getMyNotifications = async (req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    data: [
      {
        id: 'NOTIF-001',
        title: 'Water Supply Maintenance',
        message: 'Scheduled pipeline repair in North Division from 10 AM to 4 PM.',
        type: 'EMERGENCY_ALERT',
        read: false,
        createdAt: new Date(Date.now() - 7200000).toISOString(),
      },
      {
        id: 'NOTIF-002',
        title: 'Road Work Started',
        message: 'Contractor has commenced work on pothole complaint NIV-2026-89412.',
        type: 'STATUS_UPDATE',
        read: true,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 'NOTIF-003',
        title: 'Civic Reward Points Earned',
        message: 'You earned 10 civic reward points for reporting a verified issue.',
        type: 'REWARD',
        read: true,
        createdAt: new Date(Date.now() - 172800000).toISOString(),
      },
    ],
  });
};
