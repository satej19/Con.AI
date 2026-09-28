import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { ApiResponse } from '../utils/ApiResponse';
import { ZodError } from 'zod';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('Error:', err);

  if (err instanceof AppError) {
    ApiResponse.error(res, err.statusCode, err.message);
    return;
  }

  if (err instanceof ZodError) {
    const errors = err.issues.map((e: any) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    ApiResponse.error(res, 400, 'Validation failed', errors);
    return;
  }

  if (err.name === 'ValidationError') {
    const errors = [
      {
        field: 'validation',
        message: err.message,
      },
    ];
    ApiResponse.error(res, 400, 'Validation error', errors);
    return;
  }

  if (err.name === 'CastError') {
    ApiResponse.error(res, 400, 'Invalid ID format');
    return;
  }

  const mongoError = err as any;
  if (mongoError.code === 11000) {
    const field = Object.keys(mongoError.keyPattern || {})[0] || 'field';
    ApiResponse.error(res, 409, `${field} already exists`);
    return;
  }

  ApiResponse.error(res, 500, 'Internal server error');
};
