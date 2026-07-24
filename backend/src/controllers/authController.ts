import { Request, Response } from 'express';
import { z } from 'zod';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { hashPassword, verifyPassword } from '../utils/password';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';

// Zod Validation Schemas
export const registerSchema = z.object({
  body: z.object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters'),
    phoneNumber: z.string().optional(),
    email: z.string().email('Invalid email address').optional(),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(['CITIZEN', 'DEPARTMENT_HEAD', 'DIVISION_ADMIN', 'SUPER_ADMIN']).default('CITIZEN'),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    emailOrPhone: z.string().min(1, 'Email or Phone Number is required'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const sendOtpSchema = z.object({
  body: z.object({
    phoneNumber: z.string().min(10, 'Valid 10-digit phone number required'),
  }),
});

export const verifyOtpSchema = z.object({
  body: z.object({
    phoneNumber: z.string().min(10, 'Valid 10-digit phone number required'),
    otp: z.string().length(6, 'OTP must be 6 digits'),
  }),
});

// Controllers
export const login = async (req: Request, res: Response) => {
  const { emailOrPhone, password } = req.body;

  // Mock Admin Credentials Check (Fallback during Phase 3 before live DB migration)
  if (emailOrPhone === 'admin@cityfix.gov.in' && password === 'admin123') {
    const tokenPayload = {
      userId: 'admin-division-001',
      fullName: 'Division Administrator',
      role: 'DIVISION_ADMIN',
      email: emailOrPhone,
      cityId: 'mumbai-01',
      divisionId: 'north-division-01',
    };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        accessToken,
        refreshToken,
        user: tokenPayload,
      },
    });
  }

  if (emailOrPhone === 'dept@cityfix.gov.in' && password === 'dept123') {
    const tokenPayload = {
      userId: 'dept-head-001',
      fullName: 'Roads Department Head',
      role: 'DEPARTMENT_HEAD',
      email: emailOrPhone,
      departmentId: 'roads-dept-01',
      divisionId: 'north-division-01',
    };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    return res.status(200).json({
      success: true,
      message: 'Department Head login successful.',
      data: {
        accessToken,
        refreshToken,
        user: tokenPayload,
      },
    });
  }

  return res.status(401).json({
    success: false,
    error: 'Invalid credentials.',
  });
};

export const sendOtp = async (req: Request, res: Response) => {
  const { phoneNumber } = req.body;
  // Simulates OTP sending via SMS Gateway
  return res.status(200).json({
    success: true,
    message: `OTP sent successfully to ${phoneNumber}`,
    data: { otpSent: true, testOtp: '123456' },
  });
};

export const verifyOtp = async (req: Request, res: Response) => {
  const { phoneNumber, otp } = req.body;

  if (otp !== '123456') {
    return res.status(400).json({
      success: false,
      error: 'Invalid verification OTP.',
    });
  }

  const tokenPayload = {
    userId: `citizen-${phoneNumber}`,
    fullName: `Citizen (${phoneNumber.slice(-4)})`,
    role: 'CITIZEN',
    phoneNumber,
  };

  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  return res.status(200).json({
    success: true,
    message: 'Phone authentication successful.',
    data: {
      accessToken,
      refreshToken,
      user: tokenPayload,
    },
  });
};

export const refreshToken = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ success: false, error: 'Refresh token required.' });
  }

  try {
    const payload = verifyRefreshToken(refreshToken);
    const newAccessToken = generateAccessToken({
      userId: payload.userId,
      role: payload.role,
      phoneNumber: payload.phoneNumber,
      email: payload.email,
      divisionId: payload.divisionId,
      departmentId: payload.departmentId,
    });

    return res.status(200).json({
      success: true,
      data: { accessToken: newAccessToken },
    });
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Invalid or expired refresh token.' });
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response) => {
  return res.status(200).json({
    success: true,
    data: { user: req.user },
  });
};
