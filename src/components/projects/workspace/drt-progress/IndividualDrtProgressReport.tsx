'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Edit3 } from 'lucide-react';
import { Button } from '../../../ui/Button';
import type { IDRTTicket, IDRTTicketPeriodStatus } from '../../../../types/drt.types';
import {
  DrtProgressPhase,
  DRT_PROGRESS_PHASES,
  getDrtStageData,
  getDrtStagePercentage,
} from '../../../../lib/drtProgressUtils';
import { DrtProgressCells } from '../drt/DrtProgressCells';
import { statusBadgeStyles } from '../drt/drtBadges';

export interface IndividualDrtProgressReportProps {
  projectId: string;
  ticket: IDRTTicket;
  allTickets: IDRTTicket[];
  auditYears: string[];
  clientName?: string;
  auditeeName?: string;
  onBackToAll: () => void;
  onSelectTicket: (ticketId: string) => void;
  onOpenProgressModal: (ticket: IDRTTicket, phase: DrtProgressPhase) => void;
}

const COL_WIDTH = 'w-44 min-w-[176px] max-w-[176px]';

export const IndividualDrtProgressReport: React.FC<IndividualDrtProgressReportProps> = ({
  projectId,
  ticket,
  allTickets,
  auditYears,
  clientName = 'BTRC',
  auditeeName = 'FHL',
  onBackToAll,
  onSelectTicket,
  onOpenProgressModal,
}) => {
  const periodStatuses = ticket.periodStatuses || [];
  const completedYearsCount = auditYears.filter((yr) => {
    const match = periodStatuses.find((p: IDRTTicketPeriodStatus) => p.periodLabel === yr);
    return match?.evidenceStatus === 'COMPLETED' || match?.evidenceStatus === 'SHARED';
  }).length;
  const yearCompleteness = auditYears.length
    ? Math.round((completedYearsCount / auditYears.length) * 100)
    : 0;

  const linkedTors: Array<{ id: string; code: string; title?: string }> = [];
  if (ticket.tor?.id && ticket.tor?.code) {
    linkedTors.push({ id: ticket.tor.id, code: ticket.tor.code, title: ticket.tor.title });
  }
  (ticket.tors || []).forEach((m) => {
    const t = m.tor;
    if (t?.id && t?.code && !linkedTors.some((x) => x.id === t.id)) {
      linkedTors.push({ id: t.id, code: t.code, title: t.title });
    }
  });

  const stagePercentages = DRT_PROGRESS_PHASES.map((p) => getDrtStagePercentage(ticket, p.key));
  const reviewOutcomeKey = ticket.reviewOutcome || 'PENDING';
  const assignedMember = ticket.fieldMember || ticket.supervisor;

  return (
    <div className="space-y-4">
      {/* Top Action & Switcher Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3 flex-wrap">
          <Button
            variant="outline"
            size="xs"
            onClick={onBackToAll}
            leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
          >
            All DRT Progress Table
          </Button>
          <span className="text-slate-300">|</span>
          <span className="text-xs font-semibold text-slate-800">
            Individual DRT Progress Report:{' '}
            <strong className="font-mono text-indigo-700">{ticket.requestCode}</strong>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-slate-500 whitespace-nowrap">
            Switch DRT:
          </label>
          <select
            value={ticket.id}
            onChange={(e) => onSelectTicket(e.target.value)}
            className="text-xs font-medium rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-indigo-600 max-w-xs truncate"
          >
            {allTickets.map((t) => (
              <option key={t.id} value={t.id}>
                [{t.requestCode}] {t.description.slice(0, 60)}
                {t.description.length > 60 ? '...' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table 1: Single-DRT Horizontal Matrix (All Columns Same Width) */}
      <div className="w-full overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-2xs">
        <table
          className="w-full table-fixed border-collapse text-left text-xs"
          style={{ minWidth: `${22 * 176}px` }}
        >
          <thead>
            <tr className="bg-slate-100/90 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-600">
              <th rowSpan={2} className={`py-3 px-3 text-center border-r border-slate-200 ${COL_WIDTH}`}>
                DRT ID
              </th>
              <th rowSpan={2} className={`py-3 px-3 border-r border-slate-200 ${COL_WIDTH}`}>
                Request Description
              </th>
              <th rowSpan={2} className={`py-3 px-3 text-center border-r border-slate-200 ${COL_WIDTH}`}>
                Linked ToR ID
              </th>
              <th rowSpan={2} className={`py-3 px-3 text-center border-r border-slate-200 ${COL_WIDTH}`}>
                DRT For
              </th>
              <th rowSpan={2} className={`py-3 px-3 text-center border-r border-slate-200 ${COL_WIDTH}`}>
                Department
              </th>
              <th rowSpan={2} className={`py-3 px-3 text-center border-r border-slate-200 ${COL_WIDTH}`}>
                Assigned Auditor
              </th>
              <th rowSpan={2} className={`py-3 px-3 text-center border-r border-slate-200 ${COL_WIDTH}`}>
                Completeness
              </th>
              {DRT_PROGRESS_PHASES.map((p) => (
                <th
                  key={p.key}
                  colSpan={3}
                  className="py-2 px-3 text-center border-r border-b border-emerald-200 bg-emerald-50/80 text-emerald-900"
                >
                  {p.shortLabel}
                </th>
              ))}
            </tr>
            <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-600">
              {DRT_PROGRESS_PHASES.map((p) => (
                <React.Fragment key={`${p.key}-sub`}>
                  <th className={`py-2 px-3 text-center border-r border-slate-200 bg-emerald-50/40 text-emerald-800 ${COL_WIDTH}`}>
                    Progress %
                  </th>
                  <th className={`py-2 px-3 text-left border-r border-slate-200 bg-emerald-50/40 text-emerald-800 ${COL_WIDTH}`}>
                    Auditee Remark
                  </th>
                  <th className={`py-2 px-3 text-left border-r border-slate-200 bg-emerald-50/40 text-emerald-800 ${COL_WIDTH}`}>
                    Auditor Remark
                  </th>
                </React.Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="bg-white hover:bg-slate-50/70 transition-colors">
              <td className={`py-3 px-3 text-center font-mono font-bold text-indigo-700 border-r border-slate-200 align-middle ${COL_WIDTH}`}>
                <span className="inline-block px-2.5 py-0.5 rounded bg-indigo-50 border border-indigo-200">
                  {ticket.requestCode}
                </span>
              </td>
              <td className={`py-3 px-3 border-r border-slate-200 align-middle ${COL_WIDTH}`}>
                <p className="font-semibold text-slate-900 line-clamp-3 leading-snug">
                  {ticket.title || ticket.description}
                </p>
              </td>
              <td className={`py-3 px-3 text-center border-r border-slate-200 align-middle ${COL_WIDTH}`}>
                <div className="flex flex-wrap items-center justify-center gap-1">
                  {linkedTors.length > 0 ? (
                    linkedTors.map((tor) => (
                      <Link
                        key={tor.id}
                        href={`/projects/${projectId}/tor-progress?torId=${tor.id}`}
                        className="font-mono font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200 text-[11px]"
                      >
                        {tor.code}
                      </Link>
                    ))
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </div>
              </td>
              <td className={`py-3 px-3 text-center border-r border-slate-200 align-middle ${COL_WIDTH}`}>
                {ticket.assignedTeamBucket === 'CLIENT' ? (
                  <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                    {clientName}
                  </span>
                ) : (
                  <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {auditeeName}
                  </span>
                )}
              </td>
              <td className={`py-3 px-3 text-center border-r border-slate-200 align-middle ${COL_WIDTH}`}>
                <span className="text-slate-700 font-medium">{ticket.department || '—'}</span>
              </td>
              <td className={`py-3 px-3 text-center border-r border-slate-200 align-middle ${COL_WIDTH}`}>
                <span className="text-slate-800 font-medium block truncate">
                  {assignedMember?.name || 'Unassigned'}
                </span>
                <span
                  className={`inline-flex mt-1 px-1.5 py-0.2 rounded text-[10px] font-semibold border ${
                    statusBadgeStyles[reviewOutcomeKey] || 'bg-slate-100 text-slate-700 border-slate-300'
                  }`}
                >
                  {reviewOutcomeKey.replace(/_/g, ' ')}
                </span>
              </td>
              <td className={`py-3 px-3 text-center border-r border-slate-200 align-middle ${COL_WIDTH}`}>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-800">
                    <span>{yearCompleteness}%</span>
                    <span className="text-[10px] text-slate-500 font-normal">
                      {completedYearsCount}/{auditYears.length}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 border border-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${yearCompleteness}%` }}
                    />
                  </div>
                </div>
              </td>
              <DrtProgressCells
                ticket={ticket}
                activePhase="ALL"
                onOpenProgressModal={onOpenProgressModal}
              />
            </tr>
          </tbody>
        </table>
      </div>

      {/* Table 2: Stage-by-Stage Tabular Breakdown (1st–5th Progress Rows, Equal Width Columns) */}
      <div className="w-full overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-2xs">
        <table
          className="w-full table-fixed border-collapse text-left text-xs"
          style={{ minWidth: `${6 * 176}px` }}
        >
          <thead>
            <tr className="bg-slate-100/90 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-600">
              <th className="py-3 px-3 border-r border-slate-200 w-1/6">Progress Stage</th>
              <th className="py-3 px-3 text-center border-r border-slate-200 w-1/6">
                Completion %
              </th>
              <th className="py-3 px-3 text-center border-r border-slate-200 w-1/6">
                Stage Variance (Δ)
              </th>
              <th className="py-3 px-3 border-r border-slate-200 w-1/6">
                Auditee Remark ({auditeeName})
              </th>
              <th className="py-3 px-3 border-r border-slate-200 w-1/6">
                Auditor Observation / Remark
              </th>
              <th className="py-3 px-3 text-center w-1/6">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {DRT_PROGRESS_PHASES.map((phase, idx) => {
              const stage = getDrtStageData(ticket, phase.key);
              const pct = stagePercentages[idx];
              const prevPct = idx > 0 ? stagePercentages[idx - 1] : 0;
              const delta = idx > 0 ? pct - prevPct : 0;

              return (
                <tr key={phase.key} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-3 font-bold text-slate-900 border-r border-slate-200 align-middle">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span>{phase.label}</span>
                    </div>
                  </td>

                  <td className="py-3 px-3 text-center border-r border-slate-200 align-middle">
                    <div className="space-y-1 max-w-[130px] mx-auto">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full font-mono text-[11px] font-bold border ${
                          pct === 100
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            : pct >= 50
                            ? 'bg-sky-50 text-sky-700 border-sky-300'
                            : pct > 0
                            ? 'bg-amber-50 text-amber-700 border-amber-300'
                            : 'bg-slate-100 text-slate-600 border-slate-300'
                        }`}
                      >
                        {pct}%
                      </span>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            pct === 100
                              ? 'bg-emerald-500'
                              : pct >= 50
                              ? 'bg-sky-500'
                              : pct > 0
                              ? 'bg-amber-500'
                              : 'bg-slate-300'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-3 text-center border-r border-slate-200 align-middle font-mono">
                    {idx === 0 ? (
                      <span className="text-slate-400 text-[11px]">Baseline</span>
                    ) : delta > 0 ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[11px]">
                        +{delta}%
                      </span>
                    ) : delta < 0 ? (
                      <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 font-bold text-[11px]">
                        {delta}%
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[11px]">0%</span>
                    )}
                  </td>

                  <td
                    onClick={() => onOpenProgressModal(ticket, phase.key)}
                    className="py-3 px-3 border-r border-slate-200 align-middle cursor-pointer hover:bg-slate-100/70"
                  >
                    {stage.auditeeRemark ? (
                      <p className="text-slate-700 whitespace-pre-wrap break-words">
                        {stage.auditeeRemark}
                      </p>
                    ) : (
                      <span className="text-slate-400 italic">Click to add auditee remark...</span>
                    )}
                  </td>

                  <td
                    onClick={() => onOpenProgressModal(ticket, phase.key)}
                    className="py-3 px-3 border-r border-slate-200 align-middle cursor-pointer hover:bg-slate-100/70"
                  >
                    {stage.auditorRemark ? (
                      <p className="text-slate-700 whitespace-pre-wrap break-words">
                        {stage.auditorRemark}
                      </p>
                    ) : (
                      <span className="text-slate-400 italic">Click to add auditor remark...</span>
                    )}
                  </td>

                  <td className="py-3 px-3 text-center align-middle">
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={() => onOpenProgressModal(ticket, phase.key)}
                      leftIcon={<Edit3 className="w-3 h-3 text-indigo-600" />}
                    >
                      Edit {phase.shortLabel}
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
