'use client';

import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Edit3,
  Eye,
  FileSpreadsheet,
} from 'lucide-react';
import type { ITorNode, TorProgressReportPhase } from '../../../types/tor.types';
import type { IDRTTicket } from '../../../types/project.types';
import {
  DRT_PROGRESS_PHASES,
  getPhaseTargetYear,
  getPhaseCutoffDate,
  formatCutoffDateDisplay,
  type DrtProgressPhase,
} from '../../../lib/drtProgressUtils';
import {
  getTorStageData,
  aggregateTorDrtProgress,
  collectAllTorDrtTickets,
} from '../../../lib/torProgressUtils';

export type TorReportFilter = 'ALL' | TorProgressReportPhase;

export interface TorProgressTableProps {
  treeNodes: ITorNode[];
  allProjectTickets: IDRTTicket[];
  auditYears?: string[];
  progressYearMapping?: Record<string, string[]> | null;
  progressCutoffDates?: Record<string, string> | null;
  activeFilter: TorReportFilter;
  onSelectTor: (torId: string) => void;
  onOpenSummaryModal: (node: ITorNode, phase: TorProgressReportPhase) => void;
}

interface TorProgressRowProps {
  node: ITorNode;
  level: number;
  allProjectTickets: IDRTTicket[];
  auditYears?: string[];
  progressYearMapping?: Record<string, string[]> | null;
  progressCutoffDates?: Record<string, string> | null;
  activeFilter: TorReportFilter;
  onSelectTor: (torId: string) => void;
  onOpenSummaryModal: (node: ITorNode, phase: TorProgressReportPhase) => void;
}

