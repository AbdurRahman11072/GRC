import { z } from 'zod';

export const createProjectValidationSchema = z.object({
  body: z.object({
    projectName: z
      .string()
      .min(2, 'Project name must be at least 2 characters')
      .max(200, 'Project name must not exceed 200 characters'),
    projectType: z
      .string()
      .min(2, 'Project type must be at least 2 characters')
      .max(100, 'Project type must not exceed 100 characters'),
    clientId: z.string().uuid('Invalid Client entity ID format'),
    auditeeId: z.string().uuid('Invalid Auditee entity ID format'),
    startDate: z.string().datetime().optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()),
    endDate: z.string().datetime().optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()),
    projectObjective: z.string().optional(),
    projectScope: z.string().optional(),
    status: z.enum(['DRAFT', 'ACTIVE', 'COMPLETED', 'ON_HOLD']).optional(),
  }),
});

export const getProjectsValidationSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    search: z.string().optional(),
    status: z.enum(['DRAFT', 'ACTIVE', 'COMPLETED', 'ON_HOLD']).optional(),
    clientId: z.string().uuid().optional(),
    auditeeId: z.string().uuid().optional(),
  }),
});

export const getProjectByIdValidationSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid project ID format'),
  }),
});

export const updateProjectValidationSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid project ID format'),
  }),
  body: z.object({
    projectName: z
      .string()
      .min(2, 'Project name must be at least 2 characters')
      .max(200, 'Project name must not exceed 200 characters')
      .optional(),
    projectType: z
      .string()
      .min(2, 'Project type must be at least 2 characters')
      .max(100, 'Project type must not exceed 100 characters')
      .optional(),
    clientId: z.string().uuid('Invalid Client entity ID format').optional(),
    auditeeId: z.string().uuid('Invalid Auditee entity ID format').optional(),
    startDate: z.string().datetime().optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()).nullable(),
    endDate: z.string().datetime().optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()).nullable(),
    projectObjective: z.string().optional().nullable(),
    projectScope: z.string().optional().nullable(),
    status: z.enum(['DRAFT', 'ACTIVE', 'COMPLETED', 'ON_HOLD']).optional(),
  }),
});

export const deleteProjectValidationSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid project ID format'),
  }),
});

export const createDepartmentValidationSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid project ID format'),
  }),
  body: z.object({
    name: z
      .string()
      .min(2, 'Department name must be at least 2 characters')
      .max(100, 'Department name must not exceed 100 characters'),
    description: z.string().optional(),
  }),
});

export const batchCreateDepartmentsValidationSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid project ID format'),
  }),
  body: z.object({
    departments: z
      .array(
        z.object({
          name: z
            .string()
            .min(2, 'Department name must be at least 2 characters')
            .max(100, 'Department name must not exceed 100 characters'),
          description: z.string().optional(),
        })
      )
      .min(1, 'At least one department is required'),
  }),
});

export const getDepartmentsValidationSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid project ID format'),
  }),
});

export const updateDepartmentValidationSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid project ID format'),
    deptId: z.string().uuid('Invalid department ID format'),
  }),
  body: z.object({
    name: z
      .string()
      .min(2, 'Department name must be at least 2 characters')
      .max(100, 'Department name must not exceed 100 characters')
      .optional(),
    description: z.string().optional().nullable(),
  }),
});

export const deleteDepartmentValidationSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid project ID format'),
    deptId: z.string().uuid('Invalid department ID format'),
  }),
});

export const addMemberValidationSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid project ID format'),
  }),
  body: z.object({
    userId: z.string().uuid('Invalid user ID format').optional(),
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    email: z.string().email('Invalid email address').optional(),
    password: z.string().min(6, 'Password must be at least 6 characters').optional(),
    designation: z.string().optional(),
    phone: z.string().optional(),
    teamBucket: z.enum(['ADMINISTRATOR', 'ORG_MEMBER', 'CLIENT', 'AUDITEE']),
  }),
});

export const batchAddMembersValidationSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid project ID format'),
  }),
  body: z.object({
    members: z
      .array(
        z.object({
          userId: z.string().uuid('Invalid user ID format'),
          teamBucket: z.enum(['ADMINISTRATOR', 'ORG_MEMBER', 'CLIENT', 'AUDITEE']),
        })
      )
      .min(1, 'At least one member is required'),
  }),
});

export const getMembersValidationSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid project ID format'),
  }),
  query: z.object({
    teamBucket: z.enum(['ADMINISTRATOR', 'ORG_MEMBER', 'CLIENT', 'AUDITEE']).optional(),
  }),
});

export const updateMemberValidationSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid project ID format'),
    memberId: z.string().uuid('Invalid member ID format'),
  }),
  body: z.object({
    teamBucket: z.enum(['ADMINISTRATOR', 'ORG_MEMBER', 'CLIENT', 'AUDITEE']).optional(),
  }),
});

export const deleteMemberValidationSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid project ID format'),
    memberId: z.string().uuid('Invalid member ID format'),
  }),
});

export const ProjectValidation = {
  createProjectValidationSchema,
  getProjectsValidationSchema,
  getProjectByIdValidationSchema,
  updateProjectValidationSchema,
  deleteProjectValidationSchema,
  createDepartmentValidationSchema,
  batchCreateDepartmentsValidationSchema,
  getDepartmentsValidationSchema,
  updateDepartmentValidationSchema,
  deleteDepartmentValidationSchema,
  addMemberValidationSchema,
  batchAddMembersValidationSchema,
  getMembersValidationSchema,
  updateMemberValidationSchema,
  deleteMemberValidationSchema,
};


