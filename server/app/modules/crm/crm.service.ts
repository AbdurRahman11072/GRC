import httpStatus from 'http-status';
import { prisma } from '../../../lib/prisma';
import { AppError } from '../../error/AppError';
import { CRMEntityType } from '../../../generated/prisma';
import { hashPassword } from '../auth/auth.utils';

export interface ICreateCRMEntityPayload {
  name: string;
  entityType: CRMEntityType;
  address?: string;
  website?: string;
  phone?: string;
}

export interface IUpdateCRMEntityPayload {
  name?: string;
  entityType?: CRMEntityType;
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

/**
 * 3. Get single CRM entity by ID (with linked projects)
 */
const getEntityById = async (orgId: string, entityId: string) => {
  const entity = await prisma.entityCRM.findUnique({
    where: { id: entityId },
    include: {
      clientProjects: {
        select: {
          id: true,
          projectName: true,
          projectType: true,
          status: true,
          createdAt: true,
        },
      },
      auditeeProjects: {
        select: {
          id: true,
          projectName: true,
          projectType: true,
          status: true,
          createdAt: true,
        },
      },
    },
  });

  if (!entity || entity.orgId !== orgId) {
    throw new AppError(httpStatus.NOT_FOUND, 'CRM entity not found');
  }

  const linkedProjects =
    entity.entityType === 'CLIENT' ? entity.clientProjects : entity.auditeeProjects;

  return {
    ...entity,
    projects: linkedProjects,
    projectCount: linkedProjects.length,
  };
};

/**
 * 4. Update CRM entity details
 */
const updateEntity = async (
  orgId: string,
  entityId: string,
  payload: IUpdateCRMEntityPayload
) => {
  const entity = await prisma.entityCRM.findUnique({
    where: { id: entityId },
  });

  if (!entity || entity.orgId !== orgId) {
    throw new AppError(httpStatus.NOT_FOUND, 'CRM entity not found');
  }

  const updated = await prisma.entityCRM.update({
    where: { id: entityId },
    data: {
      ...(payload.name !== undefined ? { name: payload.name.trim() } : {}),
      ...(payload.entityType !== undefined ? { entityType: payload.entityType } : {}),
      ...(payload.address !== undefined ? { address: payload.address?.trim() || null } : {}),
      ...(payload.website !== undefined ? { website: payload.website?.trim() || null } : {}),
      ...(payload.phone !== undefined ? { phone: payload.phone?.trim() || null } : {}),
    },
  });

  return updated;
};

/**
 * 5. Delete CRM entity (with safety check on active linked projects)
 */
const deleteEntity = async (orgId: string, entityId: string) => {
  const entity = await prisma.entityCRM.findUnique({
    where: { id: entityId },
    include: {
      clientProjects: { select: { id: true } },
      auditeeProjects: { select: { id: true } },
    },
  });

  if (!entity || entity.orgId !== orgId) {
    throw new AppError(httpStatus.NOT_FOUND, 'CRM entity not found');
  }

  const totalProjects =
    entity.clientProjects.length + entity.auditeeProjects.length;

  if (totalProjects > 0) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Cannot delete CRM entity: it is currently referenced by ${totalProjects} active project(s). Reassign or archive those projects first.`
    );
  }

  await prisma.entityCRM.delete({
    where: { id: entityId },
  });

  return {
    success: true,
    message: 'CRM entity deleted successfully',
  };
};

export interface ICreateEntityContactPayload {
  name: string;
  email: string;
  phone?: string;
  designation?: string;
  department?: string;
  password?: string;
}

/**
 * 6. Create or link a focal contact / department representative for a CRM entity
 */
const createEntityContact = async (
  orgId: string,
  entityId: string,
  payload: ICreateEntityContactPayload
) => {
  const entity = await prisma.entityCRM.findUnique({
    where: { id: entityId },
  });

  if (!entity || entity.orgId !== orgId) {
    throw new AppError(httpStatus.NOT_FOUND, 'CRM entity not found');
  }

  const normalizedEmail = payload.email.toLowerCase().trim();

  // Check if contact already exists for this entity
  const existingContact = await prisma.entityContact.findUnique({
    where: {
      entityId_email: {
        entityId,
        email: normalizedEmail,
      },
    },
  });

  if (existingContact) {
    throw new AppError(
      httpStatus.CONFLICT,
      `A contact with email '${normalizedEmail}' already exists for this entity.`
    );
  }

  // Find or create User account for this contact so they can sign in
  let user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  const plainPassword = payload.password?.trim() || 'Welcome@2026';
  let isNewUser = false;

  if (!user) {
    const passwordHash = await hashPassword(plainPassword);
    user = await prisma.user.create({
      data: {
        name: payload.name.trim(),
        email: normalizedEmail,
        passwordHash,
        designation: payload.designation?.trim() || null,
        phone: payload.phone?.trim() || null,
      },
    });
    isNewUser = true;
  }

  const contact = await prisma.entityContact.create({
    data: {
      entityId,
      userId: user.id,
      name: payload.name.trim(),
      email: normalizedEmail,
      phone: payload.phone?.trim() || null,
      designation: payload.designation?.trim() || null,
      department: payload.department?.trim() || null,
    },
    include: {
      entity: {
        select: {
          id: true,
          name: true,
          entityType: true,
        },
      },
    },
  });

  return {
    ...contact,
    isNewUser,
    provisionedPassword: isNewUser ? plainPassword : undefined,
  };
};

/**
 * 7. Get contacts for a CRM entity (with optional department filter)
 */
const getEntityContacts = async (
  orgId: string,
  entityId: string,
  options?: { department?: string; search?: string }
) => {
  const entity = await prisma.entityCRM.findUnique({
    where: { id: entityId },
  });

  if (!entity || entity.orgId !== orgId) {
    throw new AppError(httpStatus.NOT_FOUND, 'CRM entity not found');
  }

  const whereClause: any = { entityId };

  if (options?.department) {
    whereClause.department = options.department;
  }

  if (options?.search) {
    const search = options.search.trim();
    whereClause.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { designation: { contains: search, mode: 'insensitive' } },
    ];
  }

  const contacts = await prisma.entityContact.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
  });

  return contacts;
};

/**
 * 8. Delete a contact from a CRM entity
 */
const deleteEntityContact = async (
  orgId: string,
  entityId: string,
  contactId: string
) => {
  const entity = await prisma.entityCRM.findUnique({
    where: { id: entityId },
  });

  if (!entity || entity.orgId !== orgId) {
    throw new AppError(httpStatus.NOT_FOUND, 'CRM entity not found');
  }

  const contact = await prisma.entityContact.findFirst({
    where: { id: contactId, entityId },
  });

  if (!contact) {
    throw new AppError(httpStatus.NOT_FOUND, 'Contact not found for this entity');
  }

  await prisma.entityContact.delete({
    where: { id: contactId },
  });

  return {
    success: true,
    message: 'Contact deleted successfully',
  };
};

export const CRMService = {
  createEntity,
  getEntities,
  getEntityById,
  updateEntity,
  deleteEntity,
  createEntityContact,
  getEntityContacts,
  deleteEntityContact,
};

