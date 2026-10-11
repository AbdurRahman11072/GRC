import httpStatus from 'http-status';
import { prisma } from '../../../lib/prisma';
import { AppError } from '../../error/AppError';
import {
  TeamBucket,
  DRTLifecycleStatus,
  DRTReviewStatus,
  PeriodEvidenceStatus,
} from '../../../generated/prisma';

export interface ICreateTicketPayload {
  projectId: string;
  requestCode: string;
  assignedTeamBucket: TeamBucket;
  departmentId?: string | null;
  description: string;
  dateOfRequest?: string;
  expectedDateOfReceipt?: string;
  allocatedWeight?: number;
  torIds?: string[];
}

export interface IUpdateTicketPayload {
  requestCode?: string;
  description?: string;
  assignedTeamBucket?: TeamBucket;
  departmentId?: string | null;
  dateOfRequest?: string | null;
  expectedDateOfReceipt?: string | null;
  allocatedWeight?: number;
}

export interface IDRTQueryOptions {
  page?: number;
  limit?: number;
  search?: string;
  lifecycleStatus?: DRTLifecycleStatus;
  reviewStatus?: DRTReviewStatus;
  assignedTeamBucket?: TeamBucket;
  departmentId?: string;
  torId?: string;
}

/**
 * 1. Create a DRT Ticket linked to project, department, and ToRs
 */
const createTicket = async (orgId: string, payload: ICreateTicketPayload) => {
  const project = await prisma.project.findFirst({
    where: { id: payload.projectId, orgId, isDeleted: false },
  });

  if (!project) {
    throw new AppError(httpStatus.NOT_FOUND, 'Project not found in this organization');
  }

  const requestCode = payload.requestCode.trim();

  // Check unique requestCode within this project
  const duplicate = await prisma.dRTTicket.findFirst({
    where: {
      projectId: payload.projectId,
      requestCode: { equals: requestCode, mode: 'insensitive' },
    },
  });

  if (duplicate) {
    throw new AppError(
      httpStatus.CONFLICT,
      `A DRT ticket with request code '${requestCode}' already exists in this project`
    );
  }

  // Validate departmentId if provided
  if (payload.departmentId) {
    const validDept = await prisma.projectDepartment.findFirst({
      where: { id: payload.departmentId, projectId: payload.projectId },
    });

    if (!validDept) {
      throw new AppError(
        httpStatus.NOT_FOUND,
        'Specified department does not exist in this project'
      );
    }
  }

  // Validate torIds if provided
  if (payload.torIds && payload.torIds.length > 0) {
    const existingTors = await prisma.tor.findMany({
      where: {
        id: { in: payload.torIds },
        projectId: payload.projectId,
      },
      select: { id: true },
    });

    if (existingTors.length !== payload.torIds.length) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'One or more specified ToR IDs do not exist in this project'
      );
    }
  }

  // Create ticket in transaction with initial ToR mappings
  const ticket = await prisma.$transaction(async (tx) => {
    const createdTicket = await tx.dRTTicket.create({
      data: {
        projectId: payload.projectId,
        requestCode,
        assignedTeamBucket: payload.assignedTeamBucket,
        departmentId: payload.departmentId || null,
        description: payload.description.trim(),
        dateOfRequest: payload.dateOfRequest ? new Date(payload.dateOfRequest) : new Date(),
        expectedDateOfReceipt: payload.expectedDateOfReceipt
          ? new Date(payload.expectedDateOfReceipt)
          : null,
        allocatedWeight: payload.allocatedWeight ?? 0.0,
      },
    });

    if (payload.torIds && payload.torIds.length > 0) {
      await tx.dRTTicketToR.createMany({
        data: payload.torIds.map((torId) => ({
          ticketId: createdTicket.id,
          torId,
        })),
      });
    }

    return createdTicket;
  });

  return getTicketById(orgId, ticket.id);
};

/**
 * 2. List DRT tickets for a project with filters, search, and pagination
 */
