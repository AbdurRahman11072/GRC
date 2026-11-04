import httpStatus from 'http-status';
import { prisma } from '../../../lib/prisma';
import { AppError } from '../../error/AppError';
import { TeamBucket, ProjectRole } from '../../../generated/prisma';
import { hashPassword } from '../auth/auth.utils';

export interface IAddMemberPayload {
  userId?: string;
  name?: string;
  email?: string;
  password?: string;
  designation?: string;
  phone?: string;
  teamBucket?: TeamBucket;
  projectRole?: ProjectRole;
}

export const resolveRoleAndBucket = (
  role?: ProjectRole,
  bucket?: TeamBucket
): { teamBucket: TeamBucket; projectRole: ProjectRole } => {
  if (role) {
    if (role === 'ADMINISTRATOR') return { teamBucket: 'ADMINISTRATOR', projectRole: 'ADMINISTRATOR' };
    if (role === 'ADMIN') return { teamBucket: 'ADMINISTRATOR', projectRole: 'ADMIN' };
    if (role === 'PROJECT_MANAGER') return { teamBucket: 'ADMINISTRATOR', projectRole: 'PROJECT_MANAGER' };
    if (role === 'SUPERVISOR') return { teamBucket: 'ORG_MEMBER', projectRole: 'SUPERVISOR' };
    if (role === 'FIELD_MEMBER' || role === 'FIELD_TEAM') return { teamBucket: 'ORG_MEMBER', projectRole: 'FIELD_MEMBER' };
    if (role === 'CLIENT' || role === 'CLIENT_REPRESENTATIVE') return { teamBucket: 'CLIENT', projectRole: 'CLIENT' };
    if (role === 'AUDITEE' || role === 'AUDITEE_REPRESENTATIVE') return { teamBucket: 'AUDITEE', projectRole: 'AUDITEE' };
  }

  if (bucket === 'ADMINISTRATOR') return { teamBucket: 'ADMINISTRATOR', projectRole: 'PROJECT_MANAGER' };
  if (bucket === 'CLIENT') return { teamBucket: 'CLIENT', projectRole: 'CLIENT' };
  if (bucket === 'AUDITEE') return { teamBucket: 'AUDITEE', projectRole: 'AUDITEE' };
  return { teamBucket: 'ORG_MEMBER', projectRole: 'FIELD_MEMBER' };
};

const addMember = async (orgId: string, projectId: string, payload: IAddMemberPayload) => {
  const existingProject = await prisma.project.findFirst({
    where: { id: projectId, orgId, isDeleted: false },
  });
  if (!existingProject) throw new AppError(httpStatus.NOT_FOUND, 'Project not found');

  let targetUser: any = null;
  if (payload.userId) {
    targetUser = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!targetUser) throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  } else if (payload.email && payload.name) {
    const normalizedEmail = payload.email.toLowerCase().trim();
    targetUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!targetUser) {
      const plainPassword = payload.password?.trim() || 'Welcome@2026';
      const passwordHash = await hashPassword(plainPassword);
      targetUser = await prisma.user.create({
        data: {
          name: payload.name.trim(),
          email: normalizedEmail,
          passwordHash,
          designation: payload.designation?.trim() || null,
          phone: payload.phone?.trim() || null,
        },
      });
    }
    await prisma.organizationMember.upsert({
      where: { orgId_userId: { orgId, userId: targetUser.id } },
      create: { orgId, userId: targetUser.id, orgRole: 'AUDITOR' },
      update: {},
    });
  } else {
    throw new AppError(httpStatus.BAD_REQUEST, 'Either userId or user details required');
  }

  const existingMember = await prisma.projectMember.findFirst({
    where: { projectId, userId: targetUser.id },
  });
  if (existingMember) {
    throw new AppError(httpStatus.CONFLICT, `User '${targetUser.name}' is already assigned to this project.`);
  }

  const { teamBucket, projectRole } = resolveRoleAndBucket(payload.projectRole, payload.teamBucket);

  const member = await prisma.projectMember.create({
    data: { projectId, userId: targetUser.id, teamBucket, projectRole },
    include: {
      user: { select: { id: true, name: true, email: true, designation: true, phone: true } },
    },
  });

  return {
    ...member,
    provisionedPassword: payload.password?.trim() || (!payload.userId ? 'Welcome@2026' : undefined),
  };
};

