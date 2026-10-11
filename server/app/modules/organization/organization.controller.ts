import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendResponse } from '../../utils/sendResponse';
import { OrganizationService } from './organization.service';

const createOrganization = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const result = await OrganizationService.createOrganization(userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Organization created successfully',
    data: result,
  });
});

const getMyOrganizations = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const result = await OrganizationService.getMyOrganizations(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Organizations retrieved successfully',
    data: result,
  });
});

const getOrganizationById = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const callerIsSuperAdmin = !!req.user!.isSuperAdmin;
  const id = req.params.id as string;

  const result = await OrganizationService.getOrganizationById(
    userId,
    callerIsSuperAdmin,
    id
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Organization retrieved successfully',
    data: result,
  });
});

const updateOrganization = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const callerIsSuperAdmin = !!req.user!.isSuperAdmin;
  const id = req.params.id as string;

  const result = await OrganizationService.updateOrganization(
    userId,
    callerIsSuperAdmin,
    id,
    req.body
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Organization updated successfully',
    data: result,
  });
});

export const OrganizationController = {
  createOrganization,
  getMyOrganizations,
  getOrganizationById,
  updateOrganization,
};
