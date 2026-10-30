'use client';

import React, { useState, useMemo } from 'react';
import { Layers, FileCheck } from 'lucide-react';
import type { IDRTTicket, DRTPartySide } from '../../../../../types/drt.types';
import { DrtMatrixRow } from './DrtMatrixRow';
import { DrtRemarkVersionModal, type IDRTRemarkVersion } from './DrtRemarkVersionModal';
import { UploadDrtDocumentModal } from '../UploadDrtDocumentModal';
import { EditDrtPeriodStatusModal } from '../EditDrtPeriodStatusModal';
import { DEFAULT_AUDIT_YEARS } from '../DrtTimeFrameGrid';

export interface DrtTwoRowMatrixTableProps {
  ticket: IDRTTicket;
  clientName?: string;
  auditeeName?: string;
  auditYears?: string[];
}

export const DrtTwoRowMatrixTable: React.FC<DrtTwoRowMatrixTableProps> = ({
  ticket,
  clientName = 'BTRC',
  auditeeName = 'FHL',
  auditYears = DEFAULT_AUDIT_YEARS,
}) => {
  // Modal states
  const [uploadSide, setUploadSide] = useState<DRTPartySide | null>(null);
  const [periodToEdit, setPeriodToEdit] = useState<string | null>(null);
  const [remarkModalSide, setRemarkModalSide] = useState<'AUDITOR' | 'AUDITEE' | null>(null);

  // Versioned remarks records
  const auditorVersions: IDRTRemarkVersion[] = useMemo(() => [
    {
      version: 3,
      authorName: ticket.supervisor?.name || 'Lead Auditor',
      authorRole: ticket.supervisor?.designation || 'Lead Auditor (Team 1)',
      createdAt: '24 Oct 2026, 04:30 PM',
      content: ticket.remarks || 'Primary engineering topology and fiber utilization logs verified. Final clearance pending legal sign-off.',
      isCurrent: true,
    },
    {
      version: 2,
      authorName: ticket.fieldMember?.name || 'Field Auditor',
      authorRole: 'Senior Audit Associate',
      createdAt: '19 Oct 2026, 11:15 AM',
      content: 'Initial submission lacked quarterly bandwidth capacity breakdown. Requested updated NOC sheets.',
    },
    {
      version: 1,
      authorName: 'System / Audit Lead',
      authorRole: 'Automated Dispatch',
      createdAt: '12 Oct 2026, 09:00 AM',
      content: `DRT Ticket ${ticket.requestCode} dispatched to ${clientName} and ${auditeeName}.`,
    },
  ], [ticket, clientName, auditeeName]);

  const auditeeVersions: IDRTRemarkVersion[] = useMemo(() => [
    {
      version: 2,
      authorName: ticket.auditeeContact?.name || 'FHL Operational Lead',
      authorRole: ticket.auditeeContact?.department || 'NOC & Engineering',
      createdAt: '23 Oct 2026, 02:45 PM',
      content: ticket.currentRequirement || 'Uploaded revised link utilization spreadsheets and signed NOC sign-off sheets for 2020-2026.',
      isCurrent: true,
    },
    {
      version: 1,
      authorName: ticket.auditeeContact?.name || 'FHL Operational Lead',
      authorRole: 'Regulatory Compliance Officer',
      createdAt: '15 Oct 2026, 10:20 AM',
      content: 'Initial raw logs and topology schematics shared via secure drive folder. Transmittal letter shared.',
    },
  ], [ticket]);

  const activeVersions = remarkModalSide === 'AUDITOR' ? auditorVersions : auditeeVersions;
  const activeModalTitle = remarkModalSide === 'AUDITOR'
    ? 'Auditor Remarks Version History'
    : `${auditeeName} Remarks Version History`;

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden w-full max-w-full">
      {/* Header Bar */}
      <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between flex-wrap gap-3 bg-slate-50/70">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-200">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Client & Auditee Tracking Matrix
            </h2>
            <p className="text-xs text-slate-500">
              Comparative multi-year submission, review SLA & versioned remarks for {clientName} & {auditeeName}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-xs font-semibold text-slate-700">
            <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>{ticket.drtDocuments?.length || 0} Evidence Files</span>
          </div>
        </div>
      </div>

      {/* Dense Matrix Table with Horizontal Scroll */}
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/90 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              <th className="px-3.5 py-3 whitespace-nowrap sticky left-0 bg-slate-50 z-20 border-r border-slate-200 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.06)]">Stakeholder</th>
              <th className="px-3.5 py-3 whitespace-nowrap">Date of Request</th>
              <th className="px-3.5 py-3 whitespace-nowrap">Expected Date</th>
              <th className="px-3.5 py-3 whitespace-nowrap">Actual Date</th>
              <th className="px-3.5 py-3 whitespace-nowrap">Status (Auditor)</th>
              <th className="px-3.5 py-3 whitespace-nowrap">Excess Days</th>
              <th className="px-3.5 py-3 whitespace-nowrap">Google Drive</th>
              <th className="px-3.5 py-3 whitespace-nowrap">Collecting Status</th>
              <th className="px-3.5 py-3 whitespace-nowrap min-w-[210px]">Multi-Year Timeframe</th>
              <th className="px-3.5 py-3 whitespace-nowrap">Completeness</th>
              <th className="px-3.5 py-3 whitespace-nowrap min-w-[170px]">Auditor Remarks</th>
              <th className="px-3.5 py-3 whitespace-nowrap min-w-[170px]">Auditee Remarks</th>
              <th className="px-3.5 py-3 whitespace-nowrap text-right">Data Upload</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/80 bg-white">
            {/* Row 1: Client (BTRC) */}
            <DrtMatrixRow
              ticket={ticket}
              partySide="CLIENT"
              stakeholderLabel={clientName}
              partySubLabel="Client (Regulator)"
              auditYears={auditYears}
              auditorVersions={auditorVersions}
              auditeeVersions={auditeeVersions}
              onOpenPeriodModal={(year) => setPeriodToEdit(year)}
              onOpenUploadModal={(side) => setUploadSide(side)}
              onOpenRemarkModal={(side) => setRemarkModalSide(side)}
            />

            {/* Row 2: Auditee (FHL) */}
            <DrtMatrixRow
              ticket={ticket}
              partySide="AUDITEE"
              stakeholderLabel={auditeeName}
              partySubLabel="Auditee (Operational)"
              auditYears={auditYears}
              auditorVersions={auditorVersions}
              auditeeVersions={auditeeVersions}
              onOpenPeriodModal={(year) => setPeriodToEdit(year)}
              onOpenUploadModal={(side) => setUploadSide(side)}
              onOpenRemarkModal={(side) => setRemarkModalSide(side)}
            />
          </tbody>
        </table>
      </div>

      {/* Upload Document Modal */}
      {uploadSide && (
        <UploadDrtDocumentModal
          isOpen={Boolean(uploadSide)}
          onClose={() => setUploadSide(null)}
          ticket={ticket as any}
          defaultSide={uploadSide}
          clientName={clientName}
          auditeeName={auditeeName}
          auditYears={auditYears}
        />
      )}

      {/* Edit Period Evidence Status Modal */}
      {periodToEdit && (
        <EditDrtPeriodStatusModal
          isOpen={Boolean(periodToEdit)}
          onClose={() => setPeriodToEdit(null)}
          ticket={ticket as any}
          periodLabel={periodToEdit}
          onOpenUpload={() => {
            setPeriodToEdit(null);
            setUploadSide('AUDITEE');
          }}
        />
      )}

      {/* Version History Modal */}
      {remarkModalSide && (
        <DrtRemarkVersionModal
          isOpen={Boolean(remarkModalSide)}
          onClose={() => setRemarkModalSide(null)}
          title={activeModalTitle}
          stakeholderType={remarkModalSide}
          stakeholderName={remarkModalSide === 'AUDITOR' ? 'Auditor Review Team' : auditeeName}
          versions={activeVersions}
        />
      )}
    </div>
  );
};
