import { Router } from 'express';
import rateLimit from 'express-rate-limit';
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
import { auditLogger } from '../middlewares/auditMiddleware';

const router = Router();

// Strict Auth Rate Limiter (5 attempts per 15 minutes)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, error: 'Too many authentication attempts. Please try again after 15 minutes.' },
});

router.post('/login', authLimiter, validateRequest(loginSchema), auditLogger('USER_LOGIN'), login);
router.post('/send-otp', authLimiter, validateRequest(sendOtpSchema), sendOtp);
router.post('/verify-otp', authLimiter, validateRequest(verifyOtpSchema), auditLogger('OTP_VERIFIED'), verifyOtp);
router.post('/refresh', refreshToken);
router.get('/me', authenticateJwt, getMe);

export default router;
