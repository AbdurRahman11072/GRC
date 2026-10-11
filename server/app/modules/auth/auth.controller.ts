import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendResponse } from '../../utils/sendResponse';
import { envConfig } from '../../config/envConfig';
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

export const AuthController = {
  register,
  login,
};