const getTickets = async (
  orgId: string,
  projectId: string,
  options: IDRTQueryOptions
) => {
  const project = await prisma.project.findFirst({
    where: { id: projectId, orgId, isDeleted: false },
  });

  if (!project) {
    throw new AppError(httpStatus.NOT_FOUND, 'Project not found in this organization');
  }

  const page = Math.max(1, Number(options.page) || 1);
  const limit = Math.max(1, Math.min(100, Number(options.limit) || 20));
  const skip = (page - 1) * limit;

  const whereClause: any = {
    projectId,
  };

  if (options.lifecycleStatus) {
    whereClause.lifecycleStatus = options.lifecycleStatus;
  }

  if (options.reviewStatus) {
    whereClause.reviewStatus = options.reviewStatus;
  }

  if (options.assignedTeamBucket) {
    whereClause.assignedTeamBucket = options.assignedTeamBucket;
  }

  if (options.departmentId) {
    whereClause.departmentId = options.departmentId;
  }

  if (options.torId) {
    whereClause.torMappings = {
      some: { torId: options.torId },
    };
  }

  if (options.search && options.search.trim()) {
    const search = options.search.trim();
    whereClause.OR = [
      { requestCode: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [total, tickets] = await Promise.all([
    prisma.dRTTicket.count({ where: whereClause }),
    prisma.dRTTicket.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        department: {
          select: {
            id: true,
            name: true,
          },
        },
        torMappings: {
          select: {
            tor: {
              select: {
                id: true,
                code: true,
                title: true,
              },
            },
          },
        },
        _count: {
          select: {
            submissions: true,
            comments: true,
            periodStatuses: true,
          },
        },
      },
    }),
  ]);

  const formattedTickets = tickets.map((t) => ({
    ...t,
    tors: t.torMappings.map((m) => m.tor),
  }));

  return {
    pagination: {
      page,
      limit,
      total,
    },
    data: formattedTickets,
  };
};

/**
 * 3. Get single DRT ticket detail
 */
const getTicketById = async (orgId: string, id: string) => {
  const ticket = await prisma.dRTTicket.findUnique({
    where: { id },
    include: {
      project: {
        select: {
          id: true,
          orgId: true,
          projectName: true,
          status: true,
        },
      },
      department: {
        select: {
          id: true,
          name: true,
          description: true,
        },
      },
      torMappings: {
        select: {
          tor: {
            select: {
              id: true,
              code: true,
              title: true,
              sortOrder: true,
            },
          },
        },
      },
      periodStatuses: {
        include: {
          period: {
            select: {
              id: true,
              periodKey: true,
              weight: true,
            },
          },
        },
        orderBy: {
          period: { sortOrder: 'asc' },
        },
      },
      _count: {
        select: {
          submissions: true,
          comments: true,
        },
      },
    },
  });

  if (!ticket || ticket.project.orgId !== orgId) {
    throw new AppError(httpStatus.NOT_FOUND, 'DRT ticket not found in this organization');
  }

  return {
    ...ticket,
    tors: ticket.torMappings.map((m) => m.tor),
  };
};

/**
 * 4. Update DRT ticket basic details
 */
const updateTicket = async (
  orgId: string,
  id: string,
  payload: IUpdateTicketPayload
) => {
  const existingTicket = await prisma.dRTTicket.findUnique({
    where: { id },
    include: {
      project: { select: { orgId: true } },
    },
  });

  if (!existingTicket || existingTicket.project.orgId !== orgId) {
    throw new AppError(httpStatus.NOT_FOUND, 'DRT ticket not found');
  }

  // Validate requestCode uniqueness if updated
  if (
    payload.requestCode &&
    payload.requestCode.trim().toLowerCase() !== existingTicket.requestCode.toLowerCase()
  ) {
    const duplicate = await prisma.dRTTicket.findFirst({
      where: {
        projectId: existingTicket.projectId,
        requestCode: { equals: payload.requestCode.trim(), mode: 'insensitive' },
        NOT: { id },
      },
    });

    if (duplicate) {
      throw new AppError(
        httpStatus.CONFLICT,
        `A DRT ticket with request code '${payload.requestCode.trim()}' already exists in this project`
      );
    }
  }

  // Validate departmentId if updated
  if (payload.departmentId && payload.departmentId !== existingTicket.departmentId) {
    const validDept = await prisma.projectDepartment.findFirst({
      where: { id: payload.departmentId, projectId: existingTicket.projectId },
    });

    if (!validDept) {
      throw new AppError(
        httpStatus.NOT_FOUND,
        'Specified department does not exist in this project'
      );
    }
  }

  const updated = await prisma.dRTTicket.update({
    where: { id },
    data: {
      ...(payload.requestCode !== undefined ? { requestCode: payload.requestCode.trim() } : {}),
      ...(payload.description !== undefined ? { description: payload.description.trim() } : {}),
      ...(payload.assignedTeamBucket !== undefined
        ? { assignedTeamBucket: payload.assignedTeamBucket }
        : {}),
      ...(payload.departmentId !== undefined ? { departmentId: payload.departmentId } : {}),
      ...(payload.dateOfRequest !== undefined
        ? { dateOfRequest: payload.dateOfRequest ? new Date(payload.dateOfRequest) : null }
        : {}),
      ...(payload.expectedDateOfReceipt !== undefined
        ? {
            expectedDateOfReceipt: payload.expectedDateOfReceipt
              ? new Date(payload.expectedDateOfReceipt)
              : null,
          }
        : {}),
      ...(payload.allocatedWeight !== undefined ? { allocatedWeight: payload.allocatedWeight } : {}),
    },
  });

  return getTicketById(orgId, updated.id);
};

