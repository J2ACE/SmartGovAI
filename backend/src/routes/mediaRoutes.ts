import { Router } from 'express';
import { getPresignedUploadUrl, presignedUrlSchema } from '../controllers/mediaController';
import { validateRequest } from '../middlewares/validateMiddleware';
import { authenticateJwt } from '../middlewares/authMiddleware';

const router = Router();

router.post('/presigned-url', authenticateJwt, validateRequest(presignedUrlSchema), getPresignedUploadUrl);

export default router;
