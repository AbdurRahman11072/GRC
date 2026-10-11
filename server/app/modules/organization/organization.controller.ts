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

const getOrganizationMembers = asyncHandler(async (req: Request, res: Response) => {
  const orgId = req.params.id as string;
  const result = await OrganizationService.getOrganizationMembers(
    orgId,
    req.query as any
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Organization members retrieved successfully',
    pagination: result.pagination,
    data: result.data,
  });
});

const updateMemberRole = asyncHandler(async (req: Request, res: Response) => {
  const callerUserId = req.user!.userId;
  const callerIsSuperAdmin = !!req.user!.isSuperAdmin;
  const callerOrgRole = req.orgRole!;
  const orgId = req.params.id as string;
  const memberId = req.params.memberId as string;

  const result = await OrganizationService.updateMemberRole(
    callerUserId,
    callerIsSuperAdmin,
    callerOrgRole,
    orgId,
    memberId,
    req.body.orgRole
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Member role updated successfully',
    data: result,
  });
});

const removeMember = asyncHandler(async (req: Request, res: Response) => {
  const callerUserId = req.user!.userId;
  const callerIsSuperAdmin = !!req.user!.isSuperAdmin;
  const callerOrgRole = req.orgRole!;
  const orgId = req.params.id as string;
  const memberId = req.params.memberId as string;

  const result = await OrganizationService.removeMember(
    callerUserId,
    callerIsSuperAdmin,
    callerOrgRole,
    orgId,
    memberId
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: null,
  });
});

export const OrganizationController = {
  createOrganization,
  getMyOrganizations,
  getOrganizationById,
  updateOrganization,
  getOrganizationMembers,
  updateMemberRole,
  removeMember,
};

