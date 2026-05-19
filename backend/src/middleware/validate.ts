import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { ApiResponse } from '../types';

export const validate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const response: ApiResponse<null> = {
      success: false,
      error: errors.array()[0].msg,
    };
    res.status(400).json(response);
    return;
  }
  next();
};
