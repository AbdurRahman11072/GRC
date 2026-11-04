'use client';

import React from 'react';
import { CreateDrtDrawer } from '../CreateDrtDrawer';
import { UploadDrtDocumentModal } from './UploadDrtDocumentModal';
import { ReviewDrtDocumentModal } from './ReviewDrtDocumentModal';
import { AssignDrtSquadModal } from './AssignDrtSquadModal';
import { EditDrtPeriodStatusModal } from './EditDrtPeriodStatusModal';
import { ManageDrtTorsModal } from './ManageDrtTorsModal';
import { DrtRemarkVersionModal } from './details/DrtRemarkVersionModal';
import { DrtProgressRemarkModal } from './DrtProgressRemarkModal';
import { getDrtRemarkVersions } from './drtBadges';
import type { DrtProgressPhase } from '../../../../lib/drtProgressUtils';
import type { IDRTTicket, IDRTDocument, DRTPartySide } from '../../../../types/project.types';

export interface DrtModalsProps {
  projectId: string;
  auditYears: string[];
  clientName: string;
  auditeeName: string;
  isCreateOpen: boolean;
  onCloseCreate: () => void;
  uploadTicket: { ticket: IDRTTicket; side: DRTPartySide; initialPeriodLabel?: string } | null;
  onCloseUpload: () => void;
  reviewTarget: { ticket: IDRTTicket; doc?: IDRTDocument } | null;
  onCloseReview: () => void;
  squadTicket: IDRTTicket | null;
  onCloseSquad: () => void;
  periodModal: { ticket: IDRTTicket; year: string } | null;
  onClosePeriod: () => void;
  onOpenUploadFromPeriod: (ticket: IDRTTicket, year: string) => void;
  torsTicket: IDRTTicket | null;
  onCloseTors: () => void;
  remarkModal: { ticket: IDRTTicket; side: 'AUDITOR' | 'AUDITEE' } | null;
  onCloseRemark: () => void;
  progressModal: { ticket: IDRTTicket; phase: DrtProgressPhase } | null;
  onCloseProgress: () => void;
  onSaveProgress: (id: string, phase: DrtProgressPhase, data: any) => void;
}

export const DrtModals: React.FC<DrtModalsProps> = ({
  projectId,
  auditYears,
  clientName,
  auditeeName,
  isCreateOpen,
  onCloseCreate,
  uploadTicket,
  onCloseUpload,
  reviewTarget,
  onCloseReview,
  squadTicket,
  onCloseSquad,
  periodModal,
  onClosePeriod,
  onOpenUploadFromPeriod,
  torsTicket,
  onCloseTors,
  remarkModal,
  onCloseRemark,
  progressModal,
  onCloseProgress,
  onSaveProgress,
}) => {
  return (
    <>
      <CreateDrtDrawer
        isOpen={isCreateOpen}
        onClose={onCloseCreate}
        projectId={projectId}
        auditYears={auditYears}
        clientName={clientName}
        auditeeName={auditeeName}
      />
      <UploadDrtDocumentModal
        isOpen={Boolean(uploadTicket)}
        onClose={onCloseUpload}
        ticket={uploadTicket?.ticket || null}
        defaultSide={uploadTicket?.side}
        initialPeriodLabel={uploadTicket?.initialPeriodLabel}
        auditYears={auditYears}
        clientName={clientName}
        auditeeName={auditeeName}
      />
      <ReviewDrtDocumentModal
        isOpen={Boolean(reviewTarget)}
        onClose={onCloseReview}
        ticket={reviewTarget?.ticket || null}
        document={reviewTarget?.doc || null}
      />
      <AssignDrtSquadModal
        isOpen={Boolean(squadTicket)}
        onClose={onCloseSquad}
        ticket={squadTicket}
        projectId={projectId}
      />
      <EditDrtPeriodStatusModal
        isOpen={Boolean(periodModal)}
        onClose={onClosePeriod}
        ticket={periodModal?.ticket || null}
        periodLabel={periodModal?.year || null}
        onOpenUpload={onOpenUploadFromPeriod}
      />
      <ManageDrtTorsModal
        isOpen={Boolean(torsTicket)}
        onClose={onCloseTors}
        ticket={torsTicket}
        projectId={projectId}
      />
      {remarkModal && (
        <DrtRemarkVersionModal
          isOpen={Boolean(remarkModal)}
          onClose={onCloseRemark}
          title={remarkModal.side === 'AUDITOR' ? 'Auditor Remarks History' : `${auditeeName} Remarks History`}
          stakeholderType={remarkModal.side}
          stakeholderName={remarkModal.side === 'AUDITOR' ? 'Lead Auditor' : auditeeName}
          versions={getDrtRemarkVersions(remarkModal.ticket, remarkModal.side, auditeeName)}
        />
      )}
      {progressModal && (
        <DrtProgressRemarkModal
          isOpen={Boolean(progressModal)}
          onClose={onCloseProgress}
          ticket={progressModal.ticket}
          phase={progressModal.phase}
          onSave={onSaveProgress}
        />
      )}
    </>
  );
};
