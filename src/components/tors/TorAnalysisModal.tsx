'use client';

import React, { useState, useEffect } from 'react';
import { Award, AlertCircle, FileText, CheckCircle2, ShieldCheck, Building2 } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useEvaluateTorAnalysisMutation } from '../../store/api/torApi';
import type { ITorNode } from '../../types/tor.types';

export interface TorAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  tor: ITorNode | null;
}

export const TorAnalysisModal: React.FC<TorAnalysisModalProps> = ({
  isOpen,
  onClose,
  tor,
}) => {
  const [marksAwarded, setMarksAwarded] = useState<number>(0);
  const [complianceStatus, setComplianceStatus] = useState<
    'COMPLIANT' | 'PARTIALLY_COMPLIANT' | 'NON_COMPLIANT' | 'NOT_APPLICABLE'
  >('COMPLIANT');
  const [analysisNotes, setAnalysisNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [evaluateAnalysis, { isLoading }] = useEvaluateTorAnalysisMutation();

  useEffect(() => {
    if (tor && isOpen) {
      setMarksAwarded(tor.dataAnalysisObtained ?? tor.dataAnalysisAllocated ?? 0);
      setComplianceStatus(
        (tor.complianceStatus as
          | 'COMPLIANT'
          | 'PARTIALLY_COMPLIANT'
          | 'NON_COMPLIANT'
          | 'NOT_APPLICABLE') || 'COMPLIANT'
      );
      setAnalysisNotes(tor.analysisNotes || '');
      setErrorMessage(null);
    }
  }, [tor, isOpen]);

  if (!tor) return null;

  const allocated = tor.dataAnalysisAllocated || 0;
  const childTickets = tor.drtTickets || [];
  const acceptedTickets = childTickets.filter((t) => t.workflowStatus === 'ACCEPTED').length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const marks = Number(marksAwarded);
    if (isNaN(marks) || marks < 0) {
      setErrorMessage('Awarded analysis marks must be 0 or greater');
      return;
    }
    if (allocated > 0 && marks > allocated) {
      setErrorMessage(`Awarded marks (${marks}) cannot exceed allocated marks (${allocated})`);
      return;
    }

    try {
      await evaluateAnalysis({
        torId: tor.id,
        dataAnalysisObtained: marks,
        complianceStatus,
        analysisNotes: analysisNotes.trim() || undefined,
      }).unwrap();

      onClose();
    } catch (err: unknown) {
      const error = err as { data?: { message?: string }; message?: string };
      setErrorMessage(error.data?.message || error.message || 'Failed to submit analysis evaluation');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Evaluate Analysis Marks [${tor.code}]`}
      description={tor.title}
      size="md"
    >
      {errorMessage && (
        <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-start gap-2.5 text-xs text-rose-500">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Child DRT Evidence Collection Summary */}
      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 mb-4 text-xs">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-slate-800 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-indigo-600" /> Child DRT Evidence Status
          </span>
          <span className="text-[11px] text-slate-500">
            {acceptedTickets} of {childTickets.length} DRTs accepted
          </span>
        </div>

        {childTickets.length === 0 ? (
          <p className="text-[11px] text-amber-600 italic">
            No DRT request tickets have been fired under this ToR yet.
          </p>
        ) : (
          <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
            {childTickets.map((t) => {
              const docs = t.drtDocuments || [];
              const hasClient = docs.some((d) => d.partySide === 'CLIENT' && d.status === 'ACCEPTED');
              const hasAuditee = docs.some((d) => d.partySide === 'AUDITEE' && d.status === 'ACCEPTED');

              return (
                <div
                  key={t.id}
                  className="p-1.5 rounded bg-white border border-slate-200 flex items-center justify-between text-[11px]"
                >
                  <span className="font-mono font-medium text-slate-800">{t.requestCode}</span>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-0.5 ${hasClient ? 'text-indigo-600' : 'text-slate-400'}`}>
                      <ShieldCheck className="w-3 h-3" /> Client
                    </span>
                    <span className={`inline-flex items-center gap-0.5 ${hasAuditee ? 'text-purple-600' : 'text-slate-400'}`}>
                      <Building2 className="w-3 h-3" /> Auditee
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Award Analysis Marks *
              </label>
              {allocated > 0 && (
                <span className="text-[10px] text-slate-500 font-mono">Max: {allocated}</span>
              )}
            </div>
            <input
              type="number"
              step="0.1"
              min="0"
              max={allocated > 0 ? allocated : undefined}
              value={marksAwarded}
              onChange={(e) => setMarksAwarded(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg text-xs bg-white border border-slate-200 text-slate-800 focus:outline-none focus:border-indigo-600 font-bold"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Compliance Finding *
            </label>
            <select
              value={complianceStatus}
              onChange={(e) => setComplianceStatus(e.target.value as any)}
              className="w-full px-3 py-2 rounded-lg text-xs bg-white border border-slate-200 text-slate-800 focus:outline-none focus:border-indigo-600"
            >
              <option value="COMPLIANT">Compliant</option>
              <option value="PARTIALLY_COMPLIANT">Partially Compliant</option>
              <option value="NON_COMPLIANT">Non-Compliant</option>
              <option value="NOT_APPLICABLE">Not Applicable</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Qualitative Audit Findings & Reasoning
          </label>
          <textarea
            value={analysisNotes}
            onChange={(e) => setAnalysisNotes(e.target.value)}
            rows={3}
            placeholder="State evidence gaps, regulatory deviations, corroboration between client vs auditee logs, or final rationale..."
            className="w-full px-3 py-2 rounded-lg text-xs bg-white border border-slate-200 text-slate-800 focus:outline-none focus:border-indigo-600 resize-none"
          />
        </div>

        <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isLoading}
            leftIcon={<Award className="w-4 h-4" />}
          >
            Award Marks & Sign Off
          </Button>
        </div>
      </form>
    </Modal>
  );
};
