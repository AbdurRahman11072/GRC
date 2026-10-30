'use client';

import React, { useState } from 'react';
import { X, Check, MessageSquare, AlertCircle } from 'lucide-react';
import type { ITorNode, TorProgressReportPhase, ITorProgressStageData } from '../../../types/tor.types';

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
  const [status, setStatus] = useState(initialData.status || 'PENDING');
  const [auditorRemark, setAuditorRemark] = useState(initialData.auditorRemark || '');
  const [auditeeRemark, setAuditeeRemark] = useState(initialData.auditeeRemark || '');

  if (!isOpen) return null;

  const isDraftOrFinal = phase === 'DRAFT_REPORT' || phase === 'FINAL_REPORT';

  const handleSave = () => {
    onSave(node.id, phase, {
      status,
      auditorRemark: auditorRemark.trim() || null,
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
          {/* Status Selector */}
          <div className="space-y-1.5">
            <label className="block font-semibold text-slate-700">
              Phase Progress Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full py-2 px-3 rounded-lg border border-slate-200 bg-white text-slate-800 font-medium focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all text-xs"
            >
              <option value="PENDING">Pending Evaluation</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="PARTIALLY_COMPLIANT">Partially Compliant</option>
              <option value="COMPLIANT">Compliant</option>
              <option value="NON_COMPLIANT">Non-Compliant</option>
              <option value="NOT_APPLICABLE">Not Applicable</option>
            </select>
          </div>

          {/* Auditee / Draft Remark (if applicable) */}
          {isDraftOrFinal && (
            <div className="space-y-1.5">
              <label className="block font-semibold text-slate-700">
                {phase === 'DRAFT_REPORT' ? 'Draft Remark (Auditee Focal)' : 'Final Remark (Auditee Focal)'}
              </label>
              <textarea
                rows={3}
                value={auditeeRemark}
                onChange={(e) => setAuditeeRemark(e.target.value)}
                placeholder="Enter auditee focal team remark or explanation..."
                className="w-full p-3 rounded-lg border border-slate-200 bg-slate-50/50 text-slate-800 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all resize-none text-xs"
              />
            </div>
          )}

          {/* Auditor Remark */}
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

          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2 text-amber-800">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
            <p className="text-[11px] leading-relaxed">
              Updates to this remark are versioned and logged in the audit trail. The latest remark will be displayed on the macro ToR table.
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
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 shadow-sm transition-colors"
          >
            <Check className="w-3.5 h-3.5" />
            Save Remark
          </button>
        </div>
      </div>
    </div>
  );
};
