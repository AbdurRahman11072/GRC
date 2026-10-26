import { z } from 'zod';

export const updateProjectWeightsValidationSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid project ID format'),
  }),
  body: z.object({
    clientWeight: z.number().min(0, 'Client weight must be >= 0').max(100, 'Client weight must be <= 100'),
    auditeeWeight: z.number().min(0, 'Auditee weight must be >= 0').max(100, 'Auditee weight must be <= 100'),
    pmWeight: z.number().min(0, 'PM weight must be >= 0').max(100, 'PM weight must be <= 100'),
  }),
});

export const evaluatePmValidationSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid project ID format'),
  }),
  body: z.object({
    pmObtainedMarks: z.number().min(0, 'PM marks must be >= 0').max(100, 'PM marks cannot exceed allocated'),
    pmEvaluationNotes: z.string().optional(),
  }),
});

export const getProjectScorecardValidationSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid project ID format'),
  }),
});
