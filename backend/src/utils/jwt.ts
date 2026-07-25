import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface TokenPayload {
  userId: string;
  role: string;
  fullName?: string | null;
  phoneNumber?: string | null;
  email?: string | null;
  divisionId?: string | null;
  departmentId?: string | null;
}

export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: '15m' });
};

export const generateRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as TokenPayload;
};
