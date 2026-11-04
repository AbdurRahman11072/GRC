'use client';

import React, { useState } from 'react';
import { X, MessageSquare, AlertCircle } from 'lucide-react';
import type { ITorNode, TorProgressReportPhase, ITorProgressStageData } from '../../../types/tor.types';
import { getTorStagePercentage } from '../../../lib/torPercentageUtils';

export interface TorRemarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  node: ITorNode;
  phase: TorProgressReportPhase;
  initialData: ITorProgressStageData;
  onSave: (nodeId: string, phase: TorProgressReportPhase, updatedData: Partial<ITorProgressStageData>) => void;
}

export const TorRemarkModal: React.FC<TorRemarkModalProps> = ({
  isOpen,
  onClose,
  node,
  phase,
  initialData,
  onSave,
}) => {
  const hasDualRemarks =
    phase === 'DRAFT_REPORT' || phase === 'FINAL_REPORT' || phase === 'INCENTIVE_REPORT';

  const [progressPct, setProgressPct] = useState<number>(() =>
    getTorStagePercentage(node, phase)
  );
  const [auditorRemark, setAuditorRemark] = useState(initialData.auditorRemark || '');
  const [auditeeRemark, setAuditeeRemark] = useState(initialData.auditeeRemark || '');

  if (!isOpen) return null;

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
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>{initialData.stageName} Evaluation</span>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                  {node.code}
                </span>
              </h3>
              <p className="text-xs text-slate-500 line-clamp-1">{node.title}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 overflow-y-auto text-xs">
          {/* Progress Percentage Input & Presets */}
          <div className="space-y-2 p-3 bg-emerald-50/50 rounded-xl border border-emerald-200">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-emerald-900">
                {initialData.stageName} Completion Percentage
              </label>
              <span className="font-mono font-bold text-sm text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-300">
                {progressPct}%
              </span>
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
                  className={`px-2 py-0.5 rounded text-[11px] font-mono font-semibold border transition-colors ${
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

          {/* Incentive / Auditee / Draft Remark (if applicable) */}
          {hasDualRemarks && (
            <div className="space-y-1.5">
              <label className="block font-semibold text-slate-700">
                {phase === 'INCENTIVE_REPORT'
                  ? 'Incentive Report / Deliverable Scope'
                  : phase === 'DRAFT_REPORT'
                  ? 'Draft Remark (Auditee Focal)'
                  : 'Final Remark (Auditee Focal)'}
              </label>
              <textarea
                rows={3}
                value={auditeeRemark}
                onChange={(e) => setAuditeeRemark(e.target.value)}
                placeholder={
                  phase === 'INCENTIVE_REPORT'
                    ? 'Enter incentive report findings, compliance notes, or deliverable scope...'
                    : 'Enter auditee focal team remark or explanation...'
                }
                className="w-full p-3 rounded-lg border border-slate-200 bg-slate-50/50 text-slate-800 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all resize-none text-xs"
              />
            </div>
          )}

          {/* Auditor Remark (Not applicable for Incentive Report) */}
          {phase !== 'INCENTIVE_REPORT' && (
            <div className="space-y-1.5">
              <label className="block font-semibold text-slate-700">
                Auditor Remark & Finding Notes
              </label>
              <textarea
                rows={4}
                value={auditorRemark}
                onChange={(e) => setAuditorRemark(e.target.value)}
                placeholder="Record auditor qualitative remarks, evidence gaps, or compliance notes..."
                className="w-full p-3 rounded-lg border border-slate-200 bg-slate-50/50 text-slate-800 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all resize-none text-xs"
              />
            </div>
          )}

          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2 text-amber-800">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
            <p className="text-[11px] leading-relaxed">
              Updates to this remark and progress are versioned and logged in the audit trail. The latest data will be displayed on the macro ToR table.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-slate-200 bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-medium hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 shadow-2xs transition-colors"
          >
            Save Remarks
          </button>
        </div>
      </div>
    </div>
  );
};
