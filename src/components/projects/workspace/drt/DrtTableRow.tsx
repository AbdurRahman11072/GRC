'use client';

import React from 'react';
import Link from 'next/link';
import { Upload, FileCheck2 } from 'lucide-react';
import type { IDRTTicket, IDRTTicketPeriodStatus, DRTPartySide } from '../../../../types/drt.types';
import { DrtDescriptionCell } from './DrtDescriptionCell';
import { DrtRowActions } from './DrtRowActions';
import { DrtUnifiedCloudCollectionCells } from './DrtUnifiedCloudCollectionCells';
import { DrtYearAndRemarkCells } from './DrtYearAndRemarkCells';
import { statusBadgeStyles } from './drtBadges';
import { formatDate } from '../../../../lib/utils';

export interface DrtTableRowProps {
  projectId: string;
  ticket: IDRTTicket;
  index: number;
  clientName?: string;
  auditeeName?: string;
  auditYears: string[];
  stream?: 'collection' | 'analysis';
  onManageSquad?: (ticket: IDRTTicket) => void;
  onManageTors?: (ticket: IDRTTicket) => void;
  onOpenPeriodModal: (ticket: IDRTTicket, periodLabel: string) => void;
  onOpenUploadModal: (ticket: IDRTTicket, partySide: DRTPartySide) => void;
  onOpenAnalysisModal?: (ticket: IDRTTicket, year?: string) => void;
}

