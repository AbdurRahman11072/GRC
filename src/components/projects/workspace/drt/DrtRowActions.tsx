'use client';

import React from 'react';
import Link from 'next/link';
import { Eye, Users, Tags } from 'lucide-react';
import type { IDRTTicket } from '../../../../types/project.types';

export interface DrtRowActionsProps {
  projectId: string;
  ticket: IDRTTicket;
  onManageSquad?: (ticket: IDRTTicket) => void;
  onManageTors?: (ticket: IDRTTicket) => void;
}

export const DrtRowActions: React.FC<DrtRowActionsProps> = ({
  projectId,
  ticket,
  onManageSquad,
  onManageTors,
}) => {
  return (
    <div className="flex items-center justify-center gap-1.5">
      <Link
        href={`/projects/${projectId}/drt/${ticket.id}`}
        title="View Ticket Details & Matrix"
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors"
      >
        <Eye className="w-3.5 h-3.5" />
        <span>Details</span>
      </Link>
      {onManageSquad && (
        <button
          type="button"
          title="Manage 4-Party Squad"
          onClick={() => onManageSquad(ticket)}
          className="p-1.5 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 transition-colors"
        >
          <Users className="w-3.5 h-3.5" />
        </button>
      )}
      {onManageTors && (
        <button
          type="button"
          title="Manage Linked ToR Activities"
          onClick={() => onManageTors(ticket)}
          className="p-1.5 rounded-md text-slate-500 hover:text-indigo-800 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 transition-colors"
        >
          <Tags className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
