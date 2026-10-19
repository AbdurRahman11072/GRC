'use client';

import React, { useState } from 'react';
import { CheckCircle2, RotateCcw, AlertCircle, FileText, ExternalLink } from 'lucide-react';
import { Modal } from '../../../ui/Modal';
import { Button } from '../../../ui/Button';
import { useReviewDrtDocumentMutation } from '../../../../store/api/drtApi';
import type { IDRTDocument } from '../../../../types/project.types';

export interface ReviewDrtDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: IDRTDocument | null;
}

export const ReviewDrtDocumentModal: React.FC<ReviewDrtDocumentModalProps> = ({
  isOpen,
  onClose,
  document,
}) => {
  const [reviewNotes, setReviewNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reviewDrtDocument, { isLoading }] = useReviewDrtDocumentMutation();

  if (!document) return null;

  const handleAction = async (status: 'ACCEPTED' | 'REVISION_REQUESTED') => {
    setErrorMessage(null);
    if (status === 'REVISION_REQUESTED' && !reviewNotes.trim()) {
      setErrorMessage('Please provide review notes explaining why revision is requested.');
      return;
    }

    try {
      await reviewDrtDocument({
        docId: document.id,
        status,
        reviewNotes: reviewNotes.trim() || undefined,
      }).unwrap();

      setReviewNotes('');
      onClose();
    } catch (err: unknown) {
      const error = err as { data?: { message?: string }; message?: string };
      setErrorMessage(error.data?.message || error.message || 'Failed to review document');
    }
  };

  const isClient = document.partySide === 'CLIENT';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Audit Review & Verification"
      description={`Review ${isClient ? 'Client / Regulator' : 'Auditee / Enterprise'} submitted evidence`}
      size="md"
    >
      {errorMessage && (
        <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-start gap-2.5 text-xs text-rose-500">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="space-y-3 mb-4">
        {/* Document Info Card */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                isClient
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-purple-100 text-purple-700'
              }`}
            >
              {isClient ? 'Client / Regulator Evidence' : 'Auditee / Enterprise Evidence'}
            </span>
            <span className="text-slate-500 text-[11px]">
              Uploaded {new Date(document.createdAt).toLocaleDateString()}
            </span>
          </div>

          <div className="font-semibold text-slate-800 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-slate-500" />
            <span>{document.fileName}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-slate-600 text-[11px] pt-1 border-t border-slate-200">
            <div>
              <span className="text-slate-500">Ref #: </span>
              <strong className="text-slate-700">{document.referenceNumber || 'N/A'}</strong>
            </div>
            <div>
              <span className="text-slate-500">Received: </span>
              <strong className="text-slate-700">{document.receivedDate || 'N/A'}</strong>
            </div>
            <div className="col-span-2">
              <span className="text-slate-500">Uploaded By: </span>
              <strong className="text-slate-700">{document.uploadedBy?.name || document.uploadedBy?.email || 'Auditor'}</strong>
            </div>
          </div>

          {document.fileUrl && (
            <div className="pt-2">
              <a
                href={document.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium underline"
              >
                <span>View Attachment / Evidence Link</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>

        {/* Review Notes Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Supervisor Review Notes / Verification Remarks
          </label>
          <textarea
            value={reviewNotes}
            onChange={(e) => setReviewNotes(e.target.value)}
            rows={3}
            placeholder="Add compliance assessment notes, verify matching data points, or detail required revisions..."
            className="w-full px-3 py-2 rounded-lg text-xs bg-white border border-slate-200 text-slate-800 focus:outline-none focus:border-indigo-600 resize-none"
          />
        </div>
      </div>

      <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => handleAction('REVISION_REQUESTED')}
          disabled={isLoading}
          leftIcon={<RotateCcw className="w-4 h-4 text-amber-500" />}
        >
          Request Revision
        </Button>

        <div className="flex items-center gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => handleAction('ACCEPTED')}
            disabled={isLoading}
            leftIcon={<CheckCircle2 className="w-4 h-4" />}
          >
            Accept Evidence
          </Button>
        </div>
      </div>
    </Modal>
  );
};
