import httpStatus from 'http-status';
import { prisma } from '../../../lib/prisma';
import { AppError } from '../../error/AppError';
import {
  hashPassword,
  verifyPassword,
  generateAuthTokens,
  verifyRefreshToken,
} from './auth.utils';
import type {
  IAuthTokens,
  IUserProfile,
  ILoginPayload,
  ILoginResponse,
  IUserOrgMembership,
  IProvisionUserPayload,
  IProvisionUserResponse,
} from './auth.interface';

export interface IRegisterUserPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
  nid?: string;
  designation?: string;
  organization?: {
    orgName: string;
    orgType: string;
    orgAddress?: string;
    orgPhone?: string;
    orgEmail?: string;
    orgWebsite?: string;
    numberOfEmployee?: number;
  };
}

export interface IRegisterResponse {
  user: IUserProfile;
  organization?: {
    id: string;
    orgName: string;
    orgType: string;
    role: string;
  };
  tokens: IAuthTokens;
}

const registerUser = async (payload: IRegisterUserPayload): Promise<IRegisterResponse> => {
  const normalizedEmail = payload.email.toLowerCase().trim();

  // 1. Check if email already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    throw new AppError(httpStatus.CONFLICT, 'A user with this email address already exists');
  }

  // 2. Hash password with Argon2
  const passwordHash = await hashPassword(payload.password);

  // 3. Atomically create User and optional Organization + OrganizationMember (OWNER)
  const result = await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: {
        name: payload.name.trim(),
        email: normalizedEmail,
        passwordHash,
        phone: payload.phone?.trim() || null,
        nid: payload.nid?.trim() || null,
        designation: payload.designation?.trim() || null,
      },
    });

    let createdOrg = null;

    if (payload.organization) {
      createdOrg = await tx.organization.create({
        data: {
          orgName: payload.organization.orgName.trim(),
          orgType: payload.organization.orgType,
          orgAddress: payload.organization.orgAddress?.trim() || null,
          orgPhone: payload.organization.orgPhone?.trim() || null,
          orgEmail: payload.organization.orgEmail?.toLowerCase().trim() || null,
          orgWebsite: payload.organization.orgWebsite?.trim() || null,
          numberOfEmployee: payload.organization.numberOfEmployee || null,
          createdById: newUser.id,
        },
      });

      await tx.organizationMember.create({
        data: {
          orgId: createdOrg.id,
          userId: newUser.id,
          orgRole: 'OWNER',
        },
      });
    }

    return { user: newUser, organization: createdOrg };
  });

  // 4. Generate Auth Tokens
  const tokens = generateAuthTokens({
    userId: result.user.id,
    email: result.user.email,
    isSuperAdmin: result.user.isSuperAdmin,
  });

  const userProfile: IUserProfile = {
    id: result.user.id,
    email: result.user.email,
    name: result.user.name,
    phone: result.user.phone,
    nid: result.user.nid,
    designation: result.user.designation,
    isSuperAdmin: result.user.isSuperAdmin,
    isActive: result.user.isActive,
    createdAt: result.user.createdAt,
    updatedAt: result.user.updatedAt,
  };

  return {
    user: userProfile,
    organization: result.organization
      ? {
          id: result.organization.id,
          orgName: result.organization.orgName,
          orgType: result.organization.orgType,
          role: 'OWNER',
        }
      : undefined,
    tokens,
  };
};

const loginUser = async (payload: ILoginPayload): Promise<ILoginResponse> => {
  const normalizedEmail = payload.email.toLowerCase().trim();

  // 1. Find user by email including their organization memberships
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    include: {
      orgMemberships: {
        include: {
          organization: {
            select: {
              id: true,
              orgName: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid email or password');
  }

  // 2. Check if account is active
  if (!user.isActive) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'Your account has been deactivated. Please contact your organization administrator.'
    );
  }

  // 3. Verify password hash with Argon2
  const isPasswordValid = await verifyPassword(payload.password, user.passwordHash);

  if (!isPasswordValid) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid email or password');
  }

  // 4. Generate Auth Tokens
  const tokens = generateAuthTokens({
    userId: user.id,
    email: user.email,
    isSuperAdmin: user.isSuperAdmin,
  });

  const userProfile: IUserProfile = {
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone,
    nid: user.nid,
    designation: user.designation,
    isSuperAdmin: user.isSuperAdmin,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  const organizations: IUserOrgMembership[] = user.orgMemberships.map((membership) => ({
    orgId: membership.orgId,
    orgName: membership.organization.orgName,
    orgRole: membership.orgRole,
  }));

  return {
    user: userProfile,
    organizations,
    tokens,
  };
};

const refreshAuthTokens = async (tokenString: string): Promise<IAuthTokens> => {
  const decoded = verifyRefreshToken(tokenString);

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    select: { id: true, email: true, isActive: true, isSuperAdmin: true },
  });

  if (!user) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'User no longer exists');
  }

  if (!user.isActive) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'Your account has been deactivated. Please contact your organization administrator.'
    );
  }

  return generateAuthTokens({
    userId: user.id,
    email: user.email,
    isSuperAdmin: user.isSuperAdmin,
  });
};

