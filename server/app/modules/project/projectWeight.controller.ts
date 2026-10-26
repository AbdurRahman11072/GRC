import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendResponse } from '../../utils/sendResponse';
import { ProjectWeightService } from './projectWeight.service';
import { TorRollupService } from '../tor/torRollup.service';

const updateWeights = asyncHandler(async (req: Request, res: Response) => {
  const orgId = req.orgId!;
  const projectId = req.params.id as string;
  const result = await ProjectWeightService.updateProjectWeights(
    orgId,
    projectId,
    req.body
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Project weights updated successfully',
    data: result,
  });
});

const evaluatePm = asyncHandler(async (req: Request, res: Response) => {
  const orgId = req.orgId!;
  const projectId = req.params.id as string;
  const userId = req.user!.userId;
  const result = await ProjectWeightService.evaluatePmDiscretionary(
    orgId,
    projectId,
    userId,
    req.body
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'PM discretionary score awarded successfully',
    data: result,
  });
});

const getScorecard = asyncHandler(async (req: Request, res: Response) => {
  const projectId = req.params.id as string;
  const result = await ProjectWeightService.getProjectScorecard(projectId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Project audit scorecard retrieved successfully',
    data: result,
  });
});

const recalculateRollup = asyncHandler(async (req: Request, res: Response) => {
  const projectId = req.params.id as string;
  const result = await TorRollupService.recalculateTorTreeMarks(projectId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'ToR and DRT marks recalculated successfully',
    data: result,
  });
});

export const ProjectWeightController = {
  updateWeights,
  evaluatePm,
  getScorecard,
  recalculateRollup,
};
