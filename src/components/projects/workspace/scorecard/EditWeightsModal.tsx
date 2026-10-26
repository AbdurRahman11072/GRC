'use client';

import React, { useState, useEffect } from 'react';
import { X, Sliders, AlertCircle, CheckCircle } from 'lucide-react';
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
    } catch (err: any) {
      setErrorMsg(err?.data?.message || 'Failed to update project weights');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-semibold text-slate-100">Configure Scoring Envelopes</h3>
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
            Define macro percentage weights across the 3 streams. The combined sum must strictly equal 100.00%.
          </p>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Auditee Weight (FHL) %
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={auditeeWeight}
                onChange={(e) => setAuditeeWeight(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Client Weight (BTRC) %
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={clientWeight}
                onChange={(e) => setClientWeight(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                PM Discretionary Weight %
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={pmWeight}
                onChange={(e) => setPmWeight(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
          </div>

          {/* Sum Check Indicator */}
          <div
            className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${
              isValidTotal
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
            }`}
          >
            <div className="flex items-center gap-1.5">
              {isValidTotal ? (
                <CheckCircle className="w-3.5 h-3.5" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5" />
              )}
              <span>Total Weight Sum:</span>
            </div>
            <strong className="font-mono text-sm">{total.toFixed(2)}%</strong>
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
              disabled={!isValidTotal || isLoading}
              className="text-xs h-8 bg-indigo-600 hover:bg-indigo-500 text-white"
            >
              {isLoading ? 'Saving...' : 'Save Weights'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
