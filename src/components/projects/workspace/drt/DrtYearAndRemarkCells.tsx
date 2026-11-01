'use client';

import React, { useMemo } from 'react';
import { History } from 'lucide-react';
import type { IDRTTicket, IDRTTicketPeriodStatus } from '../../../../types/drt.types';
import { periodColorMap, getDrtRemarkVersions } from './drtBadges';

export interface DrtYearAndRemarkCellsProps {
  ticket: IDRTTicket;
  auditYears: string[];
  auditeeName?: string;
  onOpenPeriodModal: (ticket: IDRTTicket, periodLabel: string) => void;
  onOpenRemarkModal: (ticket: IDRTTicket, type: 'AUDITOR' | 'AUDITEE') => void;
}

export const DrtYearAndRemarkCells: React.FC<DrtYearAndRemarkCellsProps> = ({
  ticket,
  auditYears,
  auditeeName = 'FHL',
  onOpenPeriodModal,
  onOpenRemarkModal,
}) => {
  const periodStatuses = ticket.periodStatuses || [];
  const validPeriods = auditYears.map((yr) =>
    periodStatuses.find((p: IDRTTicketPeriodStatus) => p.periodLabel === yr)
  );
  const completedCount = validPeriods.filter(
    (p) => p?.evidenceStatus === 'COMPLETED' || p?.evidenceStatus === 'SHARED'
  ).length;
  const completeness = auditYears.length
    ? Math.round((completedCount / auditYears.length) * 100)
    : 0;

  const auditorVersions = useMemo(
    () => getDrtRemarkVersions(ticket, 'AUDITOR', auditeeName),
    [ticket, auditeeName]
  );
  const auditeeVersions = useMemo(
    () => getDrtRemarkVersions(ticket, 'AUDITEE', auditeeName),
    [ticket, auditeeName]
  );
  const latestAuditor = auditorVersions[0];
  const latestAuditee = auditeeVersions[0];

  return (
    <>
      {/* 16. Dedicated Column for Each Audit Year */}
      {auditYears.map((year) => {
        const match = periodStatuses.find((p: IDRTTicketPeriodStatus) => p.periodLabel === year);
        const statusKey = match?.evidenceStatus || 'IN_PROGRESS';
        const label =
          statusKey === 'COMPLETED' || statusKey === 'SHARED'
            ? 'Shared'
            : statusKey === 'PARTIAL'
            ? 'Partial'
            : statusKey === 'NOT_SHARED'
            ? 'Not Shared'
            : statusKey === 'NOT_APPLICABLE'
            ? 'N/A'
            : 'In Prog';

        return (
          <td
            key={year}
            className="px-1.5 py-2.5 align-middle text-center border-r border-slate-200 whitespace-nowrap min-w-[55px]"
          >
            <button
              type="button"
              onClick={() => onOpenPeriodModal(ticket, year)}
              title={`${year}: ${(statusKey || 'IN_PROGRESS').replace(/_/g, ' ')} (Click to update)`}
              className={`inline-flex px-1.5 py-0.5 text-[10px] font-semibold rounded border cursor-pointer hover:opacity-85 transition-opacity ${
                periodColorMap[statusKey] || 'bg-slate-100 text-slate-600 border-slate-200'
              }`}
            >
              {label}
            </button>
          </td>
        );
      })}

      {/* 17. Completeness */}
      <td className="px-3 py-2.5 align-middle whitespace-nowrap border-r border-slate-200 text-center min-w-[90px]">
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-800">
            <span>{completeness}%</span>
            <span className="text-[10px] text-slate-500 font-normal">
              {completedCount}/{auditYears.length}
            </span>
          </div>
          <div className="w-16 h-1.5 bg-slate-100 border border-slate-200 rounded-full overflow-hidden mx-auto">
            <div
              className={`h-full transition-all duration-300 ${
                completeness === 100
                  ? 'bg-emerald-500'
                  : completeness > 50
                  ? 'bg-sky-500'
                  : 'bg-amber-500'
              }`}
              style={{ width: `${completeness}%` }}
            />
          </div>
        </div>
      </td>

      {/* 18. Auditor Remarks */}
      <td className="px-3 py-2.5 align-middle max-w-[190px] border-r border-slate-200">
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-1">
            <button
              type="button"
              onClick={() => onOpenRemarkModal(ticket, 'AUDITOR')}
              className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-colors cursor-pointer"
            >
              <History className="w-2.5 h-2.5" />
              <span>v{latestAuditor?.version || 1}</span>
            </button>
            <span className="text-[10px] text-slate-400 font-medium">
              {auditorVersions.length} ver
            </span>
          </div>
          <p
            className="text-[11px] text-slate-700 line-clamp-2 leading-tight cursor-pointer hover:text-indigo-600 transition-colors"
            onClick={() => onOpenRemarkModal(ticket, 'AUDITOR')}
            title="Click to view all versioned remarks"
          >
            {latestAuditor?.content || ticket.remarks || 'No auditor remark yet.'}
          </p>
        </div>
      </td>

      {/* 19. Auditee Remarks */}
      <td className="px-3 py-2.5 align-middle max-w-[190px] border-r border-slate-200">
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-1">
            <button
              type="button"
              onClick={() => onOpenRemarkModal(ticket, 'AUDITEE')}
              className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 transition-colors cursor-pointer"
            >
              <History className="w-2.5 h-2.5" />
              <span>v{latestAuditee?.version || 1}</span>
            </button>
            <span className="text-[10px] text-slate-400 font-medium">
              {auditeeVersions.length} ver
            </span>
          </div>
          <p
            className="text-[11px] text-slate-700 line-clamp-2 leading-tight cursor-pointer hover:text-teal-600 transition-colors"
            onClick={() => onOpenRemarkModal(ticket, 'AUDITEE')}
            title="Click to view all versioned remarks"
          >
            {latestAuditee?.content || ticket.currentRequirement || 'No auditee remark yet.'}
          </p>
        </div>
      </td>
    </>
  );
};
