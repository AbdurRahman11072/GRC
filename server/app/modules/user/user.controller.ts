import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendResponse } from '../../utils/sendResponse';
import { UserService } from './user.service';

const getUsersByOrg = asyncHandler(async (req: Request, res: Response) => {
  const callerUserId = req.user!.userId;
  const callerIsSuperAdmin = !!req.user!.isSuperAdmin;
  const { orgId } = req.params;

  const result = await UserService.getUsersByOrg(
    callerUserId,
    callerIsSuperAdmin,
    orgId as string,
    req.query as any
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Organization users retrieved successfully',
    pagination: result.pagination,
    data: result.data,
  });
});

const updateMyProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const result = await UserService.updateProfile(userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Profile updated successfully',
    data: result,
  });
});

const adminUpdateUser = asyncHandler(async (req: Request, res: Response) => {
  const callerUserId = req.user!.userId;
  const callerIsSuperAdmin = !!req.user!.isSuperAdmin;
  const { id } = req.params;

  const result = await UserService.adminUpdateUser(
    callerUserId,
    callerIsSuperAdmin,
    id as string,
    req.body
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User information updated successfully',
    data: result,
  });
});

const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const callerIsSuperAdmin = !!req.user!.isSuperAdmin;

  const result = await UserService.getAllUsers(
    callerIsSuperAdmin,
    req.query as any
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'All system users retrieved successfully',
    pagination: result.pagination,
    data: result.data,
  });
});

export const UserController = {
  getUsersByOrg,
  updateMyProfile,
  adminUpdateUser,
  getAllUsers,
};
