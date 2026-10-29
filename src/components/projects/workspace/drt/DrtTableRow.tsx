'use client';

import React from 'react';
import Link from 'next/link';
import type { IDRTTicket } from '../../../../types/project.types';
import { DrtRowActions } from './DrtRowActions';
import { DrtDescriptionCell } from './DrtDescriptionCell';

export interface DrtTableRowProps {
  projectId: string;
  ticket: IDRTTicket;
  index: number;
  onManageSquad?: (ticket: IDRTTicket) => void;
  onManageTors?: (ticket: IDRTTicket) => void;
}

export const DrtTableRow: React.FC<DrtTableRowProps> = ({
  projectId,
  ticket,
  index,
  onManageSquad,
  onManageTors,
}) => {
  const docs = ticket.drtDocuments || [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const torCodes = ticket.tors?.map((t: any) => t.code || t.tor?.code).filter(Boolean) || [];
  if (ticket.tor?.code && !torCodes.includes(ticket.tor.code)) {
    torCodes.unshift(ticket.tor.code);
  }

  const assignedMember = ticket.fieldMember || ticket.supervisor;

  return (
    <tr className="border-b border-slate-200 hover:bg-slate-50/70 transition-colors text-xs">
      {/* SL */}
      <td className="py-2.5 px-2 text-center font-mono text-slate-500 border-r border-slate-200 align-top w-12">
        {index + 1}
      </td>

      {/* ID */}
      <td className="py-2.5 px-2.5 text-center font-mono font-bold text-xs text-indigo-700 bg-indigo-50/30 border-r border-slate-200 align-middle w-20">
        <Link
          href={`/projects/${projectId}/drt/${ticket.id}`}
          className="hover:underline hover:text-indigo-900"
          title="Open Ticket Details & 2-Row Matrix"
        >
          {ticket.requestCode}
        </Link>
      </td>

      {/* Request Description */}
      <td className="py-2.5 px-3 min-w-[280px] max-w-sm border-r border-slate-200 align-middle space-y-1">
        <DrtDescriptionCell ticket={ticket} docs={docs} />
      </td>

      {/* ToR Wise Activities */}
      <td
        className={`py-2.5 px-2 text-center font-mono text-xs border-r border-slate-200 bg-slate-50/40 align-middle w-28 ${
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

      {/* Department */}
      <td className="py-2.5 px-3 text-center border-r border-slate-200 align-middle w-40">
        {ticket.department ? (
          <span
            className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200 truncate max-w-[150px]"
            title={ticket.department}
          >
            {ticket.department}
          </span>
        ) : (
          <span className="text-slate-400 font-mono text-[11px]">—</span>
        )}
      </td>

      {/* Assigned To */}
      <td className="py-2.5 px-3 text-center border-r border-slate-200 align-middle w-44">
        {assignedMember ? (
          <div
            className="flex items-center justify-center gap-1.5"
            title={`${assignedMember.name} (${assignedMember.designation || 'Squad Member'})`}
          >
            <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[10px] flex items-center justify-center shrink-0">
              {assignedMember.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="text-left overflow-hidden">
              <span className="text-xs font-medium text-slate-800 block truncate max-w-[120px]">
                {assignedMember.name}
              </span>
              {assignedMember.designation && (
                <span className="text-[10px] text-slate-400 block truncate max-w-[120px]">
                  {assignedMember.designation}
                </span>
              )}
            </div>
          </div>
        ) : (
          <span className="text-slate-400 italic text-[11px]">Unassigned</span>
        )}
      </td>

      {/* Actions */}
      <td className="py-2.5 px-3 text-center align-middle w-44">
        <DrtRowActions
          projectId={projectId}
          ticket={ticket}
          onManageSquad={onManageSquad}
          onManageTors={onManageTors}
        />
      </td>
    </tr>
  );
};

