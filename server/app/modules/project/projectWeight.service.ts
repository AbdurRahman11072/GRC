import httpStatus from 'http-status';
import { prisma } from '../../../lib/prisma';
import { AppError } from '../../error/AppError';
import { getProjectScorecard } from './projectScorecard.service';
import { recalculateTorTreeMarks } from '../tor/torRollup.service';

export interface IUpdateProjectWeightsPayload {
  clientWeight: number;
  auditeeWeight: number;
  pmWeight: number;
}

export interface IEvaluatePmPayload {
  pmObtainedMarks: number;
  pmEvaluationNotes?: string;
}

export const updateProjectWeights = async (
  orgId: string,
  projectId: string,
  payload: IUpdateProjectWeightsPayload
) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project || project.orgId !== orgId) {
    throw new AppError(httpStatus.NOT_FOUND, 'Project not found');
  }

  const clientW = Number(payload.clientWeight) || 0;
  const auditeeW = Number(payload.auditeeWeight) || 0;
  const pmW = Number(payload.pmWeight) || 0;
  const sum = Math.round((clientW + auditeeW + pmW) * 100) / 100;

  if (sum !== 100) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Project weights must sum exactly to 100%. Received: ${sum}% (Client: ${clientW}%, Auditee: ${auditeeW}%, PM: ${pmW}%)`
    );
  }

  const updated = await prisma.project.update({
    where: { id: projectId },
    data: {
      clientWeight: clientW,
      auditeeWeight: auditeeW,
      pmWeight: pmW,
    },
  });

  // Re-trigger scorecard recalculation
  await recalculateTorTreeMarks(projectId);
  return getProjectScorecard(updated.id);
};

export const evaluatePmDiscretionary = async (
  orgId: string,
  projectId: string,
  userId: string,
  payload: IEvaluatePmPayload
) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project || project.orgId !== orgId) {
    throw new AppError(httpStatus.NOT_FOUND, 'Project not found');
  }

  const marks = Number(payload.pmObtainedMarks) || 0;
  if (marks < 0 || marks > project.pmWeight) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `PM marks must be between 0 and maximum allocated ${project.pmWeight} marks. Received: ${marks}`
    );
  }

  await prisma.project.update({
    where: { id: projectId },
    data: {
      pmObtainedMarks: marks,
      pmEvaluationNotes: payload.pmEvaluationNotes ? payload.pmEvaluationNotes.trim() : null,
      pmEvaluatedAt: new Date(),
      pmEvaluatedById: userId,
    },
  });

  return getProjectScorecard(projectId);
};

export const ProjectWeightService = {
  updateProjectWeights,
  evaluatePmDiscretionary,
  getProjectScorecard,
};
