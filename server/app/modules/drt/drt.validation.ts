import { z } from 'zod';

export const createTicketValidationSchema = z.object({
  body: z.object({
    projectId: z.string().uuid('Invalid project ID format'),
    requestCode: z
      .string()
      .min(1, 'Request code is required (e.g. M1001, S2001)')
      .max(50, 'Request code must not exceed 50 characters'),
    assignedTeamBucket: z.enum(['ORG_TEAM_1', 'ORG_TEAM_2', 'CLIENT_TEAM', 'AUDITEE_TEAM']),
    departmentId: z.string().uuid('Invalid department ID format').optional().nullable(),
    description: z
      .string()
      .min(2, 'Description must be at least 2 characters'),
    dateOfRequest: z
      .string()
      .datetime()
      .optional()
      .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()),
    expectedDateOfReceipt: z
      .string()
      .datetime()
      .optional()
      .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()),
    allocatedWeight: z
      .number()
      .min(0, 'Allocated weight must be >= 0')
      .optional(),
    torIds: z.array(z.string().uuid('Invalid ToR ID format')).optional(),
  }),
});

export const getTicketsValidationSchema = z.object({
  params: z.object({
    projectId: z.string().uuid('Invalid project ID format'),
  }),
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    search: z.string().optional(),
    lifecycleStatus: z.enum(['OPEN', 'SUBMITTED', 'REVISION_REQUESTED', 'ACCEPTED']).optional(),
    reviewStatus: z.enum(['PENDING', 'PARTIAL', 'DONE', 'NOT_AVAILABLE', 'NOT_APPLICABLE']).optional(),
    assignedTeamBucket: z.enum(['ORG_TEAM_1', 'ORG_TEAM_2', 'CLIENT_TEAM', 'AUDITEE_TEAM']).optional(),
    departmentId: z.string().uuid().optional(),
    torId: z.string().uuid().optional(),
  }),
});

export const getTicketByIdValidationSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid ticket ID format'),
  }),
});

export const updateTicketValidationSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid ticket ID format'),
  }),
  body: z.object({
    requestCode: z
      .string()
      .min(1, 'Request code is required')
      .max(50, 'Request code must not exceed 50 characters')
      .optional(),
    description: z
      .string()
      .min(2, 'Description must be at least 2 characters')
      .optional(),
    assignedTeamBucket: z
      .enum(['ORG_TEAM_1', 'ORG_TEAM_2', 'CLIENT_TEAM', 'AUDITEE_TEAM'])
      .optional(),
    departmentId: z.string().uuid('Invalid department ID format').optional().nullable(),
    dateOfRequest: z
      .string()
      .datetime()
      .optional()
      .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional())
      .nullable(),
    expectedDateOfReceipt: z
      .string()
      .datetime()
      .optional()
      .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional())
      .nullable(),
    allocatedWeight: z
      .number()
      .min(0, 'Allocated weight must be >= 0')
      .optional(),
  }),
});

export const mapToRsValidationSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid ticket ID format'),
  }),
  body: z.object({
    torIds: z
      .array(z.string().uuid('Invalid ToR ID format'))
      .min(0, 'torIds array is required'),
    action: z.enum(['SET', 'ADD', 'REMOVE']).optional(),
  }),
});

export const deleteTicketValidationSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid ticket ID format'),
  }),
});

export const DRTValidation = {
  createTicketValidationSchema,
  getTicketsValidationSchema,
  getTicketByIdValidationSchema,
  updateTicketValidationSchema,
  mapToRsValidationSchema,
  deleteTicketValidationSchema,
};
