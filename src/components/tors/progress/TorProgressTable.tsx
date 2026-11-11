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
  activeFilter: TorReportFilter;
  onSelectTor: (torId: string) => void;
  onOpenSummaryModal: (node: ITorNode, phase: TorProgressReportPhase) => void;
}

const COL_WIDTH = 'w-44 min-w-[176px] max-w-[176px]';

const TorProgressRow: React.FC<TorProgressRowProps> = ({
  node,
  level,
  allProjectTickets,
  auditYears,
  progressYearMapping,
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

  const showIncentive =
    activeFilter === 'ALL' || activeFilter === 'INCENTIVE_REPORT';
  const showDraft = activeFilter === 'ALL' || activeFilter === 'DRAFT_REPORT';
  const showFinal = activeFilter === 'ALL' || activeFilter === 'FINAL_REPORT';
  const visibleProgressPhases = DRT_PROGRESS_PHASES.filter(
    (p) => activeFilter === 'ALL' || activeFilter === p.key
  );

  const stageIncentive = getTorStageData(node, 'INCENTIVE_REPORT', auditYears, progressYearMapping);
  const stageDraft = getTorStageData(node, 'DRAFT_REPORT', auditYears, progressYearMapping);
  const stageFinal = getTorStageData(node, 'FINAL_REPORT', auditYears, progressYearMapping);

  const renderRemarkButton = (
    remark: string | null | undefined,
    fallbackAutoSummary: string | undefined,
    phase: TorProgressReportPhase,
    placeholder: string
  ) => {
    const displayText = remark || fallbackAutoSummary || '';
    const isAuto = !remark && Boolean(fallbackAutoSummary);
    return (
      <button
        type="button"
        onClick={() => onOpenSummaryModal(node, phase)}
        title={displayText || `Click to edit ${placeholder}`}
        className="group flex flex-col items-start gap-0.5 text-left w-full p-1 -m-1 rounded hover:bg-slate-100/80 transition-colors cursor-pointer"
      >
        {displayText ? (
          <>
            {isAuto && (
              <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded">
                DRT Auto-Summary
              </span>
            )}
            <span className="text-[11px] text-slate-700 line-clamp-2 leading-tight break-words">
              {displayText}
            </span>
          </>
        ) : (
          <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 italic group-hover:text-indigo-600 transition-colors">
            <Edit3 className="w-2.5 h-2.5 shrink-0" />
            <span>{placeholder}</span>
          </span>
        )}
      </button>
    );
  };

  return (
    <>
      <tr
        className={`border-b border-slate-200 hover:bg-slate-50/70 transition-colors text-xs ${
          isRoot ? 'bg-white' : 'bg-slate-50/30'
        }`}
      >
        {/* 1. ToR ID */}
        <td
          className={`py-2.5 px-3 whitespace-nowrap font-mono align-middle border-r border-slate-200 ${COL_WIDTH}`}
        >
          <div
            className="flex items-center gap-1.5"
            style={{ paddingLeft: `${level * 14}px` }}
          >
            {hasChildren ? (
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-0.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                {isExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5" />
                )}
              </button>
            ) : level > 0 ? (
              <span className="w-3.5 inline-block text-slate-300 font-sans text-center">
                └
              </span>
            ) : (
              <span className="w-3.5" />
            )}
            <button
              type="button"
              onClick={() => onSelectTor(node.id)}
              title={`Click to open Individual ToR Progress Report for ToR ${node.code}`}
              className={`font-mono font-bold px-2 py-0.5 rounded text-xs shadow-2xs cursor-pointer hover:opacity-90 transition-opacity ${
                isRoot
                  ? 'bg-indigo-600 text-white'
                  : 'bg-indigo-50 text-indigo-700 border border-indigo-200/80'
              }`}
            >
              {node.code}
            </button>
          </div>
        </td>

        {/* 2. ToR Scope */}
        <td
          className={`py-2.5 px-3 align-middle border-r border-slate-200 ${COL_WIDTH}`}
        >
          <div className="space-y-0.5">
            <button
              type="button"
              onClick={() => onSelectTor(node.id)}
              className={`text-left text-slate-900 hover:text-indigo-600 hover:underline transition-colors cursor-pointer line-clamp-2 ${
                isRoot ? 'font-bold text-xs' : 'font-semibold text-xs'
              }`}
            >
              {node.title}
            </button>
            {node.department && (
              <div>
                <span className="text-[10px] font-medium px-1.5 py-0.2 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                  {node.department}
                </span>
              </div>
            )}
          </div>
        </td>

        {/* 3. Linked DRTs Count */}
        <td
          className={`py-2.5 px-3 text-center align-middle border-r border-slate-200 ${COL_WIDTH}`}
        >
          <button
            type="button"
            onClick={() => onSelectTor(node.id)}
            title="View collected DRTs for this ToR"
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-3 h-3 text-emerald-600" />
            <span>{linkedDrts.length} DRTs</span>
          </button>
        </td>

        {/* 4. Incentive Report */}
        {showIncentive && (
          <td
            className={`py-2.5 px-3 align-middle border-r border-teal-200 bg-teal-50/10 ${COL_WIDTH}`}
          >
            {renderRemarkButton(
              stageIncentive.auditeeRemark,
              undefined,
              'INCENTIVE_REPORT',
              'Add incentive report...'
            )}
          </td>
        )}

        {/* 5. 1st–5th Progress (Rolled up from DRTs) */}
        {visibleProgressPhases.map((p) => {
          const phaseKey = p.key as TorProgressReportPhase;
          const targetYear = getPhaseTargetYear(p.key, auditYears, progressYearMapping);
          const rollup = aggregateTorDrtProgress(
            node,
            p.key as DrtProgressPhase,
            allProjectTickets,
            auditYears,
            progressYearMapping
          );
          const stage = getTorStageData(node, phaseKey, auditYears, progressYearMapping);
          const pct = rollup.effectivePercentage;
          const stageLabel = targetYear ? `${p.shortLabel} (${targetYear})` : p.shortLabel;

          return (
            <React.Fragment key={p.key}>
              <td
                className={`py-2.5 px-3 text-center align-middle border-r border-slate-200 bg-emerald-50/10 ${COL_WIDTH}`}
              >
                <button
                  type="button"
                  onClick={() => onOpenSummaryModal(node, phaseKey)}
                  title={`${stageLabel}: ${pct}% (DRT Avg: ${rollup.avgDrtPercentage}% across ${rollup.totalDrtCount} DRTs${targetYear ? ` for Year ${targetYear}` : ''})`}
                  className="group inline-flex flex-col items-center gap-1 p-1 -m-1 rounded hover:bg-white/80 transition-colors cursor-pointer w-full"
                >
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full font-mono text-[11px] font-bold border transition-transform group-hover:scale-105 ${
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
                  <div className="w-20 h-1.5 bg-slate-200/80 rounded-full overflow-hidden shadow-2xs">
                    <div
                      className={`h-full transition-all duration-300 rounded-full ${
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
                  {rollup.totalDrtCount > 0 && (
                    <span className="text-[9px] text-slate-500 font-mono">
                      {rollup.reportedDrtCount}/{rollup.totalDrtCount} DRTs
                    </span>
                  )}
                </button>
              </td>

              <td
                className={`py-2.5 px-3 align-middle border-r border-slate-200 ${COL_WIDTH}`}
              >
                {renderRemarkButton(
                  stage.auditorRemark,
                  rollup.autoCompiledAuditorSummary,
                  phaseKey,
                  'Compile DRT summary...'
                )}
              </td>
            </React.Fragment>
          );
        })}

        {/* 6. Draft Report */}
        {showDraft && (
          <>
            <td
              className={`py-2.5 px-3 align-middle border-r border-slate-200 bg-amber-50/10 ${COL_WIDTH}`}
            >
              {renderRemarkButton(
                stageDraft.auditeeRemark,
                undefined,
                'DRAFT_REPORT',
                'Add draft remark...'
              )}
            </td>
            <td
              className={`py-2.5 px-3 align-middle border-r border-amber-200 bg-amber-50/10 ${COL_WIDTH}`}
            >
              {renderRemarkButton(
                stageDraft.auditorRemark,
                undefined,
                'DRAFT_REPORT',
                'Add auditor verdict...'
              )}
            </td>
          </>
        )}

        {/* 7. Final Report */}
        {showFinal && (
          <>
            <td
              className={`py-2.5 px-3 align-middle border-r border-slate-200 bg-purple-50/10 ${COL_WIDTH}`}
            >
              {renderRemarkButton(
                stageFinal.auditeeRemark,
                undefined,
                'FINAL_REPORT',
                'Add final remark...'
              )}
            </td>
            <td
              className={`py-2.5 px-3 align-middle border-r border-purple-200 bg-purple-50/10 ${COL_WIDTH}`}
            >
              {renderRemarkButton(
                stageFinal.auditorRemark,
                undefined,
                'FINAL_REPORT',
                'Add final verdict...'
              )}
            </td>
          </>
        )}

        {/* 8. Individual ToR Report Action */}
        <td className={`py-2.5 px-3 text-center align-middle ${COL_WIDTH}`}>
          <button
            type="button"
            onClick={() => onSelectTor(node.id)}
            title={`Open Individual ToR Progress Report for ToR ${node.code}`}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Report</span>
          </button>
        </td>
      </tr>

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
  activeFilter,
  onSelectTor,
  onOpenSummaryModal,
}) => {
  const showIncentive =
    activeFilter === 'ALL' || activeFilter === 'INCENTIVE_REPORT';
  const showDraft = activeFilter === 'ALL' || activeFilter === 'DRAFT_REPORT';
  const showFinal = activeFilter === 'ALL' || activeFilter === 'FINAL_REPORT';
  const visibleProgressPhases = DRT_PROGRESS_PHASES.filter(
    (p) => activeFilter === 'ALL' || activeFilter === p.key
  );

  const totalCols =
    4 +
    (showIncentive ? 1 : 0) +
    visibleProgressPhases.length * 2 +
    (showDraft ? 2 : 0) +
    (showFinal ? 2 : 0);
  const tableWidthPx = totalCols * 176;

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-2xs">
      <table
        className="w-full table-fixed border-collapse text-left"
        style={{ minWidth: `${tableWidthPx}px` }}
      >
        <thead>
          {/* Tier 1 Group Header */}
          <tr className="bg-slate-100/90 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-600">
            <th
              rowSpan={2}
              className={`py-3 px-3 border-r border-slate-200 ${COL_WIDTH}`}
            >
              ToR ID
            </th>
            <th
              rowSpan={2}
              className={`py-3 px-3 border-r border-slate-200 ${COL_WIDTH}`}
            >
              ToR Scope
            </th>
            <th
              rowSpan={2}
              className={`py-3 px-3 text-center border-r border-slate-200 ${COL_WIDTH}`}
            >
              Linked DRTs
            </th>

            {showIncentive && (
              <th
                colSpan={1}
                className={`py-2 px-3 text-center border-r border-teal-200 bg-teal-50/80 text-teal-900 ${COL_WIDTH}`}
              >
                Incentive Report
              </th>
            )}

            {visibleProgressPhases.map((p) => {
              const targetYear = getPhaseTargetYear(p.key, auditYears, progressYearMapping);
              return (
                <th
                  key={p.key}
                  colSpan={2}
                  className="py-2 px-3 text-center border-r border-emerald-200 bg-emerald-50/80 text-emerald-900"
                >
                  {p.shortLabel}{targetYear ? ` (${targetYear})` : ' (DRT Rollup)'}
                </th>
              );
            })}

            {showDraft && (
              <th
                colSpan={2}
                className="py-2 px-3 text-center border-r border-amber-200 bg-amber-50/80 text-amber-900"
              >
                Draft Report
              </th>
            )}

            {showFinal && (
              <th
                colSpan={2}
                className="py-2 px-3 text-center border-r border-purple-200 bg-purple-50/80 text-purple-900"
              >
                Final Report
              </th>
            )}

            <th rowSpan={2} className={`py-3 px-3 text-center ${COL_WIDTH}`}>
              Report
            </th>
          </tr>

          {/* Tier 2 Sub-Header */}
          <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-600">
            {showIncentive && (
              <th
                className={`py-2 px-3 text-left border-r border-teal-200 bg-teal-50/40 text-teal-800 ${COL_WIDTH}`}
              >
                Incentive Report
              </th>
            )}

            {visibleProgressPhases.map((p) => (
              <React.Fragment key={`${p.key}-sub`}>
                <th
                  className={`py-2 px-3 text-center border-r border-slate-200 bg-emerald-50/40 text-emerald-800 ${COL_WIDTH}`}
                >
                  Progress %
                </th>
                <th
                  className={`py-2 px-3 text-left border-r border-emerald-200 bg-emerald-50/40 text-emerald-800 ${COL_WIDTH}`}
                >
                  DRT Rollup &amp; Summary
                </th>
              </React.Fragment>
            ))}

            {showDraft && (
              <>
                <th
                  className={`py-2 px-3 text-left border-r border-slate-200 bg-amber-50/40 text-amber-800 ${COL_WIDTH}`}
                >
                  Draft Remark
                </th>
                <th
                  className={`py-2 px-3 text-left border-r border-amber-200 bg-amber-50/40 text-amber-800 ${COL_WIDTH}`}
                >
                  Auditor Verdict
                </th>
              </>
            )}

            {showFinal && (
              <>
                <th
                  className={`py-2 px-3 text-left border-r border-slate-200 bg-purple-50/40 text-purple-800 ${COL_WIDTH}`}
                >
                  Final Remark
                </th>
                <th
                  className={`py-2 px-3 text-left border-r border-purple-200 bg-purple-50/40 text-purple-800 ${COL_WIDTH}`}
                >
                  Auditor Verdict
                </th>
              </>
            )}
          </tr>
        </thead>

        <tbody>
          {treeNodes.map((node) => (
            <TorProgressRow
              key={node.id}
              node={node}
              level={0}
              allProjectTickets={allProjectTickets}
              auditYears={auditYears}
              progressYearMapping={progressYearMapping}
              activeFilter={activeFilter}
              onSelectTor={onSelectTor}
              onOpenSummaryModal={onOpenSummaryModal}
            />
          ))}

          {treeNodes.length === 0 && (
            <tr>
              <td colSpan={totalCols} className="py-12 text-center text-xs text-slate-500">
                No ToR clauses match your filter criteria.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
