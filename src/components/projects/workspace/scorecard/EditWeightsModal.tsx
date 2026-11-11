'use client';

import React, { useState, useEffect } from 'react';
import { Sliders, AlertCircle, CheckCircle } from 'lucide-react';
import { Modal } from '../../../ui/Modal';
import { Button } from '../../../ui/Button';
import { useUpdateProjectWeightsMutation } from '../../../../store/api/scorecardApi';

interface EditWeightsModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  initialClientWeight: number;
  initialAuditeeWeight: number;
  initialPmWeight: number;
}

export const EditWeightsModal: React.FC<EditWeightsModalProps> = ({
  isOpen,
  onClose,
  projectId,
  initialClientWeight,
  initialAuditeeWeight,
  initialPmWeight,
}) => {
  const [clientWeight, setClientWeight] = useState(initialClientWeight);
  const [auditeeWeight, setAuditeeWeight] = useState(initialAuditeeWeight);
  const [pmWeight, setPmWeight] = useState(initialPmWeight);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [updateWeights, { isLoading }] = useUpdateProjectWeightsMutation();

  useEffect(() => {
    if (isOpen) {
      setClientWeight(initialClientWeight);
      setAuditeeWeight(initialAuditeeWeight);
      setPmWeight(initialPmWeight);
      setErrorMsg(null);
    }
  }, [isOpen, initialClientWeight, initialAuditeeWeight, initialPmWeight]);

  if (!isOpen) return null;

  const total = Number((clientWeight + auditeeWeight + pmWeight).toFixed(2));
  const isValidTotal = Math.abs(total - 100) < 0.01;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidTotal) {
      setErrorMsg(`Total weights must sum to exactly 100.0%. Current sum is ${total}%.`);
      return;
    }

    try {
      setErrorMsg(null);
      await updateWeights({
        projectId,
        body: { clientWeight, auditeeWeight, pmWeight },
      }).unwrap();
      onClose();
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setErrorMsg((err as any)?.data?.message || 'Failed to update project weights');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title="Configure Scoring Envelopes"
      description="Define macro percentage weights across the 3 streams. The combined sum must strictly equal 100.00%."
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
            disabled={!isValidTotal || isLoading}
            isLoading={isLoading}
            leftIcon={<Sliders className="w-4 h-4" />}
          >
            Save Weights
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Auditee Weight (FHL) %
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={auditeeWeight}
              onChange={(e) => setAuditeeWeight(parseFloat(e.target.value) || 0)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Client Weight (BTRC) %
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={clientWeight}
              onChange={(e) => setClientWeight(parseFloat(e.target.value) || 0)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              PM Discretionary Weight %
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={pmWeight}
              onChange={(e) => setPmWeight(parseFloat(e.target.value) || 0)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
              required
            />
          </div>
        </div>

        {/* Sum Check Indicator */}
        <div
          className={`p-3 rounded-xl border text-xs flex items-center justify-between transition-colors ${
            isValidTotal
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-1.5 font-medium">
            {isValidTotal ? (
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600" />
            )}
            <span>Total Weight Sum:</span>
          </div>
          <strong className="font-mono text-sm font-bold">{total.toFixed(2)}%</strong>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </form>
    </Modal>
  );
};
