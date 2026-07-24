import { Router } from 'express';
import {
  login,
  sendOtp,
  verifyOtp,
  refreshToken,
  getMe,
  loginSchema,
  sendOtpSchema,
  verifyOtpSchema,
} from '../controllers/authController';
import { validateRequest } from '../middlewares/validateMiddleware';
import { authenticateJwt } from '../middlewares/authMiddleware';

const router = Router();

router.post('/login', validateRequest(loginSchema), login);
router.post('/send-otp', validateRequest(sendOtpSchema), sendOtp);
router.post('/verify-otp', validateRequest(verifyOtpSchema), verifyOtp);
router.post('/refresh', refreshToken);
router.get('/me', authenticateJwt, getMe);

export default router;
