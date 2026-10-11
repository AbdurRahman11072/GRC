import httpStatus from 'http-status';
import { prisma } from '../../../lib/prisma';
import { AppError } from '../../error/AppError';
import { ProjectStatus, TeamBucket } from '../../../generated/prisma';

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

/**
 * 6. Create a department in a project
 */
const createDepartment = async (
  orgId: string,
  projectId: string,
  payload: { name: string; description?: string }
) => {
  const existingProject = await prisma.project.findFirst({
    where: { id: projectId, orgId, isDeleted: false },
  });

  if (!existingProject) {
    throw new AppError(httpStatus.NOT_FOUND, 'Project not found');
  }

  const name = payload.name.trim();

  // Check unique department name per project
  const duplicate = await prisma.projectDepartment.findFirst({
    where: { projectId, name: { equals: name, mode: 'insensitive' } },
  });

  if (duplicate) {
    throw new AppError(
      httpStatus.CONFLICT,
      `A department named '${name}' already exists in this project`
    );
  }

  const department = await prisma.projectDepartment.create({
    data: {
      projectId,
      name,
      description: payload.description?.trim() || null,
    },
    include: {
      _count: {
        select: {
          members: true,
          drtTickets: true,
        },
      },
    },
  });

  return department;
};

/**
 * 7. Batch create departments in a project
 */
const batchCreateDepartments = async (
  orgId: string,
  projectId: string,
  departments: Array<{ name: string; description?: string }>
) => {
  const existingProject = await prisma.project.findFirst({
    where: { id: projectId, orgId, isDeleted: false },
  });

  if (!existingProject) {
    throw new AppError(httpStatus.NOT_FOUND, 'Project not found');
  }

  const existingDepts = await prisma.projectDepartment.findMany({
    where: { projectId },
    select: { name: true },
  });
  const existingNames = new Set(existingDepts.map((d) => d.name.toLowerCase()));

  const createdDepartments: any[] = [];
  const skippedNames: string[] = [];

  for (const item of departments) {
    const trimmedName = item.name.trim();
    if (existingNames.has(trimmedName.toLowerCase())) {
      skippedNames.push(trimmedName);
      continue;
    }

    const created = await prisma.projectDepartment.create({
      data: {
        projectId,
        name: trimmedName,
        description: item.description?.trim() || null,
      },
      include: {
        _count: {
          select: {
            members: true,
            drtTickets: true,
          },
        },
      },
    });

    existingNames.add(trimmedName.toLowerCase());
    createdDepartments.push(created);
  }

  return {
    createdCount: createdDepartments.length,
    skippedCount: skippedNames.length,
    skippedNames,
    departments: createdDepartments,
  };
};

/**
 * 8. List all departments in a project
 */
const getDepartments = async (orgId: string, projectId: string) => {
  const existingProject = await prisma.project.findFirst({
    where: { id: projectId, orgId, isDeleted: false },
  });

  if (!existingProject) {
    throw new AppError(httpStatus.NOT_FOUND, 'Project not found');
  }

  const departments = await prisma.projectDepartment.findMany({
    where: { projectId },
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: {
          members: true,
          drtTickets: true,
        },
      },
    },
  });

  return departments;
};

/**
 * 9. Update department details
 */
const updateDepartment = async (
  orgId: string,
  projectId: string,
  deptId: string,
  payload: { name?: string; description?: string | null }
) => {
  const existingProject = await prisma.project.findFirst({
    where: { id: projectId, orgId, isDeleted: false },
  });

  if (!existingProject) {
    throw new AppError(httpStatus.NOT_FOUND, 'Project not found');
  }

  const existingDept = await prisma.projectDepartment.findFirst({
    where: { id: deptId, projectId },
  });

  if (!existingDept) {
    throw new AppError(httpStatus.NOT_FOUND, 'Department not found in this project');
  }

  if (payload.name && payload.name.trim().toLowerCase() !== existingDept.name.toLowerCase()) {
    const duplicate = await prisma.projectDepartment.findFirst({
      where: {
        projectId,
        name: { equals: payload.name.trim(), mode: 'insensitive' },
        NOT: { id: deptId },
      },
    });

    if (duplicate) {
      throw new AppError(
        httpStatus.CONFLICT,
        `A department named '${payload.name.trim()}' already exists in this project`
      );
    }
  }

  const updated = await prisma.projectDepartment.update({
    where: { id: deptId },
    data: {
      ...(payload.name !== undefined ? { name: payload.name.trim() } : {}),
      ...(payload.description !== undefined
        ? { description: payload.description ? payload.description.trim() : null }
        : {}),
    },
    include: {
      _count: {
        select: {
          members: true,
          drtTickets: true,
        },
      },
    },
  });

  return updated;
};

/**
 * 10. Delete a department (with safety guard on assigned DRT tickets)
 */
