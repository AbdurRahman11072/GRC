import { z } from 'zod';

const googleDriveStatusEnum = z.enum(['UPLOADED', 'NOT_UPLOADED', 'NA']).optional();
const submissionStatusEnum = z.enum(['SHARED', 'COLLECTING_DATA', 'PARTIALLY_SHARED', 'NOT_SHARED']).optional();

export const createTicketValidationSchema = z.object({
  body: z.object({
    projectId: z.string().uuid('Invalid project ID format'),
    torId: z.string().uuid('Invalid ToR ID format').optional().nullable(),
    requestCode: z
      .string()
      .min(1, 'Request code is required (e.g. M1001, S2001)')
      .max(50, 'Request code must not exceed 50 characters'),
    title: z.string().max(200, 'Title must not exceed 200 characters').optional().nullable(),
    assignedTeamBucket: z.enum(['ADMINISTRATOR', 'ORG_MEMBER', 'CLIENT', 'AUDITEE']).default('AUDITEE'),
    department: z.string().optional().nullable(),
    description: z
      .string()
      .min(2, 'Description must be at least 2 characters'),
    currentRequirement: z.string().optional().nullable(),
    remarks: z.string().optional().nullable(),
    supervisorId: z.string().uuid('Invalid supervisor ID format').optional().nullable(),
    fieldMemberId: z.string().uuid('Invalid field member ID format').optional().nullable(),
    clientContactId: z.string().uuid('Invalid client contact ID format').optional().nullable(),
    auditeeContactId: z.string().uuid('Invalid auditee contact ID format').optional().nullable(),
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
    collectionAllocated: z.number().min(0, 'Collection allocated marks must be >= 0').optional(),
    analysisAllocated: z.number().min(0, 'Analysis allocated marks must be >= 0').optional(),
    clientGoogleDriveStatus: googleDriveStatusEnum,
    clientStatus: submissionStatusEnum,
    googleDriveStatus: googleDriveStatusEnum,
    auditeeStatus: submissionStatusEnum,
    torIds: z.array(z.string().uuid('Invalid ToR ID format')).optional(),
    periodStatuses: z
      .array(
        z.object({
          periodId: z.string().uuid('Invalid period ID format').optional().nullable(),
          periodLabel: z.string().min(1, 'Period label is required (e.g. 2020)'),
          evidenceStatus: z
            .enum(['IN_PROGRESS', 'PARTIAL', 'COMPLETED', 'SHARED', 'NOT_SHARED', 'NOT_APPLICABLE'])
            .default('IN_PROGRESS'),
          remark: z.string().optional().nullable(),
        })
      )
      .optional(),
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
    assignedTeamBucket: z.enum(['ADMINISTRATOR', 'ORG_MEMBER', 'CLIENT', 'AUDITEE']).optional(),
    department: z.string().optional(),
    torId: z.string().uuid().optional(),
  }),
});

export const getTicketByIdValidationSchema = z.object({
  params: z.object({ id: z.string().uuid('Invalid ticket ID format') }),
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
      .enum(['ADMINISTRATOR', 'ORG_MEMBER', 'CLIENT', 'AUDITEE'])
      .optional(),
    department: z.string().optional().nullable(),
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
    collectionAllocated: z.number().min(0, 'Collection allocated marks must be >= 0').optional(),
    analysisAllocated: z.number().min(0, 'Analysis allocated marks must be >= 0').optional(),
    clientGoogleDriveStatus: googleDriveStatusEnum,
    clientStatus: submissionStatusEnum,
    googleDriveStatus: googleDriveStatusEnum,
    auditeeStatus: submissionStatusEnum,
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
  params: z.object({ id: z.string().uuid('Invalid ticket ID format') }),
});

export const updateLifecycleStatusValidationSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid ticket ID format'),
  }),
  body: z.object({
    lifecycleStatus: z.enum(['OPEN', 'SUBMITTED', 'REVISION_REQUESTED', 'ACCEPTED']),
    actualDateOfReceipt: z
      .string()
      .datetime()
      .optional()
      .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional())
      .nullable(),
  }),
});

export const updateReviewStatusValidationSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid ticket ID format'),
  }),
  body: z.object({
    reviewStatus: z.enum(['PENDING', 'PARTIAL', 'DONE', 'NOT_AVAILABLE', 'NOT_APPLICABLE']),
    actualDateOfReceipt: z
      .string()
      .datetime()
      .optional()
      .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional())
      .nullable(),
  }),
});

export const updatePeriodStatusesValidationSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid ticket ID format'),
  }),
  body: z.object({
    statuses: z
      .array(
        z.object({
          periodId: z.string().uuid('Invalid period ID format').optional().nullable(),
          periodLabel: z.string().min(1, 'Period label is required (e.g. 2020)'),
          evidenceStatus: z.enum(['IN_PROGRESS', 'PARTIAL', 'COMPLETED', 'SHARED', 'NOT_SHARED', 'NOT_APPLICABLE']),
          remark: z.string().optional().nullable(),
        })
      )
      .min(1, 'At least one period status is required'),
  }),
});

export const assignSquadValidationSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid ticket ID format'),
  }),
  body: z.object({
    supervisorId: z.string().uuid('Invalid supervisor ID format').optional().nullable(),
    fieldMemberId: z.string().uuid('Invalid field member ID format').optional().nullable(),
    clientContactId: z.string().uuid('Invalid client contact ID format').optional().nullable(),
    auditeeContactId: z.string().uuid('Invalid auditee contact ID format').optional().nullable(),
    expectedDateOfReceipt: z.string().datetime().optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()).nullable(),
  }),
});

export const uploadDrtDocumentValidationSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid ticket ID format'),
  }),
  body: z.object({
    partySide: z.enum(['CLIENT', 'AUDITEE']),
    fileName: z.string().min(1, 'File name is required'),
    fileUrl: z.string().optional().nullable(),
    fileSize: z.number().optional().nullable(),
    fileType: z.string().optional().nullable(),
    referenceNumber: z.string().optional().nullable(),
    receivedDate: z.string().datetime().optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()).nullable(),
    notes: z.string().optional().nullable(),
    periodLabel: z.string().optional().nullable(),
    periodStatus: z.enum(['IN_PROGRESS', 'PARTIAL', 'COMPLETED', 'SHARED', 'NOT_SHARED', 'NOT_APPLICABLE']).optional().nullable(),
    periodRemark: z.string().optional().nullable(),
  }),
});

export const reviewDrtDocumentValidationSchema = z.object({
  params: z.object({
    docId: z.string().uuid('Invalid document ID format'),
  }),
  body: z.object({
    status: z.enum(['ACCEPTED', 'REVISION_REQUESTED']),
    reviewNotes: z.string().optional().nullable(),
  }),
});

export const DRTValidation = {
  createTicketValidationSchema,
  getTicketsValidationSchema,
  getTicketByIdValidationSchema,
  updateTicketValidationSchema,
  mapToRsValidationSchema,
  deleteTicketValidationSchema,
  updateLifecycleStatusValidationSchema,
  updateReviewStatusValidationSchema,
  updatePeriodStatusesValidationSchema,
  assignSquadValidationSchema,
  uploadDrtDocumentValidationSchema,
  reviewDrtDocumentValidationSchema,
};
