'use client';

import React, { useState, useEffect } from 'react';
import { Upload, AlertCircle, Building2, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Modal } from '../../../ui/Modal';
import { Button } from '../../../ui/Button';
import { useUploadDrtDocumentMutation } from '../../../../store/api/drtApi';
import type { IDRTTicket, DRTPartySide } from '../../../../types/project.types';

export interface UploadDrtDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: IDRTTicket | null;
  defaultSide?: DRTPartySide;
}

export const UploadDrtDocumentModal: React.FC<UploadDrtDocumentModalProps> = ({
  isOpen,
  onClose,
  ticket,
  defaultSide = 'AUDITEE',
}) => {
  const [partySide, setPartySide] = useState<DRTPartySide>(defaultSide);
  const [fileName, setFileName] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [receivedDate, setReceivedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [uploadDrtDocument, { isLoading }] = useUploadDrtDocumentMutation();

  useEffect(() => {
    if (isOpen) {
      setPartySide(defaultSide);
      setFileName('');
      setFileUrl('');
      setReferenceNumber('');
      setReceivedDate(new Date().toISOString().split('T')[0]);
      setNotes('');
      setErrorMessage(null);
    }
  }, [isOpen, defaultSide]);

  if (!ticket) return null;

  const existingDocs = ticket.drtDocuments || [];
  const clientDocs = existingDocs.filter((d) => d.partySide === 'CLIENT');
  const auditeeDocs = existingDocs.filter((d) => d.partySide === 'AUDITEE');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fileName.trim()) {
      setErrorMessage('Document title / filename is required');
      return;
    }

    try {
      await uploadDrtDocument({
        ticketId: ticket.id,
        partySide,
        fileName: fileName.trim(),
        fileUrl: fileUrl.trim() || undefined,
        referenceNumber: referenceNumber.trim() || undefined,
        receivedDate: receivedDate || undefined,
        notes: notes.trim() || undefined,
      }).unwrap();

      onClose();
    } catch (err: unknown) {
      const error = err as { data?: { message?: string }; message?: string };
      setErrorMessage(error.data?.message || error.message || 'Failed to upload document');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Upload DRT Evidence [${ticket.requestCode}]`}
      description={ticket.title || ticket.description}
      size="md"
    >
      {errorMessage && (
        <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-start gap-2.5 text-xs text-rose-500">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Existing Evidence Summary */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div
          className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
            partySide === 'CLIENT'
              ? 'border-indigo-600 bg-indigo-50/60 font-medium'
              : 'border-slate-200 bg-slate-50 text-slate-600'
          }`}
          onClick={() => setPartySide('CLIENT')}
        >
          <div className="flex items-center gap-1.5 mb-1">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span className="font-semibold text-slate-800">1. Client / Regulator</span>
          </div>
          <span className="text-[11px] block text-slate-500">
            {clientDocs.length > 0
              ? `${clientDocs.length} record(s) submitted`
              : 'Awaiting submission'}
          </span>
        </div>

        <div
          className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
            partySide === 'AUDITEE'
              ? 'border-purple-600 bg-purple-50/60 font-medium'
              : 'border-slate-200 bg-slate-50 text-slate-600'
          }`}
          onClick={() => setPartySide('AUDITEE')}
        >
          <div className="flex items-center gap-1.5 mb-1">
            <Building2 className="w-4 h-4 text-purple-600" />
            <span className="font-semibold text-slate-800">2. Auditee / Enterprise</span>
          </div>
          <span className="text-[11px] block text-slate-500">
            {auditeeDocs.length > 0
              ? `${auditeeDocs.length} record(s) submitted`
              : 'Awaiting submission'}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="text-[11px] text-slate-500 bg-amber-50 border border-amber-200 p-2.5 rounded-lg">
          Note: Both Client and Auditee evidence are uploaded by the audit team (field members or supervisors) on receipt.
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Document Title / File Name *
          </label>
          <input
            type="text"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            placeholder="e.g. BTRC Directive 2021-04.pdf or Router Config Export.log"
            className="w-full px-3 py-2 rounded-lg text-xs bg-white border border-slate-200 text-slate-800 focus:outline-none focus:border-indigo-600"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Reference / Dispatch #
            </label>
            <input
              type="text"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              placeholder="e.g. BTRC/DRT/2024/098"
              className="w-full px-3 py-2 rounded-lg text-xs bg-white border border-slate-200 text-slate-800 focus:outline-none focus:border-indigo-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Received Date
            </label>
            <input
              type="date"
              value={receivedDate}
              onChange={(e) => setReceivedDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-xs bg-white border border-slate-200 text-slate-800 focus:outline-none focus:border-indigo-600"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Evidence Link / Cloud URL
          </label>
          <input
            type="url"
            value={fileUrl}
            onChange={(e) => setFileUrl(e.target.value)}
            placeholder="https://... or cloud storage link"
            className="w-full px-3 py-2 rounded-lg text-xs bg-white border border-slate-200 text-slate-800 focus:outline-none focus:border-indigo-600"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Submission Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Optional context, verification notes, or remarks..."
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
            leftIcon={<Upload className="w-4 h-4" />}
          >
            Submit for Review
          </Button>
        </div>
      </form>
    </Modal>
  );
};