const TorProgressRow: React.FC<TorProgressRowProps> = ({
  node,
  level,
  allProjectTickets,
  auditYears,
  progressYearMapping,
  progressCutoffDates,
  activeFilter,
  onSelectTor,
  onOpenSummaryModal,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const childRows = (node.children || []).filter(
    (c) => !c.code || c.code.split('.').filter(Boolean).length <= 2
  );
  const hasChildren = childRows.length > 0;
  const isRoot = level === 0;

  const linkedDrts = collectAllTorDrtTickets(node, allProjectTickets);
  const isMatrix = activeFilter === 'ALL';

  // Calculate allocated marks if available
  const allocatedMarks =
    (node.fhlCollectionAllocated || 0) +
    (node.fhlAnalysisAllocated || 0) +
    (node.btrcCollectionAllocated || 0) +
    (node.btrcAnalysisAllocated || 0) ||
    node.dataCollectionAllocated ||
    0;

  // Single-phase specific calculations (when not in matrix mode)
  const singlePhaseKey = !isMatrix ? (activeFilter as TorProgressReportPhase) : 'FIRST_PROGRESS';
  const isDrtPhase = DRT_PROGRESS_PHASES.some((p) => p.key === singlePhaseKey);
  const singleCutoffDate = getPhaseCutoffDate(singlePhaseKey, progressCutoffDates);
  const singleCutoffLabel = singleCutoffDate ? formatCutoffDateDisplay(singleCutoffDate) : undefined;
  const singleTargetYear = singleCutoffLabel || getPhaseTargetYear(singlePhaseKey, auditYears, progressYearMapping);
  const singleRollup = isDrtPhase
    ? aggregateTorDrtProgress(
        node,
        singlePhaseKey as DrtProgressPhase,
        allProjectTickets,
        auditYears,
        progressYearMapping,
        progressCutoffDates
      )
    : null;
  const singleStage = getTorStageData(node, singlePhaseKey, auditYears, progressYearMapping, progressCutoffDates);
  const singlePct = singleRollup ? singleRollup.effectivePercentage : (singleStage.score ?? 0);

  const getBadgeClass = (pct: number) => {
    if (pct === 100) return 'bg-emerald-50 text-emerald-700 border-emerald-300';
    if (pct >= 50) return 'bg-sky-50 text-sky-700 border-sky-300';
    if (pct > 0) return 'bg-amber-50 text-amber-700 border-amber-300';
    return 'bg-slate-100 text-slate-500 border-slate-200';
  };

  return (
    <>
      <tr
        className={`border-b border-slate-200 hover:bg-slate-50/80 transition-colors text-xs ${
          isRoot ? 'bg-white' : 'bg-slate-50/30'
        }`}
      >
        {/* 1. ToR Clause (Code, Expand Arrow & Title) */}
        <td className="py-2.5 px-3 align-middle border-r border-slate-200">
          <div
            className="flex items-center gap-2"
            style={{ paddingLeft: `${level * 16}px` }}
          >
            {hasChildren ? (
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
                aria-label="Toggle Sub-ToRs"
              >
                {isExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5" />
                )}
              </button>
            ) : level > 0 ? (
              <span className="w-4 inline-block text-slate-300 font-sans text-center shrink-0">
                └
              </span>
            ) : (
              <span className="w-4 shrink-0" />
            )}

            <button
              type="button"
              onClick={() => onSelectTor(node.id)}
              title={`Inspect ToR ${node.code} dossier`}
              className={`font-mono font-bold px-2 py-0.5 rounded text-xs shadow-2xs shrink-0 cursor-pointer hover:opacity-90 transition-opacity ${
                isRoot
                  ? 'bg-indigo-600 text-white'
                  : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
              }`}
            >
              {node.code}
            </button>

            <div className="min-w-0 pr-2">
              <button
                type="button"
                onClick={() => onSelectTor(node.id)}
                className={`text-left text-slate-900 hover:text-indigo-600 hover:underline transition-colors cursor-pointer line-clamp-1 ${
                  isRoot ? 'font-bold text-xs' : 'font-semibold text-xs'
                }`}
              >
                {node.title}
              </button>
              {node.department && (
                <span className="inline-block md:hidden text-[10px] font-medium px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 border border-purple-200 mt-0.5">
                  {node.department}
                </span>
              )}
            </div>
          </div>
        </td>

        {/* ================= SINGLE PHASE VIEW ================= */}
        {!isMatrix && (
          <>
            {/* Department */}
            <td className="py-2.5 px-3 text-center align-middle border-r border-slate-200 hidden md:table-cell w-32">
              {node.department ? (
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                  {node.department}
                </span>
              ) : (
                <span className="text-slate-400">—</span>
              )}
            </td>

            {/* Weight Marks */}
            <td className="py-2.5 px-3 text-center align-middle font-mono border-r border-slate-200 w-24">
              <span className="text-slate-700 font-semibold">
                {allocatedMarks > 0 ? allocatedMarks.toFixed(2) : '—'}
              </span>
            </td>

            {/* Linked DRTs */}
            <td className="py-2.5 px-3 text-center align-middle border-r border-slate-200 w-36">
              {linkedDrts.length > 0 ? (
                <button
                  type="button"
                  onClick={() => onSelectTor(node.id)}
                  title="View collected DRTs for this clause"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>
                    {singleRollup ? `${singleRollup.reportedDrtCount}/${singleRollup.totalDrtCount}` : linkedDrts.length} DRTs
                  </span>
                </button>
              ) : (
                <span className="text-slate-400 text-xs italic">No DRTs linked</span>
              )}
            </td>

            {/* Progress Percentage */}
            <td className="py-2.5 px-4 text-center align-middle border-r border-slate-200 w-44 bg-slate-50/40">
              <div className="w-full max-w-[130px] mx-auto space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Progress</span>
                  <span
                    className={`inline-flex px-1.5 py-0.2 rounded font-mono text-[11px] font-bold border ${getBadgeClass(
                      singlePct
                    )}`}
                  >
                    {singlePct}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-200/80 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                    style={{ width: `${singlePct}%` }}
                  />
                </div>
              </div>
            </td>

            {/* Remarks & Auditor Verdict */}
            <td className="py-2.5 px-3 align-middle border-r border-slate-200">
              <button
                type="button"
                onClick={() => onOpenSummaryModal(node, singlePhaseKey)}
                title="Click to view or edit remarks & verdict"
                className="group flex items-start justify-between gap-2 w-full p-1.5 -m-1 rounded-lg hover:bg-white hover:border hover:border-slate-200 transition-all text-left cursor-pointer"
              >
                <div className="space-y-0.5 min-w-0">
                  {singleStage.auditeeRemark || singleStage.auditorRemark || singleRollup?.autoCompiledAuditorSummary ? (
                    <>
                      {singleRollup?.autoCompiledAuditorSummary && !singleStage.auditorRemark && (
                        <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded mr-1">
                          Auto-DRT
                        </span>
                      )}
                      <span className="text-xs text-slate-700 line-clamp-1 leading-snug">
                        {singleStage.auditorRemark || singleStage.auditeeRemark || singleRollup?.autoCompiledAuditorSummary}
                      </span>
                    </>
                  ) : (
                    <span className="text-[11px] text-slate-400 italic">
                      No remarks recorded. Click to add...
                    </span>
                  )}
                </div>
                <Edit3 className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 shrink-0 mt-0.5" />
              </button>
            </td>

            {/* Action Button */}
            <td className="py-2.5 px-3 text-center align-middle w-24">
              <button
                type="button"
                onClick={() => onSelectTor(node.id)}
                title={`Open ToR ${node.code} full dossier`}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Dossier</span>
              </button>
            </td>
          </>
        )}

        {/* ================= MATRIX OVERVIEW ================= */}
        {isMatrix && (
          <>
            {/* Linked DRTs */}
            <td className="py-2.5 px-2 text-center align-middle border-r border-slate-200 w-24">
              <span className="font-mono text-xs font-semibold text-slate-700">
                {linkedDrts.length}
              </span>
            </td>

            {/* 1st - 5th Progress Reports */}
            {DRT_PROGRESS_PHASES.map((p) => {
              const rollup = aggregateTorDrtProgress(
                node,
                p.key as DrtProgressPhase,
                allProjectTickets,
                auditYears,
                progressYearMapping,
                progressCutoffDates
              );
              const pct = rollup.effectivePercentage;
              const cutoffDate = getPhaseCutoffDate(p.key, progressCutoffDates);
              const cutoffLabel = cutoffDate ? formatCutoffDateDisplay(cutoffDate) : undefined;
              const targetYear = cutoffLabel || getPhaseTargetYear(p.key, auditYears, progressYearMapping);

              return (
                <td
                  key={p.key}
                  className="py-2.5 px-2 text-center align-middle border-r border-slate-200 w-28"
                >
                  <button
                    type="button"
                    onClick={() => onOpenSummaryModal(node, p.key)}
                    title={`${p.shortLabel}${targetYear ? ` (${targetYear})` : ''}: ${pct}% (Click to view remarks)`}
                    className={`inline-flex px-2 py-0.5 rounded-full font-mono text-[11px] font-bold border transition-transform hover:scale-105 cursor-pointer ${getBadgeClass(
                      pct
                    )}`}
                  >
                    {pct}%
                  </button>
                </td>
              );
            })}

            {/* Incentive Report */}
            <td className="py-2.5 px-2 text-center align-middle border-r border-slate-200 w-24">
              <button
                type="button"
                onClick={() => onOpenSummaryModal(node, 'INCENTIVE_REPORT')}
                title="Incentive Report"
                className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-teal-50 text-teal-800 border border-teal-200 hover:scale-105 transition-transform cursor-pointer"
              >
                {node.incentiveReport ? 'Submitted' : 'Pending'}
              </button>
            </td>

            {/* Draft Report */}
            <td className="py-2.5 px-2 text-center align-middle border-r border-slate-200 w-24">
              <button
                type="button"
                onClick={() => onOpenSummaryModal(node, 'DRAFT_REPORT')}
                title="Draft Audit Report"
                className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 hover:scale-105 transition-transform cursor-pointer"
              >
                {node.draftRemark ? 'Submitted' : 'Pending'}
              </button>
            </td>

            {/* Final Report */}
            <td className="py-2.5 px-2 text-center align-middle border-r border-slate-200 w-24">
              <button
                type="button"
                onClick={() => onOpenSummaryModal(node, 'FINAL_REPORT')}
                title="Final Audit Report"
                className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 text-purple-800 border border-purple-200 hover:scale-105 transition-transform cursor-pointer"
              >
                {node.finalRemark ? 'Finalized' : 'Pending'}
              </button>
            </td>

            {/* Action */}
            <td className="py-2.5 px-2 text-center align-middle w-20">
              <button
                type="button"
                onClick={() => onSelectTor(node.id)}
                title={`Inspect ToR ${node.code} dossier`}
                className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
              </button>
            </td>
          </>
        )}
      </tr>

      {/* Child Sub-ToRs */}
      {hasChildren &&
        isExpanded &&
        childRows.map((child) => (
          <TorProgressRow
            key={child.id}
            node={child}
            level={level + 1}
            allProjectTickets={allProjectTickets}
            auditYears={auditYears}
            progressYearMapping={progressYearMapping}
            progressCutoffDates={progressCutoffDates}
            activeFilter={activeFilter}
            onSelectTor={onSelectTor}
            onOpenSummaryModal={onOpenSummaryModal}
          />
        ))}
    </>
  );
};

