import { Router } from 'express';
import { authMiddleware } from '../../middleware/authMiddleware';
import { tenantMiddleware, requireOrgRole } from '../../middleware/tenantMiddleware';
import { validateRequest } from '../../middleware/validateRequest';
import { CRMValidation } from './crm.validation';
import { CRMController } from './crm.controller';

const router = Router();

// Create CRM entity (OWNER, ADMIN, AUDITOR)
router.post(
  '/entities',
  authMiddleware(),
  tenantMiddleware(),
  requireOrgRole('OWNER', 'ADMIN', 'AUDITOR'),
  validateRequest(CRMValidation.createEntityValidationSchema),
  CRMController.createEntity
);

// List CRM entities (scoped to tenant orgId)
router.get(
  '/entities',
  authMiddleware(),
  tenantMiddleware(),
  validateRequest(CRMValidation.getEntitiesValidationSchema),
  CRMController.getEntities
);

// Get CRM entity by ID
router.get(
  '/entities/:id',
  authMiddleware(),
  tenantMiddleware(),
  validateRequest(CRMValidation.getEntityByIdValidationSchema),
  CRMController.getEntityById
);

// Update CRM entity (OWNER, ADMIN, AUDITOR)
router.patch(
  '/entities/:id',
  authMiddleware(),
  tenantMiddleware(),
  requireOrgRole('OWNER', 'ADMIN', 'AUDITOR'),
  validateRequest(CRMValidation.updateEntityValidationSchema),
  CRMController.updateEntity
);

// Delete CRM entity (OWNER, ADMIN)
router.delete(
  '/entities/:id',
  authMiddleware(),
  tenantMiddleware(),
  requireOrgRole('OWNER', 'ADMIN'),
  validateRequest(CRMValidation.deleteEntityValidationSchema),
  CRMController.deleteEntity
);

export const CRMRoutes = router;
export default router;
