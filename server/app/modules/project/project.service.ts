import httpStatus from 'http-status';
import { prisma } from '../../../lib/prisma';
import { AppError } from '../../error/AppError';
import { ProjectStatus } from '../../../generated/prisma';

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
const getProjects = async (orgId: string, options: IProjectQueryOptions) => {
  const page = Math.max(1, Number(options.page) || 1);
  const limit = Math.max(1, Math.min(100, Number(options.limit) || 20));
  const skip = (page - 1) * limit;

  const whereClause: any = {
    orgId,
    isDeleted: false,
  };

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
        _count: {
          select: {
            members: true,
            departments: true,
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
      departments: {
        select: {
          id: true,
          name: true,
          description: true,
          _count: {
            select: {
              members: true,
              drtTickets: true,
            },
          },
        },
        orderBy: { name: 'asc' },
      },
      members: {
        select: {
          id: true,
          teamBucket: true,
          departmentId: true,
          department: {
            select: {
              id: true,
              name: true,
            },
          },
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
          departments: true,
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

export const ProjectService = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
};
