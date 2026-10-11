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

export const CRMRoutes = router;
export default router;
