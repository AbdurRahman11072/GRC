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
      const rawOrgId =
        (Array.isArray(orgIdHeader) ? orgIdHeader[0] : orgIdHeader) ||
        req.params.orgId ||
        req.query.orgId ||
        req.body?.orgId;

      if (!rawOrgId || typeof rawOrgId !== 'string') {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          'Organization context required: please provide an x-org-id header or orgId parameter.'
        );
      }

      const orgId = rawOrgId.trim();

      // Check if organization exists
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

      // Verify caller is an active member of this organization
      const membership = await prisma.organizationMember.findUnique({
        where: {
          orgId_userId: {
            orgId: org.id,
            userId: req.user.userId,
          },
        },
      });

      if (!membership) {
        throw new AppError(
          httpStatus.FORBIDDEN,
          'Access denied: You are not a member of this organization.'
        );
      }

      req.orgId = org.id;
      req.orgRole = membership.orgRole;
      next();
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
