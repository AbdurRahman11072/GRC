import { Router } from 'express';
import { authMiddleware } from '../../middleware/authMiddleware';
import { tenantMiddleware, requireOrgRole } from '../../middleware/tenantMiddleware';
import { validateRequest } from '../../middleware/validateRequest';
import { DRTValidation } from './drt.validation';
import { DRTController } from './drt.controller';

const router = Router();

// Create DRT Ticket (OWNER, ADMIN, AUDITOR)
router.post(
  '/tickets',
  authMiddleware(),
  tenantMiddleware(),
  requireOrgRole('OWNER', 'ADMIN', 'AUDITOR'),
  validateRequest(DRTValidation.createTicketValidationSchema),
  DRTController.createTicket
);

// List DRT Tickets for a project (with filters & search)
router.get(
  '/projects/:projectId/tickets',
  authMiddleware(),
  tenantMiddleware(),
  validateRequest(DRTValidation.getTicketsValidationSchema),
  DRTController.getTickets
);

// Get single DRT Ticket by ID
router.get(
  '/tickets/:id',
  authMiddleware(),
  tenantMiddleware(),
  validateRequest(DRTValidation.getTicketByIdValidationSchema),
  DRTController.getTicketById
);

// Update DRT Ticket details
router.patch(
  '/tickets/:id',
  authMiddleware(),
  tenantMiddleware(),
  requireOrgRole('OWNER', 'ADMIN', 'AUDITOR'),
  validateRequest(DRTValidation.updateTicketValidationSchema),
  DRTController.updateTicket
);

// Map / Unmap ToRs to DRT Ticket (many-to-many junction)
router.post(
  '/tickets/:id/tor-mappings',
  authMiddleware(),
  tenantMiddleware(),
  requireOrgRole('OWNER', 'ADMIN', 'AUDITOR'),
  validateRequest(DRTValidation.mapToRsValidationSchema),
  DRTController.mapToRs
);

// Delete DRT Ticket (OWNER, ADMIN)
router.delete(
  '/tickets/:id',
  authMiddleware(),
  tenantMiddleware(),
  requireOrgRole('OWNER', 'ADMIN'),
  validateRequest(DRTValidation.deleteTicketValidationSchema),
  DRTController.deleteTicket
);

export const DRTRoutes = router;
export default router;
