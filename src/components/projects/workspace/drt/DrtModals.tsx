'use client';

import React from 'react';
import { CreateDrtDrawer } from '../CreateDrtDrawer';
import { UploadDrtDocumentModal } from './UploadDrtDocumentModal';
import { ReviewDrtDocumentModal } from './ReviewDrtDocumentModal';
import { AssignDrtSquadModal } from './AssignDrtSquadModal';
import { EditDrtPeriodStatusModal } from './EditDrtPeriodStatusModal';
import { ManageDrtTorsModal } from './ManageDrtTorsModal';
import { DrtAnalysisModal } from './DrtAnalysisModal';
import { DrtRemarkVersionModal } from './details/DrtRemarkVersionModal';
import { getDrtRemarkVersions } from './drtBadges';
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
  analysisTicket: { ticket: IDRTTicket; year?: string } | null;
  onCloseAnalysis: () => void;
  remarkModal: { ticket: IDRTTicket; side: 'AUDITOR' | 'AUDITEE' } | null;
  onCloseRemark: () => void;
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
  analysisTicket,
  onCloseAnalysis,
  remarkModal,
  onCloseRemark,
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
      <DrtAnalysisModal
        isOpen={Boolean(analysisTicket)}
        onClose={onCloseAnalysis}
        ticket={analysisTicket?.ticket || null}
        auditYears={auditYears}
        clientName={clientName}
        auditeeName={auditeeName}
        initialYear={analysisTicket?.year}
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
    </>
  );
};
