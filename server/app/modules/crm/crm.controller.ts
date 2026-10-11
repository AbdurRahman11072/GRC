import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendResponse } from '../../utils/sendResponse';
import { CRMService } from './crm.service';

const createEntity = asyncHandler(async (req: Request, res: Response) => {
  const orgId = req.orgId!;
  const result = await CRMService.createEntity(orgId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'CRM entity created successfully',
    data: result,
  });
});

const getEntities = asyncHandler(async (req: Request, res: Response) => {
  const orgId = req.orgId!;
  const result = await CRMService.getEntities(orgId, req.query as any);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'CRM entities retrieved successfully',
    pagination: result.pagination,
    data: result.data,
  });
});

const getEntityById = asyncHandler(async (req: Request, res: Response) => {
  const orgId = req.orgId!;
  const id = req.params.id as string;
  const result = await CRMService.getEntityById(orgId, id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'CRM entity retrieved successfully',
    data: result,
  });
});

const updateEntity = asyncHandler(async (req: Request, res: Response) => {
  const orgId = req.orgId!;
  const id = req.params.id as string;
  const result = await CRMService.updateEntity(orgId, id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'CRM entity updated successfully',
    data: result,
  });
});

const deleteEntity = asyncHandler(async (req: Request, res: Response) => {
  const orgId = req.orgId!;
  const id = req.params.id as string;
  const result = await CRMService.deleteEntity(orgId, id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: null,
  });
});

export const CRMController = {
  createEntity,
  getEntities,
  getEntityById,
  updateEntity,
  deleteEntity,
};

