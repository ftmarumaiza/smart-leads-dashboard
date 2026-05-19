import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthTokenPayload, ApiResponse, UserRole } from '../types';

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Access denied. No token provided.',
    };
    res.status(401).json(response);
    return;
  }

  const token = authHeader.split(' ')[1];
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Server configuration error.',
    };
    res.status(500).json(response);
    return;
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as AuthTokenPayload;
    req.user = decoded;
    next();
  } catch {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Invalid or expired token.',
    };
    res.status(401).json(response);
  }
};

export const authorize = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Not authenticated.',
      };
      res.status(401).json(response);
      return;
    }

    if (!roles.includes(req.user.role)) {
      const response: ApiResponse<null> = {
        success: false,
        error: `Access denied. Required role: ${roles.join(' or ')}.`,
      };
      res.status(403).json(response);
      return;
    }

    next();
  };
};
