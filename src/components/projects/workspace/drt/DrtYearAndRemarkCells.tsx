'use client';

import React from 'react';
import type { IDRTTicket, IDRTTicketPeriodStatus } from '../../../../types/drt.types';
import { periodColorMap } from './drtBadges';

export interface DrtYearAndRemarkCellsProps {
  ticket: IDRTTicket;
  auditYears: string[];
  onOpenPeriodModal: (ticket: IDRTTicket, periodLabel: string) => void;
}

export const DrtYearAndRemarkCells: React.FC<DrtYearAndRemarkCellsProps> = ({
  ticket,
  auditYears,
  onOpenPeriodModal,
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

  return (
    <>
      {/* Dedicated Column for Each Audit Year */}
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

      {/* Completeness Bar */}
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
    </>
  );
};
