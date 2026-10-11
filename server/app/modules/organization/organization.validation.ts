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

export const OrganizationValidation = {
  createOrgValidationSchema,
  updateOrgValidationSchema,
  getOrgByIdValidationSchema,
};
