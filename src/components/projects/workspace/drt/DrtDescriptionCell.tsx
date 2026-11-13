'use client';

import React from 'react';
import Link from 'next/link';
import type { IDRTTicket, IDRTDocument } from '../../../../types/project.types';

interface DrtDescriptionCellProps {
  ticket: IDRTTicket;
  docs?: IDRTDocument[];
  projectId?: string;
}

export const DrtDescriptionCell: React.FC<DrtDescriptionCellProps> = ({ ticket, docs, projectId }) => {
  return (
    <>
      {ticket.title && (
        projectId ? (
          <Link
            href={`/projects/${projectId}/drt/${ticket.id}`}
            className="text-xs font-semibold text-slate-900 hover:text-indigo-600 hover:underline block leading-snug line-clamp-2 cursor-pointer mb-1"
            title={ticket.title}
          >
            {ticket.title}
          </Link>
        ) : (
          <div className="text-xs font-semibold text-slate-900 block leading-snug line-clamp-2 mb-1">
            {ticket.title}
          </div>
        )
      )}

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
    </>
  );
};
