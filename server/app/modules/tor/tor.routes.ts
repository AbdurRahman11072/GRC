import { Router } from 'express';
import { authMiddleware } from '../../middleware/authMiddleware';
import { tenantMiddleware, requireOrgRole } from '../../middleware/tenantMiddleware';
import { validateRequest } from '../../middleware/validateRequest';
import { TorValidation } from './tor.validation';
import { TorController } from './tor.controller';

const router = Router();

// Create ToR node (OWNER, ADMIN, AUDITOR)
router.post(
  '/',
  authMiddleware(),
  tenantMiddleware(),
  requireOrgRole('OWNER', 'ADMIN', 'AUDITOR'),
  validateRequest(TorValidation.createTorValidationSchema),
  TorController.createTor
);

// Get recursive hierarchical WBS tree for a project
router.get(
  '/project/:projectId/tree',
  authMiddleware(),
  tenantMiddleware(),
  validateRequest(TorValidation.getTorTreeValidationSchema),
  TorController.getTorTree
);

// List ToR nodes for a project (with search & parent filter)
router.get(
  '/project/:projectId',
  authMiddleware(),
  tenantMiddleware(),
  validateRequest(TorValidation.getTorsValidationSchema),
  TorController.getTors
);

// Get single ToR node detail
router.get(
  '/:id',
  authMiddleware(),
  tenantMiddleware(),
  validateRequest(TorValidation.getTorByIdValidationSchema),
  TorController.getTorById
);

// Update ToR node (OWNER, ADMIN, AUDITOR)
router.patch(
  '/:id',
  authMiddleware(),
  tenantMiddleware(),
  requireOrgRole('OWNER', 'ADMIN', 'AUDITOR'),
  validateRequest(TorValidation.updateTorValidationSchema),
  TorController.updateTor
);

// Delete ToR node (OWNER, ADMIN)
router.delete(
  '/:id',
  authMiddleware(),
  tenantMiddleware(),
  requireOrgRole('OWNER', 'ADMIN'),
  validateRequest(TorValidation.deleteTorValidationSchema),
  TorController.deleteTor
);

// -----------------------------------------------------------------------------
// Stream Weight Allocation (Data Collection vs Data Analysis marks)
// -----------------------------------------------------------------------------

// Set / Upsert stream weights for a ToR node
router.post(
  '/:id/stream-weights',
  authMiddleware(),
  tenantMiddleware(),
  requireOrgRole('OWNER', 'ADMIN', 'AUDITOR'),
  validateRequest(TorValidation.setStreamWeightsValidationSchema),
  TorController.setTorStreamWeights
);

// Get stream weights and marks summary for a ToR node
router.get(
  '/:id/stream-weights',
  authMiddleware(),
  tenantMiddleware(),
  validateRequest(TorValidation.getStreamWeightsValidationSchema),
  TorController.getTorStreamWeights
);

// Delete stream weight for a specific stream bucket
router.delete(
  '/:id/stream-weights/:streamBucket',
  authMiddleware(),
  tenantMiddleware(),
  requireOrgRole('OWNER', 'ADMIN'),
  validateRequest(TorValidation.deleteStreamWeightValidationSchema),
  TorController.deleteTorStreamWeight
);

export const TorRoutes = router;
export default router;