export const DrtTableRow: React.FC<DrtTableRowProps> = ({
  projectId,
  ticket,
  index,
  clientName = 'BTRC',
  auditeeName = 'FHL',
  auditYears,
  stream = 'collection',
  onManageSquad,
  onManageTors,
  onOpenPeriodModal,
  onOpenUploadModal,
  onOpenAnalysisModal,
}) => {
  const isAnalysis = stream === 'analysis';
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

  const periodStatuses = ticket.periodStatuses || [];
  const completedCount = auditYears.filter((yr) => {
    const p = periodStatuses.find((ps: IDRTTicketPeriodStatus) => ps.periodLabel === yr);
    return p?.evidenceStatus === 'COMPLETED' || p?.evidenceStatus === 'SHARED';
  }).length;
  const completeness = auditYears.length
    ? Math.round((completedCount / auditYears.length) * 100)
    : 0;

  return (
    <tr className="group border-b border-slate-200 hover:bg-slate-50/70 transition-colors text-xs bg-white">
      {/* 1. SL (Sticky Left) */}
      <td className="sticky left-0 z-10 bg-white group-hover:bg-slate-50 transition-colors py-2.5 px-2 text-center font-mono text-slate-500 border-r border-slate-200 align-middle w-12 min-w-[48px] max-w-[48px]">
        {index + 1}
      </td>

      {/* 2. ID (Sticky Left) */}
      <td className="sticky left-[48px] z-10 bg-white group-hover:bg-slate-50 transition-colors py-2.5 px-2.5 text-center font-mono font-bold text-xs text-indigo-700 border-r border-slate-200 align-middle w-24 min-w-[96px] max-w-[96px]">
        <Link
          href={`/projects/${projectId}/drt/${ticket.id}`}
          className="inline-block px-2 py-0.5 rounded bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 text-indigo-700 hover:text-indigo-900 transition-colors cursor-pointer hover:underline"
          title={`View details for ${ticket.requestCode}`}
        >
          {ticket.requestCode}
        </Link>
      </td>

      {/* 3. Request Description (Sticky Left) */}
      <td className="sticky left-[144px] z-10 bg-white group-hover:bg-slate-50 transition-colors py-2.5 px-3 min-w-[280px] max-w-sm border-r border-slate-200 align-middle space-y-1 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.06)]">
        <DrtDescriptionCell ticket={ticket} docs={docs} projectId={projectId} />
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

      {/* 12. Review / Analysis Status */}
      <td className="px-3 py-2.5 align-middle whitespace-nowrap border-r border-slate-200 text-center">
        <span
          className={`inline-flex px-2 py-0.5 rounded text-[11px] font-semibold border ${
            isAnalysis
              ? reviewOutcomeKey === 'DONE'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                : reviewOutcomeKey === 'PARTIAL'
                ? 'bg-amber-50 text-amber-700 border-amber-300'
                : 'bg-slate-100 text-slate-700 border-slate-300'
              : statusBadgeStyles[reviewOutcomeKey] || 'bg-slate-100 text-slate-700 border-slate-300'
          }`}
        >
          {isAnalysis && reviewOutcomeKey === 'DONE'
            ? 'EXAMINED'
            : reviewOutcomeKey.replace(/_/g, ' ')}
        </span>
      </td>

      {/* 13-14. Cloud Link & Collection Status OR Analysis Marks & Verification */}
      {isAnalysis ? (
        <>
          {/* Analysis Marks */}
          <td className="px-3 py-2.5 align-middle whitespace-nowrap border-r border-slate-200 text-center font-mono">
            <span className="font-bold text-indigo-700">
              {(ticket.analysisObtained ?? 0).toFixed(1)}
            </span>
            <span className="text-slate-400 mx-1">/</span>
            <span className="text-slate-600">
              {(ticket.analysisAllocated ?? 0).toFixed(1)}
            </span>
          </td>

          {/* Verification Tier */}
          <td className="px-3 py-2.5 align-middle whitespace-nowrap border-r border-slate-200 text-center">
            {completeness === 100 ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-300">
                Verified
              </span>
            ) : completeness > 0 ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-300">
                In Progress
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                Pending
              </span>
            )}
          </td>
        </>
      ) : (
        <DrtUnifiedCloudCollectionCells ticket={ticket} />
      )}

      {/* 15-16. Audit Years & Completeness/Findings */}
      {isAnalysis ? (
        <>
          {/* Individual Audit Year Verification Cells */}
          {auditYears.map((year) => {
            const match = periodStatuses.find((p: IDRTTicketPeriodStatus) => p.periodLabel === year);
            const statusKey = match?.evidenceStatus || 'IN_PROGRESS';
            const isVerified = statusKey === 'COMPLETED' || statusKey === 'SHARED';
            const isPartial = statusKey === 'PARTIAL';
            const isNA = statusKey === 'NOT_APPLICABLE';

            return (
              <td
                key={year}
                className="px-1.5 py-2.5 align-middle text-center border-r border-slate-200 whitespace-nowrap min-w-[65px]"
              >
                <button
                  type="button"
                  onClick={() => onOpenAnalysisModal?.(ticket, year)}
                  title={`Year ${year}: ${match?.remark || statusKey} (Click to examine)`}
                  className={`inline-flex px-1.5 py-0.5 text-[10px] font-semibold rounded border cursor-pointer hover:opacity-85 transition-opacity ${
                    isVerified
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      : isPartial
                      ? 'bg-amber-50 text-amber-700 border-amber-300'
                      : isNA
                      ? 'bg-slate-100 text-slate-500 border-slate-200'
                      : 'bg-rose-50 text-rose-700 border-rose-300'
                  }`}
                >
                  {isVerified ? 'Verified' : isPartial ? 'Partial' : isNA ? 'N/A' : 'Unverified'}
                </button>
              </td>
            );
          })}

          {/* Audit Findings */}
          <td className="px-3 py-2.5 align-middle whitespace-nowrap border-r border-slate-200 text-center">
            {ticket.remarks ? (
              <span
                title={ticket.remarks}
                className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-300 truncate max-w-[120px]"
              >
                Obs Recorded
              </span>
            ) : (
              <span className="text-slate-400 font-mono text-[11px]">None</span>
            )}
          </td>
        </>
      ) : (
        <DrtYearAndRemarkCells
          ticket={ticket}
          auditYears={auditYears}
          onOpenPeriodModal={onOpenPeriodModal}
        />
      )}

      {/* 17. Data Upload vs Examination Action */}
      <td className="px-3 py-2.5 align-middle whitespace-nowrap text-center border-r border-slate-200">
        <div className="flex items-center justify-center gap-1">
          {isAnalysis ? (
            <button
              type="button"
              onClick={() => onOpenAnalysisModal?.(ticket)}
              title="Examine evidence & award analysis marks"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xs transition-colors cursor-pointer"
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>Examine</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onOpenUploadModal(ticket, ticket.assignedTeamBucket === 'CLIENT' ? 'CLIENT' : 'AUDITEE')}
              title="Upload evidence"
              className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs transition-colors cursor-pointer"
            >
              <Upload className="w-3 h-3" />
              <span>Upload</span>
            </button>
          )}
        </div>
      </td>

      {/* 18. Actions */}
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
