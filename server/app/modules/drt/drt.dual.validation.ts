import { z } from 'zod';

const googleDriveStatusEnum = z.enum(['UPLOADED', 'NOT_UPLOADED', 'NA']).optional();
const submissionStatusEnum = z.enum(['SHARED', 'COLLECTING_DATA', 'PARTIALLY_SHARED', 'NOT_SHARED']).optional();

export const createDualTicketsValidationSchema = z.object({
  body: z.object({
    projectId: z.string().uuid('Invalid project ID format'),
    torId: z.string().uuid('Invalid ToR ID format').optional().nullable(),
    requestCode: z
      .string()
      .min(1, 'Base request code is required (e.g. M1001)')
      .max(50, 'Request code must not exceed 50 characters'),
    clientRequestCode: z.string().max(60).optional().nullable(),
    auditeeRequestCode: z.string().max(60).optional().nullable(),
    title: z.string().max(200).optional().nullable(),

    // Client-specific tab inputs
    clientDepartment: z.string().optional().nullable(),
    clientDescription: z.string().min(2, 'Client description must be at least 2 characters'),

    // Auditee-specific tab inputs
    auditeeDepartment: z.string().optional().nullable(),
    auditeeDescription: z.string().min(2, 'Auditee description must be at least 2 characters'),

    // Shared squad & dates
    supervisorId: z.string().uuid().optional().nullable(),
    fieldMemberId: z.string().uuid().optional().nullable(),
    clientContactId: z.string().uuid().optional().nullable(),
    auditeeContactId: z.string().uuid().optional().nullable(),
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

    // Shared marks
    allocatedWeight: z.number().min(0).optional(),
    collectionAllocated: z.number().min(0).optional(),
    analysisAllocated: z.number().min(0).optional(),

    // Statuses & Drive Links
    clientGoogleDriveStatus: googleDriveStatusEnum,
    clientGoogleDriveLink: z.string().optional().nullable(),
    clientStatus: submissionStatusEnum,
    googleDriveStatus: googleDriveStatusEnum,
    googleDriveLink: z.string().optional().nullable(),
    auditeeStatus: submissionStatusEnum,

    // Shared period statuses
    periodStatuses: z
      .array(
        z.object({
          periodId: z.string().uuid().optional().nullable(),
          periodLabel: z.string().min(1),
          evidenceStatus: z
            .enum(['IN_PROGRESS', 'PARTIAL', 'COMPLETED', 'SHARED', 'NOT_SHARED', 'NOT_APPLICABLE'])
            .default('IN_PROGRESS'),
          remark: z.string().optional().nullable(),
        })
      )
      .optional(),
  }),
});
