'use client';

import React from 'react';
import Link from 'next/link';
import { Eye } from 'lucide-react';
import type { IDRTTicket, IDRTTicketPeriodStatus } from '../../../../types/drt.types';
import {
  DrtProgressPhase,
  DRT_PROGRESS_PHASES,
} from '../../../../lib/drtProgressUtils';
import { DrtProgressCells } from '../drt/DrtProgressCells';
import { DrtDescriptionCell } from '../drt/DrtDescriptionCell';

export interface DrtProgressTableProps {
  projectId: string;
  tickets: IDRTTicket[];
  auditYears: string[];
  clientName?: string;
  auditeeName?: string;
  activePhase: 'ALL' | DrtProgressPhase;
  onSelectTicket: (ticketId: string) => void;
  onOpenProgressModal: (ticket: IDRTTicket, phase: DrtProgressPhase) => void;
}

const COL_WIDTH = 'w-44 min-w-[176px] max-w-[176px]';

export const DrtProgressTable: React.FC<DrtProgressTableProps> = ({
  projectId,
  tickets,
  auditYears,
  clientName = 'BTRC',
  auditeeName = 'FHL',
  activePhase,
  onSelectTicket,
  onOpenProgressModal,
}) => {
  const visiblePhases =
    activePhase === 'ALL'
      ? DRT_PROGRESS_PHASES
      : DRT_PROGRESS_PHASES.filter((p) => p.key === activePhase);

  const totalColumns = 8 + visiblePhases.length * 3;
  const tableWidthPx = totalColumns * 176;

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-2xs">
      <table
        className="w-full table-fixed border-collapse text-left"
        style={{ minWidth: `${tableWidthPx}px` }}
      >
        <thead>
          {/* Tier 1 Header */}
          <tr className="bg-slate-100/90 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-600">
            <th
              rowSpan={2}
              className={`py-3 px-3 text-center border-r border-slate-200 ${COL_WIDTH}`}
            >
              SL
            </th>
            <th
              rowSpan={2}
              className={`py-3 px-3 text-center border-r border-slate-200 ${COL_WIDTH}`}
            >
              DRT ID
            </th>
            <th
              rowSpan={2}
              className={`py-3 px-3 border-r border-slate-200 ${COL_WIDTH}`}
            >
              Request Description
            </th>
            <th
              rowSpan={2}
              className={`py-3 px-3 text-center border-r border-slate-200 ${COL_WIDTH}`}
            >
              ToR ID
            </th>
            <th
              rowSpan={2}
              className={`py-3 px-3 text-center border-r border-slate-200 ${COL_WIDTH}`}
            >
              DRT For
            </th>
            <th
              rowSpan={2}
              className={`py-3 px-3 text-center border-r border-slate-200 ${COL_WIDTH}`}
            >
              Department
            </th>
            <th
              rowSpan={2}
              className={`py-3 px-3 text-center border-r border-slate-200 ${COL_WIDTH}`}
            >
              Completeness
            </th>

            {visiblePhases.map((p) => {
              const colorClass =
                p.key === 'FIRST_PROGRESS'
                  ? 'border-emerald-200 bg-emerald-50/80 text-emerald-900'
                  : p.key === 'SECOND_PROGRESS'
                  ? 'border-sky-200 bg-sky-50/80 text-sky-900'
                  : p.key === 'THIRD_PROGRESS'
                  ? 'border-blue-200 bg-blue-50/80 text-blue-900'
                  : p.key === 'FOURTH_PROGRESS'
                  ? 'border-purple-200 bg-purple-50/80 text-purple-900'
                  : 'border-amber-200 bg-amber-50/80 text-amber-900';

              return (
                <th
                  key={p.key}
                  colSpan={3}
                  className={`py-2 px-3 text-center border-r border-b ${colorClass}`}
                >
                  {p.shortLabel}
                </th>
              );
            })}

            <th
              rowSpan={2}
              className={`py-3 px-3 text-center ${COL_WIDTH}`}
            >
              Report
            </th>
          </tr>

          {/* Tier 2 Sub-Header */}
          <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-600">
            {visiblePhases.map((p) => {
              const subColorClass =
                p.key === 'FIRST_PROGRESS'
                  ? 'bg-emerald-50/40 text-emerald-800'
                  : p.key === 'SECOND_PROGRESS'
                  ? 'bg-sky-50/40 text-sky-800'
                  : p.key === 'THIRD_PROGRESS'
                  ? 'bg-blue-50/40 text-blue-800'
                  : p.key === 'FOURTH_PROGRESS'
                  ? 'bg-purple-50/40 text-purple-800'
                  : 'bg-amber-50/40 text-amber-800';

              return (
                <React.Fragment key={`${p.key}-sub`}>
                  <th
                    className={`py-2 px-3 text-center border-r border-slate-200 ${COL_WIDTH} ${subColorClass}`}
                  >
                    Progress %
                  </th>
                  <th
                    className={`py-2 px-3 text-left border-r border-slate-200 ${COL_WIDTH} ${subColorClass}`}
                  >
                    Auditee Remark
                  </th>
                  <th
                    className={`py-2 px-3 text-left border-r border-slate-200 ${COL_WIDTH} ${subColorClass}`}
                  >
                    Auditor Remark
                  </th>
                </React.Fragment>
              );
            })}
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-200">
          {tickets.map((ticket, index) => {
            const docs = ticket.drtDocuments || [];
            const periodStatuses = ticket.periodStatuses || [];
            const completedCount = auditYears.filter((yr) => {
              const match = periodStatuses.find(
                (p: IDRTTicketPeriodStatus) => p.periodLabel === yr
              );
              return match?.evidenceStatus === 'COMPLETED' || match?.evidenceStatus === 'SHARED';
            }).length;
            const completeness = auditYears.length
              ? Math.round((completedCount / auditYears.length) * 100)
              : 0;

            const linkedTors: Array<{ id: string; code: string }> = [];
            if (ticket.tor?.id && ticket.tor?.code) {
              linkedTors.push({ id: ticket.tor.id, code: ticket.tor.code });
            }
            (ticket.tors || []).forEach((m) => {
              const t = m.tor;
              if (t?.id && t?.code && !linkedTors.some((x) => x.id === t.id)) {
                linkedTors.push({ id: t.id, code: t.code });
              }
            });

            return (
              <tr
                key={ticket.id}
                className="group border-b border-slate-200 hover:bg-slate-50/70 transition-colors text-xs bg-white"
              >
                {/* 1. SL */}
                <td
                  className={`py-2.5 px-3 text-center font-mono text-slate-500 border-r border-slate-200 align-middle ${COL_WIDTH}`}
                >
                  {index + 1}
                </td>

                {/* 2. DRT ID */}
                <td
                  className={`py-2.5 px-3 text-center font-mono font-bold text-xs text-indigo-700 border-r border-slate-200 align-middle ${COL_WIDTH}`}
                >
                  <button
                    type="button"
                    onClick={() => onSelectTicket(ticket.id)}
                    title={`Click to view Individual DRT Progress Report for ${ticket.requestCode}`}
                    className="inline-block px-2.5 py-0.5 rounded bg-indigo-50 hover:bg-indigo-600 hover:text-white border border-indigo-200/80 transition-colors cursor-pointer"
                  >
                    {ticket.requestCode}
                  </button>
                </td>

                {/* 3. Request Description */}
                <td
                  className={`py-2.5 px-3 border-r border-slate-200 align-middle space-y-1 ${COL_WIDTH}`}
                >
                  <DrtDescriptionCell ticket={ticket} docs={docs} />
                </td>

                {/* 4. ToR ID */}
                <td
                  className={`py-2.5 px-3 text-center font-mono text-xs border-r border-slate-200 bg-slate-50/30 align-middle ${COL_WIDTH}`}
                >
                  <div className="flex flex-wrap items-center justify-center gap-1">
                    {linkedTors.length > 0 ? (
                      linkedTors.map((t) => (
                        <Link
                          key={t.id}
                          href={`/projects/${projectId}/tor-progress?torId=${t.id}`}
                          title={`Open ToR ${t.code} Progress Report`}
                          className="font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-200 text-[11px] transition-colors"
                        >
                          {t.code}
                        </Link>
                      ))
                    ) : (
                      <span className="text-slate-400 font-sans text-[11px]">—</span>
                    )}
                  </div>
                </td>

                {/* 5. DRT For */}
                <td
                  className={`py-2.5 px-3 text-center border-r border-slate-200 align-middle whitespace-nowrap ${COL_WIDTH}`}
                >
                  {ticket.assignedTeamBucket === 'CLIENT' ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                      {clientName}
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {auditeeName}
                    </span>
                  )}
                </td>

                {/* 6. Department */}
                <td
                  className={`py-2.5 px-3 text-center border-r border-slate-200 align-middle ${COL_WIDTH}`}
                >
                  {ticket.department ? (
                    <span
                      className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200 truncate max-w-[150px]"
                      title={ticket.department}
                    >
                      {ticket.department}
                    </span>
                  ) : (
                    <span className="text-slate-400 font-mono text-[11px]">—</span>
                  )}
                </td>

                {/* 7. Completeness */}
                <td
                  className={`px-3 py-2.5 align-middle whitespace-nowrap border-r border-slate-200 text-center ${COL_WIDTH}`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-800">
                      <span>{completeness}%</span>
                      <span className="text-[10px] text-slate-500 font-normal">
                        {completedCount}/{auditYears.length}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 border border-slate-200 rounded-full overflow-hidden mx-auto">
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

                {/* 8. 1st–5th Progress & Remarks */}
                <DrtProgressCells
                  ticket={ticket}
                  activePhase={activePhase}
                  onOpenProgressModal={onOpenProgressModal}
                />

                {/* 9. Individual Report Action */}
                <td className={`py-2.5 px-3 text-center align-middle ${COL_WIDTH}`}>
                  <button
                    type="button"
                    onClick={() => onSelectTicket(ticket.id)}
                    title={`View Individual DRT Progress Report for ${ticket.requestCode}`}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Report</span>
                  </button>
                </td>
              </tr>
            );
          })}

          {tickets.length === 0 && (
            <tr>
              <td colSpan={totalColumns} className="py-12 text-center text-xs text-slate-500">
                No DRT tickets found matching your filters.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
