import httpStatus from 'http-status';
import { prisma } from '../../../lib/prisma';
import { AppError } from '../../error/AppError';
import { ProjectStatus, TeamBucket } from '../../../generated/prisma';
import { hashPassword } from '../auth/auth.utils';

export interface ICreateProjectPayload {
  projectName: string;
  projectType: string;
  clientId: string;
  auditeeId: string;
  startDate?: string;
  endDate?: string;
  projectObjective?: string;
  projectScope?: string;
  status?: ProjectStatus;
}

export interface IUpdateProjectPayload {
  projectName?: string;
  projectType?: string;
  clientId?: string;
  auditeeId?: string;
  startDate?: string | null;
  endDate?: string | null;
  projectObjective?: string | null;
  projectScope?: string | null;
  status?: ProjectStatus;
}

export interface IProjectQueryOptions {
  page?: number;
  limit?: number;
  search?: string;
  status?: ProjectStatus;
  clientId?: string;
  auditeeId?: string;
}

/**
 * 1. Create a new audit project workspace
 */
const createProject = async (
  orgId: string,
  createdById: string,
  payload: ICreateProjectPayload
) => {
  // Validate Client entity
  const clientEntity = await prisma.entityCRM.findFirst({
    where: { id: payload.clientId, orgId },
  });

  if (!clientEntity) {
    throw new AppError(httpStatus.NOT_FOUND, 'Client CRM entity not found for this organization');
  }

  if (clientEntity.entityType !== 'CLIENT') {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Selected CRM entity '${clientEntity.name}' is an AUDITEE, not a CLIENT. Only CLIENT entities can be assigned as the Regulator/Client.`
    );
  }

  // Validate Auditee entity
  const auditeeEntity = await prisma.entityCRM.findFirst({
    where: { id: payload.auditeeId, orgId },
  });

  if (!auditeeEntity) {
    throw new AppError(httpStatus.NOT_FOUND, 'Auditee CRM entity not found for this organization');
  }

  if (auditeeEntity.entityType !== 'AUDITEE') {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Selected CRM entity '${auditeeEntity.name}' is a CLIENT, not an AUDITEE. Only AUDITEE entities can be assigned as the Auditee.`
    );
  }

  const project = await prisma.project.create({
    data: {
      orgId,
      projectName: payload.projectName.trim(),
      projectType: payload.projectType.trim(),
      clientId: payload.clientId,
      auditeeId: payload.auditeeId,
      startDate: payload.startDate ? new Date(payload.startDate) : null,
      endDate: payload.endDate ? new Date(payload.endDate) : null,
      projectObjective: payload.projectObjective?.trim() || null,
      projectScope: payload.projectScope?.trim() || null,
      status: payload.status || 'DRAFT',
    },
    include: {
      client: {
        select: {
          id: true,
          name: true,
          entityType: true,
          website: true,
          phone: true,
        },
      },
      auditee: {
        select: {
          id: true,
          name: true,
          entityType: true,
          website: true,
          phone: true,
        },
      },
    },
  });

  return project;
};

/**
 * 2. List projects with pagination, search, and filters
 */
