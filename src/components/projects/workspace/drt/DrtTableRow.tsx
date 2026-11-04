'use client';

import React from 'react';
import { Upload } from 'lucide-react';
import type { IDRTTicket, DRTPartySide } from '../../../../types/drt.types';
import type { DrtProgressPhase } from '../../../../lib/drtProgressUtils';
import { DrtDescriptionCell } from './DrtDescriptionCell';
import { DrtRowActions } from './DrtRowActions';
import { DrtUnifiedCloudCollectionCells } from './DrtUnifiedCloudCollectionCells';
import { DrtYearAndRemarkCells } from './DrtYearAndRemarkCells';
import { DrtProgressCells } from './DrtProgressCells';
import { statusBadgeStyles } from './drtBadges';
import { formatDate } from '../../../../lib/utils';

export interface DrtTableRowProps {
  projectId: string;
  ticket: IDRTTicket;
  index: number;
  clientName?: string;
  auditeeName?: string;
  auditYears: string[];
  onManageSquad?: (ticket: IDRTTicket) => void;
  onManageTors?: (ticket: IDRTTicket) => void;
  onOpenPeriodModal: (ticket: IDRTTicket, periodLabel: string) => void;
  onOpenUploadModal: (ticket: IDRTTicket, partySide: DRTPartySide) => void;
  onOpenProgressModal: (ticket: IDRTTicket, phase: DrtProgressPhase) => void;
}

