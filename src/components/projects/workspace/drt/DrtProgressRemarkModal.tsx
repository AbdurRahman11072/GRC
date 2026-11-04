'use client';

import React, { useState } from 'react';
import { X, MessageSquare } from 'lucide-react';
import type { IDRTTicket } from '../../../../types/drt.types';
import {
  DrtProgressPhase,
  IDrtStageData,
  getDrtStageData,
  getDrtProgressPercentage,
  getDrtStagePercentage,
} from '../../../../lib/drtProgressUtils';

export interface DrtProgressRemarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: IDRTTicket;
  phase: DrtProgressPhase;
  onSave: (
    ticketId: string,
    phase: DrtProgressPhase,
    updatedData: {
      status?: string;
      percentage?: number;
      auditeeRemark?: string | null;
      auditorRemark?: string | null;
    }
  ) => void;
}

export const DrtProgressRemarkModal: React.FC<DrtProgressRemarkModalProps> = ({
  isOpen,
  onClose,
  ticket,
  phase,
  onSave,
}) => {
  const initialData: IDrtStageData = getDrtStageData(ticket, phase);
  const isFirstProgress = phase === 'FIRST_PROGRESS';

  const [progressPct, setProgressPct] = useState<number>(() =>
    getDrtStagePercentage(ticket, phase)
  );
  const [auditorRemark, setAuditorRemark] = useState(initialData.auditorRemark || '');
  const [auditeeRemark, setAuditeeRemark] = useState(initialData.auditeeRemark || '');

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(ticket.id, phase, {
      status: `${progressPct}%`,
      percentage: progressPct,
      auditorRemark: auditorRemark.trim() || null,
      auditeeRemark: auditeeRemark.trim() || null,
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
                  {ticket.requestCode}
                </span>
              </h3>
              <p className="text-xs text-slate-500 line-clamp-1">{ticket.description}</p>
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

          {/* Auditee Remark */}
          <div className="space-y-1.5">
            <label className="block font-semibold text-slate-700">
              Auditee Remark
            </label>
            <textarea
              rows={3}
              value={auditeeRemark}
              onChange={(e) => setAuditeeRemark(e.target.value)}
              placeholder="Record auditee focal response, deliverable status, or clarification..."
              className="w-full p-2.5 rounded-lg border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 text-xs resize-none"
            />
          </div>

          {/* Auditor Remark */}
          <div className="space-y-1.5">
            <label className="block font-semibold text-slate-700">
              Auditor Observation / Remark
            </label>
            <textarea
              rows={3}
              value={auditorRemark}
              onChange={(e) => setAuditorRemark(e.target.value)}
              placeholder="Record lead auditor evaluation, findings verification, or evidence sufficiency..."
              className="w-full p-2.5 rounded-lg border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 text-xs resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-slate-200 bg-slate-50/70">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 font-medium text-xs cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs shadow-2xs cursor-pointer"
          >
            Save Remarks
          </button>
        </div>
      </div>
    </div>
  );
};
