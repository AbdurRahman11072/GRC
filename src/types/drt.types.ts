import type { ProjectRole } from './project.types';

export type DRTPartySide = 'CLIENT' | 'AUDITEE';

export interface IDRTDocument {
  id: string;
  ticketId: string;
  partySide: DRTPartySide;
  fileName: string;
  fileUrl?: string | null;
  fileSize?: number | null;
  fileType?: string | null;
  referenceNumber?: string | null;
  receivedDate?: string | null;
  periodLabel?: string | null;
  uploadedById: string;
  reviewedById?: string | null;
  reviewNotes?: string | null;
  status: 'SUBMITTED' | 'ACCEPTED' | 'REVISION_REQUESTED';
  uploadedBy?: { id: string; name: string; email: string };
  reviewedBy?: { id: string; name: string; email: string } | null;
  createdAt: string;
  updatedAt: string;
}

export type GoogleDriveStatus = 'UPLOADED' | 'NOT_UPLOADED' | 'NA';

export type AuditeeSubmissionStatus =
  | 'SHARED'
  | 'COLLECTING_DATA'
  | 'PARTIALLY_SHARED'
  | 'NOT_SHARED';

export type PeriodEvidenceStatus =
  | 'IN_PROGRESS'
  | 'PARTIAL'
  | 'COMPLETED'
  | 'SHARED'
  | 'NOT_SHARED'
  | 'NOT_APPLICABLE';

export interface IDRTTicketPeriodStatus {
  id?: string;
  ticketId?: string;
  periodId?: string | null;
  periodLabel: string;
  evidenceStatus: PeriodEvidenceStatus;
  remark?: string | null;
  period?: { id: string; periodKey: string; weight: number };
}

export interface IDRTTicket {
  id: string;
  projectId: string;
  torId?: string | null;
  requestCode: string;
  title?: string | null;
  assignedTeamBucket: ProjectRole;
  department?: string | null;
  description: string;
  currentRequirement?: string | null;
  remarks?: string | null;
  supervisorId?: string | null;
  fieldMemberId?: string | null;
  clientContactId?: string | null;
  auditeeContactId?: string | null;
  supervisor?: { id: string; name: string; email: string; designation?: string | null } | null;
  fieldMember?: { id: string; name: string; email: string; designation?: string | null } | null;
  clientContact?: { id: string; name: string; email: string; designation?: string | null } | null;
  auditeeContact?: { id: string; name: string; email: string; department?: string | null; designation?: string | null } | null;
  dateOfRequest?: string | null;
  expectedDateOfReceipt?: string | null;
  actualDateOfReceipt?: string | null;
  allocatedWeight?: number | null;
  collectionAllocated?: number | null;
  collectionObtained?: number | null;
  analysisAllocated?: number | null;
  analysisObtained?: number | null;
  workflowStatus: 'OPEN' | 'SUBMITTED' | 'REVISION_REQUESTED' | 'ACCEPTED';
  reviewOutcome: 'PENDING' | 'PARTIAL' | 'DONE' | 'NOT_AVAILABLE' | 'NOT_APPLICABLE';
  clientGoogleDriveStatus?: GoogleDriveStatus;
  clientStatus?: AuditeeSubmissionStatus;
  googleDriveStatus?: GoogleDriveStatus;
  auditeeStatus?: AuditeeSubmissionStatus;
  excessDays: number;
  isOverdue: boolean;
  tor?: { id: string; code: string; title: string; department?: string | null } | null;
  tors?: Array<{ torId: string; tor?: { id: string; code: string; title: string; department?: string | null } }>;
  drtDocuments?: IDRTDocument[];
  periodStatuses?: IDRTTicketPeriodStatus[];
  createdAt: string;
  updatedAt: string;
}

export interface ICreateDRTTicketPayload {
  projectId: string;
  torId?: string;
  requestCode: string;
  title?: string;
  assignedTeamBucket?: ProjectRole;
  department?: string | null;
  description: string;
  currentRequirement?: string | null;
  remarks?: string | null;
  supervisorId?: string;
  fieldMemberId?: string;
  clientContactId?: string;
  auditeeContactId?: string;
  dateOfRequest?: string;
  expectedDateOfReceipt?: string;
  allocatedWeight?: number;
  collectionAllocated?: number;
  analysisAllocated?: number;
  clientGoogleDriveStatus?: GoogleDriveStatus;
  clientStatus?: AuditeeSubmissionStatus;
  googleDriveStatus?: GoogleDriveStatus;
  auditeeStatus?: AuditeeSubmissionStatus;
  torIds?: string[];
  periodStatuses?: Array<{
    periodId?: string | null;
    periodLabel: string;
    evidenceStatus: PeriodEvidenceStatus;
    remark?: string | null;
  }>;
}

export interface IUpdateDRTTicketPayload {
  requestCode?: string;
  title?: string;
  assignedTeamBucket?: ProjectRole;
  department?: string | null;
  description?: string;
  currentRequirement?: string | null;
  remarks?: string | null;
  supervisorId?: string | null;
  fieldMemberId?: string | null;
  clientContactId?: string | null;
  auditeeContactId?: string | null;
  dateOfRequest?: string | null;
  expectedDateOfReceipt?: string | null;
  allocatedWeight?: number;
  collectionAllocated?: number;
  analysisAllocated?: number;
  clientGoogleDriveStatus?: GoogleDriveStatus;
  clientStatus?: AuditeeSubmissionStatus;
  googleDriveStatus?: GoogleDriveStatus;
  auditeeStatus?: AuditeeSubmissionStatus;
}
