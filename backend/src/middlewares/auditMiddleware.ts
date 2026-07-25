import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './authMiddleware';

export const auditLogger = (actionType: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.user?.userId || 'anonymous';
    const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';
    const userAgent = req.get('user-agent') || 'unknown';

    console.log(`🔒 [AUDIT LOG]: Action = ${actionType} | User = ${userId} | IP = ${ipAddress} | Time = ${new Date().toISOString()}`);

    next();
  };
};
