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
  sortOrder?: number;
}

export interface IUpdateTorPayload {
  parentId?: string | null;
  code?: string;
  title?: string;
  description?: string | null;
  sortOrder?: number;
}

export interface ITorTreeNode {
  id: string;
  projectId: string;
  parentId: string | null;
  code: string;
  title: string;
  description: string | null;
  sortOrder: number;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
  streamWeights: any[];
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
      _count: {
        select: {
          children: true,
          drtMappings: true,
          findings: true,
        },
      },
    },
  });

  // Construct recursive tree
  const nodeMap = new Map<string, ITorTreeNode>();
  allNodes.forEach((node) => {
    nodeMap.set(node.id, {
      ...node,
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
};
