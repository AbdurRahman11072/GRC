'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Edit3, ExternalLink } from 'lucide-react';
import { Button } from '../../ui/Button';
import type { ITorNode, TorProgressReportPhase } from '../../../types/tor.types';
import type { IDRTTicket } from '../../../types/project.types';
import {
  DRT_PROGRESS_PHASES,
  getDrtStageData,
  getDrtStagePercentage,
  getPhaseTargetYear,
  type DrtProgressPhase,
} from '../../../lib/drtProgressUtils';
import {
  REPORT_PHASES,
  getTorStageData,
  aggregateTorDrtProgress,
  collectAllTorDrtTickets,
} from '../../../lib/torProgressUtils';
import { getTorStagePercentage } from '../../../lib/torPercentageUtils';
import { TorProgressTable } from './TorProgressTable';

export interface IndividualTorProgressReportProps {
  projectId: string;
  node: ITorNode;
  flatNodes: ITorNode[];
  allProjectTickets: IDRTTicket[];
  auditYears?: string[];
  progressYearMapping?: Record<string, string[]> | null;
  clientName?: string;
  auditeeName?: string;
  onBackToAll: () => void;
  onSelectTor: (torId: string) => void;
  onOpenSummaryModal: (node: ITorNode, phase: TorProgressReportPhase) => void;
}

const COL_WIDTH = 'w-44 min-w-[176px] max-w-[176px]';

