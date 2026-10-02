import rateLimit from 'express-rate-limit';
import { env } from '../config/env';

// General API rate limiter — generous in development, strict in production
export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: env.NODE_ENV === 'production' ? 300 : 1000,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => env.NODE_ENV === 'test',
});

// Auth endpoints — always strict regardless of environment
export const authRateLimiter = rateLimit({
  windowMs: env.NODE_ENV === 'production' ? 15 * 60 * 1000 : 60 * 1000,
  max: env.NODE_ENV === 'production' ? 5 : 50,
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
