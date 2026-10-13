import httpStatus from 'http-status';
import { prisma } from '../../../lib/prisma';
import { AppError } from '../../error/AppError';
import { TeamBucket } from '../../../generated/prisma';

export interface IStreamWeightItem {
  streamBucket: TeamBucket;
  dataCollectionAllocated: number;
  dataAnalysisAllocated: number;
  dataAnalysisObtained?: number;
}

export interface ICreateTorPayload {
  projectId: string;
  parentId?: string | null;
  code: string;
  title: string;
  description?: string | null;
  department?: string | null;
  sortOrder?: number;
}

export interface IUpdateTorPayload {
  parentId?: string | null;
  code?: string;
  title?: string;
  description?: string | null;
  department?: string | null;
  sortOrder?: number;
}

export interface ITorTreeNode {
  id: string;
  projectId: string;
  parentId: string | null;
  code: string;
  title: string;
  description: string | null;
  department: string | null;
  submissionDeadline?: Date | null;
  sortOrder: number;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
  streamWeights: any[];
  assignedMembers?: any[];
  documents?: any[];
  _count: {
    children: number;
    drtMappings: number;
    findings: number;
  };
  children: ITorTreeNode[];
}

/**
 * 1. Create a ToR node (WBS activity or parent category)
 */
const createTor = async (
  orgId: string,
  createdById: string,
  payload: ICreateTorPayload
) => {
  // Verify project belongs to tenant
  const project = await prisma.project.findFirst({
    where: { id: payload.projectId, orgId, isDeleted: false },
  });

  if (!project) {
    throw new AppError(httpStatus.NOT_FOUND, 'Project not found in this organization');
  }

  // If parentId provided, verify parent exists in the same project
  if (payload.parentId) {
    const parentTor = await prisma.tor.findFirst({
      where: { id: payload.parentId, projectId: payload.projectId },
    });

    if (!parentTor) {
      throw new AppError(
        httpStatus.NOT_FOUND,
        'Parent ToR node does not exist in this project'
      );
    }
  }

  const tor = await prisma.tor.create({
    data: {
      projectId: payload.projectId,
      parentId: payload.parentId || null,
      code: payload.code.trim(),
      title: payload.title.trim(),
      description: payload.description?.trim() || null,
      department: payload.department?.trim() || null,
      sortOrder: payload.sortOrder ?? 0,
      createdById,
    },
    include: {
      parent: {
        select: {
          id: true,
          code: true,
          title: true,
        },
      },
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      streamWeights: true,
    },
  });

  return tor;
};

/**
 * 2. Get recursive hierarchical ToR WBS tree for a project
 */
