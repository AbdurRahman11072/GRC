'use client';

import React from 'react';
import { Layers } from 'lucide-react';
import { DrtTableRow } from './DrtTableRow';
import type { IDRTTicket } from '../../../../types/project.types';

export interface DrtTableProps {
  projectId: string;
  tickets: IDRTTicket[];
  onManageSquad?: (ticket: IDRTTicket) => void;
  onManageTors?: (ticket: IDRTTicket) => void;
}

export const DrtTable: React.FC<DrtTableProps> = ({
  projectId,
  tickets,
  onManageSquad,
  onManageTors,
}) => {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-300 bg-white shadow-2xs">
      <table className="w-full text-left border-collapse min-w-[900px]">
        <thead>
          <tr className="border-b border-slate-300 bg-slate-100/90 text-[11px] font-bold text-slate-700 uppercase tracking-wider select-none">
            {/* SL */}
            <th className="py-2.5 px-2 text-center border-r border-slate-300 w-12">
              SL
            </th>

            {/* ID */}
            <th className="py-2.5 px-2.5 text-center border-r border-slate-300 w-20">
              ID
            </th>

            {/* Request Description */}
            <th className="py-2.5 px-3 border-r border-slate-300 min-w-[280px]">
              Request Description
            </th>

            {/* ToR Wise Activities */}
            <th className="py-2.5 px-2 text-center border-r border-slate-300 w-28 bg-emerald-50/60 text-emerald-900">
              ToR Clause
            </th>

            {/* Department */}
            <th className="py-2.5 px-3 text-center border-r border-slate-300 w-40 bg-slate-50 text-slate-800">
              Department
            </th>

            {/* Assigned To */}
            <th className="py-2.5 px-3 text-center border-r border-slate-300 w-44 bg-indigo-50/40 text-indigo-900">
              Assigned To
            </th>

            {/* Actions */}
            <th className="py-2.5 px-3 text-center w-44">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {tickets.length > 0 ? (
            tickets.map((ticket, idx) => (
              <DrtTableRow
                key={ticket.id}
                projectId={projectId}
                ticket={ticket}
                index={idx}
                onManageSquad={onManageSquad}
                onManageTors={onManageTors}
              />
            ))
          ) : (
            <tr>
              <td
                colSpan={7}
                className="py-12 text-center text-xs text-slate-500"
              >
                <div className="flex flex-col items-center gap-2">
                  <Layers className="w-6 h-6 text-slate-400" />
                  <span>No DRT request tickets found matching your filter criteria.</span>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