const getProjects = async (
  orgId: string,
  options: IProjectQueryOptions,
  userId?: string,
  orgRole?: string
) => {
  const page = Math.max(1, Number(options.page) || 1);
  const limit = Math.max(1, Math.min(100, Number(options.limit) || 20));
  const skip = (page - 1) * limit;

  const whereClause: any = {
    orgId,
    isDeleted: false,
  };

  // If caller is an organization member (not OWNER or ADMIN), ONLY show projects they are assigned to
  if (userId && orgRole !== 'OWNER' && orgRole !== 'ADMIN') {
    whereClause.members = {
      some: {
        userId,
      },
    };
  }

  if (options.status) {
    whereClause.status = options.status;
  }

  if (options.clientId) {
    whereClause.clientId = options.clientId;
  }

  if (options.auditeeId) {
    whereClause.auditeeId = options.auditeeId;
  }

  if (options.search && options.search.trim()) {
    const search = options.search.trim();
    whereClause.OR = [
      { projectName: { contains: search, mode: 'insensitive' } },
      { projectType: { contains: search, mode: 'insensitive' } },
      { projectObjective: { contains: search, mode: 'insensitive' } },
      { projectScope: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [total, projects] = await Promise.all([
    prisma.project.count({ where: whereClause }),
    prisma.project.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            entityType: true,
            website: true,
          },
        },
        auditee: {
          select: {
            id: true,
            name: true,
            entityType: true,
            website: true,
          },
        },
        members: {
          select: {
            id: true,
            teamBucket: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                designation: true,
              },
            },
          },
        },
        _count: {
          select: {
            members: true,
            tors: true,
            drtTickets: true,
          },
        },
      },
    }),
  ]);

  return {
    pagination: {
      page,
      limit,
      total,
    },
    data: projects,
  };
};

/**
 * 3. Get single project workspace by ID
 */
const getProjectById = async (orgId: string, projectId: string) => {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      orgId,
      isDeleted: false,
    },
    include: {
      client: true,
      auditee: true,
      members: {
        select: {
          id: true,
          teamBucket: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              designation: true,
              phone: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      },
      _count: {
        select: {
          members: true,
          tors: true,
          drtTickets: true,
          assessmentPeriods: true,
          milestones: true,
          snapshots: true,
        },
      },
    },
  });

  if (!project) {
    throw new AppError(httpStatus.NOT_FOUND, 'Project not found');
  }

  return project;
};

/**
 * 4. Update project details
 */
const updateProject = async (
  orgId: string,
  projectId: string,
  payload: IUpdateProjectPayload
) => {
  const existingProject = await prisma.project.findFirst({
    where: { id: projectId, orgId, isDeleted: false },
  });

  if (!existingProject) {
    throw new AppError(httpStatus.NOT_FOUND, 'Project not found');
  }

  // Validate Client entity if updated
  if (payload.clientId && payload.clientId !== existingProject.clientId) {
    const clientEntity = await prisma.entityCRM.findFirst({
      where: { id: payload.clientId, orgId },
    });

    if (!clientEntity) {
      throw new AppError(httpStatus.NOT_FOUND, 'Updated Client CRM entity not found');
    }

    if (clientEntity.entityType !== 'CLIENT') {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `Selected CRM entity '${clientEntity.name}' is an AUDITEE, not a CLIENT.`
      );
    }
  }

  // Validate Auditee entity if updated
  if (payload.auditeeId && payload.auditeeId !== existingProject.auditeeId) {
    const auditeeEntity = await prisma.entityCRM.findFirst({
      where: { id: payload.auditeeId, orgId },
    });

    if (!auditeeEntity) {
      throw new AppError(httpStatus.NOT_FOUND, 'Updated Auditee CRM entity not found');
    }

    if (auditeeEntity.entityType !== 'AUDITEE') {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `Selected CRM entity '${auditeeEntity.name}' is a CLIENT, not an AUDITEE.`
      );
    }
  }

  const updatedProject = await prisma.project.update({
    where: { id: projectId },
    data: {
      ...(payload.projectName !== undefined ? { projectName: payload.projectName.trim() } : {}),
      ...(payload.projectType !== undefined ? { projectType: payload.projectType.trim() } : {}),
      ...(payload.clientId !== undefined ? { clientId: payload.clientId } : {}),
      ...(payload.auditeeId !== undefined ? { auditeeId: payload.auditeeId } : {}),
      ...(payload.startDate !== undefined
        ? { startDate: payload.startDate ? new Date(payload.startDate) : null }
        : {}),
      ...(payload.endDate !== undefined
        ? { endDate: payload.endDate ? new Date(payload.endDate) : null }
        : {}),
      ...(payload.projectObjective !== undefined
        ? { projectObjective: payload.projectObjective ? payload.projectObjective.trim() : null }
        : {}),
      ...(payload.projectScope !== undefined
        ? { projectScope: payload.projectScope ? payload.projectScope.trim() : null }
        : {}),
      ...(payload.status !== undefined ? { status: payload.status } : {}),
    },
    include: {
      client: {
        select: {
          id: true,
          name: true,
          entityType: true,
          website: true,
        },
      },
      auditee: {
        select: {
          id: true,
          name: true,
          entityType: true,
          website: true,
        },
      },
    },
  });

  return updatedProject;
};