const getMe = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      nid: true,
      designation: true,
      isSuperAdmin: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      orgMemberships: {
        select: {
          id: true,
          orgId: true,
          orgRole: true,
          organization: {
            select: {
              id: true,
              orgName: true,
              orgType: true,
            },
          },
        },
      },
      projectMemberships: {
        select: {
          id: true,
          projectId: true,
          teamBucket: true,
          departmentId: true,
          project: {
            select: {
              id: true,
              projectName: true,
              projectType: true,
              status: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  return user;
};

const provisionUser = async (
  callerUserId: string,
  callerIsSuperAdmin: boolean,
  payload: IProvisionUserPayload
): Promise<IProvisionUserResponse> => {
  const normalizedEmail = payload.email.toLowerCase().trim();

  // 1. Verify caller has permission (Must be SuperAdmin OR Org OWNER/ADMIN in targeted orgId)
  if (!callerIsSuperAdmin) {
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
        'You do not have permission to provision users for this organization. Admin or Owner role required.'
      );
    }
  }

  // 2. Verify target organization exists
  const targetOrg = await prisma.organization.findUnique({
    where: { id: payload.orgId },
  });

  if (!targetOrg) {
    throw new AppError(httpStatus.NOT_FOUND, 'Target organization not found');
  }

  // 3. Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    // Check if user is already a member of this organization
    const existingMembership = await prisma.organizationMember.findUnique({
      where: {
        orgId_userId: {
          orgId: payload.orgId,
          userId: existingUser.id,
        },
      },
    });

    if (existingMembership) {
      throw new AppError(
        httpStatus.CONFLICT,
        'User is already a member of this organization'
      );
    }

    // Add existing user to organization
    const membership = await prisma.organizationMember.create({
      data: {
        orgId: payload.orgId,
        userId: existingUser.id,
        orgRole: payload.orgRole,
      },
    });

    return {
      user: {
        id: existingUser.id,
        email: existingUser.email,
        name: existingUser.name,
        phone: existingUser.phone,
        nid: existingUser.nid,
        designation: existingUser.designation,
        isSuperAdmin: existingUser.isSuperAdmin,
        isActive: existingUser.isActive,
        createdAt: existingUser.createdAt,
        updatedAt: existingUser.updatedAt,
      },
      membership: {
        orgId: membership.orgId,
        orgRole: membership.orgRole,
        isExistingUser: true,
      },
    };
  }

  // 4. Create new user with temporary password and assign to organization
  const passwordHash = await hashPassword(payload.password);

  const result = await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        name: payload.name.trim(),
        phone: payload.phone?.trim() || null,
        nid: payload.nid?.trim() || null,
        designation: payload.designation?.trim() || null,
      },
    });

    const membership = await tx.organizationMember.create({
      data: {
        orgId: payload.orgId,
        userId: newUser.id,
        orgRole: payload.orgRole,
      },
    });

    return { user: newUser, membership };
  });

  return {
    user: {
      id: result.user.id,
      email: result.user.email,
      name: result.user.name,
      phone: result.user.phone,
      nid: result.user.nid,
      designation: result.user.designation,
      isSuperAdmin: result.user.isSuperAdmin,
      isActive: result.user.isActive,
      createdAt: result.user.createdAt,
      updatedAt: result.user.updatedAt,
    },
    membership: {
      orgId: result.membership.orgId,
      orgRole: result.membership.orgRole,
      isExistingUser: false,
    },
  };
};

export const AuthService = {
  registerUser,
  loginUser,
  refreshAuthTokens,
  getMe,
  provisionUser,
};


