'use client';

import React from 'react';
import { FileText, CheckCircle2, RotateCcw, Clock, Download, ExternalLink } from 'lucide-react';
import { Badge } from '../../../ui/Badge';
import { Button } from '../../../ui/Button';
import { useUpdateDocumentStatusMutation } from '../../../../store/api/torApi';
import type { ITorDocument } from '../../../../types/tor.types';

export interface DrtDocumentListProps {
  torId: string;
  documents?: ITorDocument[];
  canReview?: boolean;
}

export const DrtDocumentList: React.FC<DrtDocumentListProps> = ({
  torId,
  documents = [],
  canReview = false,
}) => {
  const [updateStatus, { isLoading }] = useUpdateDocumentStatusMutation();

  const handleStatusChange = async (docId: string, status: string) => {
    try {
      await updateStatus({ torId, docId, status }).unwrap();
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  if (!documents || documents.length === 0) {
    return (
      <div className="py-4 text-center text-xs text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-300">
        No compliance documents submitted for this ToR yet.
      </div>
    );
  }

  return (
    <div className="space-y-2 pt-2">
      <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
        Submitted Compliance Documents ({documents.length})
      </div>

      <div className="space-y-2">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="p-3 rounded-lg bg-slate-50/80 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
          >
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                <span className="font-semibold text-slate-900 truncate">
                  {doc.fileName}
                </span>
                <Badge
                  variant={
                    doc.status === 'ACCEPTED'
                      ? 'success'
                      : doc.status === 'REVISION_REQUESTED'
                      ? 'danger'
                      : 'indigo'
                  }
                  size="xs"
                >
                  {doc.status}
                </Badge>
                {doc.fileType && (
                  <span className="text-[10px] text-slate-500 font-mono">
                    {doc.fileType}
                  </span>
                )}
              </div>

              {doc.notes && (
                <p className="text-[11px] text-slate-600 pl-6 leading-relaxed">
                  {doc.notes}
                </p>
              )}

              <div className="flex items-center gap-2 pl-6 text-[10px] text-slate-500">
                <span>Uploaded by: <strong className="text-slate-700">{doc.uploadedBy?.name || 'Team Member'}</strong></span>
                <span>•</span>
                <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Document Action & Auditor Review Controls */}
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              {doc.fileUrl && (
                <a
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors shadow-2xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}

              {canReview && (
                <div className="flex items-center gap-1.5">
                  <Button
                    type="button"
                    variant={doc.status === 'ACCEPTED' ? 'outline' : 'ghost'}
                    size="xs"
                    onClick={() => handleStatusChange(doc.id, 'ACCEPTED')}
                    disabled={isLoading}
                    className="text-emerald-700 hover:bg-emerald-50"
                    leftIcon={<CheckCircle2 className="w-3 h-3" />}
                  >
                    Accept
                  </Button>
                  <Button
                    type="button"
                    variant={doc.status === 'REVISION_REQUESTED' ? 'outline' : 'ghost'}
                    size="xs"
                    onClick={() => handleStatusChange(doc.id, 'REVISION_REQUESTED')}
                    disabled={isLoading}
                    className="text-rose-700 hover:bg-rose-50"
                    leftIcon={<RotateCcw className="w-3 h-3" />}
                  >
                    Revise
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