export const DrtTableRow: React.FC<DrtTableRowProps> = ({
  projectId,
  ticket,
  index,
  clientName = 'BTRC',
  auditeeName = 'FHL',
  auditYears,
  onManageSquad,
  onManageTors,
  onOpenPeriodModal,
  onOpenUploadModal,
  onOpenProgressModal,
}) => {
  const docs = ticket.drtDocuments || [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const torCodes = ticket.tors?.map((t: any) => t.code || t.tor?.code).filter(Boolean) || [];
  if (ticket.tor?.code && !torCodes.includes(ticket.tor.code)) {
    torCodes.unshift(ticket.tor.code);
  }

  const assignedMember = ticket.fieldMember || ticket.supervisor;
  const reviewOutcomeKey = ticket.reviewOutcome || 'PENDING';
  const excessDays = ticket.excessDays ?? 0;

  // Dates
  const latestDocDate = docs[0]?.receivedDate || docs[0]?.createdAt;
  const actualDateDisplay = latestDocDate
    ? formatDate(latestDocDate)
    : ticket.actualDateOfReceipt
      ? formatDate(ticket.actualDateOfReceipt)
      : '—';

  return (
    <tr className="group border-b border-slate-200 hover:bg-slate-50/70 transition-colors text-xs bg-white">
      {/* 1. SL (Sticky Left) */}
      <td className="sticky left-0 z-10 bg-white group-hover:bg-slate-50 transition-colors py-2.5 px-2 text-center font-mono text-slate-500 border-r border-slate-200 align-middle w-12 min-w-[48px] max-w-[48px]">
        {index + 1}
      </td>

      {/* 2. ID (Sticky Left) */}
      <td className="sticky left-[48px] z-10 bg-white group-hover:bg-slate-50 transition-colors py-2.5 px-2.5 text-center font-mono font-bold text-xs text-indigo-700 border-r border-slate-200 align-middle w-24 min-w-[96px] max-w-[96px]">
        <span className="inline-block px-2 py-0.5 rounded bg-indigo-50 border border-indigo-200/80">
          {ticket.requestCode}
        </span>
      </td>

      {/* 3. Request Description (Sticky Left) */}
      <td className="sticky left-[144px] z-10 bg-white group-hover:bg-slate-50 transition-colors py-2.5 px-3 min-w-[280px] max-w-sm border-r border-slate-200 align-middle space-y-1 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.06)]">
        <DrtDescriptionCell ticket={ticket} docs={docs} />
      </td>

      {/* 4. ToR ID */}
      <td
        className={`py-2.5 px-2 text-center font-mono text-xs border-r border-slate-200 bg-slate-50/30 align-middle w-24 ${
          onManageTors ? 'cursor-pointer hover:bg-emerald-50/60 transition-colors' : ''
        }`}
        onClick={() => onManageTors?.(ticket)}
        title={onManageTors ? 'Click to manage linked ToR' : undefined}
      >
        <div className="flex flex-wrap items-center justify-center gap-1">
          {torCodes.length > 0 ? (
            torCodes.map((code) => (
              <span
                key={code}
                className="font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 text-[11px]"
              >
                {code}
              </span>
            ))
          ) : (
            <span className="text-slate-400 font-sans text-[11px]">{onManageTors ? '+ ToR' : '—'}</span>
          )}
        </div>
      </td>

      {/* 5. DRT For */}
      <td className="py-2.5 px-3 text-center border-r border-slate-200 align-middle w-36 whitespace-nowrap">
        {ticket.assignedTeamBucket === 'CLIENT' ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
            {clientName} (Client)
          </span>
        ) : (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            {auditeeName} (Auditee)
          </span>
        )}
      </td>

      {/* 6. Department */}
      <td className="py-2.5 px-3 text-center border-r border-slate-200 align-middle w-36">
        {ticket.department ? (
          <span
            className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200 truncate max-w-[140px]"
            title={ticket.department}
          >
            {ticket.department}
          </span>
        ) : (
          <span className="text-slate-400 font-mono text-[11px]">—</span>
        )}
      </td>

      {/* 7. Assigned To */}
      <td className="py-2.5 px-3 text-center border-r border-slate-200 align-middle w-40">
        {assignedMember ? (
          <div
            className="flex items-center justify-center gap-1.5"
            title={`${assignedMember.name} (${assignedMember.designation || 'Squad Member'})`}
          >
            <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[10px] flex items-center justify-center shrink-0">
              {assignedMember.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="text-left overflow-hidden">
              <span className="text-xs font-medium text-slate-800 block truncate max-w-[110px]">
                {assignedMember.name}
              </span>
              {assignedMember.designation && (
                <span className="text-[10px] text-slate-400 block truncate max-w-[110px]">
                  {assignedMember.designation}
                </span>
              )}
            </div>
          </div>
        ) : (
          <span className="text-slate-400 italic text-[11px]">Unassigned</span>
        )}
      </td>

      {/* 8. Date of Request */}
      <td className="px-3 py-2.5 align-middle whitespace-nowrap text-xs text-slate-700 border-r border-slate-200 font-medium">
        {ticket.dateOfRequest ? formatDate(ticket.dateOfRequest) : '—'}
      </td>

      {/* 9. Expected Date */}
      <td className="px-3 py-2.5 align-middle whitespace-nowrap text-xs text-slate-900 border-r border-slate-200 font-semibold">
        {ticket.expectedDateOfReceipt ? formatDate(ticket.expectedDateOfReceipt) : '—'}
      </td>

      {/* 10. Actual Date */}
      <td className="px-3 py-2.5 align-middle whitespace-nowrap text-xs text-slate-700 border-r border-slate-200">
        {actualDateDisplay}
      </td>

      {/* 11. Excess Days */}
      <td className="px-3 py-2.5 align-middle whitespace-nowrap border-r border-slate-200 text-center">
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold border ${
            excessDays > 0
              ? 'bg-rose-50 text-rose-700 border-rose-200'
              : excessDays === 0
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-sky-50 text-sky-700 border-sky-200'
          }`}
        >
          {excessDays > 0 ? `+${excessDays}d` : `${excessDays}d`}
        </span>
      </td>

      {/* 12. Status (Auditor) */}
      <td className="px-3 py-2.5 align-middle whitespace-nowrap border-r border-slate-200">
        <span
          className={`inline-flex px-2 py-0.5 rounded text-[11px] font-semibold border ${
            statusBadgeStyles[reviewOutcomeKey] || 'bg-slate-100 text-slate-700 border-slate-300'
          }`}
        >
          {reviewOutcomeKey.replace(/_/g, ' ')}
        </span>
      </td>

      {/* 13-14. Unified Cloud Link & Collection Status */}
      <DrtUnifiedCloudCollectionCells ticket={ticket} />

      {/* 15-16. Audit Years & Completeness */}
      <DrtYearAndRemarkCells
        ticket={ticket}
        auditYears={auditYears}
        onOpenPeriodModal={onOpenPeriodModal}
      />

      {/* 17. 1st through 5th Progress Stages */}
      <DrtProgressCells
        ticket={ticket}
        onOpenProgressModal={onOpenProgressModal}
      />

      {/* 18. Data Upload Action */}
      <td className="px-3 py-2.5 align-middle whitespace-nowrap text-center border-r border-slate-200">
        <div className="flex items-center justify-center gap-1">
          <button
            type="button"
            onClick={() => onOpenUploadModal(ticket, ticket.assignedTeamBucket === 'CLIENT' ? 'CLIENT' : 'AUDITEE')}
            title="Upload evidence"
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs transition-colors cursor-pointer"
          >
            <Upload className="w-3 h-3" />
            <span>Upload</span>
          </button>
        </div>
      </td>

      {/* 19. Actions */}
      <td className="py-2.5 px-3 text-center align-middle w-36">
        <DrtRowActions
          projectId={projectId}
          ticket={ticket}
          onManageSquad={onManageSquad}
          onManageTors={onManageTors}
        />
      </td>
    </tr>
  );
};
