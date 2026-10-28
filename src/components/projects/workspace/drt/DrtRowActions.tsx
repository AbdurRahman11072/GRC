'use client';

import React from 'react';
import { Upload, Users, CheckCircle2, Tags } from 'lucide-react';
import type { IDRTTicket, IDRTDocument, DRTPartySide } from '../../../../types/project.types';

export interface DrtRowActionsProps {
  ticket: IDRTTicket;
  latestDoc?: IDRTDocument;
  canUpload: boolean;
  canReview: boolean;
  onUpload: (ticket: IDRTTicket, side: DRTPartySide) => void;
  onReview: (ticket: IDRTTicket, doc?: IDRTDocument) => void;
  onManageSquad: (ticket: IDRTTicket) => void;
  onManageTors?: (ticket: IDRTTicket) => void;
}

export const DrtRowActions: React.FC<DrtRowActionsProps> = ({
  ticket,
  latestDoc,
  canUpload,
  canReview,
  onUpload,
  onReview,
  onManageSquad,
  onManageTors,
}) => {
  return (
    <div className="flex items-center justify-center gap-1">
      <button
        type="button"
        title="Manage 4-Party Squad"
        onClick={() => onManageSquad(ticket)}
        className="p-1.5 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 transition-colors"
      >
        <Users className="w-3.5 h-3.5" />
      </button>
      {onManageTors && (
        <button
          type="button"
          title="Manage Linked ToR Activities"
          onClick={() => onManageTors(ticket)}
          className="p-1.5 rounded-md text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 border border-indigo-200 transition-colors"
        >
          <Tags className="w-3.5 h-3.5" />
        </button>
      )}
      {canUpload && (
        <button
          type="button"
          title="Upload Evidence Document"
          onClick={() => onUpload(ticket, 'AUDITEE')}
          className="p-1.5 rounded-md text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 border border-indigo-200 transition-colors"
        >
          <Upload className="w-3.5 h-3.5" />
        </button>
      )}
      {latestDoc && canReview && (
        <button
          type="button"
          title="Review Evidence"
          onClick={() => onReview(ticket, latestDoc)}
          className="p-1.5 rounded-md text-cyan-700 hover:text-cyan-900 hover:bg-cyan-50 border border-cyan-200 transition-colors"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
