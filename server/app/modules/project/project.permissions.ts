import httpStatus from 'http-status';
import { prisma } from '../../../lib/prisma';
import { AppError } from '../../error/AppError';
import { ProjectRole, TeamBucket } from '../../../generated/prisma';

export interface IProjectUserContext {
  isOrgAdmin: boolean;
  projectRole: ProjectRole | null;
  teamBucket: TeamBucket | null;
  canCreateTor: boolean;
  canAssignDrt: boolean;
  canAwardMarks: boolean;
  canCheckDocument: boolean;
  canUploadDocument: boolean;
}

/**
 * Resolves the effective project permissions for a user in an organization and project.
 */
export const getProjectUserContext = async (
  orgId: string,
  projectId: string,
  userId: string
): Promise<IProjectUserContext> => {
  // 1. Check SuperAdmin or Organization Admin status
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isSuperAdmin: true },
  });

  const orgMember = await prisma.organizationMember.findUnique({
    where: { orgId_userId: { orgId, userId } },
    select: { orgRole: true },
  });

  const isOrgAdmin =
    !!user?.isSuperAdmin ||
    orgMember?.orgRole === 'OWNER' ||
    orgMember?.orgRole === 'ADMIN';

  // 2. Check Project-specific membership and role
  const projectMember = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
    select: { teamBucket: true, projectRole: true },
  });

  const projectRole = projectMember?.projectRole || null;
  const teamBucket = projectMember?.teamBucket || null;

  // 3. Compute authoritative capability flags
  const isManager = projectRole === 'PROJECT_MANAGER' || teamBucket === 'ADMINISTRATOR';
  const isSupervisor = projectRole === 'SUPERVISOR';
  const isFieldTeam = projectRole === 'FIELD_TEAM' || teamBucket === 'ORG_MEMBER';

  const canCreateTor = isOrgAdmin || isManager;
  const canAssignDrt = isOrgAdmin || isManager;
  const canAwardMarks = isOrgAdmin || isManager || isSupervisor;
  const canCheckDocument = isOrgAdmin || isManager || isSupervisor;
  const canUploadDocument = isOrgAdmin || isManager || isSupervisor || isFieldTeam;

  return {
    isOrgAdmin,
    projectRole,
    teamBucket,
    canCreateTor,
    canAssignDrt,
    canAwardMarks,
    canCheckDocument,
    canUploadDocument,
  };
};

/**
 * Asserts that the user has permission to create/manage ToR WBS nodes.
 */
export const assertCanCreateTor = async (
  orgId: string,
  projectId: string,
  userId: string
) => {
  const ctx = await getProjectUserContext(orgId, projectId, userId);
  if (!ctx.canCreateTor) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'Permission denied. Only Organization Admins and Project Managers can create or modify Terms of Reference (ToR).'
    );
  }
  return ctx;
};

/**
 * Asserts that the user has permission to assign DRT tasks and supervisors.
 */
export const assertCanAssignDrt = async (
  orgId: string,
  projectId: string,
  userId: string
) => {
  const ctx = await getProjectUserContext(orgId, projectId, userId);
  if (!ctx.canAssignDrt) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'Permission denied. Only Organization Admins and Project Managers can assign DRT tasks and designate supervisors.'
    );
  }
  return ctx;
};

/**
 * Asserts that the user has permission to award Data Collection and Analysis marks.
 */
export const assertCanAwardMarks = async (
  orgId: string,
  projectId: string,
  userId: string
) => {
  const ctx = await getProjectUserContext(orgId, projectId, userId);
  if (!ctx.canAwardMarks) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'Permission denied. Field team members cannot award marks. Only Supervisors, Project Managers, and Admins can allocate marks.'
    );
  }
  return ctx;
};

/**
 * Asserts that the user has permission to check/verify documents (ACCEPT or REJECT).
 */
export const assertCanCheckDocument = async (
  orgId: string,
  projectId: string,
  userId: string
) => {
  const ctx = await getProjectUserContext(orgId, projectId, userId);
  if (!ctx.canCheckDocument) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'Permission denied. Field team members cannot check documents. Only Supervisors, Project Managers, and Admins can verify documents.'
    );
  }
  return ctx;
};
