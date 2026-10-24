'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { CheckCircle2, RotateCcw, AlertCircle, FileText, ExternalLink, Calendar, Building2, ShieldCheck } from 'lucide-react';
import { Modal } from '../../../ui/Modal';
import { Button } from '../../../ui/Button';
import { useReviewDrtDocumentMutation } from '../../../../store/api/drtApi';
import type { IDRTDocument, IDRTTicket } from '../../../../types/project.types';

export interface ReviewDrtDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket?: IDRTTicket | null;
  document?: IDRTDocument | null;
}

export const ReviewDrtDocumentModal: React.FC<ReviewDrtDocumentModalProps> = ({
  isOpen,
  onClose,
  ticket,
  document,
}) => {
  const [selectedDocId, setSelectedDocId] = useState<string>('');
  const [reviewNotes, setReviewNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [reviewDrtDocument, { isLoading }] = useReviewDrtDocumentMutation();

  const allDocs = useMemo(() => {
    if (ticket?.drtDocuments && ticket.drtDocuments.length > 0) return ticket.drtDocuments;
    if (document) return [document];
    return [];
  }, [ticket, document]);

  // Group evidence by timeframe
  const docsByTimeframe = useMemo(() => {
    const map = new Map<string, IDRTDocument[]>();
    allDocs.forEach((d) => {
      const key = d.periodLabel ? `Year ${d.periodLabel}` : 'All Years / General';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(d);
    });
    return Array.from(map.entries());
  }, [allDocs]);

  useEffect(() => {
    if (isOpen && allDocs.length > 0) {
      const target = document
        ? allDocs.find((d) => d.id === document.id)
        : allDocs.find((d) => d.status === 'SUBMITTED') || allDocs[0];
      setSelectedDocId(target ? target.id : allDocs[0].id);
      setReviewNotes(target?.reviewNotes || '');
      setErrorMessage(null);
    }
  }, [isOpen, allDocs, document]);

  const activeDoc = allDocs.find((d) => d.id === selectedDocId) || allDocs[0];

  const handleSelectDoc = (doc: IDRTDocument) => {
    setSelectedDocId(doc.id);
    setReviewNotes(doc.reviewNotes || '');
    setErrorMessage(null);
  };

  const handleAction = async (status: 'ACCEPTED' | 'REVISION_REQUESTED') => {
    if (!activeDoc) return;
    setErrorMessage(null);

    if (status === 'REVISION_REQUESTED' && !reviewNotes.trim()) {
      setErrorMessage('Please provide supervisor remarks detailing why revision is requested.');
      return;
    }

    try {
      await reviewDrtDocument({
        docId: activeDoc.id,
        status,
        reviewNotes: reviewNotes.trim() || undefined,
      }).unwrap();
      onClose();
    } catch (err: unknown) {
      const error = err as { data?: { message?: string }; message?: string };
      setErrorMessage(error.data?.message || error.message || 'Failed to review document');
    }
  };

  if (!isOpen || allDocs.length === 0) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Review DRT Evidence [${ticket?.requestCode || activeDoc.fileName}]`}
      description={ticket?.title || ticket?.description || 'Verify multi-year evidence submissions and compliance records'}
      size="lg"
    >
      {errorMessage && (
        <div className="mb-3 p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-600">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Left: Timeframe-grouped evidence list */}
        <div className="md:col-span-5 space-y-3 max-h-[380px] overflow-y-auto pr-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Evidence by Timeframe ({allDocs.length})
          </span>
          {docsByTimeframe.map(([timeframe, docs]) => (
            <div key={timeframe} className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-100/80 px-2 py-1 rounded">
                <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                <span>{timeframe}</span>
                <span className="text-[10px] text-slate-400 font-normal">({docs.length})</span>
              </div>
              <div className="space-y-1">
                {docs.map((doc) => {
                  const isSelected = doc.id === activeDoc?.id;
                  const isClient = doc.partySide === 'CLIENT';
                  return (
                    <div
                      key={doc.id}
                      onClick={() => handleSelectDoc(doc)}
                      className={`p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/70 shadow-2xs ring-1 ring-indigo-500'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="font-medium text-slate-900 truncate max-w-[170px]">{doc.fileName}</span>
                        <span
                          className={`px-1.5 py-0.2 rounded text-[10px] font-bold border ${
                            doc.status === 'ACCEPTED'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : doc.status === 'REVISION_REQUESTED'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-cyan-50 text-cyan-700 border-cyan-200'
                          }`}
                        >
                          {doc.status === 'ACCEPTED' ? 'Accepted' : doc.status === 'REVISION_REQUESTED' ? 'Revision' : 'Review'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-500">
                        <span className="flex items-center gap-1">
                          {isClient ? <ShieldCheck className="w-3 h-3 text-indigo-600" /> : <Building2 className="w-3 h-3 text-purple-600" />}
                          {isClient ? 'Client' : 'Auditee'}
                        </span>
                        {doc.referenceNumber && <span className="font-mono truncate max-w-[90px]">#{doc.referenceNumber}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Right: Active Document Details & Supervisor Action Panel */}
        {activeDoc && (
          <div className="md:col-span-7 space-y-3 bg-slate-50/70 p-3.5 rounded-xl border border-slate-200">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800">
                    {activeDoc.periodLabel ? `Timeframe: ${activeDoc.periodLabel}` : 'All Years'}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-200 text-slate-700">
                    {activeDoc.partySide === 'CLIENT' ? 'Client / Regulator' : 'Auditee / Enterprise'}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <span>{activeDoc.fileName}</span>
                </h4>
              </div>
              {activeDoc.fileUrl && (
                <a
                  href={activeDoc.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold underline shrink-0"
                >
                  <span>View File</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-2 border-t border-slate-200">
              <div><span className="text-slate-400">Ref #: </span><strong className="text-slate-700">{activeDoc.referenceNumber || 'N/A'}</strong></div>
              <div><span className="text-slate-400">Received: </span><strong className="text-slate-700">{activeDoc.receivedDate || 'N/A'}</strong></div>
              <div className="col-span-2"><span className="text-slate-400">Uploaded By: </span><strong className="text-slate-700">{activeDoc.uploadedBy?.name || activeDoc.uploadedBy?.email || 'Auditor'}</strong></div>
            </div>

            {/* Supervisor Remarks Input */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Supervisor Remarks & Revision Instructions *
              </label>
              <textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                rows={3}
                placeholder="Explain any discrepancy, missing attachments, incomplete configurations, or revisions needed..."
                className="w-full px-3 py-2 rounded-lg text-xs bg-white border border-slate-200 text-slate-800 focus:outline-none focus:border-indigo-600 resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleAction('REVISION_REQUESTED')}
                disabled={isLoading}
                className="text-amber-700 border-amber-300 hover:bg-amber-50"
                leftIcon={<RotateCcw className="w-3.5 h-3.5 text-amber-600" />}
              >
                Request Revision
              </Button>
              <div className="flex items-center gap-2">
                <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isLoading}>Close</Button>
                <Button type="button" variant="primary" size="sm" onClick={() => handleAction('ACCEPTED')} disabled={isLoading} leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}>
                  Accept Evidence
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
