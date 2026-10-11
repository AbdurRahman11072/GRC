import { z } from 'zod';

export const createOrgValidationSchema = z.object({
  body: z.object({
    orgName: z
      .string({ required_error: 'Organization name is required' })
      .min(2, 'Organization name must be at least 2 characters')
      .max(150, 'Organization name must not exceed 150 characters'),
    orgType: z.string({ required_error: 'Organization type is required' }).default('AUDIT_FIRM'),
    orgAddress: z.string().optional(),
    orgPhone: z.string().optional(),
    orgEmail: z.string().email('Invalid organization email address').optional(),
    orgWebsite: z.string().optional(),
    orgLinkedIn: z.string().optional(),
    numberOfEmployee: z.number().int().positive().optional(),
  }),
});

export const updateOrgValidationSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid organization ID format'),
  }),
  body: z.object({
    orgName: z
      .string()
      .min(2, 'Organization name must be at least 2 characters')
      .max(150, 'Organization name must not exceed 150 characters')
      .optional(),
    orgType: z.string().optional(),
    orgAddress: z.string().optional(),
    orgPhone: z.string().optional(),
    orgEmail: z.string().email('Invalid organization email address').optional(),
    orgWebsite: z.string().optional(),
    orgLinkedIn: z.string().optional(),
    numberOfEmployee: z.number().int().positive().optional(),
  }),
});

export const getOrgByIdValidationSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid organization ID format'),
  }),
});

export const getMembersValidationSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid organization ID format'),
  }),
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    search: z.string().optional(),
    role: z.enum(['OWNER', 'ADMIN', 'AUDITOR', 'MEMBER']).optional(),
  }),
});

export const updateMemberRoleValidationSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid organization ID format'),
    memberId: z.string().uuid('Invalid member ID format'),
  }),
  body: z.object({
    orgRole: z.enum(['OWNER', 'ADMIN', 'AUDITOR', 'MEMBER'], {
      required_error: 'orgRole is required',
    }),
  }),
});

export const removeMemberValidationSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid organization ID format'),
    memberId: z.string().uuid('Invalid member ID format'),
  }),
});

export const OrganizationValidation = {
  createOrgValidationSchema,
  updateOrgValidationSchema,
  getOrgByIdValidationSchema,
  getMembersValidationSchema,
  updateMemberRoleValidationSchema,
  removeMemberValidationSchema,
};

