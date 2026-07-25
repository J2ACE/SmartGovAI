import { Router } from 'express';
import { broadcastEmergencyAlert, broadcastAlertSchema, getMyNotifications } from '../controllers/notificationController';
import { validateRequest } from '../middlewares/validateMiddleware';
import { authenticateJwt } from '../middlewares/authMiddleware';
import { requireRole } from '../middlewares/rbacMiddleware';

const router = Router();

router.get('/my', getMyNotifications);
router.get('/', getMyNotifications);
router.post('/broadcast', authenticateJwt, requireRole(['DIVISION_ADMIN', 'SUPER_ADMIN']), validateRequest(broadcastAlertSchema), broadcastEmergencyAlert);

export default router;
