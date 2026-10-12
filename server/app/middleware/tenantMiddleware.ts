import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import { prisma } from '../../lib/prisma';
import { AppError } from '../error/AppError';
import { OrgRole } from '../../generated/prisma';

/**
 * Validates tenant context and caller membership.
 * Resolves orgId from:
 * 1. 'x-org-id' header
 * 2. req.params.orgId
 * 3. req.query.orgId
 * 4. req.body.orgId
 * 5. Automatic fallback to user's primary organization membership
 */
export const tenantMiddleware = () => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError(
          httpStatus.UNAUTHORIZED,
          'Authentication required before tenant resolution.'
        );
      }

      const orgIdHeader = req.headers['x-org-id'];
      let rawOrgId: string | undefined =
        (Array.isArray(orgIdHeader) ? orgIdHeader[0] : orgIdHeader) ||
        req.params.orgId ||
        (req.query.orgId as string | undefined) ||
        req.body?.orgId;

      // Filter out literal 'undefined', 'null', or empty strings
      if (typeof rawOrgId === 'string') {
        const trimmed = rawOrgId.trim();
        if (!trimmed || trimmed === 'undefined' || trimmed === 'null') {
          rawOrgId = undefined;
        } else {
          rawOrgId = trimmed;
        }
      }

      // If no explicit orgId is supplied in header/query/body, automatically resolve user's organization
      if (!rawOrgId) {
        // 1. Direct organization membership
        const primaryMembership = await prisma.organizationMember.findFirst({
          where: { userId: req.user.userId },
          orderBy: { createdAt: 'asc' },
          select: { orgId: true },
        });

        if (primaryMembership?.orgId) {
          rawOrgId = primaryMembership.orgId;
        } else {
          // 2. Project membership linking to an organization
          const projectMembership = await prisma.projectMember.findFirst({
            where: { userId: req.user.userId },
            select: { project: { select: { orgId: true } } },
          });

          if (projectMembership?.project?.orgId) {
            rawOrgId = projectMembership.project.orgId;
          } else {
            // 3. Organization created by the user
            const createdOrg = await prisma.organization.findFirst({
              where: { createdById: req.user.userId },
              select: { id: true },
            });

            if (createdOrg?.id) {
              rawOrgId = createdOrg.id;
            } else {
              // 4. Fallback to the latest available organization in the system
              const defaultOrg = await prisma.organization.findFirst({
                orderBy: { createdAt: 'desc' },
                select: { id: true },
              });
              if (defaultOrg?.id) {
                rawOrgId = defaultOrg.id;
              }
            }
          }
        }
      }

      if (!rawOrgId || typeof rawOrgId !== 'string') {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          'Organization context required: please provide an x-org-id header or orgId parameter.'
        );
      }

      const orgId = rawOrgId.trim();

      // Check if target organization exists
      const org = await prisma.organization.findUnique({
        where: { id: orgId },
        select: { id: true, orgName: true },
      });

      if (!org) {
        throw new AppError(httpStatus.NOT_FOUND, 'Target organization not found.');
      }

      // If caller is SuperAdmin, grant OWNER privileges globally
      if (req.user.isSuperAdmin) {
        req.orgId = org.id;
        req.orgRole = 'OWNER';
        return next();
      }

      // Check primary organization membership
      const membership = await prisma.organizationMember.findUnique({
        where: {
          orgId_userId: {
            orgId: org.id,
            userId: req.user.userId,
          },
        },
      });

      if (membership) {
        req.orgId = org.id;
        req.orgRole = membership.orgRole;
        return next();
      }

      // Check if user is a member of any project within this organization
      const projectMembership = await prisma.projectMember.findFirst({
        where: {
          userId: req.user.userId,
          project: { orgId: org.id },
        },
      });

      if (projectMembership) {
        req.orgId = org.id;
        req.orgRole = 'AUDITOR';
        return next();
      }

      // Check if user was the creator of the organization
      const createdOrg = await prisma.organization.findFirst({
        where: { id: org.id, createdById: req.user.userId },
      });

      if (createdOrg) {
        req.orgId = org.id;
        req.orgRole = 'OWNER';
        return next();
      }

      throw new AppError(
        httpStatus.FORBIDDEN,
        'Access denied: You are not a member of this organization.'
      );
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Enforces specific organization roles (e.g. OWNER, ADMIN, AUDITOR).
 * Automatically permits SuperAdmin.
 */
export const requireOrgRole = (...allowedRoles: OrgRole[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (req.user?.isSuperAdmin) {
      return next();
    }

    if (!req.orgRole) {
      return next(
        new AppError(
          httpStatus.INTERNAL_SERVER_ERROR,
          'tenantMiddleware must be executed before requireOrgRole.'
        )
      );
    }

    if (!allowedRoles.includes(req.orgRole)) {
      return next(
        new AppError(
          httpStatus.FORBIDDEN,
          `Forbidden: Insufficient organization privileges. Required: ${allowedRoles.join(', ')}`
        )
      );
    }

    next();
  };
};

export default tenantMiddleware;
