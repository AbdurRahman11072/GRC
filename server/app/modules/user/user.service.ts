import httpStatus from 'http-status';
import { prisma } from '../../../lib/prisma';
import { AppError } from '../../error/AppError';
import { OrgRole } from '@prisma/client';

export interface IUpdateProfilePayload {
  name?: string;
  phone?: string;
  nid?: string;
  designation?: string;
}

export interface IAdminUpdateUserPayload {
  name?: string;
  phone?: string;
  nid?: string;
  designation?: string;
  isActive?: boolean;
  orgId?: string;
  orgRole?: OrgRole;
}

export interface IPaginationOptions {
  page?: number;
  limit?: number;
  search?: string;
  role?: OrgRole;
}

const safeUserSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  nid: true,
  designation: true,
  isActive: true,
  isSuperAdmin: true,
  createdAt: true,
  updatedAt: true,
};

/**
 * 1. Get all users belonging to an Organization (scoped to org members or SuperAdmin)
 */
const getUsersByOrg = async (
  callerUserId: string,
  callerIsSuperAdmin: boolean,
  orgId: string,
  options: IPaginationOptions
) => {
  // Verify target organization exists
  const targetOrg = await prisma.organization.findUnique({
    where: { id: orgId },
  });

  if (!targetOrg) {
    throw new AppError(httpStatus.NOT_FOUND, 'Organization not found');
  }

  // Caller authorization: must be member of the org or SuperAdmin
  if (!callerIsSuperAdmin) {
    const callerMembership = await prisma.organizationMember.findUnique({
      where: {
        orgId_userId: {
          orgId,
          userId: callerUserId,
        },
      },
    });

    if (!callerMembership) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        'Access denied. You are not a member of this organization.'
      );
    }
  }

  const page = Math.max(1, Number(options.page) || 1);
  const limit = Math.max(1, Math.min(100, Number(options.limit) || 20));
  const skip = (page - 1) * limit;

  const whereClause: any = {
    orgId,
  };

  if (options.role) {
    whereClause.orgRole = options.role;
  }

  if (options.search) {
    const search = options.search.trim();
    whereClause.user = {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { designation: { contains: search, mode: 'insensitive' } },
      ],
    };
  }

  const [members, total] = await Promise.all([
    prisma.organizationMember.findMany({
      where: whereClause,
      select: {
        id: true,
        orgId: true,
        orgRole: true,
        createdAt: true,
        user: {
          select: safeUserSelect,
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.organizationMember.count({ where: whereClause }),
  ]);

  const formattedMembers = members.map((m) => ({
    membershipId: m.id,
    orgId: m.orgId,
    orgRole: m.orgRole,
    joinedAt: m.createdAt,
    ...m.user,
  }));

  return {
    data: formattedMembers,
    pagination: {
      total,
      page,
      limit,
    },
  };
};

/**
 * 2. Self-update profile (authenticated user updates their own info)
 */
const updateProfile = async (userId: string, payload: IUpdateProfilePayload) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(payload.name !== undefined ? { name: payload.name.trim() } : {}),
      ...(payload.phone !== undefined ? { phone: payload.phone?.trim() || null } : {}),
      ...(payload.nid !== undefined ? { nid: payload.nid?.trim() || null } : {}),
      ...(payload.designation !== undefined
        ? { designation: payload.designation?.trim() || null }
        : {}),
    },
    select: safeUserSelect,
  });

  return updatedUser;
};

/**
 * 3. Admin updates user information (Org Admin/Owner or SuperAdmin)
 */
const adminUpdateUser = async (
  callerUserId: string,
  callerIsSuperAdmin: boolean,
  targetUserId: string,
  payload: IAdminUpdateUserPayload
) => {
  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
  });

  if (!targetUser) {
    throw new AppError(httpStatus.NOT_FOUND, 'Target user not found');
  }

  // If orgId is provided, enforce that caller is OWNER or ADMIN in that org
  if (payload.orgId && !callerIsSuperAdmin) {
    const callerMembership = await prisma.organizationMember.findUnique({
      where: {
        orgId_userId: {
          orgId: payload.orgId,
          userId: callerUserId,
        },
      },
    });

    if (
      !callerMembership ||
      (callerMembership.orgRole !== 'OWNER' && callerMembership.orgRole !== 'ADMIN')
    ) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        'You must be an Organization Owner or Admin to update user information for this organization.'
      );
    }
  } else if (!payload.orgId && !callerIsSuperAdmin) {
    // If no orgId is passed and not SuperAdmin, caller can only edit within their shared org
    const sharedMemberships = await prisma.organizationMember.findMany({
      where: {
        userId: callerUserId,
        orgRole: { in: ['OWNER', 'ADMIN'] },
      },
      select: { orgId: true },
    });

    const sharedOrgIds = sharedMemberships.map((m) => m.orgId);
    const targetInSharedOrg = await prisma.organizationMember.findFirst({
      where: {
        userId: targetUserId,
        orgId: { in: sharedOrgIds },
      },
    });

    if (!targetInSharedOrg) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        'Access denied. You can only update users within organizations you administer.'
      );
    }
  }

  // Update orgRole if requested
  if (payload.orgId && payload.orgRole) {
    await prisma.organizationMember.update({
      where: {
        orgId_userId: {
          orgId: payload.orgId,
          userId: targetUserId,
        },
      },
      data: {
        orgRole: payload.orgRole,
      },
    });
  }

  // Update user profile fields
  const updatedUser = await prisma.user.update({
    where: { id: targetUserId },
    data: {
      ...(payload.name !== undefined ? { name: payload.name.trim() } : {}),
      ...(payload.phone !== undefined ? { phone: payload.phone?.trim() || null } : {}),
      ...(payload.nid !== undefined ? { nid: payload.nid?.trim() || null } : {}),
      ...(payload.designation !== undefined
        ? { designation: payload.designation?.trim() || null }
        : {}),
      ...(payload.isActive !== undefined ? { isActive: payload.isActive } : {}),
    },
    select: {
      ...safeUserSelect,
      orgMemberships: {
        select: {
          orgId: true,
          orgRole: true,
          organization: {
            select: { id: true, orgName: true },
          },
        },
      },
    },
  });

  return updatedUser;
};

/**
 * 4. Get all system users (SuperAdmin only)
 */
const getAllUsers = async (
  callerIsSuperAdmin: boolean,
  options: { page?: number; limit?: number; search?: string }
) => {
  if (!callerIsSuperAdmin) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'SuperAdmin privilege is required to retrieve all system users.'
    );
  }

  const page = Math.max(1, Number(options.page) || 1);
  const limit = Math.max(1, Math.min(100, Number(options.limit) || 20));
  const skip = (page - 1) * limit;

  const whereClause: any = {};
  if (options.search) {
    const search = options.search.trim();
    whereClause.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { designation: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where: whereClause,
      select: {
        ...safeUserSelect,
        orgMemberships: {
          select: {
            orgId: true,
            orgRole: true,
            organization: {
              select: { id: true, orgName: true, orgType: true },
            },
          },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where: whereClause }),
  ]);

  return {
    data: users,
    pagination: {
      total,
      page,
      limit,
    },
  };
};

export const UserService = {
  getUsersByOrg,
  updateProfile,
  adminUpdateUser,
  getAllUsers,
};
