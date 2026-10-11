import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendResponse } from '../../utils/sendResponse';
import { TorService } from './tor.service';

const createTor = asyncHandler(async (req: Request, res: Response) => {
  const orgId = req.orgId!;
  const createdById = req.user!.userId;
  const result = await TorService.createTor(orgId, createdById, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'ToR node created successfully',
    data: result,
  });
});

const getTorTree = asyncHandler(async (req: Request, res: Response) => {
  const orgId = req.orgId!;
  const projectId = req.params.projectId as string;
  const result = await TorService.getTorTree(orgId, projectId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'ToR hierarchical WBS tree retrieved successfully',
    data: result,
  });
});

const getTors = asyncHandler(async (req: Request, res: Response) => {
  const orgId = req.orgId!;
  const projectId = req.params.projectId as string;
  const result = await TorService.getTors(orgId, projectId, req.query as any);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'ToR nodes retrieved successfully',
    data: result,
  });
});

const getTorById = asyncHandler(async (req: Request, res: Response) => {
  const orgId = req.orgId!;
  const id = req.params.id as string;
  const result = await TorService.getTorById(orgId, id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'ToR node retrieved successfully',
    data: result,
  });
});

const updateTor = asyncHandler(async (req: Request, res: Response) => {
  const orgId = req.orgId!;
  const id = req.params.id as string;
  const result = await TorService.updateTor(orgId, id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'ToR node updated successfully',
    data: result,
  });
});

const deleteTor = asyncHandler(async (req: Request, res: Response) => {
  const orgId = req.orgId!;
  const id = req.params.id as string;
  const result = await TorService.deleteTor(orgId, id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: result.cascadeDetails,
  });
});

const setTorStreamWeights = asyncHandler(async (req: Request, res: Response) => {
  const orgId = req.orgId!;
  const id = req.params.id as string;
  const result = await TorService.setTorStreamWeights(orgId, id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'ToR stream weights configured successfully',
    data: result,
  });
});

const getTorStreamWeights = asyncHandler(async (req: Request, res: Response) => {
  const orgId = req.orgId!;
  const id = req.params.id as string;
  const result = await TorService.getTorStreamWeights(orgId, id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'ToR stream weights retrieved successfully',
    data: result,
  });
});

const deleteTorStreamWeight = asyncHandler(async (req: Request, res: Response) => {
  const orgId = req.orgId!;
  const id = req.params.id as string;
  const streamBucket = req.params.streamBucket as any;
  const result = await TorService.deleteTorStreamWeight(orgId, id, streamBucket);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: null,
  });
});

export const TorController = {
  createTor,
  getTorTree,
  getTors,
  getTorById,
  updateTor,
  deleteTor,
  setTorStreamWeights,
  getTorStreamWeights,
  deleteTorStreamWeight,
};

