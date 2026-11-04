import httpStatus from 'http-status';
import { prisma } from '../../../lib/prisma';
import { AppError } from '../../error/AppError';
import {
  TeamBucket,
  PeriodEvidenceStatus,
  GoogleDriveStatus,
  AuditeeSubmissionStatus,
} from '../../../generated/prisma';
import type { IPeriodStatusPayload } from './drt.service';

export interface ICreateDualTicketsPayload {
  projectId: string;
  torId?: string | null;
  requestCode: string;
  clientRequestCode?: string | null;
  auditeeRequestCode?: string | null;
  title?: string | null;

  clientDepartment?: string | null;
  clientDescription: string;

  auditeeDepartment?: string | null;
  auditeeDescription: string;

  supervisorId?: string | null;
  fieldMemberId?: string | null;
  clientContactId?: string | null;
  auditeeContactId?: string | null;

  dateOfRequest?: string;
  expectedDateOfReceipt?: string;
  allocatedWeight?: number;
  collectionAllocated?: number;
  analysisAllocated?: number;

  clientGoogleDriveStatus?: GoogleDriveStatus;
  clientGoogleDriveLink?: string | null;
  clientStatus?: AuditeeSubmissionStatus;
  googleDriveStatus?: GoogleDriveStatus;
  googleDriveLink?: string | null;
  auditeeStatus?: AuditeeSubmissionStatus;

  periodStatuses?: IPeriodStatusPayload[];
}

