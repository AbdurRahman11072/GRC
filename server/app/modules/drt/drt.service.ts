import httpStatus from 'http-status';
import { prisma } from '../../../lib/prisma';
import { AppError } from '../../error/AppError';
import {
  TeamBucket,
  DRTLifecycleStatus,
  DRTReviewStatus,
  PeriodEvidenceStatus,
} from '../../../generated/prisma';

export interface IPeriodStatusPayload {
  periodId?: string | null;
  periodLabel: string;
  evidenceStatus: PeriodEvidenceStatus;
  remark?: string | null;
}

export interface ICreateTicketPayload {
  projectId: string;
  torId?: string | null;
  requestCode: string;
  title?: string | null;
  assignedTeamBucket?: TeamBucket;
  department?: string | null;
  description: string;
  currentRequirement?: string | null;
  remarks?: string | null;
  supervisorId?: string | null;
  fieldMemberId?: string | null;
  clientContactId?: string | null;
  auditeeContactId?: string | null;
  dateOfRequest?: string;
  expectedDateOfReceipt?: string;
  allocatedWeight?: number;
  torIds?: string[];
  periodStatuses?: IPeriodStatusPayload[];
}

export interface IAssignSquadPayload {
  supervisorId?: string | null;
  fieldMemberId?: string | null;
  clientContactId?: string | null;
  auditeeContactId?: string | null;
  expectedDateOfReceipt?: string | null;
}

export interface IUploadDrtDocPayload {
  partySide: 'CLIENT' | 'AUDITEE';
  fileName: string;
  fileUrl?: string | null;
  fileSize?: number | null;
  fileType?: string | null;
  referenceNumber?: string | null;
  receivedDate?: string | null;
  notes?: string | null;
  periodLabel?: string | null;
  periodStatus?: PeriodEvidenceStatus | null;
  periodRemark?: string | null;
}

export interface IReviewDrtDocPayload {
  status: 'ACCEPTED' | 'REVISION_REQUESTED';
  reviewNotes?: string | null;
}

export interface IUpdateTicketPayload {
  requestCode?: string;
  title?: string | null;
  description?: string;
  currentRequirement?: string | null;
  remarks?: string | null;
  assignedTeamBucket?: TeamBucket;
  department?: string | null;
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
  department?: string;
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

  // Create ticket in transaction with initial ToR mappings
  const ticket = await prisma.$transaction(async (tx) => {
    const parentTorId = payload.torId || (payload.torIds && payload.torIds.length > 0 ? payload.torIds[0] : null);

    const createdTicket = await tx.dRTTicket.create({
      data: {
        projectId: payload.projectId,
        torId: parentTorId,
        requestCode,
        title: payload.title ? payload.title.trim() : null,
        assignedTeamBucket: payload.assignedTeamBucket || TeamBucket.AUDITEE,
        department: payload.department ? payload.department.trim() : null,
        description: payload.description.trim(),
        currentRequirement: payload.currentRequirement ? payload.currentRequirement.trim() : null,
        remarks: payload.remarks ? payload.remarks.trim() : null,
        supervisorId: payload.supervisorId || null,
        fieldMemberId: payload.fieldMemberId || null,
        clientContactId: payload.clientContactId || null,
        auditeeContactId: payload.auditeeContactId || null,
        dateOfRequest: payload.dateOfRequest ? new Date(payload.dateOfRequest) : new Date(),
        expectedDateOfReceipt: payload.expectedDateOfReceipt
          ? new Date(payload.expectedDateOfReceipt)
          : null,
        allocatedWeight: payload.allocatedWeight ?? 0.0,
      },
    });

    const allTorIds = new Set<string>();
    if (parentTorId) allTorIds.add(parentTorId);
    if (payload.torIds) {
      payload.torIds.forEach((id) => allTorIds.add(id));
    }

    if (allTorIds.size > 0) {
      await tx.dRTTicketToR.createMany({
        data: Array.from(allTorIds).map((torId) => ({
          ticketId: createdTicket.id,
          torId,
        })),
        skipDuplicates: true,
      });
    }

    if (payload.periodStatuses && payload.periodStatuses.length > 0) {
      await tx.dRTTicketPeriodStatus.createMany({
        data: payload.periodStatuses.map((ps) => ({
          ticketId: createdTicket.id,
          periodId: ps.periodId || null,
          periodLabel: ps.periodLabel,
          evidenceStatus: ps.evidenceStatus || PeriodEvidenceStatus.IN_PROGRESS,
          remark: ps.remark ? ps.remark.trim() : null,
        })),
        skipDuplicates: true,
      });
    }

    return createdTicket;
  });

