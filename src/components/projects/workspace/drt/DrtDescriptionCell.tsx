'use client';

import React from 'react';
import type { IDRTTicket, IDRTDocument } from '../../../../types/project.types';

interface DrtDescriptionCellProps {
  ticket: IDRTTicket;
  docs: IDRTDocument[];
}

export const DrtDescriptionCell: React.FC<DrtDescriptionCellProps> = ({ ticket, docs }) => {
  return (
    <>
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
    </>
  );
};