export const DRTDualService = {
  createDualTickets: async (orgId: string, payload: ICreateDualTicketsPayload, userId?: string) => {
    const project = await prisma.project.findFirst({
      where: { id: payload.projectId, orgId, isDeleted: false },
    });

    if (!project) {
      throw new AppError(httpStatus.NOT_FOUND, 'Project not found in this organization');
    }

    const baseCode = payload.requestCode.trim();
    const clientCode = (payload.clientRequestCode?.trim() || `${baseCode}-C`).trim();
    const auditeeCode = (payload.auditeeRequestCode?.trim() || `${baseCode}-A`).trim();

    // Verify uniqueness for both codes in project
    const existing = await prisma.dRTTicket.findMany({
      where: {
        projectId: payload.projectId,
        requestCode: { in: [clientCode, auditeeCode], mode: 'insensitive' },
      },
    });

    if (existing.length > 0) {
      const conflictCodes = existing.map((t) => t.requestCode).join(', ');
      throw new AppError(
        httpStatus.CONFLICT,
        `DRT ticket(s) with request code '${conflictCodes}' already exist in this project`
      );
    }

    const totalWeight =
      payload.collectionAllocated !== undefined || payload.analysisAllocated !== undefined
        ? (payload.collectionAllocated ?? 0) + (payload.analysisAllocated ?? 0)
        : (payload.allocatedWeight ?? 0.0);

    const dateOfRequest = payload.dateOfRequest ? new Date(payload.dateOfRequest) : new Date();
    const expectedReceipt = payload.expectedDateOfReceipt ? new Date(payload.expectedDateOfReceipt) : null;
    const clientDrive = payload.clientGoogleDriveLink?.trim();
    const auditeeDrive = payload.googleDriveLink?.trim();
    const clientGDriveStatus = clientDrive ? 'UPLOADED' : (payload.clientGoogleDriveStatus || 'NA');
    const auditeeGDriveStatus = auditeeDrive ? 'UPLOADED' : (payload.googleDriveStatus || 'NA');
    const uploaderId = userId || payload.supervisorId || payload.fieldMemberId;

    return prisma.$transaction(async (tx) => {
      // 1. Create Client DRT Ticket
      const clientTicket = await tx.dRTTicket.create({
        data: {
          projectId: payload.projectId,
          torId: payload.torId || null,
          requestCode: clientCode,
          title: payload.title ? payload.title.trim() : null,
          assignedTeamBucket: TeamBucket.CLIENT,
          department: payload.clientDepartment ? payload.clientDepartment.trim() : null,
          description: payload.clientDescription.trim(),
          supervisorId: payload.supervisorId || null,
          fieldMemberId: payload.fieldMemberId || null,
          clientContactId: payload.clientContactId || null,
          auditeeContactId: payload.auditeeContactId || null,
          dateOfRequest,
          expectedDateOfReceipt: expectedReceipt,
          allocatedWeight: totalWeight,
          collectionAllocated: payload.collectionAllocated ?? 0.0,
          analysisAllocated: payload.analysisAllocated ?? 0.0,
          clientGoogleDriveStatus: clientGDriveStatus,
          clientStatus: payload.clientStatus || 'COLLECTING_DATA',
          googleDriveStatus: 'NA',
          auditeeStatus: 'COLLECTING_DATA',
        },
      });

      // 2. Create Auditee DRT Ticket
      const auditeeTicket = await tx.dRTTicket.create({
        data: {
          projectId: payload.projectId,
          torId: payload.torId || null,
          requestCode: auditeeCode,
          title: payload.title ? payload.title.trim() : null,
          assignedTeamBucket: TeamBucket.AUDITEE,
          department: payload.auditeeDepartment ? payload.auditeeDepartment.trim() : null,
          description: payload.auditeeDescription.trim(),
          supervisorId: payload.supervisorId || null,
          fieldMemberId: payload.fieldMemberId || null,
          clientContactId: payload.clientContactId || null,
          auditeeContactId: payload.auditeeContactId || null,
          dateOfRequest,
          expectedDateOfReceipt: expectedReceipt,
          allocatedWeight: totalWeight,
          collectionAllocated: payload.collectionAllocated ?? 0.0,
          analysisAllocated: payload.analysisAllocated ?? 0.0,
          clientGoogleDriveStatus: 'NA',
          clientStatus: 'COLLECTING_DATA',
          googleDriveStatus: auditeeGDriveStatus,
          auditeeStatus: payload.auditeeStatus || 'COLLECTING_DATA',
        },
      });

      // 3. Create Google Drive documents if links provided
      if (clientDrive && uploaderId) {
        await tx.dRTDocument.create({
          data: {
            ticketId: clientTicket.id,
            partySide: 'CLIENT',
            fileName: 'Google Drive Evidence Folder (Client)',
            fileUrl: clientDrive,
            fileType: 'google_drive',
            uploadedById: uploaderId,
            status: 'ACCEPTED',
          },
        });
      }
      if (auditeeDrive && uploaderId) {
        await tx.dRTDocument.create({
          data: {
            ticketId: auditeeTicket.id,
            partySide: 'AUDITEE',
            fileName: 'Google Drive Evidence Folder (Auditee)',
            fileUrl: auditeeDrive,
            fileType: 'google_drive',
            uploadedById: uploaderId,
            status: 'ACCEPTED',
          },
        });
      }

      // 4. Link both tickets to ToR
      if (payload.torId) {
        await tx.dRTTicketToR.createMany({
          data: [
            { ticketId: clientTicket.id, torId: payload.torId },
            { ticketId: auditeeTicket.id, torId: payload.torId },
          ],
          skipDuplicates: true,
        });
      }

      // 4. Duplicate period statuses for both tickets
      if (payload.periodStatuses && payload.periodStatuses.length > 0) {
        const statuses = payload.periodStatuses.flatMap((ps) => [
          {
            ticketId: clientTicket.id,
            periodId: ps.periodId || null,
            periodLabel: ps.periodLabel,
            evidenceStatus: ps.evidenceStatus || PeriodEvidenceStatus.IN_PROGRESS,
            remark: ps.remark ? ps.remark.trim() : null,
          },
          {
            ticketId: auditeeTicket.id,
            periodId: ps.periodId || null,
            periodLabel: ps.periodLabel,
            evidenceStatus: ps.evidenceStatus || PeriodEvidenceStatus.IN_PROGRESS,
            remark: ps.remark ? ps.remark.trim() : null,
          },
        ]);

        await tx.dRTTicketPeriodStatus.createMany({
          data: statuses,
          skipDuplicates: true,
        });
      }

      return { clientTicket, auditeeTicket };
    });
  },
};
