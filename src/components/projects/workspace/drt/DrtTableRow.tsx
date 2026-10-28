'use client';

import type { IDRTTicket, IDRTDocument, DRTPartySide } from '../../../../types/project.types';
import { gDriveColorMap, auditeeStatusColorMap, statusBadgeStyles, periodCellStyles } from './drtBadges';
import { DrtRowActions } from './DrtRowActions';
import { DrtDescriptionCell } from './DrtDescriptionCell';

const formatDate = (val?: string | null) => (val ? new Date(val).toISOString().split('T')[0] : '—');

export interface DrtTableRowProps {
  ticket: IDRTTicket;
  index: number;
  years: string[];
  canUpload: boolean;
  canReview: boolean;
  clientName?: string;
  auditeeName?: string;
  onUpload: (ticket: IDRTTicket, side: DRTPartySide) => void;
  onReview: (ticket: IDRTTicket, doc?: IDRTDocument) => void;
  onManageSquad: (ticket: IDRTTicket) => void;
  onEditPeriodStatus?: (ticket: IDRTTicket, year: string) => void;
  onManageTors?: (ticket: IDRTTicket) => void;
}

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

  const auditorStatus = ticket.reviewOutcome || (ticket.workflowStatus === 'ACCEPTED' ? 'DONE' : 'PENDING');
  const completeness = ticket.workflowStatus === 'ACCEPTED' ? 'Complete' : ticket.workflowStatus === 'SUBMITTED' ? 'Pending Review' : 'Incomplete';

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
      <td className="py-2.5 px-3 min-w-[260px] max-w-sm border-r border-slate-200 align-top space-y-1">
        <DrtDescriptionCell ticket={ticket} docs={docs} />
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

      {/* Date of Request */}
      <td className="py-2.5 px-2 text-center font-mono text-[11px] border-r border-slate-200 align-top text-slate-700 whitespace-nowrap">
        {formatDate(ticket.dateOfRequest)}
      </td>

      {/* Expected Date of Receipt */}
      <td className="py-2.5 px-2 text-center font-mono text-[11px] border-r border-slate-200 align-top text-slate-700 whitespace-nowrap">
        {formatDate(ticket.expectedDateOfReceipt)}
      </td>

      {/* Actual Date of Receipt */}
      <td className="py-2.5 px-2 text-center font-mono text-[11px] border-r border-slate-200 align-top text-slate-700 whitespace-nowrap">
        {formatDate(ticket.actualDateOfReceipt)}
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

      {/* Excess Time (Days) */}
      <td className="py-2.5 px-2 text-center font-mono font-bold text-[11px] border-r border-slate-200 align-top text-rose-700">
        {ticket.excessDays !== undefined && ticket.excessDays > 0 ? `+${ticket.excessDays}` : ticket.excessDays ?? 0}
      </td>

      {/* Google Drive Status as per Client */}
      <td className="py-2.5 px-2 text-center border-r border-slate-200 align-top">
        <span
          className={`inline-block px-1.5 py-0.5 rounded text-[10px] border font-bold ${
            gDriveColorMap[ticket.clientGoogleDriveStatus || 'NA'] || gDriveColorMap.NA
          }`}
        >
          {ticket.clientGoogleDriveStatus || 'NA'}
        </span>
      </td>

      {/* Status as per Client */}
      <td className="py-2.5 px-2 text-center border-r border-slate-200 align-top">
        <span
          className={`inline-block px-1.5 py-0.5 rounded text-[10px] border font-bold ${
            auditeeStatusColorMap[ticket.clientStatus || 'COLLECTING_DATA'] || auditeeStatusColorMap.COLLECTING_DATA
          }`}
        >
          {ticket.clientStatus === 'COLLECTING_DATA'
            ? 'Collecting'
            : ticket.clientStatus
            ? ticket.clientStatus.replace('_', ' ')
            : '—'}
        </span>
      </td>

      {/* Google Drive Status as per Auditee */}
      <td className="py-2.5 px-2 text-center border-r border-slate-200 align-top">
        <span
          className={`inline-block px-1.5 py-0.5 rounded text-[10px] border font-bold ${
            gDriveColorMap[ticket.googleDriveStatus || 'NA'] || gDriveColorMap.NA
          }`}
        >
          {ticket.googleDriveStatus || 'NA'}
        </span>
      </td>

      {/* Status as per Fiber@Home FY */}
      <td className="py-2.5 px-2 text-center border-r border-slate-200 align-top">
        <span
          className={`inline-block px-1.5 py-0.5 rounded text-[10px] border font-bold ${
            auditeeStatusColorMap[ticket.auditeeStatus || 'COLLECTING_DATA'] || auditeeStatusColorMap.COLLECTING_DATA
          }`}
        >
          {ticket.auditeeStatus === 'COLLECTING_DATA'
            ? 'Collecting'
            : ticket.auditeeStatus
            ? ticket.auditeeStatus.replace('_', ' ')
            : '—'}
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
        <DrtRowActions
          ticket={ticket}
          latestDoc={latestDoc}
          canUpload={canUpload}
          canReview={canReview}
          onUpload={onUpload}
          onReview={onReview}
          onManageSquad={onManageSquad}
          onManageTors={onManageTors}
        />
      </td>
    </tr>
  );
};
