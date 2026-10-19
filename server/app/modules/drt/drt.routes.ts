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

// -----------------------------------------------------------------------------
// Two-Tier Status Engine & SLA Tracking
// -----------------------------------------------------------------------------

// Update DRT Ticket lifecycle status (OPEN -> SUBMITTED -> REVISION_REQUESTED -> ACCEPTED)
router.patch(
  '/tickets/:id/lifecycle',
  authMiddleware(),
  tenantMiddleware(),
  validateRequest(DRTValidation.updateLifecycleStatusValidationSchema),
  DRTController.updateLifecycleStatus
);

// Update DRT Ticket auditor review outcome (auditor-only: DONE, PARTIAL, PENDING, NOT_AVAILABLE, NOT_APPLICABLE)
router.patch(
  '/tickets/:id/review-status',
  authMiddleware(),
  tenantMiddleware(),
  requireOrgRole('OWNER', 'ADMIN', 'AUDITOR'),
  validateRequest(DRTValidation.updateReviewStatusValidationSchema),
  DRTController.updateReviewStatus
);

// Update DRT Ticket multi-year period statuses (SHARED, PARTIAL, NOT_SHARED, NOT_APPLICABLE)
router.put(
  '/tickets/:id/period-statuses',
  authMiddleware(),
  tenantMiddleware(),
  requireOrgRole('OWNER', 'ADMIN', 'AUDITOR'),
  validateRequest(DRTValidation.updatePeriodStatusesValidationSchema),
  DRTController.updatePeriodStatuses
);

// Assign 4-Party Squad to DRT Ticket
router.patch(
  '/tickets/:id/squad',
  authMiddleware(),
  tenantMiddleware(),
  requireOrgRole('OWNER', 'ADMIN', 'AUDITOR'),
  validateRequest(DRTValidation.assignSquadValidationSchema),
  DRTController.assignSquad
);

// Upload DRT Document (Client or Auditee slot, uploaded by Field Team / Supervisor / PM)
router.post(
  '/tickets/:id/documents',
  authMiddleware(),
  tenantMiddleware(),
  validateRequest(DRTValidation.uploadDrtDocumentValidationSchema),
  DRTController.uploadDrtDocument
);

// Review DRT Document (Accept or Request Revision)
router.patch(
  '/documents/:docId/review',
  authMiddleware(),
  tenantMiddleware(),
  requireOrgRole('OWNER', 'ADMIN', 'AUDITOR'),
  validateRequest(DRTValidation.reviewDrtDocumentValidationSchema),
  DRTController.reviewDrtDocument
);

export const DRTRoutes = router;
export default router;

