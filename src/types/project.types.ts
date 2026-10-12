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
  code?: string | null;
  entityType: 'CLIENT' | 'AUDITEE';
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  contactPersonName?: string | null;
  contactPersonEmail?: string | null;
  contactPersonPhone?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateCrmEntityPayload {
  name: string;
  code?: string;
  entityType: 'CLIENT' | 'AUDITEE';
  email?: string;
  phone?: string;
  address?: string;
  contactPersonName?: string;
  contactPersonEmail?: string;
  contactPersonPhone?: string;
}
