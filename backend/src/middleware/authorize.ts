import { Response, NextFunction } from 'express';
import { AuthRequest } from './authenticate';
import { AppError } from '../utils/AppError';
import { USER_ROLES } from '../config/constants';

export const authorize = (...allowedRoles: string[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new AppError('Insufficient permissions', 403);
    }

    next();
  };
};

// Simplified authorization for MVP
export const requireAdmin = authorize(USER_ROLES.ADMIN);
export const requireManager = authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER);
export const requireUser = authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.USER);

