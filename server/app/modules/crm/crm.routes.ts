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

// -----------------------------------------------------------------------------
// Entity Contacts & Department Representatives
// -----------------------------------------------------------------------------

// Add contact to CRM entity
router.post(
  '/entities/:id/contacts',
  authMiddleware(),
  tenantMiddleware(),
  requireOrgRole('OWNER', 'ADMIN', 'AUDITOR'),
  validateRequest(CRMValidation.createContactValidationSchema),
  CRMController.createEntityContact
);

// Get contacts of CRM entity
router.get(
  '/entities/:id/contacts',
  authMiddleware(),
  tenantMiddleware(),
  validateRequest(CRMValidation.getContactsValidationSchema),
  CRMController.getEntityContacts
);

// Delete contact from CRM entity
router.delete(
  '/entities/:id/contacts/:contactId',
  authMiddleware(),
  tenantMiddleware(),
  requireOrgRole('OWNER', 'ADMIN'),
  validateRequest(CRMValidation.deleteContactValidationSchema),
  CRMController.deleteEntityContact
);

export const CRMRoutes = router;
export default router;