/**
 * 5. Soft delete project
 */
const deleteProject = async (orgId: string, projectId: string) => {
  const existingProject = await prisma.project.findFirst({
    where: { id: projectId, orgId, isDeleted: false },
  });

  if (!existingProject) {
    throw new AppError(httpStatus.NOT_FOUND, 'Project not found');
  }

  await prisma.project.update({
    where: { id: projectId },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
    },
  });

  return {
    success: true,
    message: 'Project archived and soft-deleted successfully',
  };
};

/**
 * 6. Create a department in a project
 */
const createDepartment = async (..._args: any[]) => ({ id: '', name: '' });
const batchCreateDepartments = async (..._args: any[]) => ({
  createdCount: 0,
  skippedCount: 0,
  skippedNames: [],
  departments: [],
});
const getDepartments = async (..._args: any[]) => [];
const updateDepartment = async (..._args: any[]) => ({ id: '', name: '' });
const deleteDepartment = async (..._args: any[]) => ({
  success: true,
  message: 'Departments are now managed as fields on ToR nodes',
});

/**
 * 11. Add a single member to a project with a 4-team bucket
 */
export interface IAddMemberPayload {
  userId?: string;
  name?: string;
  email?: string;
  password?: string;
  designation?: string;
  phone?: string;
  teamBucket: TeamBucket;
}

const addMember = async (
  orgId: string,
  projectId: string,
  payload: IAddMemberPayload
) => {
  const existingProject = await prisma.project.findFirst({
    where: { id: projectId, orgId, isDeleted: false },
  });

  if (!existingProject) {
    throw new AppError(httpStatus.NOT_FOUND, 'Project not found');
  }

  let targetUser: any = null;

  // Option A: Assigning an existing user by ID
  if (payload.userId) {
    targetUser = await prisma.user.findUnique({
      where: { id: payload.userId },
    });
    if (!targetUser) {
      throw new AppError(httpStatus.NOT_FOUND, 'User not found');
    }
  }
  // Option B: Provisioning a user on the fly with name, email, and password
  else if (payload.email && payload.name) {
    const normalizedEmail = payload.email.toLowerCase().trim();
    targetUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!targetUser) {
      const plainPassword = payload.password?.trim() || 'Welcome@2026';
      const passwordHash = await hashPassword(plainPassword);

      targetUser = await prisma.user.create({
        data: {
          name: payload.name.trim(),
          email: normalizedEmail,
          passwordHash,
          designation: payload.designation?.trim() || null,
          phone: payload.phone?.trim() || null,
        },
      });
    }

    // Ensure member has organization membership for tenant scope
    await prisma.organizationMember.upsert({
      where: { orgId_userId: { orgId, userId: targetUser.id } },
      create: {
        orgId,
        userId: targetUser.id,
        orgRole: 'AUDITOR',
      },
      update: {},
    });
  } else {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Either an existing userId or user details (name, email, password) must be provided'
    );
  }

  // Check unique membership per project
  const existingMember = await prisma.projectMember.findFirst({
    where: { projectId, userId: targetUser.id },
  });

  if (existingMember) {
    throw new AppError(
      httpStatus.CONFLICT,
      `User '${targetUser.name}' is already assigned to this project in ${existingMember.teamBucket}.`
    );
  }

  const member = await prisma.projectMember.create({
    data: {
      projectId,
      userId: targetUser.id,
      teamBucket: payload.teamBucket,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          designation: true,
          phone: true,
        },
      },
    },
  });

  return {
    ...member,
    provisionedPassword: payload.password?.trim() || (!payload.userId ? 'Welcome@2026' : undefined),
  };
};