  if (ticket.torId) {
    await recalculateTorCollectionMarks(ticket.torId);
  }

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

  if (options.department) {
    whereClause.department = options.department;
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
        tor: {
          select: {
            id: true,
            code: true,
            title: true,
            department: true,
          },
        },
        supervisor: {
          select: {
            id: true,
            name: true,
            email: true,
            designation: true,
          },
        },
        fieldMember: {
          select: {
            id: true,
            name: true,
            email: true,
            designation: true,
          },
        },
        clientContact: {
          select: {
            id: true,
            name: true,
            email: true,
            designation: true,
          },
        },
        auditeeContact: {
          select: {
            id: true,
            name: true,
            email: true,
            designation: true,
          },
        },
        drtDocuments: {
          include: {
            uploadedBy: { select: { id: true, name: true, email: true } },
            reviewedBy: { select: { id: true, name: true, email: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        periodStatuses: {
          select: {
            id: true,
            periodLabel: true,
            evidenceStatus: true,
            remark: true,
          },
          orderBy: { periodLabel: 'asc' },
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
            drtDocuments: true,
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
      tor: {
        select: {
          id: true,
          code: true,
          title: true,
          department: true,
        },
      },
      supervisor: {
        select: {
          id: true,
          name: true,
          email: true,
          designation: true,
        },
      },
      fieldMember: {
        select: {
          id: true,
          name: true,
          email: true,
          designation: true,
        },
      },
      clientContact: {
        select: {
          id: true,
          name: true,
          email: true,
          designation: true,
        },
      },
      auditeeContact: {
        select: {
          id: true,
          name: true,
          email: true,
          designation: true,
        },
      },
      drtDocuments: {
        include: {
          uploadedBy: { select: { id: true, name: true, email: true } },
          reviewedBy: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
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
          periodLabel: 'asc',
        },
      },
      _count: {
        select: {
          submissions: true,
          comments: true,
          drtDocuments: true,
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

  const updated = await prisma.dRTTicket.update({
    where: { id },
    data: {
      ...(payload.requestCode !== undefined ? { requestCode: payload.requestCode.trim() } : {}),
      ...(payload.description !== undefined ? { description: payload.description.trim() } : {}),
      ...(payload.currentRequirement !== undefined
        ? { currentRequirement: payload.currentRequirement ? payload.currentRequirement.trim() : null }
        : {}),
      ...(payload.remarks !== undefined
        ? { remarks: payload.remarks ? payload.remarks.trim() : null }
        : {}),
      ...(payload.assignedTeamBucket !== undefined
        ? { assignedTeamBucket: payload.assignedTeamBucket }
        : {}),
      ...(payload.department !== undefined ? { department: payload.department ? payload.department.trim() : null } : {}),
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

      await tx.dRTTicket.update({
        where: { id },
        data: { torId: payload.torIds.length > 0 ? payload.torIds[0] : null },
      });
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
    statuses: Array<{
      periodId?: string | null;
      periodLabel: string;
      evidenceStatus: PeriodEvidenceStatus;
      remark?: string | null;
    }>;
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

  for (const item of payload.statuses) {
    await prisma.dRTTicketPeriodStatus.upsert({
      where: {
        ticketId_periodLabel: {
          ticketId: id,
          periodLabel: item.periodLabel,
        },
      },
      update: {
        evidenceStatus: item.evidenceStatus,
        remark: item.remark !== undefined ? item.remark : undefined,
        ...(item.periodId ? { periodId: item.periodId } : {}),
      },
      create: {
        ticketId: id,
        periodLabel: item.periodLabel,
        periodId: item.periodId || null,
        evidenceStatus: item.evidenceStatus,
        remark: item.remark || null,
      },
    });
  }

  return getTicketById(orgId, id);
};

/**
 * 10. Assign 4-Party Squad to a DRT Ticket
 */
const assignSquad = async (
  orgId: string,
  ticketId: string,
  payload: IAssignSquadPayload
) => {
  const ticket = await prisma.dRTTicket.findUnique({
    where: { id: ticketId },
    include: { project: true },
  });

  if (!ticket || ticket.project.orgId !== orgId) {
    throw new AppError(httpStatus.NOT_FOUND, 'DRT ticket not found in this organization');
  }

  const updated = await prisma.dRTTicket.update({
    where: { id: ticketId },
    data: {
      supervisorId: payload.supervisorId !== undefined ? payload.supervisorId : ticket.supervisorId,
      fieldMemberId: payload.fieldMemberId !== undefined ? payload.fieldMemberId : ticket.fieldMemberId,
      clientContactId: payload.clientContactId !== undefined ? payload.clientContactId : ticket.clientContactId,
      auditeeContactId: payload.auditeeContactId !== undefined ? payload.auditeeContactId : ticket.auditeeContactId,
      expectedDateOfReceipt: payload.expectedDateOfReceipt !== undefined
        ? (payload.expectedDateOfReceipt ? new Date(payload.expectedDateOfReceipt) : null)
        : ticket.expectedDateOfReceipt,
    },
  });

  return getTicketById(orgId, updated.id);
};

/**
 * 11. Upload Document for DRT (Client or Auditee Slot)
 */
const uploadDrtDocument = async (
  orgId: string,
  ticketId: string,
  payload: IUploadDrtDocPayload,
  user: { id: string }
) => {
  const ticket = await prisma.dRTTicket.findUnique({
    where: { id: ticketId },
    include: { project: true },
  });

  if (!ticket || ticket.project.orgId !== orgId) {
    throw new AppError(httpStatus.NOT_FOUND, 'DRT ticket not found in this organization');
  }

  const doc = await prisma.dRTDocument.create({
    data: {
      ticketId,
      partySide: payload.partySide,
      fileName: payload.fileName,
      fileUrl: payload.fileUrl || null,
      fileSize: payload.fileSize || null,
      fileType: payload.fileType || null,
      referenceNumber: payload.referenceNumber || null,
      receivedDate: payload.receivedDate ? new Date(payload.receivedDate) : new Date(),
      reviewNotes: payload.notes || null,
      periodLabel: payload.periodLabel && payload.periodLabel !== 'ALL' ? payload.periodLabel : null,
      status: 'SUBMITTED',
      uploadedById: user.id,
    },
    include: {
      uploadedBy: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  // Automatically update timeframe status if specified for this audit period
  if (payload.periodLabel && payload.periodLabel !== 'ALL' && payload.periodStatus) {
    await prisma.dRTTicketPeriodStatus.upsert({
      where: {
        ticketId_periodLabel: {
          ticketId,
          periodLabel: payload.periodLabel,
        },
      },
      update: {
        evidenceStatus: payload.periodStatus,
        remark: payload.periodRemark !== undefined ? payload.periodRemark : undefined,
      },
      create: {
        ticketId,
        periodLabel: payload.periodLabel,
        evidenceStatus: payload.periodStatus,
        remark: payload.periodRemark || null,
      },
    });
  }

  // Update ticket lifecycle status to SUBMITTED if currently OPEN
  if (ticket.lifecycleStatus === 'OPEN') {
    await prisma.dRTTicket.update({
      where: { id: ticketId },
      data: {
        lifecycleStatus: 'SUBMITTED',
        actualDateOfReceipt: new Date(),
      },
    });
  }

  if (ticket.torId) {
    await recalculateTorCollectionMarks(ticket.torId);
  }

  return doc;
};

/**
 * 12. Review DRT Document (Accept or Request Revision)
 */
const reviewDrtDocument = async (
  orgId: string,
  docId: string,
  payload: IReviewDrtDocPayload,
  user: { id: string }
) => {
  const doc = await prisma.dRTDocument.findUnique({
    where: { id: docId },
    include: {
      ticket: {
        include: { project: true },
      },
    },
  });

  if (!doc || doc.ticket.project.orgId !== orgId) {
    throw new AppError(httpStatus.NOT_FOUND, 'DRT document not found in this organization');
  }

  const updatedDoc = await prisma.dRTDocument.update({
    where: { id: docId },
    data: {
      status: payload.status,
      reviewNotes: payload.reviewNotes !== undefined ? payload.reviewNotes : doc.reviewNotes,
      reviewedById: user.id,
    },
    include: {
      uploadedBy: { select: { id: true, name: true, email: true } },
      reviewedBy: { select: { id: true, name: true, email: true } },
    },
  });

  // Check all documents for ticket
  const allDocs = await prisma.dRTDocument.findMany({
    where: { ticketId: doc.ticketId },
  });

  const hasClientAccepted = allDocs.some((d) => d.partySide === 'CLIENT' && d.status === 'ACCEPTED');
  const hasAuditeeAccepted = allDocs.some((d) => d.partySide === 'AUDITEE' && d.status === 'ACCEPTED');

  if (hasClientAccepted || hasAuditeeAccepted) {
    const isFullAccepted = hasClientAccepted && hasAuditeeAccepted;
    await prisma.dRTTicket.update({
      where: { id: doc.ticketId },
      data: {
        lifecycleStatus: isFullAccepted ? 'ACCEPTED' : 'SUBMITTED',
        reviewStatus: isFullAccepted ? 'DONE' : 'PARTIAL',
      },
    });
  } else if (payload.status === 'REVISION_REQUESTED') {
    await prisma.dRTTicket.update({
      where: { id: doc.ticketId },
      data: {
        lifecycleStatus: 'REVISION_REQUESTED',
        reviewStatus: 'PARTIAL',
      },
    });
  }

  // Synchronize audit timeframe status if document is mapped to a specific period
  if (doc.periodLabel) {
    if (payload.status === 'REVISION_REQUESTED') {
      await prisma.dRTTicketPeriodStatus.upsert({
        where: {
          ticketId_periodLabel: {
            ticketId: doc.ticketId,
            periodLabel: doc.periodLabel,
          },
        },
        update: {
          evidenceStatus: 'PARTIAL',
          remark: payload.reviewNotes || 'Revision requested by supervisor',
        },
        create: {
          ticketId: doc.ticketId,
          periodLabel: doc.periodLabel,
          evidenceStatus: 'PARTIAL',
          remark: payload.reviewNotes || 'Revision requested by supervisor',
        },
      });
    } else if (payload.status === 'ACCEPTED') {
      await prisma.dRTTicketPeriodStatus.upsert({
        where: {
          ticketId_periodLabel: {
            ticketId: doc.ticketId,
            periodLabel: doc.periodLabel,
          },
        },
        update: {
          evidenceStatus: 'COMPLETED',
          ...(payload.reviewNotes ? { remark: payload.reviewNotes } : {}),
        },
        create: {
          ticketId: doc.ticketId,
          periodLabel: doc.periodLabel,
          evidenceStatus: 'COMPLETED',
          remark: payload.reviewNotes || null,
        },
      });
    }
  }

  if (doc.ticket.torId) {
    await recalculateTorCollectionMarks(doc.ticket.torId);
  }

  return updatedDoc;
};

/**
 * Helper: Recalculate parent ToR Data Collection Marks based on child DRTs
 */
export const recalculateTorCollectionMarks = async (torId: string) => {
  const tor = await prisma.tor.findUnique({
    where: { id: torId },
    include: { drtTickets: true },
  });

  if (!tor || !tor.drtTickets || tor.drtTickets.length === 0) {
    return;
  }

  const totalDrtCount = tor.drtTickets.length;
  const acceptedDrtCount = tor.drtTickets.filter(
    (t) => t.lifecycleStatus === 'ACCEPTED' || t.reviewStatus === 'DONE'
  ).length;

  const collectionRate = totalDrtCount > 0 ? acceptedDrtCount / totalDrtCount : 0;
  const allocated = tor.dataCollectionAllocated > 0 ? tor.dataCollectionAllocated : 5.0;
  const obtained = Math.round(collectionRate * allocated * 100) / 100;

  await prisma.tor.update({
    where: { id: torId },
    data: {
      dataCollectionObtained: obtained,
    },
  });
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
  assignSquad,
  uploadDrtDocument,
  reviewDrtDocument,
  recalculateTorCollectionMarks,
};