const getTorTree = async (orgId: string, projectId: string) => {
  // Verify project belongs to tenant
  const project = await prisma.project.findFirst({
    where: { id: projectId, orgId, isDeleted: false },
  });

  if (!project) {
    throw new AppError(httpStatus.NOT_FOUND, 'Project not found in this organization');
  }

  const allNodes = await prisma.tor.findMany({
    where: { projectId },
    orderBy: [{ sortOrder: 'asc' }, { code: 'asc' }],
    include: {
      streamWeights: true,
      assignedMembers: {
        include: {
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
      documents: {
        include: {
          uploadedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
      _count: {
        select: {
          children: true,
          drtMappings: true,
          findings: true,
        },
      },
    },
  });

  // Fetch project members to map teamBucket to each assigned member
  const projectMembers = await prisma.projectMember.findMany({
    where: { projectId },
    select: { userId: true, teamBucket: true },
  });
  const memberTeamMap = new Map(projectMembers.map((m) => [m.userId, m.teamBucket]));

  // Construct recursive tree
  const nodeMap = new Map<string, ITorTreeNode>();
  allNodes.forEach((node) => {
    const enrichedAssigned = node.assignedMembers.map((am) => ({
      ...am,
      teamBucket: memberTeamMap.get(am.userId) || 'ORG_MEMBER',
    }));

    nodeMap.set(node.id, {
      ...node,
      assignedMembers: enrichedAssigned,
      children: [],
    });
  });

  const rootNodes: ITorTreeNode[] = [];

  allNodes.forEach((node) => {
    const currentNode = nodeMap.get(node.id)!;
    if (node.parentId && nodeMap.has(node.parentId)) {
      const parentNode = nodeMap.get(node.parentId)!;
      parentNode.children.push(currentNode);
    } else {
      rootNodes.push(currentNode);
    }
  });

  return {
    projectId,
    totalNodes: allNodes.length,
    rootCount: rootNodes.length,
    tree: rootNodes,
  };
};

/**
 * 3. List ToR nodes with search and optional parent filter
 */
const getTors = async (
  orgId: string,
  projectId: string,
  query: { parentId?: string; search?: string }
) => {
  const project = await prisma.project.findFirst({
    where: { id: projectId, orgId, isDeleted: false },
  });

  if (!project) {
    throw new AppError(httpStatus.NOT_FOUND, 'Project not found in this organization');
  }

  const whereClause: any = {
    projectId,
  };

  if (query.parentId === 'root') {
    whereClause.parentId = null;
  } else if (query.parentId) {
    whereClause.parentId = query.parentId;
  }

  if (query.search && query.search.trim()) {
    const search = query.search.trim();
    whereClause.OR = [
      { code: { contains: search, mode: 'insensitive' } },
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  const nodes = await prisma.tor.findMany({
    where: whereClause,
    orderBy: [{ sortOrder: 'asc' }, { code: 'asc' }],
    include: {
      parent: {
        select: {
          id: true,
          code: true,
          title: true,
        },
      },
      streamWeights: true,
      _count: {
        select: {
          children: true,
          drtMappings: true,
          findings: true,
        },
      },
    },
  });

  return nodes;
};

/**
 * 4. Get single ToR node detail with parent, children, and DRT linkages
 */
const getTorById = async (orgId: string, id: string) => {
  const tor = await prisma.tor.findUnique({
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
      parent: {
        select: {
          id: true,
          code: true,
          title: true,
        },
      },
      children: {
        orderBy: [{ sortOrder: 'asc' }, { code: 'asc' }],
        include: {
          streamWeights: true,
          _count: {
            select: {
              children: true,
              drtMappings: true,
            },
          },
        },
      },
      streamWeights: true,
      drtMappings: {
        include: {
          ticket: {
            select: {
              id: true,
              requestCode: true,
              description: true,
              assignedTeamBucket: true,
              lifecycleStatus: true,
              reviewStatus: true,
              allocatedWeight: true,
              excessDays: true,
            },
          },
        },
      },
      _count: {
        select: {
          children: true,
          drtMappings: true,
          findings: true,
        },
      },
    },
  });

  if (!tor || tor.project.orgId !== orgId) {
    throw new AppError(httpStatus.NOT_FOUND, 'ToR node not found in this organization');
  }

  return tor;
};

/**
 * 5. Update ToR node
 */
const updateTor = async (
  orgId: string,
  id: string,
  payload: IUpdateTorPayload
) => {
  const existingTor = await prisma.tor.findUnique({
    where: { id },
    include: {
      project: { select: { orgId: true } },
    },
  });

  if (!existingTor || existingTor.project.orgId !== orgId) {
    throw new AppError(httpStatus.NOT_FOUND, 'ToR node not found');
  }

  // Prevent self as parent
  if (payload.parentId && payload.parentId === id) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'A ToR node cannot be its own parent'
    );
  }

  // If changing parentId, verify target parent exists in same project
  if (payload.parentId && payload.parentId !== existingTor.parentId) {
    const parentTor = await prisma.tor.findFirst({
      where: { id: payload.parentId, projectId: existingTor.projectId },
    });

    if (!parentTor) {
      throw new AppError(
        httpStatus.NOT_FOUND,
        'Target parent ToR node does not exist in this project'
      );
    }
  }

  const updated = await prisma.tor.update({
    where: { id },
    data: {
      ...(payload.code !== undefined ? { code: payload.code.trim() } : {}),
      ...(payload.title !== undefined ? { title: payload.title.trim() } : {}),
      ...(payload.description !== undefined
        ? { description: payload.description ? payload.description.trim() : null }
        : {}),
      ...(payload.department !== undefined
        ? { department: payload.department ? payload.department.trim() : null }
        : {}),
      ...(payload.sortOrder !== undefined ? { sortOrder: payload.sortOrder } : {}),
      ...(payload.parentId !== undefined ? { parentId: payload.parentId || null } : {}),
    },
    include: {
      parent: {
        select: {
          id: true,
          code: true,
          title: true,
        },
      },
      streamWeights: true,
    },
  });

  return updated;
};

/**
 * 6. Delete ToR node (cascades to children via Prisma schema)
 */
const deleteTor = async (orgId: string, id: string) => {
  const existingTor = await prisma.tor.findUnique({
    where: { id },
    include: {
      project: { select: { orgId: true } },
      _count: {
        select: {
          children: true,
          drtMappings: true,
        },
      },
    },
  });

  if (!existingTor || existingTor.project.orgId !== orgId) {
    throw new AppError(httpStatus.NOT_FOUND, 'ToR node not found');
  }

  await prisma.tor.delete({
    where: { id },
  });

  return {
    success: true,
    message: `ToR node '${existingTor.code} - ${existingTor.title}' deleted successfully`,
    cascadeDetails: {
      childrenDeleted: existingTor._count.children,
      drtMappingsRemoved: existingTor._count.drtMappings,
    },
  };
};

/**
 * 7. Set / Upsert stream weights for a ToR node (single or batch)
 */
const setTorStreamWeights = async (
  orgId: string,
  torId: string,
  payload: { weights?: IStreamWeightItem[] } | IStreamWeightItem
) => {
  const existingTor = await prisma.tor.findUnique({
    where: { id: torId },
    include: {
      project: { select: { orgId: true } },
    },
  });

  if (!existingTor || existingTor.project.orgId !== orgId) {
    throw new AppError(httpStatus.NOT_FOUND, 'ToR node not found');
  }

  const items: IStreamWeightItem[] =
    'weights' in payload && Array.isArray(payload.weights)
      ? payload.weights
      : [payload as IStreamWeightItem];

  for (const item of items) {
    await prisma.torStreamWeight.upsert({
      where: {
        torId_streamBucket: {
          torId,
          streamBucket: item.streamBucket,
        },
      },
      update: {
        dataCollectionAllocated: item.dataCollectionAllocated,
        dataAnalysisAllocated: item.dataAnalysisAllocated,
        dataAnalysisObtained: item.dataAnalysisObtained ?? 0.0,
      },
      create: {
        torId,
        streamBucket: item.streamBucket,
        dataCollectionAllocated: item.dataCollectionAllocated,
        dataAnalysisAllocated: item.dataAnalysisAllocated,
        dataAnalysisObtained: item.dataAnalysisObtained ?? 0.0,
      },
    });
  }

  const updatedWeights = await prisma.torStreamWeight.findMany({
    where: { torId },
    orderBy: { streamBucket: 'asc' },
  });

  const totals = updatedWeights.reduce(
    (acc, curr) => ({
      totalDataCollectionAllocated: acc.totalDataCollectionAllocated + curr.dataCollectionAllocated,
      totalDataAnalysisAllocated: acc.totalDataAnalysisAllocated + curr.dataAnalysisAllocated,
      totalAllocated:
        acc.totalAllocated + curr.dataCollectionAllocated + curr.dataAnalysisAllocated,
      totalDataAnalysisObtained: acc.totalDataAnalysisObtained + curr.dataAnalysisObtained,
    }),
    {
      totalDataCollectionAllocated: 0,
      totalDataAnalysisAllocated: 0,
      totalAllocated: 0,
      totalDataAnalysisObtained: 0,
    }
  );

  return {
    torId,
    torCode: existingTor.code,
    torTitle: existingTor.title,
    weights: updatedWeights,
    summary: totals,
  };
};

/**
 * 8. Get stream weights and marks summary for a ToR node
 */
const getTorStreamWeights = async (orgId: string, torId: string) => {
  const existingTor = await prisma.tor.findUnique({
    where: { id: torId },
    include: {
      project: { select: { orgId: true } },
    },
  });

  if (!existingTor || existingTor.project.orgId !== orgId) {
    throw new AppError(httpStatus.NOT_FOUND, 'ToR node not found');
  }

  const weights = await prisma.torStreamWeight.findMany({
    where: { torId },
    orderBy: { streamBucket: 'asc' },
  });

  const totals = weights.reduce(
    (acc, curr) => ({
      totalDataCollectionAllocated: acc.totalDataCollectionAllocated + curr.dataCollectionAllocated,
      totalDataAnalysisAllocated: acc.totalDataAnalysisAllocated + curr.dataAnalysisAllocated,
      totalAllocated:
        acc.totalAllocated + curr.dataCollectionAllocated + curr.dataAnalysisAllocated,
      totalDataAnalysisObtained: acc.totalDataAnalysisObtained + curr.dataAnalysisObtained,
    }),
    {
      totalDataCollectionAllocated: 0,
      totalDataAnalysisAllocated: 0,
      totalAllocated: 0,
      totalDataAnalysisObtained: 0,
    }
  );

  return {
    torId,
    torCode: existingTor.code,
    torTitle: existingTor.title,
    weights,
    summary: totals,
  };
};

/**
 * 9. Delete a stream weight from a ToR node
 */
const deleteTorStreamWeight = async (
  orgId: string,
  torId: string,
  streamBucket: TeamBucket
) => {
  const existingTor = await prisma.tor.findUnique({
    where: { id: torId },
    include: {
      project: { select: { orgId: true } },
    },
  });

  if (!existingTor || existingTor.project.orgId !== orgId) {
    throw new AppError(httpStatus.NOT_FOUND, 'ToR node not found');
  }

  const existingWeight = await prisma.torStreamWeight.findUnique({
    where: {
      torId_streamBucket: {
        torId,
        streamBucket,
      },
    },
  });

  if (!existingWeight) {
    throw new AppError(httpStatus.NOT_FOUND, `No stream weight found for ${streamBucket}`);
  }

  await prisma.torStreamWeight.delete({
    where: {
      torId_streamBucket: {
        torId,
        streamBucket,
      },
    },
  });

  return {
    success: true,
    message: `Stream weight for '${streamBucket}' removed from ToR node successfully`,
  };
};

/**
 * 10. Assign a project member to a specific ToR node
 */
const assignMemberToTor = async (orgId: string, torId: string, userId: string) => {
  const tor = await prisma.tor.findUnique({
    where: { id: torId },
    include: { project: { select: { orgId: true, id: true } } },
  });

  if (!tor || tor.project.orgId !== orgId) {
    throw new AppError(httpStatus.NOT_FOUND, 'ToR node not found');
  }

  const projectMember = await prisma.projectMember.findFirst({
    where: { projectId: tor.project.id, userId },
  });

  if (!projectMember) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'User is not a member of this project. Add them to the project team roster first.'
    );
  }

  const assignment = await prisma.torMemberAssignment.upsert({
    where: { torId_userId: { torId, userId } },
    update: {},
    create: { torId, userId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          designation: true,
        },
      },
    },
  });

  return assignment;
};

