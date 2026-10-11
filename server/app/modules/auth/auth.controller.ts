import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendResponse } from '../../utils/sendResponse';
import { envConfig } from '../../config/envConfig';
import { AppError } from '../../error/AppError';
import { AuthService } from './auth.service';

const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await AuthService.registerUser(req.body);

  const { tokens, ...userData } = result;

  // Set refresh token in secure, httpOnly cookie
  res.cookie('refreshToken', tokens.refreshToken, {
    secure: envConfig.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'User registered successfully',
    data: {
      ...userData,
      accessToken: tokens.accessToken,
    },
  });
});

const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await AuthService.loginUser(req.body);

  const { tokens, ...userData } = result;

  // Set refresh token in secure, httpOnly cookie
  res.cookie('refreshToken', tokens.refreshToken, {
    secure: envConfig.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User logged in successfully',
    data: {
      ...userData,
      accessToken: tokens.accessToken,
    },
  });
});

const refreshSession = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken || req.body?.refreshToken;

  if (!token) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Refresh token is required');
  }

  const tokens = await AuthService.refreshAuthTokens(token);

  // Rotate refresh token in cookie
  res.cookie('refreshToken', tokens.refreshToken, {
    secure: envConfig.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Token refreshed successfully',
    data: {
      accessToken: tokens.accessToken,
    },
  });
});

const getMe = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const result = await AuthService.getMe(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Current user profile retrieved successfully',
    data: result,
  });
});

export const AuthController = {
  register,
  login,
  refreshSession,
  getMe,
};

