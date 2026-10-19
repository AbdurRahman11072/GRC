import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendResponse } from '../../utils/sendResponse';
import { DRTService } from './drt.service';

const createTicket = asyncHandler(async (req: Request, res: Response) => {
  const orgId = req.orgId!;
  const result = await DRTService.createTicket(orgId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'DRT ticket created successfully',
    data: result,
  });
});

const getTickets = asyncHandler(async (req: Request, res: Response) => {
  const orgId = req.orgId!;
  const projectId = req.params.projectId as string;
  const result = await DRTService.getTickets(orgId, projectId, req.query as any);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'DRT tickets retrieved successfully',
    pagination: result.pagination,
    data: result.data,
  });
});

const getTicketById = asyncHandler(async (req: Request, res: Response) => {
  const orgId = req.orgId!;
  const id = req.params.id as string;
  const result = await DRTService.getTicketById(orgId, id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'DRT ticket retrieved successfully',
    data: result,
  });
});

const updateTicket = asyncHandler(async (req: Request, res: Response) => {
  const orgId = req.orgId!;
  const id = req.params.id as string;
  const result = await DRTService.updateTicket(orgId, id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'DRT ticket updated successfully',
    data: result,
  });
});

const mapToRs = asyncHandler(async (req: Request, res: Response) => {
  const orgId = req.orgId!;
  const id = req.params.id as string;
  const result = await DRTService.mapToRs(orgId, id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'ToR mappings updated successfully for DRT ticket',
    data: result,
  });
});

const deleteTicket = asyncHandler(async (req: Request, res: Response) => {
  const orgId = req.orgId!;
  const id = req.params.id as string;
  const result = await DRTService.deleteTicket(orgId, id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: null,
  });
});

const updateLifecycleStatus = asyncHandler(async (req: Request, res: Response) => {
  const orgId = req.orgId!;
  const id = req.params.id as string;
  const result = await DRTService.updateLifecycleStatus(orgId, id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'DRT ticket lifecycle status updated successfully',
    data: result,
  });
});

const updateReviewStatus = asyncHandler(async (req: Request, res: Response) => {
  const orgId = req.orgId!;
  const id = req.params.id as string;
  const result = await DRTService.updateReviewStatus(orgId, id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'DRT ticket auditor review outcome updated successfully',
    data: result,
  });
});

const updatePeriodStatuses = asyncHandler(async (req: Request, res: Response) => {
  const orgId = req.orgId!;
  const id = req.params.id as string;
  const result = await DRTService.updatePeriodStatuses(orgId, id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'DRT ticket multi-year period statuses updated successfully',
    data: result,
  });
});

const assignSquad = asyncHandler(async (req: Request, res: Response) => {
  const orgId = req.orgId!;
  const id = req.params.id as string;
  const result = await DRTService.assignSquad(orgId, id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'DRT 4-party squad assigned successfully',
    data: result,
  });
});

const uploadDrtDocument = asyncHandler(async (req: Request, res: Response) => {
  const orgId = req.orgId!;
  const id = req.params.id as string;
  const user = { id: req.user!.userId };
  const result = await DRTService.uploadDrtDocument(orgId, id, req.body, user);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'DRT evidence document uploaded successfully',
    data: result,
  });
});

const reviewDrtDocument = asyncHandler(async (req: Request, res: Response) => {
  const orgId = req.orgId!;
  const docId = req.params.docId as string;
  const user = { id: req.user!.userId };
  const result = await DRTService.reviewDrtDocument(orgId, docId, req.body, user);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'DRT document review status updated successfully',
    data: result,
  });
});

export const DRTController = {
  createTicket,
  getTickets,
  getTicketById,
  updateTicket,
  mapToRs,
  deleteTicket,
  updateLifecycleStatus,
  updateReviewStatus,
  updatePeriodStatuses,
  assignSquad,
  uploadDrtDocument,
  reviewDrtDocument,
};