/**
 * 11. Remove a member assignment from a ToR node
 */
const removeMemberFromTor = async (orgId: string, torId: string, userId: string) => {
  const tor = await prisma.tor.findUnique({
    where: { id: torId },
    include: { project: { select: { orgId: true } } },
  });

  if (!tor || tor.project.orgId !== orgId) {
    throw new AppError(httpStatus.NOT_FOUND, 'ToR node not found');
  }

  await prisma.torMemberAssignment.deleteMany({
    where: { torId, userId },
  });

  return { success: true, message: 'Member unassigned from ToR' };
};

/**
 * 12. Assign Tri-Party Members (Org, Client, Auditee) & Document Submission Deadline
 */
export interface IAssignTrioPayload {
  orgMemberId?: string | null;
  clientMemberId?: string | null;
  auditeeMemberId?: string | null;
  submissionDeadline?: string | null;
}

const assignTrioMembers = async (
  orgId: string,
  torId: string,
  payload: IAssignTrioPayload
) => {
  const tor = await prisma.tor.findUnique({
    where: { id: torId },
    include: { project: { select: { orgId: true, id: true } } },
  });

  if (!tor || tor.project.orgId !== orgId) {
    throw new AppError(httpStatus.NOT_FOUND, 'ToR node not found');
  }

  const projectId = tor.project.id;
  const targetUserIds = [
    payload.orgMemberId,
    payload.clientMemberId,
    payload.auditeeMemberId,
  ].filter(Boolean) as string[];

  // Validate roles if IDs are provided
  if (targetUserIds.length > 0) {
    const projectMembers = await prisma.projectMember.findMany({
      where: { projectId, userId: { in: targetUserIds } },
    });
    const memberMap = new Map(projectMembers.map((m) => [m.userId, m.teamBucket]));

    if (payload.orgMemberId) {
      const role = memberMap.get(payload.orgMemberId);
      if (!role || (role !== 'ORG_MEMBER' && role !== 'ADMINISTRATOR')) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          'Selected Org Member must belong to ORG_MEMBER or ADMINISTRATOR role.'
        );
      }
    }

    if (payload.clientMemberId) {
      const role = memberMap.get(payload.clientMemberId);
      if (!role || role !== 'CLIENT') {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          'Selected Client Member must belong to CLIENT role.'
        );
      }
    }

    if (payload.auditeeMemberId) {
      const role = memberMap.get(payload.auditeeMemberId);
      if (!role || role !== 'AUDITEE') {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          'Selected Auditee Member must belong to AUDITEE role.'
        );
      }
    }
  }

  // Parse submission deadline
  const deadlineDate = payload.submissionDeadline
    ? new Date(payload.submissionDeadline)
    : null;

  // Transactionally update deadline and tri-party assignments
  await prisma.$transaction(async (tx) => {
    // 1. Update deadline on ToR
    await tx.tor.update({
      where: { id: torId },
      data: {
        submissionDeadline: deadlineDate,
      },
    });

    // 2. Clear old assignments
    await tx.torMemberAssignment.deleteMany({
      where: { torId },
    });

    // 3. Insert new trio assignments
    for (const userId of targetUserIds) {
      await tx.torMemberAssignment.create({
        data: {
          torId,
          userId,
        },
      });
    }
  });

  return {
    success: true,
    message: 'Tri-party members and submission deadline updated successfully',
  };
};

