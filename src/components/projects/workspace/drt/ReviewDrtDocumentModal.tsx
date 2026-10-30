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

export const ReviewDrtDocumentModal: React.FC<ReviewDrtDocumentModalProps> = ({ isOpen, onClose, ticket, document }) => {
  const [selectedDocId, setSelectedDocId] = useState<string>('');
  const [reviewNotes, setReviewNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reviewDrtDocument, { isLoading }] = useReviewDrtDocumentMutation();

  const allDocs = useMemo(() => {
    if (ticket?.drtDocuments && ticket.drtDocuments.length > 0) return ticket.drtDocuments;
    return document ? [document] : [];
  }, [ticket, document]);

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

  const handleAction = async (status: 'ACCEPTED' | 'REVISION_REQUESTED') => {
    if (!activeDoc) return;
    if (status === 'REVISION_REQUESTED' && !reviewNotes.trim()) {
      setErrorMessage('Please provide supervisor remarks/instructions explaining what revision is needed.');
      return;
    }
    setErrorMessage(null);
    try {
      await reviewDrtDocument({ docId: activeDoc.id, status, reviewNotes: reviewNotes.trim() || undefined }).unwrap();
      onClose();
    } catch (err: unknown) {
      const error = err as { data?: { message?: string }; message?: string };
      setErrorMessage(error.data?.message || error.message || 'Failed to review document');
    }
  };

  if (!isOpen || allDocs.length === 0) return null;
  const isRev = activeDoc?.status === 'REVISION_REQUESTED';
  const isAcc = activeDoc?.status === 'ACCEPTED';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Review DRT Evidence [${ticket?.requestCode || activeDoc?.fileName}]`}
      description={ticket?.title || ticket?.description || 'Verify multi-year evidence submissions and compliance records'}
      size="4xl"
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleAction('REVISION_REQUESTED')}
            disabled={isLoading}
            className="text-rose-700 border-rose-300 hover:bg-rose-50"
            leftIcon={<RotateCcw className="w-3.5 h-3.5 text-rose-600" />}
          >
            Request Revision
          </Button>
          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isLoading}>Close</Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => handleAction('ACCEPTED')}
              disabled={isLoading}
              className="bg-emerald-600 hover:bg-emerald-700"
              leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
            >
              Accept Evidence
            </Button>
          </div>
        </>
      }
    >
      {errorMessage && (
        <div className="mb-3.5 p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-600">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-5">
        {/* Left Navigator */}
        <div className="w-full md:w-72 shrink-0 border-b md:border-b-0 md:border-r border-slate-200 pb-4 md:pb-0 md:pr-4 space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Submitted Evidence</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700">{allDocs.length} files</span>
          </div>
          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {docsByTimeframe.map(([timeframe, docs]) => (
              <div key={timeframe} className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{timeframe}</span>
                  <span className="text-[10px] text-slate-400 font-normal">({docs.length})</span>
                </div>
                <div className="space-y-1">
                  {docs.map((doc) => {
                    const sel = doc.id === activeDoc?.id;
                    const cli = doc.partySide === 'CLIENT';
                    return (
                      <div
                        key={doc.id}
                        onClick={() => { setSelectedDocId(doc.id); setReviewNotes(doc.reviewNotes || ''); }}
                        className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                          sel ? 'border-indigo-600 bg-indigo-50/70 shadow-xs ring-1 ring-indigo-500/30' : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1.5 mb-1">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <FileText className={`w-3.5 h-3.5 shrink-0 ${cli ? 'text-cyan-600' : 'text-purple-600'}`} />
                            <span className="font-semibold text-xs text-slate-800 truncate" title={doc.fileName}>{doc.fileName}</span>
                          </div>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 border ${
                            doc.status === 'ACCEPTED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : doc.status === 'REVISION_REQUESTED' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-sky-50 text-sky-700 border-sky-200'
                          }`}>
                            {doc.status === 'ACCEPTED' ? 'Accepted' : doc.status === 'REVISION_REQUESTED' ? 'Revision' : 'Review'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-500">
                          <span className="flex items-center gap-1">
                            {cli ? <ShieldCheck className="w-3 h-3 text-cyan-600" /> : <Building2 className="w-3 h-3 text-purple-600" />}
                            {cli ? 'Client' : 'Auditee'}
                          </span>
                          <span className="font-mono text-slate-400">{doc.referenceNumber ? `#${doc.referenceNumber}` : 'No Ref'}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Inspector */}
        {activeDoc && (
          <div className="flex-1 min-w-0 space-y-3.5">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-indigo-100 text-indigo-800">
                    {activeDoc.periodLabel ? `Timeframe: Year ${activeDoc.periodLabel}` : 'All Years / Global'}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-white border border-slate-200 text-slate-700">
                    {activeDoc.partySide === 'CLIENT' ? 'Client / Regulator' : 'Auditee / Enterprise'}
                  </span>
                  <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${isAcc ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : isRev ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-sky-50 text-sky-700 border-sky-200'}`}>
                    Status: {(activeDoc.status || 'SUBMITTED').replace(/_/g, ' ')}
                  </span>
                </div>
                {activeDoc.fileUrl && (
                  <a href={activeDoc.fileUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-white border border-slate-200 hover:border-indigo-400 text-indigo-700 shadow-2xs hover:bg-indigo-50/50 transition-colors">
                    <span>View File</span><ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600 shrink-0" /><span className="truncate">{activeDoc.fileName}</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs pt-2.5 border-t border-slate-200/80">
                <div className="p-2 rounded-lg bg-white border border-slate-100">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Dispatch Ref #</span>
                  <strong className="text-slate-800 text-xs font-mono truncate block">{activeDoc.referenceNumber || 'N/A'}</strong>
                </div>
                <div className="p-2 rounded-lg bg-white border border-slate-100">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Received Date</span>
                  <strong className="text-slate-800 text-xs block">{activeDoc.receivedDate ? activeDoc.receivedDate.split('T')[0] : 'N/A'}</strong>
                </div>
                <div className="p-2 rounded-lg bg-white border border-slate-100">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Uploaded By</span>
                  <strong className="text-slate-800 text-xs truncate block">{activeDoc.uploadedBy?.name || activeDoc.uploadedBy?.email || 'Auditor'}</strong>
                </div>
              </div>
            </div>

            {isRev && activeDoc.reviewNotes && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-rose-800">
                  <RotateCcw className="w-3.5 h-3.5 text-rose-600" /><span>Revision Requested by Supervisor</span>
                </div>
                <p className="text-rose-700 pl-5 leading-relaxed">{activeDoc.reviewNotes}</p>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Supervisor Remarks & Revision Instructions *
              </label>
              <textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                rows={3}
                placeholder="Detail verified items or explain required revisions..."
                className="w-full px-3 py-2 rounded-xl text-xs bg-white border border-slate-200 text-slate-800 focus:outline-none focus:border-indigo-600 resize-none shadow-2xs"
              />
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
