'use client';

import React from 'react';
import { Upload, Users, Clock, CheckCircle2, RotateCcw, Tags } from 'lucide-react';
import type { IDRTTicket, IDRTDocument, DRTPartySide } from '../../../../types/project.types';

export interface DrtTableRowProps {
  ticket: IDRTTicket;
  index: number;
  years: string[];
  canUpload: boolean;
  canReview: boolean;
  onUpload: (ticket: IDRTTicket, side: DRTPartySide) => void;
  onReview: (ticket: IDRTTicket, doc?: IDRTDocument) => void;
  onManageSquad: (ticket: IDRTTicket) => void;
  onEditPeriodStatus?: (ticket: IDRTTicket, year: string) => void;
  onManageTors?: (ticket: IDRTTicket) => void;
}

const statusBadgeStyles: Record<string, string> = {
  DONE: 'bg-emerald-100 text-emerald-800 border-emerald-300', ACCEPTED: 'bg-emerald-100 text-emerald-800 border-emerald-300', COMPLETED: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  PARTIAL: 'bg-amber-100 text-amber-900 border-amber-300', PENDING: 'bg-rose-100 text-rose-800 border-rose-300', OPEN: 'bg-rose-100 text-rose-800 border-rose-300',
  REVISION_REQUESTED: 'bg-rose-100 text-rose-800 border-rose-300', SUBMITTED: 'bg-sky-100 text-sky-800 border-sky-300',
  NOT_AVAILABLE: 'bg-slate-100 text-slate-600 border-slate-300', NOT_APPLICABLE: 'bg-slate-100 text-slate-500 border-slate-200',
};

const periodCellStyles: Record<string, string> = {
  COMPLETED: 'bg-emerald-50 text-emerald-800 font-semibold', SHARED: 'bg-emerald-50 text-emerald-800 font-semibold',
  PARTIAL: 'bg-amber-50 text-amber-900 font-semibold', IN_PROGRESS: 'bg-amber-50/60 text-amber-800',
  NOT_APPLICABLE: 'bg-slate-50 text-slate-400', NOT_SHARED: 'bg-rose-50 text-rose-800',
};

