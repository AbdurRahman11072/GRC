'use client';

import React from 'react';

export const TorTableHeader: React.FC = () => {
  return (
    <thead>
      {/* Tier 1: Grouped Phase & Entity Headers */}
      <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-700 uppercase tracking-wider select-none">
        {/* Sticky Left: ToR ID */}
        <th
          rowSpan={2}
          className="sticky left-0 z-20 bg-slate-50 py-2.5 px-3 w-28 min-w-[110px] whitespace-nowrap border-r border-slate-200 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.05)]"
        >
          ToR ID
        </th>

        {/* Sticky Left: ToR Scope */}
        <th
          rowSpan={2}
          className="sticky left-[110px] z-20 bg-slate-50 py-2.5 px-3 min-w-[240px] max-w-[300px] border-r border-slate-200 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.05)]"
        >
          ToR Scope
        </th>

        {/* Assigned To */}
        <th rowSpan={2} className="py-2.5 px-3 min-w-[140px] whitespace-nowrap border-r border-slate-200">
          Assigned To
        </th>

        {/* DRT BTRC (Client) */}
        <th
          colSpan={2}
          className="py-2 px-3 text-center border-r border-violet-200 bg-violet-50/90 text-violet-900 border-b"
        >
          DRT BTRC (Client)
        </th>

        {/* DRT FHL (Auditee) */}
        <th
          colSpan={2}
          className="py-2 px-3 text-center border-r border-blue-200 bg-blue-50/90 text-blue-900 border-b"
        >
          DRT FHL (Auditee)
        </th>

        {/* Actions */}
        <th
          rowSpan={2}
          className="py-2.5 px-3 text-right w-48 min-w-[200px] whitespace-nowrap border-l border-slate-200"
        >
          Actions
        </th>
      </tr>

      {/* Tier 2: Sub-Column Headers */}
      <tr className="border-b border-slate-200 bg-slate-100/80 text-[10px] font-semibold text-slate-600 uppercase tracking-wide">
        {/* DRT BTRC Sub-columns */}
        <th className="py-1.5 px-2.5 text-center min-w-[120px] bg-violet-50/50 text-violet-800 border-r border-slate-200">
          Collection
        </th>
        <th className="py-1.5 px-2.5 text-center min-w-[130px] bg-violet-50/50 text-violet-800 border-r border-violet-200">
          Audite Examination
        </th>

        {/* DRT FHL Sub-columns */}
        <th className="py-1.5 px-2.5 text-center min-w-[120px] bg-blue-50/50 text-blue-800 border-r border-slate-200">
          Collection
        </th>
        <th className="py-1.5 px-2.5 text-center min-w-[130px] bg-blue-50/50 text-blue-800 border-r border-blue-200">
          Audite Examination
        </th>
      </tr>
    </thead>
  );
};
