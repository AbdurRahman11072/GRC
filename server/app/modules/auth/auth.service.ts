import httpStatus from 'http-status';
import { prisma } from '../../../lib/prisma';
import { AppError } from '../../error/AppError';
import { hashPassword, verifyPassword, generateAuthTokens } from './auth.utils';
import type {
  IAuthTokens,
  IUserProfile,
  ILoginPayload,
  ILoginResponse,
  IUserOrgMembership,
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

export const AuthService = {
  registerUser,
  loginUser,
};
