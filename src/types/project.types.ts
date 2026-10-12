export interface IProject {
  id: string;
  orgId: string;
  projectName: string;
  projectType: string;
  clientId: string;
  auditeeId: string;
  client?: { id: string; name: string; code?: string | null };
  auditee?: { id: string; name: string; code?: string | null };
  startDate?: string | null;
  endDate?: string | null;
  projectObjective?: string | null;
  projectScope?: string | null;
  status: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'ON_HOLD';
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
