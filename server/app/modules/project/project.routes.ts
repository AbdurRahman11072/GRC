import { Router } from 'express';
import { authMiddleware } from '../../middleware/authMiddleware';
import { tenantMiddleware, requireOrgRole } from '../../middleware/tenantMiddleware';
import { validateRequest } from '../../middleware/validateRequest';
import { ProjectValidation } from './project.validation';
import { ProjectController } from './project.controller';
import { ProjectWeightController } from './projectWeight.controller';
import {
  updateProjectWeightsValidationSchema,
  evaluatePmValidationSchema,
  getProjectScorecardValidationSchema,
} from './projectWeight.validation';

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

// Get current user's role and capability context for this project
router.get(
  '/:id/my-permissions',
  authMiddleware(),
  tenantMiddleware(),
  validateRequest(ProjectValidation.getProjectByIdValidationSchema),
  ProjectController.getMyProjectPermissions
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

// -----------------------------------------------------------------------------
// 4-Team Collaborative Member Assignment (ORG_TEAM_1, ORG_TEAM_2, CLIENT_TEAM, AUDITEE_TEAM)
// -----------------------------------------------------------------------------

// Add a single member to project
router.post(
  '/:id/members',
  authMiddleware(),
  tenantMiddleware(),
  requireOrgRole('OWNER', 'ADMIN', 'AUDITOR'),
  validateRequest(ProjectValidation.addMemberValidationSchema),
  ProjectController.addMember
);

// Batch assign members to project
router.post(
  '/:id/members/batch',
  authMiddleware(),
  tenantMiddleware(),
  requireOrgRole('OWNER', 'ADMIN', 'AUDITOR'),
  validateRequest(ProjectValidation.batchAddMembersValidationSchema),
  ProjectController.batchAddMembers
);

// List members in project (filterable by teamBucket and departmentId)
router.get(
  '/:id/members',
  authMiddleware(),
  tenantMiddleware(),
  validateRequest(ProjectValidation.getMembersValidationSchema),
  ProjectController.getMembers
);

// Update member team bucket or department
router.patch(
  '/:id/members/:memberId',
  authMiddleware(),
  tenantMiddleware(),
  requireOrgRole('OWNER', 'ADMIN', 'AUDITOR'),
  validateRequest(ProjectValidation.updateMemberValidationSchema),
  ProjectController.updateMember
);

// Remove member from project
router.delete(
  '/:id/members/:memberId',
  authMiddleware(),
  tenantMiddleware(),
  requireOrgRole('OWNER', 'ADMIN'),
  validateRequest(ProjectValidation.deleteMemberValidationSchema),
  ProjectController.deleteMember
);

// -----------------------------------------------------------------------------
// Scorecard & Macro Weight Envelopes
// -----------------------------------------------------------------------------

router.get(
  '/:id/scorecard',
  authMiddleware(),
  tenantMiddleware(),
  validateRequest(getProjectScorecardValidationSchema),
  ProjectWeightController.getScorecard
);

router.patch(
  '/:id/weights',
  authMiddleware(),
  tenantMiddleware(),
  requireOrgRole('OWNER', 'ADMIN', 'AUDITOR'),
  validateRequest(updateProjectWeightsValidationSchema),
  ProjectWeightController.updateWeights
);

router.post(
  '/:id/pm-evaluation',
  authMiddleware(),
  tenantMiddleware(),
  requireOrgRole('OWNER', 'ADMIN', 'AUDITOR'),
  validateRequest(evaluatePmValidationSchema),
  ProjectWeightController.evaluatePm
);

router.post(
  '/:id/recalculate-marks',
  authMiddleware(),
  tenantMiddleware(),
  requireOrgRole('OWNER', 'ADMIN', 'AUDITOR'),
  validateRequest(getProjectScorecardValidationSchema),
  ProjectWeightController.recalculateRollup
);

export const ProjectRoutes = router;
export default router;