const deleteDepartment = async (orgId: string, projectId: string, deptId: string) => {
  const existingProject = await prisma.project.findFirst({
    where: { id: projectId, orgId, isDeleted: false },
  });

  if (!existingProject) {
    throw new AppError(httpStatus.NOT_FOUND, 'Project not found');
  }

  const existingDept = await prisma.projectDepartment.findFirst({
    where: { id: deptId, projectId },
    include: {
      drtTickets: { select: { id: true, requestCode: true } },
      members: { select: { id: true } },
    },
  });

  if (!existingDept) {
    throw new AppError(httpStatus.NOT_FOUND, 'Department not found in this project');
  }

  if (existingDept.drtTickets.length > 0) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Cannot delete department '${existingDept.name}': it has ${existingDept.drtTickets.length} active DRT ticket(s) assigned to it. Reassign or delete those tickets first.`
    );
  }

  await prisma.projectDepartment.delete({
    where: { id: deptId },
  });

  return {
    success: true,
    message: `Department '${existingDept.name}' deleted successfully`,
  };
};

/**
 * 11. Add a single member to a project with a 4-team bucket
 */
const addMember = async (
  orgId: string,
  projectId: string,
  payload: { userId: string; teamBucket: TeamBucket; departmentId?: string }
) => {
  const existingProject = await prisma.project.findFirst({
    where: { id: projectId, orgId, isDeleted: false },
  });

  if (!existingProject) {
    throw new AppError(httpStatus.NOT_FOUND, 'Project not found');
  }

  // Verify user exists
  const targetUser = await prisma.user.findUnique({
    where: { id: payload.userId },
  });

  if (!targetUser) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  // If departmentId is provided, verify it belongs to this project
  if (payload.departmentId) {
    const validDept = await prisma.projectDepartment.findFirst({
      where: { id: payload.departmentId, projectId },
    });

    if (!validDept) {
      throw new AppError(
        httpStatus.NOT_FOUND,
        'Specified department does not exist in this project'
      );
    }
  }

  // Check unique membership per project
  const existingMember = await prisma.projectMember.findFirst({
    where: { projectId, userId: payload.userId },
  });

  if (existingMember) {
    throw new AppError(
      httpStatus.CONFLICT,
      `User '${targetUser.name}' is already a member of this project in ${existingMember.teamBucket}. Use the update member endpoint to change their team or department.`
    );
  }

  const member = await prisma.projectMember.create({
    data: {
      projectId,
      userId: payload.userId,
      teamBucket: payload.teamBucket,
      departmentId: payload.departmentId || null,
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
      department: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return member;
};

/**
 * 12. Batch assign members to 4-team collaborative buckets
 */
const batchAddMembers = async (
  orgId: string,
  projectId: string,
  members: Array<{ userId: string; teamBucket: TeamBucket; departmentId?: string }>
) => {
  const existingProject = await prisma.project.findFirst({
    where: { id: projectId, orgId, isDeleted: false },
  });

  if (!existingProject) {
    throw new AppError(httpStatus.NOT_FOUND, 'Project not found');
  }

  const projectDepts = await prisma.projectDepartment.findMany({
    where: { projectId },
    select: { id: true },
  });
  const validDeptIds = new Set(projectDepts.map((d) => d.id));

  const results: any[] = [];

  for (const item of members) {
    const user = await prisma.user.findUnique({
      where: { id: item.userId },
      select: { id: true, name: true, email: true },
    });

    if (!user) {
      continue;
    }

    if (item.departmentId && !validDeptIds.has(item.departmentId)) {
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
        departmentId: item.departmentId || null,
      },
      create: {
        projectId,
        userId: item.userId,
        teamBucket: item.teamBucket,
        departmentId: item.departmentId || null,
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
        department: {
          select: {
            id: true,
            name: true,
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
 * 13. List members in a project with team bucket and department filters
 */
const getMembers = async (
  orgId: string,
  projectId: string,
  options: { teamBucket?: TeamBucket; departmentId?: string }
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

  if (options.departmentId) {
    whereClause.departmentId = options.departmentId;
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
      department: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return members;
};

/**
 * 14. Update project member (team bucket or department assignment)
 */
const updateMember = async (
  orgId: string,
  projectId: string,
  memberId: string,
  payload: { teamBucket?: TeamBucket; departmentId?: string | null }
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

  if (payload.departmentId) {
    const validDept = await prisma.projectDepartment.findFirst({
      where: { id: payload.departmentId, projectId },
    });

    if (!validDept) {
      throw new AppError(
        httpStatus.NOT_FOUND,
        'Specified department does not exist in this project'
      );
    }
  }

  const updated = await prisma.projectMember.update({
    where: { id: memberId },
    data: {
      ...(payload.teamBucket !== undefined ? { teamBucket: payload.teamBucket } : {}),
      ...(payload.departmentId !== undefined ? { departmentId: payload.departmentId } : {}),
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
      department: {
        select: {
          id: true,
          name: true,
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
