import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { ApiResponse, AuthTokenPayload } from '../types';
import { createError } from '../middleware/errorHandler';

const generateToken = (payload: AuthTokenPayload): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET not defined');
  return jwt.sign(payload, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  } as jwt.SignOptions);
};

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      next(createError('Email already registered', 409));
      return;
    }

    const user = await User.create({ name, email, password, role });

    const tokenPayload: AuthTokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const token = generateToken(tokenPayload);

    const response: ApiResponse<{
      token: string;
      user: { id: string; name: string; email: string; role: string };
    }> = {
      success: true,
      message: 'Registration successful',
      data: {
        token,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      next(createError('Invalid email or password', 401));
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      next(createError('Invalid email or password', 401));
      return;
    }

    const tokenPayload: AuthTokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const token = generateToken(tokenPayload);

    const response: ApiResponse<{
      token: string;
      user: { id: string; name: string; email: string; role: string };
    }> = {
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      next(createError('Not authenticated', 401));
      return;
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      next(createError('User not found', 404));
      return;
    }

    const response: ApiResponse<{
      id: string;
      name: string;
      email: string;
      role: string;
      createdAt: Date;
    }> = {
      success: true,
      data: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