/**
 * 5. Many-to-many ToR mapping (SET, ADD, REMOVE)
 */
const mapToRs = async (
  orgId: string,
  id: string,
  payload: { torIds: string[]; action?: 'SET' | 'ADD' | 'REMOVE' }
) => {
  const existingTicket = await prisma.dRTTicket.findUnique({
    where: { id },
    include: {
      project: { select: { orgId: true } },
    },
  });

  if (!existingTicket || existingTicket.project.orgId !== orgId) {
    throw new AppError(httpStatus.NOT_FOUND, 'DRT ticket not found');
  }

  const action = payload.action || 'SET';

  // Validate all torIds belong to this project
  if (payload.torIds.length > 0) {
    const validTors = await prisma.tor.findMany({
      where: {
        id: { in: payload.torIds },
        projectId: existingTicket.projectId,
      },
      select: { id: true },
    });

    if (validTors.length !== payload.torIds.length) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'One or more specified ToR IDs do not exist in this project'
      );
    }
  }

  if (action === 'SET') {
    await prisma.$transaction(async (tx) => {
      await tx.dRTTicketToR.deleteMany({
        where: { ticketId: id },
      });

      if (payload.torIds.length > 0) {
        await tx.dRTTicketToR.createMany({
          data: payload.torIds.map((torId) => ({
            ticketId: id,
            torId,
          })),
        });
      }
    });
  } else if (action === 'ADD') {
    for (const torId of payload.torIds) {
      await prisma.dRTTicketToR.upsert({
        where: {
          ticketId_torId: {
            ticketId: id,
            torId,
          },
        },
        update: {},
        create: {
          ticketId: id,
          torId,
        },
      });
    }
  } else if (action === 'REMOVE') {
    await prisma.dRTTicketToR.deleteMany({
      where: {
        ticketId: id,
        torId: { in: payload.torIds },
      },
    });
  }

  return getTicketById(orgId, id);
};

/**
 * 6. Delete a DRT Ticket
 */
const deleteTicket = async (orgId: string, id: string) => {
  const existingTicket = await prisma.dRTTicket.findUnique({
    where: { id },
    include: {
      project: { select: { orgId: true } },
    },
  });

  if (!existingTicket || existingTicket.project.orgId !== orgId) {
    throw new AppError(httpStatus.NOT_FOUND, 'DRT ticket not found');
  }

  await prisma.dRTTicket.delete({
    where: { id },
  });

  return {
    success: true,
    message: `DRT ticket '${existingTicket.requestCode}' deleted successfully`,
  };
};

/**
 * Helper: Automated SLA excess days calculation against expectedDateOfReceipt
 */
const calculateExcessDays = (
  expectedDateOfReceipt: Date | null,
  actualDateOfReceipt: Date | null,
  lifecycleStatus: DRTLifecycleStatus
): number => {
  if (!expectedDateOfReceipt) {
    return 0;
  }

  const isFulfilled = lifecycleStatus === 'SUBMITTED' || lifecycleStatus === 'ACCEPTED';
  const comparisonDate = isFulfilled
    ? (actualDateOfReceipt || new Date())
    : new Date();

  const diffTime = comparisonDate.getTime() - expectedDateOfReceipt.getTime();
  if (diffTime <= 0) {
    return 0;
  }

  return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
};

/**
 * 7. Update ticket lifecycle status (OPEN -> SUBMITTED -> REVISION_REQUESTED -> ACCEPTED)
 */
