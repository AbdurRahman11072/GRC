'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  X,
  MessageSquare,
  Sparkles,
  FileSpreadsheet,
  ExternalLink,
  AlertCircle,
} from 'lucide-react';
import type {
  ITorNode,
  TorProgressReportPhase,
  ITorProgressStageData,
} from '../../../types/tor.types';
import type { IDRTTicket } from '../../../types/project.types';
import type { DrtProgressPhase } from '../../../lib/drtProgressUtils';
import {
  getTorStageData,
  aggregateTorDrtProgress,
} from '../../../lib/torProgressUtils';
import { getTorStagePercentage } from '../../../lib/torPercentageUtils';

export interface TorProgressSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  node: ITorNode;
  phase: TorProgressReportPhase;
  allProjectTickets: IDRTTicket[];
  clientName?: string;
  auditeeName?: string;
  onSave: (
    nodeId: string,
    phase: TorProgressReportPhase,
    updatedData: Partial<ITorProgressStageData>
  ) => void;
}

const PROGRESS_PHASES: DrtProgressPhase[] = [
  'FIRST_PROGRESS',
  'SECOND_PROGRESS',
  'THIRD_PROGRESS',
  'FOURTH_PROGRESS',
  'FIFTH_PROGRESS',
];

export const TorProgressSummaryModal: React.FC<TorProgressSummaryModalProps> = ({
  isOpen,
  onClose,
  projectId,
  node,
  phase,
  allProjectTickets,
  clientName = 'BTRC',
  auditeeName = 'FHL',
  onSave,
}) => {
  const initialData = getTorStageData(node, phase);
  const isDrtProgressPhase = PROGRESS_PHASES.includes(phase as DrtProgressPhase);

  const drtRollup = isDrtProgressPhase
    ? aggregateTorDrtProgress(node, phase as DrtProgressPhase, allProjectTickets)
    : null;

  const hasDualRemarks =
    phase === 'DRAFT_REPORT' || phase === 'FINAL_REPORT' || phase === 'INCENTIVE_REPORT';

  const [progressPct, setProgressPct] = useState<number>(() => {
    if (drtRollup) return drtRollup.effectivePercentage;
    return getTorStagePercentage(node, phase);
  });

  const [auditorRemark, setAuditorRemark] = useState<string>(() => {
    if (initialData.auditorRemark) return initialData.auditorRemark;
    if (drtRollup?.autoCompiledAuditorSummary) return drtRollup.autoCompiledAuditorSummary;
    return '';
  });

  const [auditeeRemark, setAuditeeRemark] = useState<string>(
    initialData.auditeeRemark || ''
  );

  if (!isOpen) return null;

  const handleAutoCompileFromDrts = () => {
    if (!drtRollup) return;
    setProgressPct(drtRollup.avgDrtPercentage);

    const blocks: string[] = [];
    blocks.push(
      `DRT Rollup (${drtRollup.reportedDrtCount}/${drtRollup.totalDrtCount} DRTs evaluated — ${drtRollup.avgDrtPercentage}% avg completion):`
    );
    drtRollup.items.forEach((item) => {
      const partyLabel = item.party === 'CLIENT' ? clientName : auditeeName;
      const remParts: string[] = [];
      if (item.auditeeRemark) remParts.push(`Auditee: ${item.auditeeRemark}`);
      if (item.auditorRemark) remParts.push(`Auditor: ${item.auditorRemark}`);
      const remarkStr = remParts.length > 0 ? remParts.join(' | ') : 'No remarks recorded';
      blocks.push(`• [${item.requestCode}] (${partyLabel}, ${item.percentage}%): ${remarkStr}`);
    });

    setAuditorRemark(blocks.join('\n'));
  };

  const handleSave = () => {
    onSave(node.id, phase, {
      status: `${progressPct}%`,
      score: progressPct,
      auditorRemark: phase === 'INCENTIVE_REPORT' ? null : auditorRemark.trim() || null,
      auditeeRemark: auditeeRemark.trim() || null,
      updatedAt: new Date().toISOString(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 flex-wrap">
                <span>{initialData.stageName} — ToR Summary &amp; DRT Rollup</span>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-indigo-600 text-white">
                  ToR {node.code}
                </span>
              </h3>
              <p className="text-xs text-slate-500 line-clamp-1">{node.title}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 overflow-y-auto text-xs">
          {/* Collected DRTs Breakdown Section (For 1st–5th Progress) */}
          {isDrtProgressPhase && drtRollup && (
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 overflow-hidden">
              <div className="flex items-center justify-between gap-2 px-3.5 py-2.5 bg-slate-100/80 border-b border-slate-200 flex-wrap">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
                  <span className="font-bold text-slate-800">
                    Collected DRT Progress &amp; Remarks ({drtRollup.totalDrtCount} Linked DRTs)
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono font-bold text-[11px]">
                    DRT Avg: {drtRollup.avgDrtPercentage}%
                  </span>
                </div>

                {drtRollup.totalDrtCount > 0 && (
                  <button
                    type="button"
                    onClick={handleAutoCompileFromDrts}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xs transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Generate Summary from DRTs</span>
                  </button>
                )}
              </div>

              {drtRollup.items.length > 0 ? (
                <div className="max-h-52 overflow-y-auto divide-y divide-slate-200/80 bg-white">
                  {drtRollup.items.map((item) => (
                    <div key={item.ticketId} className="p-3 space-y-1.5 hover:bg-slate-50/70">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Link
                            href={`/projects/${projectId}/drt-progress?ticketId=${item.ticketId}`}
                            className="inline-flex items-center gap-1 font-mono font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded border border-indigo-200"
                            title="Open Individual DRT Progress Report"
                          >
                            <span>{item.requestCode}</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </Link>
                          {item.torCode && (
                            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                              ToR {item.torCode}
                            </span>
                          )}
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                            {item.party === 'CLIENT' ? clientName : auditeeName}
                          </span>
                          <span className="text-slate-700 font-medium line-clamp-1 max-w-xs">
                            {item.description}
                          </span>
                        </div>
                        <span
                          className={`font-mono font-bold px-2 py-0.5 rounded-full text-[11px] border ${
                            item.percentage === 100
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                              : item.percentage >= 50
                              ? 'bg-sky-50 text-sky-700 border-sky-300'
                              : 'bg-amber-50 text-amber-700 border-amber-300'
                          }`}
                        >
                          {item.percentage}%
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                        <div className="p-2 rounded bg-emerald-50/40 border border-emerald-100">
                          <span className="font-semibold text-emerald-800 block">
                            Auditee Remark:
                          </span>
                          <span className="text-slate-600">
                            {item.auditeeRemark || '—'}
                          </span>
                        </div>
                        <div className="p-2 rounded bg-indigo-50/40 border border-indigo-100">
                          <span className="font-semibold text-indigo-800 block">
                            Auditor Remark:
                          </span>
                          <span className="text-slate-600">
                            {item.auditorRemark || '—'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-slate-400 italic bg-white">
                  No DRT tickets are currently linked to ToR {node.code} (or its child Sub-ToRs).
                </div>
              )}
            </div>
          )}

          {/* ToR Completion Percentage Slider */}
          <div className="space-y-2 p-3 bg-emerald-50/50 rounded-xl border border-emerald-200">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-emerald-900">
                ToR {initialData.stageName} Completion Percentage
              </label>
              <div className="flex items-center gap-2">
                {drtRollup && drtRollup.totalDrtCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setProgressPct(drtRollup.avgDrtPercentage)}
                    className="text-[10px] font-semibold text-emerald-700 hover:underline cursor-pointer"
                  >
                    Use DRT Avg ({drtRollup.avgDrtPercentage}%)
                  </button>
                )}
                <span className="font-mono font-bold text-sm text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-300">
                  {progressPct}%
                </span>
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={progressPct}
              onChange={(e) => setProgressPct(parseInt(e.target.value, 10))}
              className="w-full h-2 bg-emerald-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
            <div className="flex items-center justify-between gap-1 pt-1">
              {[0, 25, 50, 75, 100].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setProgressPct(preset)}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono font-semibold border transition-colors cursor-pointer ${
                    progressPct === preset
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                  }`}
                >
                  {preset}%
                </button>
              ))}
            </div>
          </div>

          {/* Incentive / Draft / Final Auditee Focal Remark */}
          {hasDualRemarks && (
            <div className="space-y-1.5">
              <label className="block font-semibold text-slate-700">
                {phase === 'INCENTIVE_REPORT'
                  ? 'Incentive Report / Deliverable Scope'
                  : phase === 'DRAFT_REPORT'
                  ? 'Draft Report Remark (Auditee Focal)'
                  : 'Final Report Remark (Auditee Focal)'}
              </label>
              <textarea
                rows={3}
                value={auditeeRemark}
                onChange={(e) => setAuditeeRemark(e.target.value)}
                placeholder={
                  phase === 'INCENTIVE_REPORT'
                    ? 'Enter incentive report summary, deliverable scope, or initial compliance notes...'
                    : 'Enter auditee focal team response or explanation for this ToR clause...'
                }
                className="w-full p-3 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-indigo-600 transition-all resize-none text-xs"
              />
            </div>
          )}

          {/* ToR Executive Summary / Auditor Remark */}
          {phase !== 'INCENTIVE_REPORT' && (
            <div className="space-y-1.5">
              <label className="block font-semibold text-slate-700">
                ToR Executive Summary &amp; Auditor Remark
              </label>
              <textarea
                rows={5}
                value={auditorRemark}
                onChange={(e) => setAuditorRemark(e.target.value)}
                placeholder="Record or auto-compile the ToR-level summary of DRT progress, findings, and auditor evaluation..."
                className="w-full p-3 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-indigo-600 transition-all resize-none text-xs"
              />
            </div>
          )}

          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2 text-amber-800">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
            <p className="text-[11px] leading-relaxed">
              This ToR report aggregates progress and remarks from all linked DRTs (and child Sub-ToRs). You can use <strong>Generate Summary from DRTs</strong> to auto-compile DRT remarks into the executive summary.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-slate-200 bg-slate-50/70">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-medium hover:bg-slate-50 transition-colors text-xs cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 shadow-2xs transition-colors text-xs cursor-pointer"
          >
            Save ToR Report Summary
          </button>
        </div>
      </div>
    </div>
  );
};
