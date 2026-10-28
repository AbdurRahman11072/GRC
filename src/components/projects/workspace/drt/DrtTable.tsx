'use client';

import React, { useMemo } from 'react';
import { Layers } from 'lucide-react';
import { DrtTableRow } from './DrtTableRow';
import type { IDRTTicket, IDRTDocument, DRTPartySide } from '../../../../types/project.types';

export interface DrtTableProps {
  tickets: IDRTTicket[];
  canUpload: boolean;
  canReview: boolean;
  auditYears?: string[];
  clientName?: string;
  auditeeName?: string;
  onUpload: (ticket: IDRTTicket, side: DRTPartySide) => void;
  onReview: (ticket: IDRTTicket, doc?: IDRTDocument) => void;
  onManageSquad: (ticket: IDRTTicket) => void;
  onEditPeriodStatus?: (ticket: IDRTTicket, year: string) => void;
  onManageTors?: (ticket: IDRTTicket) => void;
}

export const DrtTable: React.FC<DrtTableProps> = ({
  tickets,
  canUpload,
  canReview,
  auditYears,
  clientName = 'BTRC',
  auditeeName = 'FHL',
  onUpload,
  onReview,
  onManageSquad,
  onEditPeriodStatus,
  onManageTors,
}) => {
  // Dynamically extract all unique years from auditYears and ticket period statuses
  const allYears = useMemo(() => {
    const yearSet = new Set<string>(auditYears && auditYears.length > 0 ? auditYears : []);
    tickets.forEach((t) => {
      t.periodStatuses?.forEach((ps) => {
        if (ps.periodLabel) yearSet.add(ps.periodLabel);
      });
    });

    const sorted = Array.from(yearSet).sort();
    return sorted.length > 0 ? sorted : (auditYears || ['2020', '2021', '2022', '2023', '2024', '2025', '2026']);
  }, [tickets, auditYears]);

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-300 bg-white shadow-2xs">
      <table className="w-full text-left border-collapse min-w-[1400px]">
        <thead>
          <tr className="border-b border-slate-300 bg-slate-100/90 text-[11px] font-bold text-slate-700 uppercase tracking-wider select-none">
            {/* SL */}
            <th className="py-2.5 px-2 text-center border-r border-slate-300 w-12">
              SL
            </th>

            {/* ID */}
            <th className="py-2.5 px-2.5 text-center border-r border-slate-300 w-20">
              ID
            </th>

            {/* Request Description */}
            <th className="py-2.5 px-3 border-r border-slate-300 min-w-[260px]">
              Request Description
            </th>

            {/* ToR Wise Activities */}
            <th className="py-2.5 px-2 text-center border-r border-slate-300 w-24 bg-emerald-50/60 text-emerald-900">
              ToR Clause
            </th>

            {/* Date of Request */}
            <th className="py-2.5 px-2 text-center border-r border-slate-300 w-24">
              Date of Request
            </th>

            {/* Expected Date of Receipt */}
            <th className="py-2.5 px-2 text-center border-r border-slate-300 w-24">
              Expected Date
            </th>

            {/* Actual Date of Receipt */}
            <th className="py-2.5 px-2 text-center border-r border-slate-300 w-24">
              Actual Date
            </th>

            {/* Status as per Auditor */}
            <th className="py-2.5 px-2 text-center border-r border-slate-300 w-28 bg-amber-50/60 text-amber-900">
              Status (Auditor)
            </th>

            {/* Excess Time (Days) */}
            <th className="py-2.5 px-2 text-center border-r border-slate-300 w-20 bg-rose-50/60 text-rose-900">
              Excess (Days)
            </th>

            {/* Google Drive Status as per Client */}
            <th className="py-2.5 px-2 text-center border-r border-slate-300 w-28 bg-cyan-50/60 text-cyan-900">
              Google Drive ({clientName})
            </th>

            {/* Status as per Client */}
            <th className="py-2.5 px-2 text-center border-r border-slate-300 w-28 bg-teal-50/60 text-teal-900">
              Status ({clientName})
            </th>

            {/* Google Drive Status as per Auditee */}
            <th className="py-2.5 px-2 text-center border-r border-slate-300 w-28 bg-indigo-50/60 text-indigo-900">
              Google Drive ({auditeeName})
            </th>

            {/* Status as per Auditee FY */}
            <th className="py-2.5 px-2 text-center border-r border-slate-300 w-28 bg-purple-50/60 text-purple-900">
              Status ({auditeeName} FY)
            </th>

            {/* Multi-Year Timeline Columns */}
            {allYears.map((yr) => (
              <th
                key={yr}
                className="py-2.5 px-1.5 text-center border-r border-slate-300 w-16 bg-slate-100 text-slate-800 font-mono text-[11px]"
              >
                {yr}
              </th>
            ))}

            {/* Completeness */}
            <th className="py-2.5 px-2 text-center border-r border-slate-300 w-24">
              Completeness
            </th>

            {/* Remarks */}
            <th className="py-2.5 px-3 border-r border-slate-300 min-w-[200px]">
              Auditor Remarks
            </th>

            {/* Actions */}
            <th className="py-2.5 px-2 text-center w-28">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {tickets.length > 0 ? (
            tickets.map((ticket, idx) => (
              <DrtTableRow
                key={ticket.id}
                ticket={ticket}
                index={idx}
                years={allYears}
                canUpload={canUpload}
                canReview={canReview}
                clientName={clientName}
                auditeeName={auditeeName}
                onUpload={onUpload}
                onReview={onReview}
                onManageSquad={onManageSquad}
                onEditPeriodStatus={onEditPeriodStatus}
                onManageTors={onManageTors}
              />
            ))
          ) : (
            <tr>
              <td
                colSpan={16 + allYears.length}
                className="py-12 text-center text-xs text-slate-500"
              >
                <div className="flex flex-col items-center gap-2">
                  <Layers className="w-6 h-6 text-slate-400" />
                  <span>No DRT request tickets found matching your filter criteria.</span>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