const updateLifecycleStatus = async (
  orgId: string,
  id: string,
  payload: { lifecycleStatus: DRTLifecycleStatus; actualDateOfReceipt?: string | null }
) => {
  const existingTicket = await prisma.dRTTicket.findUnique({
    where: { id },
    include: {
      project: { select: { orgId: true } },
    },
  });

  if (!existingTicket || existingTicket.project.orgId !== orgId) {
    throw new AppError(httpStatus.NOT_FOUND, 'DRT ticket not found');
  }

  let finalActualReceipt: Date | null = existingTicket.actualDateOfReceipt;

  if (payload.actualDateOfReceipt !== undefined) {
    finalActualReceipt = payload.actualDateOfReceipt
      ? new Date(payload.actualDateOfReceipt)
      : null;
  } else if (
    (payload.lifecycleStatus === 'SUBMITTED' || payload.lifecycleStatus === 'ACCEPTED') &&
    !existingTicket.actualDateOfReceipt
  ) {
    finalActualReceipt = new Date();
  }

  const excessDays = calculateExcessDays(
    existingTicket.expectedDateOfReceipt,
    finalActualReceipt,
    payload.lifecycleStatus
  );

  await prisma.dRTTicket.update({
    where: { id },
    data: {
      lifecycleStatus: payload.lifecycleStatus,
      actualDateOfReceipt: finalActualReceipt,
      excessDays,
    },
  });

  return getTicketById(orgId, id);
};

/**
 * 8. Update ticket auditor review outcome (auditor-only: DONE, PARTIAL, PENDING, NOT_AVAILABLE, NOT_APPLICABLE)
 */
const updateReviewStatus = async (
  orgId: string,
  id: string,
  payload: { reviewStatus: DRTReviewStatus; actualDateOfReceipt?: string | null }
) => {
  const existingTicket = await prisma.dRTTicket.findUnique({
    where: { id },
    include: {
      project: { select: { orgId: true } },
    },
  });

  if (!existingTicket || existingTicket.project.orgId !== orgId) {
    throw new AppError(httpStatus.NOT_FOUND, 'DRT ticket not found');
  }

  let finalActualReceipt: Date | null = existingTicket.actualDateOfReceipt;
  if (payload.actualDateOfReceipt !== undefined) {
    finalActualReceipt = payload.actualDateOfReceipt
      ? new Date(payload.actualDateOfReceipt)
      : null;
  }

  const excessDays = calculateExcessDays(
    existingTicket.expectedDateOfReceipt,
    finalActualReceipt,
    existingTicket.lifecycleStatus
  );

  await prisma.dRTTicket.update({
    where: { id },
    data: {
      reviewStatus: payload.reviewStatus,
      actualDateOfReceipt: finalActualReceipt,
      excessDays,
    },
  });

  return getTicketById(orgId, id);
};

/**
 * 9. Update multi-year period evidence statuses (SHARED, PARTIAL, NOT_SHARED, NOT_APPLICABLE)
 */
const updatePeriodStatuses = async (
  orgId: string,
  id: string,
  payload: {
    statuses: Array<{ periodId: string; evidenceStatus: PeriodEvidenceStatus }>;
  }
) => {
  const existingTicket = await prisma.dRTTicket.findUnique({
    where: { id },
    include: {
      project: { select: { orgId: true } },
    },
  });

  if (!existingTicket || existingTicket.project.orgId !== orgId) {
    throw new AppError(httpStatus.NOT_FOUND, 'DRT ticket not found');
  }

  // Validate all periodIds belong to this project
  const periodIds = payload.statuses.map((s) => s.periodId);
  const validPeriods = await prisma.assessmentPeriod.findMany({
    where: {
      id: { in: periodIds },
      projectId: existingTicket.projectId,
    },
    select: { id: true },
  });

  if (validPeriods.length !== periodIds.length) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'One or more specified assessment periods do not exist in this project'
    );
  }

  for (const item of payload.statuses) {
    await prisma.dRTTicketPeriodStatus.upsert({
      where: {
        ticketId_periodId: {
          ticketId: id,
          periodId: item.periodId,
        },
      },
      update: {
        evidenceStatus: item.evidenceStatus,
      },
      create: {
        ticketId: id,
        periodId: item.periodId,
        evidenceStatus: item.evidenceStatus,
      },
    });
  }

  return getTicketById(orgId, id);
};

export const DRTService = {
  createTicket,
  getTickets,
  getTicketById,
  updateTicket,
  mapToRs,
  deleteTicket,
  updateLifecycleStatus,
  updateReviewStatus,
  updatePeriodStatuses,
};
