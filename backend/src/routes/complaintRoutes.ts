import { Router } from 'express';
import {
  createComplaint,
  getMyComplaints,
  getComplaintById,
  getNearbyComplaints,
  updateComplaintStatus,
  deleteComplaint,
  createComplaintSchema,
} from '../controllers/complaintController';
import { validateRequest } from '../middlewares/validateMiddleware';
import { authenticateJwt } from '../middlewares/authMiddleware';
import { requireRole } from '../middlewares/rbacMiddleware';

const router = Router();

router.post('/', authenticateJwt, validateRequest(createComplaintSchema), createComplaint);
router.get('/my', authenticateJwt, getMyComplaints);
router.get('/nearby', getNearbyComplaints);
router.get('/:id', getComplaintById);
router.patch('/:id/status', authenticateJwt, requireRole(['DEPARTMENT_HEAD', 'DIVISION_ADMIN', 'SUPER_ADMIN']), updateComplaintStatus);
router.delete('/:id', authenticateJwt, deleteComplaint);

export default router;