export const TorProgressTable: React.FC<TorProgressTableProps> = ({
  treeNodes,
  allProjectTickets,
  auditYears,
  progressYearMapping,
  progressCutoffDates,
  activeFilter,
  onSelectTor,
  onOpenSummaryModal,
}) => {
  const isMatrix = activeFilter === 'ALL';

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-2xs">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="bg-slate-100/90 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-700">
            {/* Clause Column */}
            <th className="py-3 px-3 border-r border-slate-200 min-w-[280px]">
              ToR Clause &amp; Title
            </th>

            {!isMatrix ? (
              <>
                <th className="py-3 px-3 text-center border-r border-slate-200 hidden md:table-cell w-32">
                  Department
                </th>
                <th className="py-3 px-3 text-center border-r border-slate-200 w-24">
                  Allocated Marks
                </th>
                <th className="py-3 px-3 text-center border-r border-slate-200 w-36">
                  Linked DRTs
                </th>
                <th className="py-3 px-3 text-center border-r border-slate-200 w-44">
                  Progress Completion
                </th>
                <th className="py-3 px-3 border-r border-slate-200">
                  Auditee Remarks &amp; Auditor Verdict
                </th>
                <th className="py-3 px-3 text-center w-24">
                  Inspect
                </th>
              </>
            ) : (
              <>
                <th className="py-3 px-2 text-center border-r border-slate-200 w-24">
                  DRTs
                </th>
                {DRT_PROGRESS_PHASES.map((p) => {
                  const cutoffDate = getPhaseCutoffDate(p.key, progressCutoffDates);
                  const cutoffLabel = cutoffDate ? formatCutoffDateDisplay(cutoffDate) : undefined;
                  const targetYear = cutoffLabel || getPhaseTargetYear(p.key, auditYears, progressYearMapping);
                  return (
                    <th
                      key={p.key}
                      className="py-3 px-2 text-center border-r border-emerald-200 bg-emerald-50/70 text-emerald-950 w-28"
                    >
                      <div>{p.shortLabel}</div>
                      {targetYear && (
                        <div className="text-[9px] font-normal text-emerald-700 font-mono">
                          ({targetYear})
                        </div>
                      )}
                    </th>
                  );
                })}
                <th className="py-3 px-2 text-center border-r border-teal-200 bg-teal-50/70 text-teal-950 w-24">
                  Incentive
                </th>
                <th className="py-3 px-2 text-center border-r border-amber-200 bg-amber-50/70 text-amber-950 w-24">
                  Draft
                </th>
                <th className="py-3 px-2 text-center border-r border-purple-200 bg-purple-50/70 text-purple-950 w-24">
                  Final
                </th>
                <th className="py-3 px-2 text-center w-20">
                  Dossier
                </th>
              </>
            )}
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {treeNodes.map((node) => (
            <TorProgressRow
              key={node.id}
              node={node}
              level={0}
              allProjectTickets={allProjectTickets}
              auditYears={auditYears}
              progressYearMapping={progressYearMapping}
              progressCutoffDates={progressCutoffDates}
              activeFilter={activeFilter}
              onSelectTor={onSelectTor}
              onOpenSummaryModal={onOpenSummaryModal}
            />
          ))}

          {treeNodes.length === 0 && (
            <tr>
              <td
                colSpan={isMatrix ? 12 : 7}
                className="py-12 text-center text-xs text-slate-400 italic"
              >
                No ToR clauses match your filter criteria.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
