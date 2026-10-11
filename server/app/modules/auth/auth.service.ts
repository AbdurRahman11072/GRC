import httpStatus from 'http-status';
import { prisma } from '../../../lib/prisma';
import { AppError } from '../../error/AppError';
import { hashPassword, generateAuthTokens } from './auth.utils';
import type { IAuthTokens, IUserProfile } from './auth.interface';

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

export const AuthService = {
  registerUser,
};
