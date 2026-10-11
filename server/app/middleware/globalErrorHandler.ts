import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';

export const globalErrorHandler = (
  error: any,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const isDev = process.env.NODE_ENV === 'development';
  let statusCode = error.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
  let message = error.message || 'Internal Server Error';

  // Prisma Unique Constraint violation
  if (error.code === 'P2002') {
    statusCode = httpStatus.CONFLICT;
    const target = error.meta?.target;
    if (Array.isArray(target) && target.length > 0) {
      message = `A record with this ${target.join(', ')} already exists.`;
    } else {
      message = 'A record with this unique value already exists.';
    }
  }

  // Prisma Record Not Found
  if (error.code === 'P2025') {
    statusCode = httpStatus.NOT_FOUND;
    message = 'Requested record was not found.';
  }

  // Zod Validation Error handling
  if (error.name === 'ZodError') {
    statusCode = httpStatus.BAD_REQUEST;
    message = error.errors?.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ') || 'Validation error';
  }

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    ...(isDev && {
      stackTrace: error.stack,
    }),
  });
};

export default globalErrorHandler;
