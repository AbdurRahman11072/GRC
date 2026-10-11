import { z } from 'zod';

export const updateProfileValidationSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name must not exceed 100 characters')
      .optional(),
    phone: z.string().optional(),
    nid: z.string().optional(),
    designation: z.string().optional(),
  }),
});

export const adminUpdateUserValidationSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid user ID format'),
  }),
  body: z.object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name must not exceed 100 characters')
      .optional(),
    phone: z.string().optional(),
    nid: z.string().optional(),
    designation: z.string().optional(),
    isActive: z.boolean().optional(),
    orgId: z.string().uuid('Invalid organization ID format').optional(),
    orgRole: z.enum(['ADMIN', 'AUDITOR', 'MEMBER']).optional(),
  }),
});

export const getUsersByOrgValidationSchema = z.object({
  params: z.object({
    orgId: z.string().uuid('Invalid organization ID format'),
  }),
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    search: z.string().optional(),
    role: z.enum(['OWNER', 'ADMIN', 'AUDITOR', 'MEMBER']).optional(),
  }),
});

export const getAllUsersValidationSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    search: z.string().optional(),
  }),
});

export const UserValidation = {
  updateProfileValidationSchema,
  adminUpdateUserValidationSchema,
  getUsersByOrgValidationSchema,
  getAllUsersValidationSchema,
};
