'use client';

import React, { useState, useEffect } from 'react';
import { X, UserCheck } from 'lucide-react';
import { Button } from '../../../ui/Button';
import { useEvaluatePmDiscretionaryMutation } from '../../../../store/api/scorecardApi';

interface PmEvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  maxPmWeight: number;
  initialObtained: number;
  initialNotes?: string | null;
}

export const PmEvaluationModal: React.FC<PmEvaluationModalProps> = ({
  isOpen,
  onClose,
  projectId,
  maxPmWeight,
  initialObtained,
  initialNotes,
}) => {
  const [obtainedMarks, setObtainedMarks] = useState(initialObtained);
  const [evaluationNotes, setEvaluationNotes] = useState(initialNotes || '');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [evaluatePm, { isLoading }] = useEvaluatePmDiscretionaryMutation();

  useEffect(() => {
    if (isOpen) {
      setObtainedMarks(initialObtained);
      setEvaluationNotes(initialNotes || '');
      setErrorMsg(null);
    }
  }, [isOpen, initialObtained, initialNotes]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (obtainedMarks < 0 || obtainedMarks > maxPmWeight) {
      setErrorMsg(`Obtained marks must be between 0.0 and ${maxPmWeight.toFixed(2)}.`);
      return;
    }

    try {
      setErrorMsg(null);
      await evaluatePm({
        projectId,
        body: {
          obtainedMarks,
          evaluationNotes: evaluationNotes.trim() || undefined,
        },
      }).unwrap();
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.data?.message || 'Failed to submit PM evaluation');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-slate-100">PM Discretionary Evaluation</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <p className="text-xs text-slate-400">
            Award the discretionary performance mark (up to {maxPmWeight.toFixed(2)} marks) based on overall team cooperation, responsiveness, and SLA compliance.
          </p>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Awarded Marks (Max: {maxPmWeight.toFixed(2)})
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max={maxPmWeight}
                value={obtainedMarks}
                onChange={(e) => setObtainedMarks(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Evaluation Notes / Justification
              </label>
              <textarea
                rows={3}
                value={evaluationNotes}
                onChange={(e) => setEvaluationNotes(e.target.value)}
                placeholder="e.g. Audit field team met all sprint deliverables on time. Auditee team cooperated well on network topology requests."
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500 placeholder-slate-500"
              />
            </div>
          </div>

          {errorMsg && (
            <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded p-2">
              {errorMsg}
            </p>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isLoading}
              className="text-xs h-8 border-slate-700 text-slate-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isLoading}
              className="text-xs h-8 bg-amber-600 hover:bg-amber-500 text-white"
            >
              {isLoading ? 'Saving...' : 'Submit Evaluation'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
