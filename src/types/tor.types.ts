import type { ProjectRole } from './project.types';

export interface IStreamWeight {
  id?: string;
  torId?: string;
  streamBucket: ProjectRole;
  dataCollectionAllocated: number;
  dataAnalysisAllocated: number;
  dataAnalysisObtained?: number;
}

export interface ITorDocument {
  id: string;
  torId: string;
  uploadedById: string;
  fileName: string;
  fileUrl?: string | null;
  fileSize?: number | null;
  fileType?: string | null;
  notes?: string | null;
  status: 'SUBMITTED' | 'ACCEPTED' | 'REVISION_REQUESTED';
  uploadedBy?: { id: string; name: string; email: string };
  createdAt: string;
  updatedAt: string;
}

export interface ITorMemberAssignment {
  id: string;
  torId: string;
  userId: string;
  teamBucket?: ProjectRole;
  user?: { id: string; name: string; email: string; designation?: string | null };
  createdAt: string;
}

export interface ITorNode {
  id: string;
  projectId: string;
  parentId: string | null;
  code: string;
  title: string;
  description?: string | null;
  department?: string | null;
  sortOrder: number;
  submissionDeadline?: string | null;
  createdAt: string;
  updatedAt: string;
  streamWeights?: IStreamWeight[];
  assignedMembers?: ITorMemberAssignment[];
  documents?: ITorDocument[];
  _count?: {
    children: number;
    drtMappings: number;
    findings: number;
  };
  children?: ITorNode[];
}

export interface IAssignTrioPayload {
  torId: string;
  orgMemberId?: string | null;
  clientMemberId?: string | null;
  auditeeMemberId?: string | null;
  submissionDeadline?: string | null;
}

export interface ICreateTorPayload {
  projectId: string;
  parentId?: string | null;
  code: string;
  title: string;
  description?: string | null;
  department?: string | null;
  sortOrder?: number;
}

export interface ISetStreamWeightPayload {
  torId: string;
  weights: {
    streamBucket: ProjectRole;
    dataCollectionAllocated: number;
    dataAnalysisAllocated: number;
  }[];
}