/**
 * 13. Submit evidence document against a specific ToR node
 * Enforces rule: ONLY assigned Org team members (or Org Admins/Owners) can upload documents.
 * Client and Auditee members have read-only tracking and cannot upload documents.
 */
const submitTorDocument = async (
  orgId: string,
  torId: string,
  currentUserId: string,
  currentUserOrgRole: string,
  payload: {
    fileName: string;
    fileUrl?: string;
    fileSize?: number;
    fileType?: string;
    notes?: string;
  }
) => {
  const tor = await prisma.tor.findUnique({
    where: { id: torId },
    include: { project: { select: { orgId: true, id: true } } },
  });

  if (!tor || tor.project.orgId !== orgId) {
    throw new AppError(httpStatus.NOT_FOUND, 'ToR node not found');
  }

  const isOrgAdmin = currentUserOrgRole === 'OWNER' || currentUserOrgRole === 'ADMIN';

  // Find user's project membership role
  const projectMember = await prisma.projectMember.findFirst({
    where: { projectId: tor.project.id, userId: currentUserId },
  });

  if (!isOrgAdmin) {
    // Rule: Must be an Org Team Member or Project Administrator
    if (
      !projectMember ||
      (projectMember.teamBucket !== 'ORG_MEMBER' &&
        projectMember.teamBucket !== 'ADMINISTRATOR')
    ) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        'Only Org Team members can upload evidence documents. Client and Auditee members have read-only access.'
      );
    }

    // Must be assigned to this specific ToR (unless Project Administrator)
    const isAssigned = await prisma.torMemberAssignment.findUnique({
      where: { torId_userId: { torId, userId: currentUserId } },
    });

    if (!isAssigned && projectMember.teamBucket !== 'ADMINISTRATOR') {
      throw new AppError(
        httpStatus.FORBIDDEN,
        'You can only upload documents against ToR items you are assigned to as the Org member.'
      );
    }
  }

  const document = await prisma.torDocument.create({
    data: {
      torId,
      uploadedById: currentUserId,
      fileName: payload.fileName.trim(),
      fileUrl: payload.fileUrl?.trim() || null,
      fileSize: payload.fileSize || null,
      fileType: payload.fileType?.trim() || null,
      notes: payload.notes?.trim() || null,
      status: 'SUBMITTED',
    },
    include: {
      uploadedBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return document;
};

/**
 * 13. Update document review status
 */
const updateDocumentStatus = async (
  orgId: string,
  torId: string,
  docId: string,
  status: string
) => {
  const tor = await prisma.tor.findUnique({
    where: { id: torId },
    include: { project: { select: { orgId: true } } },
  });

  if (!tor || tor.project.orgId !== orgId) {
    throw new AppError(httpStatus.NOT_FOUND, 'ToR node not found');
  }

  const updated = await prisma.torDocument.update({
    where: { id: docId },
    data: { status },
    include: {
      uploadedBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return updated;
};

export const TorService = {
  createTor,
  getTorTree,
  getTors,
  getTorById,
  updateTor,
  deleteTor,
  setTorStreamWeights,
  getTorStreamWeights,
  deleteTorStreamWeight,
  assignMemberToTor,
  removeMemberFromTor,
  assignTrioMembers,
  submitTorDocument,
  updateDocumentStatus,
};
