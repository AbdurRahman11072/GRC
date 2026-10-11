import { z } from 'zod';

export const registerValidationSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'Name is required' })
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name must not exceed 100 characters'),
    email: z
      .string({ required_error: 'Email is required' })
      .email('Invalid email address'),
    password: z
      .string({ required_error: 'Password is required' })
      .min(8, 'Password must be at least 8 characters')
      .max(100, 'Password must not exceed 100 characters'),
    phone: z.string().optional(),
    nid: z.string().optional(),
    designation: z.string().optional(),
    organization: z
      .object({
        orgName: z
          .string({ required_error: 'Organization name is required' })
          .min(2, 'Organization name must be at least 2 characters'),
        orgType: z.string().default('AUDIT_FIRM'),
        orgAddress: z.string().optional(),
        orgPhone: z.string().optional(),
        orgEmail: z.string().email('Invalid organization email').optional(),
        orgWebsite: z.string().optional(),
        numberOfEmployee: z.number().int().positive().optional(),
      })
      .optional(),
  }),
});

export const loginValidationSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'Email is required' })
      .email('Invalid email address'),
    password: z
      .string({ required_error: 'Password is required' })
      .min(1, 'Password is required'),
  }),
});

export const createUserValidationSchema = z.object({
  body: z.object({
    orgId: z
      .string({ required_error: 'Organization ID is required' })
      .uuid('Invalid organization ID format'),
    name: z
      .string({ required_error: 'Name is required' })
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name must not exceed 100 characters'),
    email: z
      .string({ required_error: 'Email is required' })
      .email('Invalid email address'),
    password: z
      .string({ required_error: 'Temporary password is required' })
      .min(8, 'Temporary password must be at least 8 characters')
      .max(100, 'Temporary password must not exceed 100 characters'),
    orgRole: z.enum(['ADMIN', 'AUDITOR', 'MEMBER']).default('AUDITOR'),
    phone: z.string().optional(),
    nid: z.string().optional(),
    designation: z.string().optional(),
  }),
});

export const AuthValidation = {
  registerValidationSchema,
  loginValidationSchema,
  createUserValidationSchema,
};

