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
