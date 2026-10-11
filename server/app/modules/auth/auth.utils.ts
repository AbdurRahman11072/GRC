import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import httpStatus from 'http-status';
import { envConfig } from '../../config/envConfig';
import { AppError } from '../../error/AppError';
import type { IJwtPayload, IAuthTokens } from './auth.interface';

/**
 * Hash a plain text password using Argon2id
 */
export const hashPassword = async (password: string): Promise<string> => {
  return argon2.hash(password, {
    type: argon2.argon2id,
  });
};

/**
 * Verify a plain text password against an Argon2 hash
 */
export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  try {
    return await argon2.verify(hash, password);
  } catch {
    return false;
  }
};

/**
 * Generate Access Token & Refresh Token pair
 */
export const generateAuthTokens = (payload: IJwtPayload): IAuthTokens => {
  const accessToken = jwt.sign(
    payload,
    envConfig.JWT.ACCESS_SECRET,
    { expiresIn: envConfig.JWT.ACCESS_EXPIRES_IN as any }
  );

  const refreshToken = jwt.sign(
    payload,
    envConfig.JWT.REFRESH_SECRET,
    { expiresIn: envConfig.JWT.REFRESH_EXPIRES_IN as any }
  );

  return { accessToken, refreshToken };
};

/**
 * Verify Access Token
 */
export const verifyAccessToken = (token: string): IJwtPayload => {
  try {
    return jwt.verify(token, envConfig.JWT.ACCESS_SECRET) as IJwtPayload;
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      throw new AppError(httpStatus.UNAUTHORIZED, 'Access token has expired');
    }
    throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid access token');
  }
};

/**
 * Verify Refresh Token
 */
export const verifyRefreshToken = (token: string): IJwtPayload => {
  try {
    return jwt.verify(token, envConfig.JWT.REFRESH_SECRET) as IJwtPayload;
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      throw new AppError(httpStatus.UNAUTHORIZED, 'Refresh token has expired');
    }
    throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid refresh token');
  }
};
