import { prisma } from '../../../lib/prisma';
import { CRMEntityType } from '../../../generated/prisma';

export interface ICreateCRMEntityPayload {
  name: string;
  entityType: CRMEntityType;
  address?: string;
  website?: string;
  phone?: string;
}

export interface ICRMQueryOptions {
  page?: number;
  limit?: number;
  search?: string;
  entityType?: CRMEntityType;
}

/**
 * 1. Create a reusable corporate CRM entity (Client or Auditee)
 */
const createEntity = async (orgId: string, payload: ICreateCRMEntityPayload) => {
  const entity = await prisma.entityCRM.create({
    data: {
      orgId,
      name: payload.name.trim(),
      entityType: payload.entityType,
      address: payload.address?.trim() || null,
      website: payload.website?.trim() || null,
      phone: payload.phone?.trim() || null,
    },
  });

  return entity;
};

/**
 * 2. Get paginated and searchable CRM entities strictly scoped to orgId
 */
const getEntities = async (orgId: string, options: ICRMQueryOptions) => {
  const page = Math.max(1, Number(options.page) || 1);
  const limit = Math.max(1, Math.min(100, Number(options.limit) || 20));
  const skip = (page - 1) * limit;

  const whereClause: any = { orgId };

  if (options.entityType) {
    whereClause.entityType = options.entityType;
  }

  if (options.search) {
    const search = options.search.trim();
    whereClause.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search, mode: 'insensitive' } },
      { address: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [entities, total] = await Promise.all([
    prisma.entityCRM.findMany({
      where: whereClause,
      include: {
        _count: {
          select: {
            clientProjects: true,
            auditeeProjects: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.entityCRM.count({ where: whereClause }),
  ]);

  const formatted = entities.map((e) => ({
    ...e,
    projectCount: e.entityType === 'CLIENT' ? e._count.clientProjects : e._count.auditeeProjects,
  }));

  return {
    data: formatted,
    pagination: {
      total,
      page,
      limit,
    },
  };
};

export const CRMService = {
  createEntity,
  getEntities,
};
