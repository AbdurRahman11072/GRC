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

// -----------------------------------------------------------------------------
// Project Department Management (Auditee routing: Marketing, Engineering, IT, Legal, etc.)
// -----------------------------------------------------------------------------

// Create a single department in project
router.post(
  '/:id/departments',
  authMiddleware(),
  tenantMiddleware(),
  requireOrgRole('OWNER', 'ADMIN', 'AUDITOR'),
  validateRequest(ProjectValidation.createDepartmentValidationSchema),
  ProjectController.createDepartment
);

// Batch create departments in project
router.post(
  '/:id/departments/batch',
  authMiddleware(),
  tenantMiddleware(),
  requireOrgRole('OWNER', 'ADMIN', 'AUDITOR'),
  validateRequest(ProjectValidation.batchCreateDepartmentsValidationSchema),
  ProjectController.batchCreateDepartments
);

// List all departments in project
router.get(
  '/:id/departments',
  authMiddleware(),
  tenantMiddleware(),
  validateRequest(ProjectValidation.getDepartmentsValidationSchema),
  ProjectController.getDepartments
);

// Update department details
router.patch(
  '/:id/departments/:deptId',
  authMiddleware(),
  tenantMiddleware(),
  requireOrgRole('OWNER', 'ADMIN', 'AUDITOR'),
  validateRequest(ProjectValidation.updateDepartmentValidationSchema),
  ProjectController.updateDepartment
);

// Delete department from project
router.delete(
  '/:id/departments/:deptId',
  authMiddleware(),
  tenantMiddleware(),
  requireOrgRole('OWNER', 'ADMIN'),
  validateRequest(ProjectValidation.deleteDepartmentValidationSchema),
  ProjectController.deleteDepartment
);

export const ProjectRoutes = router;
export default router;
