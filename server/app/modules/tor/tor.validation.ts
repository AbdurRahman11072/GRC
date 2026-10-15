import { z } from 'zod';

export const createTorValidationSchema = z.object({
  body: z.object({
    projectId: z.string().uuid('Invalid project ID format'),
    parentId: z.string().uuid('Invalid parent ToR ID format').optional().nullable(),
    code: z
      .string()
      .min(1, 'ToR code is required')
      .max(50, 'ToR code must not exceed 50 characters'),
    title: z
      .string()
      .min(2, 'ToR title must be at least 2 characters')
      .max(300, 'ToR title must not exceed 300 characters'),
    description: z.string().optional().nullable(),
    objective: z.string().optional().nullable(),
    department: z.string().optional().nullable(),
    sortOrder: z.number().int().optional(),
  }),
});

export const getTorTreeValidationSchema = z.object({
  params: z.object({
    projectId: z.string().uuid('Invalid project ID format'),
  }),
});

export const getTorsValidationSchema = z.object({
  params: z.object({
    projectId: z.string().uuid('Invalid project ID format'),
  }),
  query: z.object({
    parentId: z.string().uuid().optional().or(z.literal('root').optional()),
    search: z.string().optional(),
  }),
});

export const getTorByIdValidationSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid ToR ID format'),
  }),
});

export const updateTorValidationSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid ToR ID format'),
  }),
  body: z.object({
    parentId: z.string().uuid('Invalid parent ToR ID format').optional().nullable(),
    code: z
      .string()
      .min(1, 'ToR code is required')
      .max(50, 'ToR code must not exceed 50 characters')
      .optional(),
    title: z
      .string()
      .min(2, 'ToR title must be at least 2 characters')
      .max(300, 'ToR title must not exceed 300 characters')
      .optional(),
    description: z.string().optional().nullable(),
    objective: z.string().optional().nullable(),
    department: z.string().optional().nullable(),
    sortOrder: z.number().int().optional(),
  }),
});

export const deleteTorValidationSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid ToR ID format'),
  }),
});

export const streamWeightItemSchema = z.object({
  streamBucket: z.enum(['ADMINISTRATOR', 'ORG_MEMBER', 'CLIENT', 'AUDITEE']),
  dataCollectionAllocated: z
    .number()
    .min(0, 'Data collection allocated marks must be >= 0'),
  dataAnalysisAllocated: z
    .number()
    .min(0, 'Data analysis allocated marks must be >= 0'),
  dataAnalysisObtained: z
    .number()
    .min(0, 'Data analysis obtained marks must be >= 0')
    .optional(),
});

export const setStreamWeightsValidationSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid ToR ID format'),
  }),
  body: z
    .object({
      weights: z.array(streamWeightItemSchema).min(1, 'At least one stream weight is required'),
    })
    .or(streamWeightItemSchema),
});

export const getStreamWeightsValidationSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid ToR ID format'),
  }),
});

export const deleteStreamWeightValidationSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid ToR ID format'),
    streamBucket: z.enum(['ADMINISTRATOR', 'ORG_MEMBER', 'CLIENT', 'AUDITEE']),
  }),
});

export const TorValidation = {
  createTorValidationSchema,
  getTorTreeValidationSchema,
  getTorsValidationSchema,
  getTorByIdValidationSchema,
  updateTorValidationSchema,
  deleteTorValidationSchema,
  setStreamWeightsValidationSchema,
  getStreamWeightsValidationSchema,
  deleteStreamWeightValidationSchema,
};

