import { Router } from 'express';
import { broadcastEmergencyAlert, broadcastAlertSchema } from '../controllers/notificationController';
import { validateRequest } from '../middlewares/validateMiddleware';
import { authenticateJwt } from '../middlewares/authMiddleware';
import { requireRole } from '../middlewares/rbacMiddleware';

const router = Router();

router.post('/broadcast', authenticateJwt, requireRole(['DIVISION_ADMIN', 'SUPER_ADMIN']), validateRequest(broadcastAlertSchema), broadcastEmergencyAlert);

export default router;
