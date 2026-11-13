export interface IProject {
  id: string;
  orgId: string;
  projectName: string;
  projectType: string;
  clientId: string;
  auditeeId: string;
  client?: ICrmEntity;
  auditee?: ICrmEntity;
  startDate?: string | null;
  endDate?: string | null;
  projectObjective?: string | null;
  projectScope?: string | null;
  status: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'ON_HOLD';
  progressYearMapping?: Record<string, string[]> | null;
  progressCutoffDates?: Record<string, string> | null;
  members?: IProjectMember[];
  assessmentPeriods?: IAssessmentPeriod[];
  createdAt: string;
  updatedAt: string;
}

export interface IAssessmentPeriod {
  id: string;
  projectId: string;
  periodKey: string;
  weight: number;
  revenueAmount?: number | null;
  sortOrder: number;
}

export interface ICreateProjectPayload {
  projectName: string;
  projectType: string;
  clientId: string;
  auditeeId: string;
  startDate?: string;
  endDate?: string;
  projectObjective?: string;
  projectScope?: string;
  status?: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'ON_HOLD';
  progressYearMapping?: Record<string, string[]> | null;
  progressCutoffDates?: Record<string, string> | null;
  projectManagerId?: string;
  supervisorIds?: string[];
  fieldTeamIds?: string[];
  clientContactIds?: string[];
  auditeeContactIds?: string[];
}

export interface ICrmEntity {
  id: string;
  orgId: string;
  name: string;
  entityType: 'CLIENT' | 'AUDITEE';
  address?: string | null;
  website?: string | null;
  phone?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateCrmEntityPayload {
  name: string;
  entityType: 'CLIENT' | 'AUDITEE';
  address?: string;
  website?: string;
  phone?: string;
}

export interface IEntityContact {
  id: string;
  entityId: string;
  userId?: string | null;
  name: string;
  email: string;
  phone?: string | null;
  designation?: string | null;
  department?: string | null;
  provisionedPassword?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateEntityContactPayload {
  entityId: string;
  name: string;
  email: string;
  phone?: string;
  designation?: string;
  department?: string;
  password?: string;
}

export type ProjectRole = 'ADMINISTRATOR' | 'ORG_MEMBER' | 'CLIENT' | 'AUDITEE';

export type ProjectFunctionalRole =
  | 'PROJECT_MANAGER'
  | 'SUPERVISOR'
  | 'CLIENT'
  | 'FIELD_MEMBER'
  | 'AUDITEE'
  | 'ADMIN'
  | 'ADMINISTRATOR'
  | 'FIELD_TEAM'
  | 'CLIENT_REPRESENTATIVE'
  | 'AUDITEE_REPRESENTATIVE';

export interface IProjectRoleOption {
  value: ProjectFunctionalRole;
  label: string;
  description: string;
  teamBucket: ProjectRole;
}

export const PROJECT_ROLE_OPTIONS: IProjectRoleOption[] = [
  { value: 'PROJECT_MANAGER', label: 'Project Manager', description: 'Full Project Authority (ToRs, DRTs, Marks, Checks)', teamBucket: 'ADMINISTRATOR' },
  { value: 'SUPERVISOR', label: 'Supervisor', description: 'Verify Documents & Award Marks', teamBucket: 'ORG_MEMBER' },
  { value: 'CLIENT', label: 'Client', description: 'Regulatory Oversight & Macro Scorecard', teamBucket: 'CLIENT' },
  { value: 'FIELD_MEMBER', label: 'Field Member', description: 'Evidence Upload & Progress Tracking', teamBucket: 'ORG_MEMBER' },
  { value: 'AUDITEE', label: 'Auditee', description: 'Auditee Submissions & SLA Focal Point', teamBucket: 'AUDITEE' },
  { value: 'ADMIN', label: 'Admin', description: 'Project Administration & Team Management', teamBucket: 'ADMINISTRATOR' },
  { value: 'ADMINISTRATOR', label: 'Administrator', description: 'Full System & Workspace Control', teamBucket: 'ADMINISTRATOR' },
];

export interface IProjectPermissions {
  isOrgAdmin: boolean;
  projectRole: ProjectFunctionalRole | null;
  teamBucket: ProjectRole | null;
  canCreateTor: boolean;
  canAssignDrt: boolean;
  canAwardMarks: boolean;
  canCheckDocument: boolean;
  canUploadDocument: boolean;
  canAccessTors?: boolean;
  canAccessScorecard?: boolean;
  canAccessEntities?: boolean;
  canManageTeam?: boolean;
}

export interface IOrgUserMember {
  id: string;
  name: string;
  email: string;
  designation?: string | null;
  orgRole: string;
  membershipId?: string;
  phone?: string | null;
}

export interface IProjectDepartment {
  id: string;
  projectId: string;
  name: string;
  code: string;
  description?: string | null;
  createdAt: string;
}

export interface IProjectMember {
  id: string;
  projectId: string;
  userId: string;
  teamBucket: ProjectRole;
  projectRole?: ProjectFunctionalRole;
  user?: { id: string; name: string; email: string; designation?: string | null };
  provisionedPassword?: string;
  createdAt: string;
}

export interface IAddProjectMemberPayload {
  projectId: string;
  userId?: string;
  name?: string;
  email?: string;
  password?: string;
  designation?: string;
  phone?: string;
  teamBucket: ProjectRole;
  projectRole?: ProjectFunctionalRole;
  departmentId?: string | null;
}

export * from './drt.types';