export const DrtTableRow: React.FC<DrtTableRowProps> = ({
  ticket,
  index,
  years,
  canUpload,
  canReview,
  onUpload,
  onReview,
  onManageSquad,
  onEditPeriodStatus,
  onManageTors,
}) => {
  const docs = ticket.drtDocuments || [];
  const latestDoc = docs.slice(-1)[0];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const torCodes = ticket.tors?.map((t: any) => t.code || t.tor?.code).filter(Boolean) || [];
  if (ticket.tor?.code && !torCodes.includes(ticket.tor.code)) {
    torCodes.unshift(ticket.tor.code);
  }
  const torLabel = torCodes.length > 0 ? torCodes.join(', ') : '—';

  // Overall auditor review status
  const auditorStatus = ticket.reviewOutcome || (ticket.workflowStatus === 'ACCEPTED' ? 'DONE' : 'PENDING');

  // Format completeness
  const completeness =
    ticket.workflowStatus === 'ACCEPTED'
      ? 'Complete'
      : ticket.workflowStatus === 'SUBMITTED'
      ? 'Pending Review'
      : 'Incomplete';

  return (
    <tr className="border-b border-slate-200 hover:bg-slate-50/70 transition-colors text-xs">
      {/* SL */}
      <td className="py-2.5 px-2 text-center font-mono text-slate-500 border-r border-slate-200 align-top w-12">
        {index + 1}
      </td>

      {/* ID */}
      <td className="py-2.5 px-2.5 text-center font-mono font-bold text-xs text-indigo-700 bg-indigo-50/30 border-r border-slate-200 align-top w-20">
        {ticket.requestCode}
      </td>

      {/* Request Description */}
      <td className="py-2.5 px-3 min-w-[280px] max-w-sm border-r border-slate-200 align-top space-y-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-semibold text-slate-900 text-xs">
            {ticket.title || ticket.requestCode}
          </span>
          {ticket.department && (
            <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 border border-purple-200">
              {ticket.department}
            </span>
          )}
        </div>

        {ticket.description && (
          <div
            className="text-[11px] text-slate-600 leading-relaxed max-h-24 overflow-y-auto pr-1"
            dangerouslySetInnerHTML={{ __html: ticket.description }}
          />
        )}

        {ticket.currentRequirement && (
          <div className="text-[11px] text-cyan-800 bg-cyan-50/80 border border-cyan-200/80 rounded px-2 py-0.5 mt-1">
            <strong className="text-[10px] uppercase font-bold text-cyan-900 mr-1">Req:</strong>
            {ticket.currentRequirement}
          </div>
        )}

        {docs.length > 0 && (
          <div className="flex items-center gap-1 flex-wrap pt-0.5">
            {docs.map((d) => (
              <span
                key={d.id}
                title={`${d.fileName} (${d.partySide})${d.periodLabel ? ` • Year ${d.periodLabel}` : ''}`}
                className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200"
              >
                {d.periodLabel && (
                  <strong className="font-mono text-indigo-600 font-bold">[{d.periodLabel}]</strong>
                )}
                <span className="truncate max-w-[130px]">{d.fileName}</span>
              </span>
            ))}
          </div>
        )}
      </td>

      {/* ToR Wise Activities */}
      <td
        className={`py-2.5 px-2 text-center font-mono text-xs border-r border-slate-200 bg-slate-50/40 align-top w-28 ${
          onManageTors ? 'cursor-pointer hover:bg-indigo-50/60 transition-colors group' : ''
        }`}
        onClick={() => onManageTors?.(ticket)}
        title={onManageTors ? 'Click to manage linked ToR activities' : undefined}
      >
        <div className="flex flex-wrap items-center justify-center gap-1">
          {torCodes.length > 0 ? (
            torCodes.map((code) => (
              <span
                key={code}
                className="font-semibold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200/80 text-[11px]"
              >
                {code}
              </span>
            ))
          ) : (
            <span className="text-slate-400 font-sans text-[11px] group-hover:text-indigo-600">
              {onManageTors ? '+ Link ToR' : '—'}
            </span>
          )}
        </div>
      </td>

      {/* Status as per Auditor */}
      <td className="py-2.5 px-2 text-center border-r border-slate-200 align-top w-28">
        <span
          className={`inline-block px-2 py-0.5 rounded text-[11px] border font-bold capitalize ${
            statusBadgeStyles[auditorStatus] || statusBadgeStyles.PENDING
          }`}
        >
          {auditorStatus.toLowerCase().replace('_', ' ')}
        </span>
      </td>

      {/* Multi-Year Timeline Grid Cells */}
      {years.map((yr) => {
        const ps = ticket.periodStatuses?.find((p) => p.periodLabel === yr);
        const status = ps?.evidenceStatus;
        return (
          <td
            key={yr}
            onClick={() => onEditPeriodStatus && onEditPeriodStatus(ticket, yr)}
            title={
              ps?.remark
                ? `${yr}: ${status || 'Pending'} — ${ps.remark}. Click to edit.`
                : `${yr}: ${status || 'Pending'}. Click to update status.`
            }
            className={`py-2 px-1.5 text-center text-[10px] border-r border-slate-200 align-top w-16 whitespace-nowrap cursor-pointer hover:bg-indigo-50/80 hover:ring-1 hover:ring-indigo-300 transition-colors ${
              status ? periodCellStyles[status] || 'text-slate-600' : 'text-slate-300'
            }`}
          >
            {status ? status.replace('_', ' ').toLowerCase() : '—'}
          </td>
        );
      })}

      {/* Completeness */}
      <td className="py-2.5 px-2 text-center border-r border-slate-200 align-top w-24">
        <span
          className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
            completeness === 'Complete'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : completeness === 'Pending Review'
              ? 'bg-sky-50 text-sky-700 border border-sky-200'
              : 'bg-slate-100 text-slate-600 border border-slate-200'
          }`}
        >
          {completeness}
        </span>
      </td>

      {/* Remarks */}
      <td className="py-2.5 px-3 min-w-[220px] max-w-xs text-[11px] text-slate-600 border-r border-slate-200 align-top leading-relaxed">
        {ticket.remarks || <span className="text-slate-300">—</span>}
      </td>

      {/* Actions */}
      <td className="py-2.5 px-2 text-center whitespace-nowrap align-top w-28">
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
      </td>
    </tr>
  );
};