/**
 * 12. Batch assign members to 4-team collaborative buckets
 */
const batchAddMembers = async (
  orgId: string,
  projectId: string,
  members: Array<{ userId: string; teamBucket: TeamBucket }>
) => {
  const existingProject = await prisma.project.findFirst({
    where: { id: projectId, orgId, isDeleted: false },
  });

  if (!existingProject) {
    throw new AppError(httpStatus.NOT_FOUND, 'Project not found');
  }

  const results: any[] = [];

  for (const item of members) {
    const user = await prisma.user.findUnique({
      where: { id: item.userId },
      select: { id: true, name: true, email: true },
    });

    if (!user) {
      continue;
    }

    // Upsert project member
    const member = await prisma.projectMember.upsert({
      where: {
        projectId_userId: {
          projectId,
          userId: item.userId,
        },
      },
      update: {
        teamBucket: item.teamBucket,
      },
      create: {
        projectId,
        userId: item.userId,
        teamBucket: item.teamBucket,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            designation: true,
            phone: true,
          },
        },
      },
    });

    results.push(member);
  }

  return {
    assignedCount: results.length,
    members: results,
  };
};

/**
 * 13. List members in a project with team bucket filter
 */
const getMembers = async (
  orgId: string,
  projectId: string,
  options: { teamBucket?: TeamBucket }
) => {
  const existingProject = await prisma.project.findFirst({
    where: { id: projectId, orgId, isDeleted: false },
  });

  if (!existingProject) {
    throw new AppError(httpStatus.NOT_FOUND, 'Project not found');
  }

  const whereClause: any = {
    projectId,
  };

  if (options.teamBucket) {
    whereClause.teamBucket = options.teamBucket;
  }

  const members = await prisma.projectMember.findMany({
    where: whereClause,
    orderBy: { createdAt: 'asc' },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          designation: true,
          phone: true,
        },
      },
    },
  });

  return members;
};

/**
 * 14. Update project member (team bucket role assignment)
 */
const updateMember = async (
  orgId: string,
  projectId: string,
  memberId: string,
  payload: { teamBucket?: TeamBucket }
) => {
  const existingProject = await prisma.project.findFirst({
    where: { id: projectId, orgId, isDeleted: false },
  });

  if (!existingProject) {
    throw new AppError(httpStatus.NOT_FOUND, 'Project not found');
  }

  const existingMember = await prisma.projectMember.findFirst({
    where: { id: memberId, projectId },
  });

  if (!existingMember) {
    throw new AppError(httpStatus.NOT_FOUND, 'Member not found in this project');
  }

  const updated = await prisma.projectMember.update({
    where: { id: memberId },
    data: {
      ...(payload.teamBucket !== undefined ? { teamBucket: payload.teamBucket } : {}),
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          designation: true,
          phone: true,
        },
      },
    },
  });

  return updated;
};

/**
 * 15. Remove a member from a project
 */
const deleteMember = async (orgId: string, projectId: string, memberId: string) => {
  const existingProject = await prisma.project.findFirst({
    where: { id: projectId, orgId, isDeleted: false },
  });

  if (!existingProject) {
    throw new AppError(httpStatus.NOT_FOUND, 'Project not found');
  }

  const existingMember = await prisma.projectMember.findFirst({
    where: { id: memberId, projectId },
    include: {
      user: { select: { name: true } },
    },
  });

  if (!existingMember) {
    throw new AppError(httpStatus.NOT_FOUND, 'Member not found in this project');
  }

  await prisma.projectMember.delete({
    where: { id: memberId },
  });

  return {
    success: true,
    message: `Member '${existingMember.user.name}' removed from project successfully`,
  };
};

export const ProjectService = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  createDepartment,
  batchCreateDepartments,
  getDepartments,
  updateDepartment,
  deleteDepartment,
  addMember,
  batchAddMembers,
  getMembers,
  updateMember,
  deleteMember,
};
