import { Router } from 'express';
import { authMiddleware } from '../../middleware/authMiddleware';
import { tenantMiddleware, requireOrgRole } from '../../middleware/tenantMiddleware';
import { validateRequest } from '../../middleware/validateRequest';
import { ProjectValidation } from './project.validation';
import { ProjectController } from './project.controller';

const router = Router();

// Create project workspace (OWNER, ADMIN, AUDITOR)
router.post(
  '/',
  authMiddleware(),
  tenantMiddleware(),
  requireOrgRole('OWNER', 'ADMIN', 'AUDITOR'),
  validateRequest(ProjectValidation.createProjectValidationSchema),
  ProjectController.createProject
);

// List projects (scoped to tenant orgId)
router.get(
  '/',
  authMiddleware(),
  tenantMiddleware(),
  validateRequest(ProjectValidation.getProjectsValidationSchema),
  ProjectController.getProjects
);

// Get single project workspace by ID
router.get(
  '/:id',
  authMiddleware(),
  tenantMiddleware(),
  validateRequest(ProjectValidation.getProjectByIdValidationSchema),
  ProjectController.getProjectById
);

// Update project workspace (OWNER, ADMIN, AUDITOR)
router.patch(
  '/:id',
  authMiddleware(),
  tenantMiddleware(),
  requireOrgRole('OWNER', 'ADMIN', 'AUDITOR'),
  validateRequest(ProjectValidation.updateProjectValidationSchema),
  ProjectController.updateProject
);

// Soft delete / archive project (OWNER, ADMIN)
router.delete(
  '/:id',
  authMiddleware(),
  tenantMiddleware(),
  requireOrgRole('OWNER', 'ADMIN'),
  validateRequest(ProjectValidation.deleteProjectValidationSchema),
  ProjectController.deleteProject
);

export const ProjectRoutes = router;
export default router;
