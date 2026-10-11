import { z } from 'zod';

export const createEntityValidationSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'Entity name is required' })
      .min(2, 'Entity name must be at least 2 characters')
      .max(150, 'Entity name must not exceed 150 characters'),
    entityType: z.enum(['CLIENT', 'AUDITEE'], {
      required_error: 'Entity type is required (CLIENT or AUDITEE)',
    }),
    address: z.string().optional(),
    website: z.string().optional(),
    phone: z.string().optional(),
  }),
});

export const getEntitiesValidationSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    search: z.string().optional(),
    entityType: z.enum(['CLIENT', 'AUDITEE']).optional(),
  }),
});

export const getEntityByIdValidationSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid entity ID format'),
  }),
});

export const updateEntityValidationSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid entity ID format'),
  }),
  body: z.object({
    name: z
      .string()
      .min(2, 'Entity name must be at least 2 characters')
      .max(150, 'Entity name must not exceed 150 characters')
      .optional(),
    entityType: z.enum(['CLIENT', 'AUDITEE']).optional(),
    address: z.string().optional(),
    website: z.string().optional(),
    phone: z.string().optional(),
  }),
});

export const deleteEntityValidationSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid entity ID format'),
  }),
});

export const CRMValidation = {
  createEntityValidationSchema,
  getEntitiesValidationSchema,
  getEntityByIdValidationSchema,
  updateEntityValidationSchema,
  deleteEntityValidationSchema,
};

