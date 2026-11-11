'use client';

import React, { useState, useEffect } from 'react';
import { UserCheck, AlertCircle } from 'lucide-react';
import { Modal } from '../../../ui/Modal';
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
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setErrorMsg((err as any)?.data?.message || 'Failed to submit PM evaluation');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title="PM Discretionary Evaluation"
      description={`Award the discretionary performance mark (up to ${maxPmWeight.toFixed(2)} marks) based on overall team cooperation, responsiveness, and SLA compliance.`}
      footer={
        <div className="flex items-center justify-end gap-2 w-full">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            isLoading={isLoading}
            leftIcon={<UserCheck className="w-4 h-4" />}
          >
            Submit Evaluation
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Awarded Marks (Max: <span className="font-mono">{maxPmWeight.toFixed(2)}</span>)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            max={maxPmWeight}
            value={obtainedMarks}
            onChange={(e) => setObtainedMarks(parseFloat(e.target.value) || 0)}
            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Evaluation Remarks &amp; Justification
          </label>
          <textarea
            rows={3}
            value={evaluationNotes}
            onChange={(e) => setEvaluationNotes(e.target.value)}
            placeholder="Document rationale for PM mark award (e.g. prompt responsiveness to DRT inquiries, active meeting participation)..."
            className="w-full bg-white border border-slate-300 rounded-lg p-3 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
          />
        </div>
      </form>
    </Modal>
  );
};
