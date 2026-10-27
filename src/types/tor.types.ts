import type { ProjectRole, IDRTTicket } from './project.types';

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
  reviewedById?: string | null;
  reviewedAt?: string | null;
  reviewNotes?: string | null;
  reviewedBy?: { id: string; name: string; email: string; designation?: string | null } | null;
  createdAt: string;
  updatedAt: string;
}

export interface ITorMemberAssignment {
  id: string;
  torId: string;
  userId: string;
  assignmentRole?: 'SUPERVISOR' | 'FIELD_MEMBER' | 'CLIENT_OBSERVER' | 'AUDITEE_FOCAL';
  teamBucket?: ProjectRole;
  projectRole?: 'PROJECT_MANAGER' | 'SUPERVISOR' | 'FIELD_TEAM' | 'CLIENT_REPRESENTATIVE' | 'AUDITEE_REPRESENTATIVE';
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
  objective?: string | null;
  department?: string | null;
  sortOrder: number;
  submissionDeadline?: string | null;
  createdAt: string;
  updatedAt: string;

  // Dual-Stream & Two-Stage Scoring Engine
  clientWeight?: number;
  auditeeWeight?: number;
  fhlCollectionAllocated?: number;
  fhlCollectionObtained?: number;
  fhlAnalysisAllocated?: number;
  fhlAnalysisObtained?: number;
  btrcCollectionAllocated?: number;
  btrcCollectionObtained?: number;
  btrcAnalysisAllocated?: number;
  btrcAnalysisObtained?: number;
  dataCollectionAllocated?: number;
  dataCollectionObtained?: number;
  dataAnalysisAllocated?: number;
  dataAnalysisObtained?: number;
  analysisNotes?: string | null;
  complianceStatus?: string | null;
  analyzedById?: string | null;
  analyzedAt?: string | null;
  analyzedBy?: { id: string; name: string; email: string } | null;

  streamWeights?: IStreamWeight[];
  assignedMembers?: ITorMemberAssignment[];
  documents?: ITorDocument[];
  drtTickets?: IDRTTicket[];
  _count?: {
    children: number;
    drtMappings: number;
    findings: number;
  };
  children?: ITorNode[];
}

export interface IEvaluateTorAnalysisPayload {
  torId: string;
  dataAnalysisObtained: number;
  analysisNotes?: string | null;
  complianceStatus: 'COMPLIANT' | 'PARTIALLY_COMPLIANT' | 'NON_COMPLIANT' | 'NOT_APPLICABLE';
}

export interface IAssignTrioPayload {
  torId: string;
  supervisorIds?: string[];
  fieldMemberIds?: string[];
  orgMemberId?: string | null;
  clientMemberId?: string | null;
  auditeeMemberId?: string | null;
  submissionDeadline?: string | null;
}

export interface ICheckTorDocumentPayload {
  torId: string;
  docId: string;
  status: 'ACCEPTED' | 'REVISION_REQUESTED';
  reviewNotes?: string | null;
}

export interface ICreateTorPayload {
  projectId: string;
  parentId?: string | null;
  code: string;
  title: string;
  description?: string | null;
  objective?: string | null;
  department?: string | null;
  sortOrder?: number;
  clientWeight?: number;
  auditeeWeight?: number;
}

export interface ISetStreamWeightPayload {
  torId: string;
  weights: {
    streamBucket: ProjectRole;
    dataCollectionAllocated: number;
    dataAnalysisAllocated: number;
  }[];
}

export interface IUpdateTorPayload {
  id: string;
  parentId?: string | null;
  code?: string;
  title?: string;
  description?: string | null;
  objective?: string | null;
  department?: string | null;
  sortOrder?: number;
  clientWeight?: number;
  auditeeWeight?: number;
}

