import { Router } from 'express';
import { authMiddleware } from '../../middleware/authMiddleware';
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

export const OrganizationRoutes = router;
export default router;
