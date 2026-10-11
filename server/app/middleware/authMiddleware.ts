import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import { prisma } from '../../lib/prisma';
import { AppError } from '../error/AppError';
import { verifyAccessToken } from '../modules/auth/auth.utils';

export const authMiddleware = () => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new AppError(
          httpStatus.UNAUTHORIZED,
          'You are not authorized. Access token is missing or malformed'
        );
      }

      const token = authHeader.split(' ')[1];
      if (!token) {
        throw new AppError(httpStatus.UNAUTHORIZED, 'Access token is missing');
      }

      // Verify JWT signature and expiration
      const decoded = verifyAccessToken(token);

      // Verify user exists and is active in database
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, email: true, isActive: true, isSuperAdmin: true },
      });

      if (!user) {
        throw new AppError(httpStatus.UNAUTHORIZED, 'User no longer exists');
      }

      if (!user.isActive) {
        throw new AppError(
          httpStatus.FORBIDDEN,
          'Your account has been deactivated. Please contact your administrator'
        );
      }

      req.user = {
        userId: user.id,
        email: user.email,
        isSuperAdmin: user.isSuperAdmin,
      };

      next();
    } catch (error) {
      next(error);
    }
  };
};

export default authMiddleware;
