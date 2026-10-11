import { Router } from 'express';
import { authMiddleware } from '../../middleware/authMiddleware';
import { tenantMiddleware, requireOrgRole } from '../../middleware/tenantMiddleware';
import { validateRequest } from '../../middleware/validateRequest';
import { OrganizationValidation } from './organization.validation';
import { OrganizationController } from './organization.controller';

const router = Router();

// Create new organization (caller becomes OWNER)
router.post(
  '/',
  authMiddleware(),
  validateRequest(OrganizationValidation.createOrgValidationSchema),
  OrganizationController.createOrganization
);

// Get all organizations where caller is a member
router.get('/', authMiddleware(), OrganizationController.getMyOrganizations);

// Get single organization by ID (scoped to member or SuperAdmin)
router.get(
  '/:id',
  authMiddleware(),
  validateRequest(OrganizationValidation.getOrgByIdValidationSchema),
  OrganizationController.getOrganizationById
);

// Update organization details (OWNER or ADMIN)
router.patch(
  '/:id',
  authMiddleware(),
  validateRequest(OrganizationValidation.updateOrgValidationSchema),
  OrganizationController.updateOrganization
);

// -----------------------------------------------------------------------------
// Member Management Endpoints
// -----------------------------------------------------------------------------

// List members of organization
router.get(
  '/:id/members',
  authMiddleware(),
  tenantMiddleware(),
  validateRequest(OrganizationValidation.getMembersValidationSchema),
  OrganizationController.getOrganizationMembers
);

// Update member role (OWNER or ADMIN only)
router.patch(
  '/:id/members/:memberId',
  authMiddleware(),
  tenantMiddleware(),
  requireOrgRole('OWNER', 'ADMIN'),
  validateRequest(OrganizationValidation.updateMemberRoleValidationSchema),
  OrganizationController.updateMemberRole
);

// Remove member from organization (OWNER or ADMIN only)
router.delete(
  '/:id/members/:memberId',
  authMiddleware(),
  tenantMiddleware(),
  requireOrgRole('OWNER', 'ADMIN'),
  validateRequest(OrganizationValidation.removeMemberValidationSchema),
  OrganizationController.removeMember
);

export const OrganizationRoutes = router;
export default router;

