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
  members?: IProjectMember[];
  createdAt: string;
  updatedAt: string;
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
  | 'FIELD_TEAM'
  | 'CLIENT_REPRESENTATIVE'
  | 'AUDITEE_REPRESENTATIVE';

export interface IProjectPermissions {
  isOrgAdmin: boolean;
  projectRole: ProjectFunctionalRole | null;
  teamBucket: ProjectRole | null;
  canCreateTor: boolean;
  canAssignDrt: boolean;
  canAwardMarks: boolean;
  canCheckDocument: boolean;
  canUploadDocument: boolean;
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

export interface IDRTTicket {
  id: string;
  projectId: string;
  requestCode: string;
  assignedTeamBucket: ProjectRole;
  department?: string | null;
  description: string;
  dateOfRequest?: string | null;
  expectedDateOfReceipt?: string | null;
  allocatedWeight?: number | null;
  workflowStatus: 'OPEN' | 'SUBMITTED' | 'REVISION_REQUESTED' | 'ACCEPTED';
  reviewOutcome: 'PENDING' | 'PARTIAL' | 'DONE' | 'NOT_AVAILABLE' | 'NOT_APPLICABLE';
  excessDays: number;
  isOverdue: boolean;
  tors?: Array<{ torId: string; tor?: { id: string; code: string; title: string; department?: string | null } }>;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateDRTTicketPayload {
  projectId: string;
  requestCode: string;
  assignedTeamBucket: ProjectRole;
  department?: string | null;
  description: string;
  dateOfRequest?: string;
  expectedDateOfReceipt?: string;
  allocatedWeight?: number;
  torIds?: string[];
}
