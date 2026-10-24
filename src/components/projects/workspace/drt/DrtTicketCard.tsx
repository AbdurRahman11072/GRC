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
  Target,
  MessageSquare,
} from 'lucide-react';
import { Badge } from '../../../ui/Badge';
import { Button } from '../../../ui/Button';
import type { IDRTTicket, IDRTDocument, DRTPartySide } from '../../../../types/project.types';

export interface DrtTicketCardProps {
  ticket: IDRTTicket;
  onUpload: (ticket: IDRTTicket, side: DRTPartySide) => void;
  onReview: (ticket: IDRTTicket, doc?: IDRTDocument) => void;
  onManageSquad: (ticket: IDRTTicket) => void;
  canUpload: boolean;
  canReview: boolean;
}

const periodColorMap: Record<string, string> = {
  COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  SHARED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  PARTIAL: 'bg-sky-50 text-sky-700 border-sky-200',
  IN_PROGRESS: 'bg-amber-50 text-amber-700 border-amber-200',
  NOT_APPLICABLE: 'bg-slate-100 text-slate-500 border-slate-200',
  NOT_SHARED: 'bg-rose-50 text-rose-700 border-rose-200',
};

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
  const periodStatuses = ticket.periodStatuses || [];

  const isOverdue =
    ticket.expectedDateOfReceipt &&
    new Date(ticket.expectedDateOfReceipt) < new Date() &&
    ticket.workflowStatus !== 'ACCEPTED';

  const renderBadge = (doc?: IDRTDocument) => {
    if (!doc) return <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-500"><Clock className="w-3 h-3 text-slate-400" /> Awaiting</span>;
    if (doc.status === 'ACCEPTED') return <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"><CheckCircle2 className="w-3 h-3 text-emerald-600" /> Accepted</span>;
    if (doc.status === 'REVISION_REQUESTED') return <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200"><RotateCcw className="w-3 h-3 text-rose-600" /> Revision</span>;
    return <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200"><Clock className="w-3 h-3 text-cyan-600" /> Review</span>;
  };

  const renderSideBox = (side: DRTPartySide, doc?: IDRTDocument) => {
    const isClient = side === 'CLIENT';
    const Icon = isClient ? ShieldCheck : Building2;
    const color = isClient ? 'text-cyan-700' : 'text-purple-700';
    return (
      <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/70 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <Icon className={`w-4 h-4 ${color} shrink-0`} />
          <span className="font-medium text-slate-800 text-[11px] truncate">
            {isClient ? 'Client' : 'Auditee'}: <span className="text-slate-600">{doc ? `${doc.periodLabel ? `[${doc.periodLabel}] ` : ''}${doc.fileName}` : 'Awaiting'}</span>
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {renderBadge(doc)}
          {doc && canReview && (
            <button type="button" onClick={() => onReview(ticket, doc)} className={`text-[11px] ${color} font-semibold hover:underline`}>
              Review
            </button>
          )}
          {!doc && canUpload && (
            <button type="button" onClick={() => onUpload(ticket, side)} className={`text-[11px] ${color} font-semibold hover:underline`}>
              + Upload
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3.5 hover:shadow-xs transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200/80 shadow-2xs">
              {ticket.requestCode}
            </span>
            {ticket.department && (
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                {ticket.department}
              </span>
            )}
            {ticket.tor && (
              <span className="text-[11px] text-slate-500">
                ToR: <strong className="text-slate-800 font-semibold">[{ticket.tor.code}] {ticket.tor.title}</strong>
              </span>
            )}
          </div>
          <h3 className="text-sm font-semibold text-slate-900 mt-1.5 leading-snug">{ticket.title || ticket.description}</h3>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {isOverdue && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
              <AlertTriangle className="w-3 h-3 text-rose-600" /> Overdue
            </span>
          )}
          <Badge variant={ticket.workflowStatus === 'ACCEPTED' ? 'success' : ticket.workflowStatus === 'SUBMITTED' ? 'info' : ticket.workflowStatus === 'REVISION_REQUESTED' ? 'danger' : 'neutral'}>
            {ticket.workflowStatus}
          </Badge>
        </div>
      </div>

      {/* Current Requirement & Remarks */}
      {(ticket.currentRequirement || ticket.remarks) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {ticket.currentRequirement && (
            <div className="p-2.5 rounded-lg bg-cyan-50/60 border border-cyan-200/70 flex items-start gap-2">
              <Target className="w-3.5 h-3.5 text-cyan-700 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] font-bold text-cyan-800 uppercase tracking-wide block">Current Requirement</span>
                <p className="text-slate-700 text-[11px] line-clamp-2 leading-relaxed">{ticket.currentRequirement}</p>
              </div>
            </div>
          )}
          {ticket.remarks && (
            <div className="p-2.5 rounded-lg bg-amber-50/60 border border-amber-200/70 flex items-start gap-2">
              <MessageSquare className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wide block">Auditor Remarks</span>
                <p className="text-slate-700 text-[11px] line-clamp-2 leading-relaxed">{ticket.remarks}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Multi-Year Time Frame Grid Badges */}
      {periodStatuses.length > 0 && (
        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
            Audit Timeline ({periodStatuses.length} Years)
          </span>
          <div className="flex flex-wrap gap-1.5">
            {periodStatuses.map((ps) => (
              <span
                key={ps.id || ps.periodLabel}
                title={ps.remark ? `${ps.periodLabel}: ${ps.remark}` : `${ps.periodLabel}: ${ps.evidenceStatus}`}
                className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold border ${periodColorMap[ps.evidenceStatus] || periodColorMap.IN_PROGRESS}`}
              >
                {ps.periodLabel}: {ps.evidenceStatus.replace('_', ' ')}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 4-Party Squad Chips */}
      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
        <div>
          <span className="text-slate-500 block text-[9px] uppercase font-bold tracking-wider">Supervisor</span>
          <strong className="text-slate-800 truncate block font-medium">{ticket.supervisor?.name || 'Unassigned'}</strong>
        </div>
        <div>
          <span className="text-slate-500 block text-[9px] uppercase font-bold tracking-wider">Field Team</span>
          <strong className="text-slate-800 truncate block font-medium">{ticket.fieldMember?.name || 'Unassigned'}</strong>
        </div>
        <div>
          <span className="text-slate-500 block text-[9px] uppercase font-bold tracking-wider">Client (Regulator)</span>
          <strong className="text-slate-800 truncate block font-medium">{ticket.clientContact?.name || 'Unassigned'}</strong>
        </div>
        <div>
          <span className="text-slate-500 block text-[9px] uppercase font-bold tracking-wider">Auditee (Dept)</span>
          <strong className="text-slate-800 truncate block font-medium">{ticket.auditeeContact?.name || 'Unassigned'}</strong>
        </div>
      </div>

      {/* Dual Evidence Submissions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
        {renderSideBox('CLIENT', clientDoc)}
        {renderSideBox('AUDITEE', auditeeDoc)}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500">
        <span>SLA: <strong className="text-slate-700 font-semibold">{ticket.expectedDateOfReceipt ? new Date(ticket.expectedDateOfReceipt).toLocaleDateString() : 'None'}</strong></span>
        <div className="flex items-center gap-2">
          <Button size="xs" variant="ghost" onClick={() => onManageSquad(ticket)} leftIcon={<Users className="w-3 h-3" />}>Squad</Button>
          {canUpload && (
            <Button size="xs" variant="outline" onClick={() => onUpload(ticket, 'AUDITEE')} leftIcon={<Upload className="w-3 h-3" />}>Upload Evidence</Button>
          )}
        </div>
      </div>
    </div>
  );
};

