import { Request, Response, NextFunction } from 'express';
import { AuthService } from './service.js';
import { CustomError } from '../../middleware/errorHandler.js';
import { jwtService } from './jwt.js';
import { UserRole } from '../../generated/prisma/index.js';
import logger from '../../config/logger.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string | null;
    username: string;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
  };
}

/**
 * Enhanced authentication middleware with JWT access tokens
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new CustomError('No token provided', 401);
    }

    const token = authHeader.split(' ')[1];

    // Verify access token
    const payload = jwtService.verifyAccessToken(token);

    // Get user from database
    const authService = new AuthService();
    const user = await authService.findUserById(payload.userId);

    if (!user) {
      throw new CustomError('User not found', 401);
    }

    // Add user to request object
    (req as AuthenticatedRequest).user = user;
    next();
  } catch (error) {
    if (error instanceof Error) {
      logger.warn(`Authentication failed: ${error.message}`);
      next(new CustomError(error.message.includes('token') ? error.message : 'Authentication failed', 401));
    } else {
      next(new CustomError('Authentication failed', 401));
    }
  }
};

/**
 * Role-based authorization middleware
 */
export const authorize = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) {
      return next(new CustomError('User not authenticated', 401));
    }

    const userRole = authReq.user.role;
    
    if (!roles.includes(userRole)) {
      logger.warn(`Authorization failed: User ${authReq.user.email} with role ${userRole} attempted to access resource requiring roles: ${roles.join(', ')}`);
      return next(new CustomError('Insufficient permissions', 403));
    }
    
    next();
  };
};

/**
 * Admin-only middleware
 */
export const adminOnly = authorize('ADMIN');

/**
 * Instructor and Admin middleware
 */
export const instructorOrAdmin = authorize('INSTRUCTOR', 'ADMIN');

/**
 * Student access middleware (all roles can access)
 */
export const studentAccess = authorize('STUDENT', 'INSTRUCTOR', 'ADMIN');

/**
 * Self or Admin access middleware - user can access their own resources or admin can access any
 */
export const selfOrAdmin = (req: Request, res: Response, next: NextFunction) => {
  const authReq = req as AuthenticatedRequest;
  if (!authReq.user) {
    return next(new CustomError('User not authenticated', 401));
  }

  const userId = req.params.userId || req.params.id;
  const isOwnResource = authReq.user.id === userId;
  const isAdmin = authReq.user.role === 'ADMIN';

  if (!isOwnResource && !isAdmin) {
    logger.warn(`Authorization failed: User ${authReq.user.email} attempted to access resource belonging to user ${userId}`);
    return next(new CustomError('Insufficient permissions', 403));
  }

  next();
};

/**
 * Optional authentication middleware - doesn't fail if no token provided
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // Continue without authentication
    }

    const token = authHeader.split(' ')[1];
    const payload = jwtService.verifyAccessToken(token);

    const authService = new AuthService();
    const user = await authService.findUserById(payload.userId);

    if (user) {
      (req as AuthenticatedRequest).user = user;
    }

    next();
  } catch (error) {
    // Continue without authentication on error
    next();
  }
};
