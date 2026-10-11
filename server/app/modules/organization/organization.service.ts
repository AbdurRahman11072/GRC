import httpStatus from 'http-status';
import { prisma } from '../../../lib/prisma';
import { AppError } from '../../error/AppError';

export interface ICreateOrgPayload {
  orgName: string;
  orgType: string;
  orgAddress?: string;
  orgPhone?: string;
  orgEmail?: string;
  orgWebsite?: string;
  orgLinkedIn?: string;
  numberOfEmployee?: number;
}

export interface IUpdateOrgPayload {
  orgName?: string;
  orgType?: string;
  orgAddress?: string;
  orgPhone?: string;
  orgEmail?: string;
  orgWebsite?: string;
  orgLinkedIn?: string;
  numberOfEmployee?: number;
}

/**
 * 1. Create a new organization and assign creator as OWNER
 */
const createOrganization = async (userId: string, payload: ICreateOrgPayload) => {
  const result = await prisma.$transaction(async (tx) => {
    const org = await tx.organization.create({
      data: {
        orgName: payload.orgName.trim(),
        orgType: payload.orgType,
        orgAddress: payload.orgAddress?.trim() || null,
        orgPhone: payload.orgPhone?.trim() || null,
        orgEmail: payload.orgEmail?.toLowerCase().trim() || null,
        orgWebsite: payload.orgWebsite?.trim() || null,
        orgLinkedIn: payload.orgLinkedIn?.trim() || null,
        numberOfEmployee: payload.numberOfEmployee || null,
        createdById: userId,
      },
    });

    const membership = await tx.organizationMember.create({
      data: {
        orgId: org.id,
        userId,
        orgRole: 'OWNER',
      },
    });

    return { org, membership };
  });

  return {
    ...result.org,
    myRole: result.membership.orgRole,
  };
};

/**
 * 2. Get all organizations where caller is a member
 */
const getMyOrganizations = async (userId: string) => {
  const memberships = await prisma.organizationMember.findMany({
    where: { userId },
    include: {
      organization: {
        include: {
          _count: {
            select: {
              members: true,
              projects: true,
              crmEntities: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return memberships.map((m) => ({
    ...m.organization,
    myRole: m.orgRole,
    memberCount: m.organization._count.members,
    projectCount: m.organization._count.projects,
    crmCount: m.organization._count.crmEntities,
  }));
};

/**
 * 3. Get single organization details (scoped to members or SuperAdmin)
 */
const getOrganizationById = async (
  userId: string,
  callerIsSuperAdmin: boolean,
  orgId: string
) => {
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      _count: {
        select: {
          members: true,
          projects: true,
          crmEntities: true,
        },
      },
    },
  });

  if (!org) {
    throw new AppError(httpStatus.NOT_FOUND, 'Organization not found');
  }

  // Caller authorization: must be member of the org or SuperAdmin
  let callerRole: string | null = null;

  if (!callerIsSuperAdmin) {
    const membership = await prisma.organizationMember.findUnique({
      where: {
        orgId_userId: {
          orgId,
          userId,
        },
      },
    });

    if (!membership) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        'Access denied. You are not a member of this organization.'
      );
    }

    callerRole = membership.orgRole;
  } else {
    callerRole = 'SUPERADMIN';
  }

  return {
    ...org,
    myRole: callerRole,
    memberCount: org._count.members,
    projectCount: org._count.projects,
    crmCount: org._count.crmEntities,
  };
};

/**
 * 4. Update organization details (OWNER or ADMIN only, or SuperAdmin)
 */
const updateOrganization = async (
  userId: string,
  callerIsSuperAdmin: boolean,
  orgId: string,
  payload: IUpdateOrgPayload
) => {
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
  });

  if (!org) {
    throw new AppError(httpStatus.NOT_FOUND, 'Organization not found');
  }

  if (!callerIsSuperAdmin) {
    const membership = await prisma.organizationMember.findUnique({
      where: {
        orgId_userId: {
          orgId,
          userId,
        },
      },
    });

    if (!membership || (membership.orgRole !== 'OWNER' && membership.orgRole !== 'ADMIN')) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        'Access denied. Organization Owner or Admin role required.'
      );
    }
  }

  const updatedOrg = await prisma.organization.update({
    where: { id: orgId },
    data: {
      ...(payload.orgName !== undefined ? { orgName: payload.orgName.trim() } : {}),
      ...(payload.orgType !== undefined ? { orgType: payload.orgType } : {}),
      ...(payload.orgAddress !== undefined ? { orgAddress: payload.orgAddress?.trim() || null } : {}),
      ...(payload.orgPhone !== undefined ? { orgPhone: payload.orgPhone?.trim() || null } : {}),
      ...(payload.orgEmail !== undefined
        ? { orgEmail: payload.orgEmail?.toLowerCase().trim() || null }
        : {}),
      ...(payload.orgWebsite !== undefined ? { orgWebsite: payload.orgWebsite?.trim() || null } : {}),
      ...(payload.orgLinkedIn !== undefined ? { orgLinkedIn: payload.orgLinkedIn?.trim() || null } : {}),
      ...(payload.numberOfEmployee !== undefined
        ? { numberOfEmployee: payload.numberOfEmployee }
        : {}),
    },
  });

  return updatedOrg;
};

export const OrganizationService = {
  createOrganization,
  getMyOrganizations,
  getOrganizationById,
  updateOrganization,
};