export const IndividualTorProgressReport: React.FC<IndividualTorProgressReportProps> = ({
  projectId,
  node,
  flatNodes,
  allProjectTickets,
  auditYears,
  progressYearMapping,
  clientName = 'BTRC',
  auditeeName = 'FHL',
  onBackToAll,
  onSelectTor,
  onOpenSummaryModal,
}) => {
  const allLinkedDrts = collectAllTorDrtTickets(node, allProjectTickets);
  const progressPhaseKeys: DrtProgressPhase[] = [
    'FIRST_PROGRESS',
    'SECOND_PROGRESS',
    'THIRD_PROGRESS',
    'FOURTH_PROGRESS',
    'FIFTH_PROGRESS',
  ];

  return (
    <div className="space-y-4">
      {/* Top Action & Clause Switcher Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3 flex-wrap">
          <Button
            variant="outline"
            size="xs"
            onClick={onBackToAll}
            leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
          >
            All ToR Progress Table
          </Button>
          <span className="text-slate-300">|</span>
          <span className="text-xs font-semibold text-slate-800">
            Individual ToR Progress &amp; DRT Rollup Report:{' '}
            <strong className="font-mono text-indigo-700">ToR {node.code}</strong> —{' '}
            <span>{node.title}</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-slate-500 whitespace-nowrap">
            Switch ToR Clause:
          </label>
          <select
            value={node.id}
            onChange={(e) => onSelectTor(e.target.value)}
            className="text-xs font-medium rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-indigo-600 max-w-xs truncate"
          >
            {flatNodes.map((n) => (
              <option key={n.id} value={n.id}>
                [ToR {n.code}] {n.title.slice(0, 55)}
                {n.title.length > 55 ? '...' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table 1: Single ToR (and Child Sub-ToRs) Horizontal Progress Matrix (All Columns Same Width) */}
      <TorProgressTable
        treeNodes={[node]}
        allProjectTickets={allProjectTickets}
        auditYears={auditYears}
        activeFilter="ALL"
        onSelectTor={onSelectTor}
        onOpenSummaryModal={onOpenSummaryModal}
      />

      {/* Table 2: Stage-by-Stage ToR Progress & Milestone Summary Table (All Columns Same Width) */}
      <div className="w-full overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-2xs">
        <table
          className="w-full table-fixed border-collapse text-left text-xs"
          style={{ minWidth: `${6 * 176}px` }}
        >
          <thead>
            <tr className="bg-slate-100/90 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-600">
              <th className="py-3 px-3 border-r border-slate-200 w-1/6">
                Report / Progress Stage
              </th>
              <th className="py-3 px-3 text-center border-r border-slate-200 w-1/6">
                Collected DRTs
              </th>
              <th className="py-3 px-3 text-center border-r border-slate-200 w-1/6">
                Rolled-Up Progress %
              </th>
              <th className="py-3 px-3 border-r border-slate-200 w-1/6">
                Auditee / Deliverable Remark
              </th>
              <th className="py-3 px-3 border-r border-slate-200 w-1/6">
                ToR Summary / Auditor Verdict
              </th>
              <th className="py-3 px-3 text-center w-1/6">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {REPORT_PHASES.map((phase) => {
              const isDrtPhase = progressPhaseKeys.includes(phase.key as DrtProgressPhase);
              const rollup = isDrtPhase
                ? aggregateTorDrtProgress(
                    node,
                    phase.key as DrtProgressPhase,
                    allProjectTickets,
                    auditYears,
                    progressYearMapping
                  )
                : null;
              const stage = getTorStageData(node, phase.key, auditYears, progressYearMapping);
              const pct = rollup
                ? rollup.effectivePercentage
                : getTorStagePercentage(node, phase.key, auditYears, progressYearMapping);

              return (
                <tr key={phase.key} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-3 font-bold text-slate-900 border-r border-slate-200 align-middle">
                    {stage.stageName}
                  </td>

                  <td className="py-3 px-3 text-center border-r border-slate-200 align-middle font-mono">
                    {rollup ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold">
                        {rollup.reportedDrtCount}/{rollup.totalDrtCount} DRTs
                      </span>
                    ) : (
                      <span className="text-slate-500 text-[11px]">
                        {allLinkedDrts.length} DRTs
                      </span>
                    )}
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

                  <td
                    onClick={() => onOpenSummaryModal(node, phase.key)}
                    className="py-3 px-3 border-r border-slate-200 align-middle cursor-pointer hover:bg-slate-100/70"
                  >
                    {stage.auditeeRemark || rollup?.autoCompiledAuditeeSummary ? (
                      <p className="text-slate-700 whitespace-pre-wrap break-words line-clamp-3">
                        {stage.auditeeRemark || rollup?.autoCompiledAuditeeSummary}
                      </p>
                    ) : (
                      <span className="text-slate-400 italic">Click to add remark...</span>
                    )}
                  </td>

                  <td
                    onClick={() => onOpenSummaryModal(node, phase.key)}
                    className="py-3 px-3 border-r border-slate-200 align-middle cursor-pointer hover:bg-slate-100/70"
                  >
                    {stage.auditorRemark || rollup?.autoCompiledAuditorSummary ? (
                      <p className="text-slate-700 whitespace-pre-wrap break-words line-clamp-3">
                        {stage.auditorRemark || rollup?.autoCompiledAuditorSummary}
                      </p>
                    ) : (
                      <span className="text-slate-400 italic">Click to compile summary...</span>
                    )}
                  </td>

                  <td className="py-3 px-3 text-center align-middle">
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={() => onOpenSummaryModal(node, phase.key)}
                      leftIcon={<Edit3 className="w-3 h-3 text-indigo-600" />}
                    >
                      Edit / Compile
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Table 3: Collected DRT Progress & Remarks Matrix for ToR (All Columns Same Width) */}
      <div className="w-full overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-2xs">
        <table
          className="w-full table-fixed border-collapse text-left text-xs"
          style={{ minWidth: `${20 * 176}px` }}
        >
          <thead>
            <tr className="bg-slate-100/90 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-600">
              <th rowSpan={2} className={`py-3 px-3 text-center border-r border-slate-200 ${COL_WIDTH}`}>
                DRT ID
              </th>
              <th rowSpan={2} className={`py-3 px-3 text-center border-r border-slate-200 ${COL_WIDTH}`}>
                Sub-ToR Clause
              </th>
              <th rowSpan={2} className={`py-3 px-3 text-center border-r border-slate-200 ${COL_WIDTH}`}>
                DRT For
              </th>
              <th rowSpan={2} className={`py-3 px-3 text-center border-r border-slate-200 ${COL_WIDTH}`}>
                Department
              </th>
              <th rowSpan={2} className={`py-3 px-3 border-r border-slate-200 ${COL_WIDTH}`}>
                DRT Description
              </th>
              {DRT_PROGRESS_PHASES.map((p) => {
                const targetYear = getPhaseTargetYear(p.key, auditYears, progressYearMapping);
                return (
                  <th
                    key={p.key}
                    colSpan={3}
                    className="py-2 px-3 text-center border-r border-b border-emerald-200 bg-emerald-50/80 text-emerald-900"
                  >
                    {p.shortLabel}{targetYear ? ` (${targetYear})` : ''}
                  </th>
                );
              })}
            </tr>
            <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-600">
              {DRT_PROGRESS_PHASES.map((p) => (
                <React.Fragment key={`${p.key}-drt-sub`}>
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
          <tbody className="divide-y divide-slate-200">
            {allLinkedDrts.map(({ ticket, sourceTorCode }) => (
              <tr key={ticket.id} className="hover:bg-slate-50/70 transition-colors">
                <td className={`py-2.5 px-3 text-center font-mono font-bold border-r border-slate-200 align-middle ${COL_WIDTH}`}>
                  <Link
                    href={`/projects/${projectId}?tab=drt`}
                    className="inline-flex items-center gap-1 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded border border-indigo-200 transition-colors"
                    title="View DRT in Requests Hub"
                  >
                    <span>{ticket.requestCode}</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </Link>
                </td>
                <td className={`py-2.5 px-3 text-center font-mono border-r border-slate-200 align-middle ${COL_WIDTH}`}>
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold">
                    {sourceTorCode}
                  </span>
                </td>
                <td className={`py-2.5 px-3 text-center border-r border-slate-200 align-middle ${COL_WIDTH}`}>
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
                <td className={`py-2.5 px-3 text-center border-r border-slate-200 align-middle ${COL_WIDTH}`}>
                  <span className="text-slate-700 font-medium">{ticket.department || '—'}</span>
                </td>
                <td className={`py-2.5 px-3 border-r border-slate-200 align-middle ${COL_WIDTH}`}>
                  <span className="text-slate-800 font-medium line-clamp-2">
                    {ticket.title || ticket.description}
                  </span>
                </td>
                {DRT_PROGRESS_PHASES.map((p) => {
                  const stage = getDrtStageData(ticket, p.key, auditYears, progressYearMapping);
                  const pct = getDrtStagePercentage(ticket, p.key, auditYears, progressYearMapping);
                  return (
                    <React.Fragment key={`${ticket.id}-${p.key}`}>
                      <td className={`py-2.5 px-3 text-center font-mono font-bold border-r border-slate-200 align-middle ${COL_WIDTH}`}>
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-[11px] border ${
                            pct === 100
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                              : pct >= 50
                              ? 'bg-sky-50 text-sky-700 border-sky-300'
                              : 'bg-slate-100 text-slate-600 border-slate-300'
                          }`}
                        >
                          {pct}%
                        </span>
                      </td>
                      <td className={`py-2.5 px-3 border-r border-slate-200 align-middle text-slate-600 ${COL_WIDTH}`}>
                        {stage.auditeeRemark ? (
                          <span className="line-clamp-2 break-words">{stage.auditeeRemark}</span>
                        ) : (
                          <span className="text-slate-400 italic">—</span>
                        )}
                      </td>
                      <td className={`py-2.5 px-3 border-r border-slate-200 align-middle text-slate-600 ${COL_WIDTH}`}>
                        {stage.auditorRemark ? (
                          <span className="line-clamp-2 break-words">{stage.auditorRemark}</span>
                        ) : (
                          <span className="text-slate-400 italic">—</span>
                        )}
                      </td>
                    </React.Fragment>
                  );
                })}
              </tr>
            ))}

            {allLinkedDrts.length === 0 && (
              <tr>
                <td colSpan={20} className="py-10 text-center text-xs text-slate-400 italic">
                  No DRT tickets linked to ToR {node.code}.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
