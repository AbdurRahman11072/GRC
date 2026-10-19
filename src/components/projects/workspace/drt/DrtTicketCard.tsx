'use client';

import React from 'react';
import {
  Upload,
  Users,
  ShieldCheck,
  Building2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { Badge } from '../../../ui/Badge';
import { Button } from '../../../ui/Button';
import type { IDRTTicket, IDRTDocument, DRTPartySide } from '../../../../types/project.types';

export interface DrtTicketCardProps {
  ticket: IDRTTicket;
  onUpload: (ticket: IDRTTicket, side: DRTPartySide) => void;
  onReview: (doc: IDRTDocument) => void;
  onManageSquad: (ticket: IDRTTicket) => void;
  canUpload: boolean;
  canReview: boolean;
}

export const DrtTicketCard: React.FC<DrtTicketCardProps> = ({
  ticket,
  onUpload,
  onReview,
  onManageSquad,
  canUpload,
  canReview,
}) => {
  const docs = ticket.drtDocuments || [];
  const clientDoc = docs.filter((d) => d.partySide === 'CLIENT').slice(-1)[0];
  const auditeeDoc = docs.filter((d) => d.partySide === 'AUDITEE').slice(-1)[0];

  const isOverdue =
    ticket.expectedDateOfReceipt &&
    new Date(ticket.expectedDateOfReceipt) < new Date() &&
    ticket.workflowStatus !== 'ACCEPTED';

  const renderBadge = (doc?: IDRTDocument) => {
    if (!doc) {
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-500">
          <Clock className="w-3 h-3" /> Awaiting
        </span>
      );
    }
    if (doc.status === 'ACCEPTED') {
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Accepted
        </span>
      );
    }
    if (doc.status === 'REVISION_REQUESTED') {
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700">
          <RotateCcw className="w-3 h-3 text-rose-500" /> Revision
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700">
        <Clock className="w-3 h-3 text-blue-500" /> Review
      </span>
    );
  };

  return (
    <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
              {ticket.requestCode}
            </span>
            {ticket.department && (
              <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                {ticket.department}
              </span>
            )}
            {ticket.tor && (
              <span className="text-[11px] text-slate-500">
                ToR: <strong className="text-slate-700">[{ticket.tor.code}] {ticket.tor.title}</strong>
              </span>
            )}
          </div>
          <h3 className="text-sm font-semibold text-slate-900 mt-1">
            {ticket.title || ticket.description}
          </h3>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isOverdue && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-600">
              <AlertTriangle className="w-3 h-3" /> Overdue
            </span>
          )}
          <Badge
            variant={
              ticket.workflowStatus === 'ACCEPTED'
                ? 'success'
                : ticket.workflowStatus === 'SUBMITTED'
                ? 'info'
                : ticket.workflowStatus === 'REVISION_REQUESTED'
                ? 'danger'
                : 'neutral'
            }
          >
            {ticket.workflowStatus}
          </Badge>
        </div>
      </div>

      {/* 4-Party Squad Chips */}
      <div className="p-2 rounded-lg bg-slate-50 border border-slate-150 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
        <div>
          <span className="text-slate-400 block text-[9px] uppercase font-semibold">Supervisor</span>
          <strong className="text-slate-700 truncate block">{ticket.supervisor?.name || 'Unassigned'}</strong>
        </div>
        <div>
          <span className="text-slate-400 block text-[9px] uppercase font-semibold">Field Team</span>
          <strong className="text-slate-700 truncate block">{ticket.fieldMember?.name || 'Unassigned'}</strong>
        </div>
        <div>
          <span className="text-slate-400 block text-[9px] uppercase font-semibold">Client (Regulator)</span>
          <strong className="text-slate-700 truncate block">{ticket.clientContact?.name || 'Unassigned'}</strong>
        </div>
        <div>
          <span className="text-slate-400 block text-[9px] uppercase font-semibold">Auditee (Dept)</span>
          <strong className="text-slate-700 truncate block">{ticket.auditeeContact?.name || 'Unassigned'}</strong>
        </div>
      </div>

      {/* Dual Evidence Submissions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
        {/* Client Side */}
        <div className="p-2 rounded-lg border border-slate-200 bg-white flex items-center justify-between">
          <div className="flex items-center gap-1.5 min-w-0">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span className="font-medium text-slate-800 text-[11px] truncate">
              Client: {clientDoc ? clientDoc.fileName : 'Awaiting'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {renderBadge(clientDoc)}
            {clientDoc && canReview && (
              <button
                type="button"
                onClick={() => onReview(clientDoc)}
                className="text-[11px] text-indigo-600 font-semibold hover:underline cursor-pointer"
              >
                Review
              </button>
            )}
            {!clientDoc && canUpload && (
              <button
                type="button"
                onClick={() => onUpload(ticket, 'CLIENT')}
                className="text-[11px] text-indigo-600 font-semibold hover:underline cursor-pointer"
              >
                + Upload
              </button>
            )}
          </div>
        </div>

        {/* Auditee Side */}
        <div className="p-2 rounded-lg border border-slate-200 bg-white flex items-center justify-between">
          <div className="flex items-center gap-1.5 min-w-0">
            <Building2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
            <span className="font-medium text-slate-800 text-[11px] truncate">
              Auditee: {auditeeDoc ? auditeeDoc.fileName : 'Awaiting'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {renderBadge(auditeeDoc)}
            {auditeeDoc && canReview && (
              <button
                type="button"
                onClick={() => onReview(auditeeDoc)}
                className="text-[11px] text-purple-600 font-semibold hover:underline cursor-pointer"
              >
                Review
              </button>
            )}
            {!auditeeDoc && canUpload && (
              <button
                type="button"
                onClick={() => onUpload(ticket, 'AUDITEE')}
                className="text-[11px] text-purple-600 font-semibold hover:underline cursor-pointer"
              >
                + Upload
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px] text-slate-500">
        <span>
          SLA: <strong className="text-slate-700">{ticket.expectedDateOfReceipt ? new Date(ticket.expectedDateOfReceipt).toLocaleDateString() : 'None'}</strong>
        </span>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={() => onManageSquad(ticket)} leftIcon={<Users className="w-3 h-3" />}>
            Squad
          </Button>
          {canUpload && (
            <Button size="sm" variant="outline" onClick={() => onUpload(ticket, 'AUDITEE')} leftIcon={<Upload className="w-3 h-3" />}>
              Upload Evidence
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
