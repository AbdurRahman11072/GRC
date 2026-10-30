'use client';

import React, { useState } from 'react';
import {
  FileText,
  ExternalLink,
  ShieldCheck,
  Building2,
  CheckCircle2,
  RotateCcw,
  Clock,
  Upload,
  User,
} from 'lucide-react';
import { Button } from '../../../../ui/Button';
import { ReviewDrtDocumentModal } from '../ReviewDrtDocumentModal';
import { formatDate } from '../../../../../lib/utils';
import type { IDRTTicket, IDRTDocument, DRTPartySide } from '../../../../../types/drt.types';

export interface DrtDetailsDocumentsProps {
  ticket: IDRTTicket;
  clientName?: string;
  auditeeName?: string;
  onOpenUpload?: (side: DRTPartySide) => void;
}

export const DrtDetailsDocuments: React.FC<DrtDetailsDocumentsProps> = ({
  ticket,
  clientName = 'BTRC',
  auditeeName = 'FHL',
  onOpenUpload,
}) => {
  const [activeTab, setActiveTab] = useState<'ALL' | 'CLIENT' | 'AUDITEE'>('ALL');
  const [reviewingDoc, setReviewingDoc] = useState<IDRTDocument | null>(null);

  const docs = ticket.drtDocuments || [];
  const clientDocs = docs.filter((d) => d.partySide === 'CLIENT');
  const auditeeDocs = docs.filter((d) => d.partySide === 'AUDITEE');

  const displayedDocs =
    activeTab === 'CLIENT'
      ? clientDocs
      : activeTab === 'AUDITEE'
      ? auditeeDocs
      : docs;

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden w-full max-w-full">
      {/* Header & Tabs */}
      <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between flex-wrap gap-3 bg-slate-50/70">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-sky-50 text-sky-700 rounded-lg border border-sky-200">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Submitted Evidence & Compliance Documents
            </h2>
            <p className="text-xs text-slate-500">
              Submissions from {clientName} & {auditeeName} with review verification records
            </p>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('ALL')}
            className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
              activeTab === 'ALL'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({docs.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('CLIENT')}
            className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
              activeTab === 'CLIENT'
                ? 'bg-white text-sky-700 shadow-xs border border-sky-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {clientName} ({clientDocs.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('AUDITEE')}
            className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
              activeTab === 'AUDITEE'
                ? 'bg-white text-emerald-700 shadow-xs border border-emerald-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {auditeeName} ({auditeeDocs.length})
          </button>
        </div>
      </div>

      {/* Document Listing */}
      <div className="p-5">
        {displayedDocs.length === 0 ? (
          <div className="py-12 text-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 space-y-3">
            <FileText className="w-8 h-8 text-slate-400 mx-auto" />
            <div>
              <p className="text-xs font-semibold text-slate-800">
                No documents found for {activeTab === 'ALL' ? 'this request' : activeTab === 'CLIENT' ? clientName : auditeeName}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Upload evidence files to advance the verification workflow.
              </p>
            </div>
            {onOpenUpload && (
              <Button
                variant="outline"
                size="xs"
                onClick={() => onOpenUpload(activeTab === 'CLIENT' ? 'CLIENT' : 'AUDITEE')}
                leftIcon={<Upload className="w-3.5 h-3.5" />}
              >
                Upload for {activeTab === 'CLIENT' ? clientName : auditeeName}
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {displayedDocs.map((doc) => {
              const isClient = doc.partySide === 'CLIENT';
              const isAccepted = doc.status === 'ACCEPTED';
              const isRevision = doc.status === 'REVISION_REQUESTED';

              return (
                <div
                  key={doc.id}
                  className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs ${
                    isClient
                      ? 'border-sky-200/80 bg-white hover:border-sky-300'
                      : 'border-emerald-200/80 bg-white hover:border-emerald-300'
                  }`}
                >
                  {/* Left Column: File Details */}
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold border ${
                          isClient
                            ? 'bg-sky-50 text-sky-800 border-sky-200'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}
                      >
                        {isClient ? <Building2 className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
                        {isClient ? clientName : auditeeName}
                      </span>

                      <span className="font-bold text-slate-900 truncate">
                        {doc.fileName}
                      </span>

                      {doc.periodLabel && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold">
                          {doc.periodLabel === 'ALL' ? 'All Periods' : `Year ${doc.periodLabel}`}
                        </span>
                      )}

                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          isAccepted
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : isRevision
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-sky-50 text-sky-700 border-sky-200'
                        }`}
                      >
                        {isAccepted ? <CheckCircle2 className="w-3 h-3" /> : isRevision ? <RotateCcw className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {(doc.status || 'SUBMITTED').replace(/_/g, ' ')}
                      </span>
                    </div>

                    {/* Metadata tags */}
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 flex-wrap">
                      {doc.referenceNumber && (
                        <span>Ref: <strong className="text-slate-800 font-mono">{doc.referenceNumber}</strong></span>
                      )}
                      <span>Received: {doc.receivedDate ? formatDate(doc.receivedDate) : formatDate(doc.createdAt)}</span>
                      {doc.uploadedBy && (
                        <span className="inline-flex items-center gap-1 text-slate-700">
                          <User className="w-3 h-3 text-slate-400" />
                          <span>{doc.uploadedBy.name}</span>
                        </span>
                      )}
                    </div>

                    {/* Review Notes / Supervisor Remarks */}
                    {doc.reviewNotes && (
                      <div className="p-2.5 rounded-lg bg-amber-50/60 border border-amber-200/80 text-[11px] text-amber-950">
                        <span className="font-bold text-amber-900">Review Notes: </span>
                        {doc.reviewNotes}
                        {doc.reviewedBy && (
                          <span className="text-amber-700 font-medium ml-1">
                            (checked by {doc.reviewedBy.name})
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    {doc.fileUrl && (
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>View File</span>
                      </a>
                    )}

                    <Button
                      variant={isAccepted ? 'outline' : 'primary'}
                      size="xs"
                      onClick={() => setReviewingDoc(doc)}
                      leftIcon={<ShieldCheck className="w-3.5 h-3.5" />}
                    >
                      {isAccepted ? 'Update Review' : 'Audit Review'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {reviewingDoc && (
        <ReviewDrtDocumentModal
          isOpen={Boolean(reviewingDoc)}
          onClose={() => setReviewingDoc(null)}
          ticket={ticket as any}
          document={reviewingDoc as any}
        />
      )}
    </div>
  );
};
