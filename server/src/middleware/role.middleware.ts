import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../types';
import { ApiError } from '../utils/ApiError';

export const requireRole = (...roles: UserRole[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ApiError(403, 'Insufficient permissions'));
    }
    return next();
  };