const batchAddMembers = async (
  orgId: string,
  projectId: string,
  members: Array<{ userId: string; teamBucket?: TeamBucket; projectRole?: ProjectRole }>
) => {
  const existingProject = await prisma.project.findFirst({
    where: { id: projectId, orgId, isDeleted: false },
  });
  if (!existingProject) throw new AppError(httpStatus.NOT_FOUND, 'Project not found');

  const results: any[] = [];
  for (const item of members) {
    const user = await prisma.user.findUnique({
      where: { id: item.userId },
      select: { id: true, name: true, email: true },
    });
    if (!user) continue;

    const { teamBucket, projectRole } = resolveRoleAndBucket(item.projectRole, item.teamBucket);

    const member = await prisma.projectMember.upsert({
      where: { projectId_userId: { projectId, userId: item.userId } },
      update: { teamBucket, projectRole },
      create: { projectId, userId: item.userId, teamBucket, projectRole },
      include: {
        user: { select: { id: true, name: true, email: true, designation: true, phone: true } },
      },
    });
    results.push(member);
  }
  return { assignedCount: results.length, members: results };
};

const getMembers = async (orgId: string, projectId: string, options: { teamBucket?: TeamBucket }) => {
  const existingProject = await prisma.project.findFirst({
    where: { id: projectId, orgId, isDeleted: false },
  });
  if (!existingProject) throw new AppError(httpStatus.NOT_FOUND, 'Project not found');

  return prisma.projectMember.findMany({
    where: { projectId, ...(options.teamBucket ? { teamBucket: options.teamBucket } : {}) },
    orderBy: { createdAt: 'asc' },
    include: {
      user: { select: { id: true, name: true, email: true, designation: true, phone: true } },
    },
  });
};

const updateMember = async (
  orgId: string,
  projectId: string,
  memberId: string,
  payload: { teamBucket?: TeamBucket; projectRole?: ProjectRole }
) => {
  const existingProject = await prisma.project.findFirst({
    where: { id: projectId, orgId, isDeleted: false },
  });
  if (!existingProject) throw new AppError(httpStatus.NOT_FOUND, 'Project not found');

  const existingMember = await prisma.projectMember.findFirst({
    where: { id: memberId, projectId },
  });
  if (!existingMember) throw new AppError(httpStatus.NOT_FOUND, 'Member not found in this project');

  let targetRole = payload.projectRole ?? existingMember.projectRole;
  let targetBucket = payload.teamBucket ?? existingMember.teamBucket;

  if (payload.projectRole && !payload.teamBucket) {
    const resolved = resolveRoleAndBucket(payload.projectRole);
    targetBucket = resolved.teamBucket;
    targetRole = resolved.projectRole;
  } else if (payload.teamBucket && !payload.projectRole) {
    const resolved = resolveRoleAndBucket(undefined, payload.teamBucket);
    targetBucket = resolved.teamBucket;
    targetRole = resolved.projectRole;
  }

  return prisma.projectMember.update({
    where: { id: memberId },
    data: { teamBucket: targetBucket, projectRole: targetRole },
    include: {
      user: { select: { id: true, name: true, email: true, designation: true, phone: true } },
    },
  });
};

const deleteMember = async (orgId: string, projectId: string, memberId: string) => {
  const existingProject = await prisma.project.findFirst({
    where: { id: projectId, orgId, isDeleted: false },
  });
  if (!existingProject) throw new AppError(httpStatus.NOT_FOUND, 'Project not found');

  const existingMember = await prisma.projectMember.findFirst({
    where: { id: memberId, projectId },
    include: { user: { select: { name: true } } },
  });
  if (!existingMember) throw new AppError(httpStatus.NOT_FOUND, 'Member not found');

  await prisma.projectMember.delete({ where: { id: memberId } });
  return { success: true, message: `Member '${existingMember.user.name}' removed from project successfully` };
};

export const ProjectMemberService = {
  addMember,
  batchAddMembers,
  getMembers,
  updateMember,
  deleteMember,
};
