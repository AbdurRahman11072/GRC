'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, AlertCircle, Save, Upload } from 'lucide-react';
import { Modal } from '../../../ui/Modal';
import { Button } from '../../../ui/Button';
import { useUpdatePeriodStatusesMutation } from '../../../../store/api/drtApi';
import type { IDRTTicket, PeriodEvidenceStatus } from '../../../../types/project.types';

export interface EditDrtPeriodStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: IDRTTicket | null;
  periodLabel: string | null;
  onOpenUpload?: (ticket: IDRTTicket, year: string) => void;
}

export const EditDrtPeriodStatusModal: React.FC<EditDrtPeriodStatusModalProps> = ({
  isOpen,
  onClose,
  ticket,
  periodLabel,
  onOpenUpload,
}) => {
  const [evidenceStatus, setEvidenceStatus] = useState<PeriodEvidenceStatus>('IN_PROGRESS');
  const [remark, setRemark] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [updatePeriodStatuses, { isLoading }] = useUpdatePeriodStatusesMutation();

  useEffect(() => {
    if (isOpen && ticket && periodLabel) {
      const match = ticket.periodStatuses?.find((p) => p.periodLabel === periodLabel);
      setEvidenceStatus(match?.evidenceStatus || 'IN_PROGRESS');
      setRemark(match?.remark || '');
      setErrorMessage(null);
    }
  }, [isOpen, ticket, periodLabel]);

  if (!ticket || !periodLabel) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    try {
      await updatePeriodStatuses({
        ticketId: ticket.id,
        statuses: [
          {
            periodLabel,
            evidenceStatus,
            remark: remark.trim() || null,
          },
        ],
      }).unwrap();
      onClose();
    } catch (err: unknown) {
      const error = err as { data?: { message?: string }; message?: string };
      setErrorMessage(error.data?.message || error.message || 'Failed to update timeframe status');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Timeframe Status: ${ticket.requestCode} (${periodLabel})`}
      description={ticket.title || ticket.description}
      size="sm"
    >
      {errorMessage && (
        <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-600">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-700">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <span className="font-semibold">Audit Year: {periodLabel}</span>
          </div>
          {onOpenUpload && (
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={() => {
                onClose();
                onOpenUpload(ticket, periodLabel);
              }}
              leftIcon={<Upload className="w-3 h-3 text-indigo-600" />}
            >
              Upload Evidence
            </Button>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Evidence Status *
          </label>
          <select
            value={evidenceStatus}
            onChange={(e) => setEvidenceStatus(e.target.value as PeriodEvidenceStatus)}
            className="w-full px-3 py-2 rounded-lg text-xs bg-white border border-slate-200 text-slate-800 focus:outline-none focus:border-indigo-600 font-medium"
          >
            <option value="COMPLETED">Completed (Shared in full)</option>
            <option value="PARTIAL">Partial Evidence</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="SHARED">Shared</option>
            <option value="NOT_SHARED">Not Shared (Missing)</option>
            <option value="NOT_APPLICABLE">Not Applicable (Excluded)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Auditor / Field Remark
          </label>
          <textarea
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            rows={3}
            placeholder={`Add notes on evidence status for ${periodLabel}...`}
            className="w-full px-3 py-2 rounded-lg text-xs bg-white border border-slate-200 text-slate-800 focus:outline-none focus:border-indigo-600 resize-none"
          />
        </div>

        <div className="pt-2 border-t border-slate-200 flex items-center justify-end gap-2.5">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isLoading} leftIcon={<Save className="w-3.5 h-3.5" />}>
            Save Status
          </Button>
        </div>
      </form>
    </Modal>
  );
};
