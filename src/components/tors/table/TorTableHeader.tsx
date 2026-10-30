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

        {/* 1st Progress Report */}
        <th
          colSpan={2}
          className="py-2 px-3 text-center border-r border-emerald-200 bg-emerald-50/90 text-emerald-900 border-b"
        >
          1st Progress
        </th>

        {/* 2nd Progress Report */}
        <th
          colSpan={2}
          className="py-2 px-3 text-center border-r border-sky-200 bg-sky-50/90 text-sky-900 border-b"
        >
          2nd Progress
        </th>

        {/* 3rd Progress Report */}
        <th
          colSpan={2}
          className="py-2 px-3 text-center border-r border-indigo-200 bg-indigo-50/90 text-indigo-900 border-b"
        >
          3rd Progress
        </th>

        {/* Draft Report */}
        <th
          colSpan={2}
          className="py-2 px-3 text-center border-r border-amber-200 bg-amber-50/90 text-amber-900 border-b"
        >
          Draft Report
        </th>

        {/* Final Report */}
        <th
          colSpan={2}
          className="py-2 px-3 text-center border-r border-purple-200 bg-purple-50/90 text-purple-900 border-b"
        >
          Final Report
        </th>

        {/* Sticky Right: Actions */}
        <th
          rowSpan={2}
          className="sticky right-0 z-20 bg-slate-50 py-2.5 px-3 text-right w-48 min-w-[200px] whitespace-nowrap shadow-[-2px_0_4px_-2px_rgba(0,0,0,0.05)] border-l border-slate-200"
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

        {/* 1st Progress Sub-columns */}
        <th className="py-1.5 px-2.5 text-center min-w-[110px] bg-emerald-50/50 text-emerald-800 border-r border-slate-200">
          Progress
        </th>
        <th className="py-1.5 px-2.5 text-left min-w-[160px] max-w-[200px] bg-emerald-50/50 text-emerald-800 border-r border-emerald-200">
          Auditor Remark
        </th>

        {/* 2nd Progress Sub-columns */}
        <th className="py-1.5 px-2.5 text-center min-w-[110px] bg-sky-50/50 text-sky-800 border-r border-slate-200">
          Progress
        </th>
        <th className="py-1.5 px-2.5 text-left min-w-[160px] max-w-[200px] bg-sky-50/50 text-sky-800 border-r border-sky-200">
          Auditor Remark
        </th>

        {/* 3rd Progress Sub-columns */}
        <th className="py-1.5 px-2.5 text-center min-w-[110px] bg-indigo-50/50 text-indigo-800 border-r border-slate-200">
          Progress
        </th>
        <th className="py-1.5 px-2.5 text-left min-w-[160px] max-w-[200px] bg-indigo-50/50 text-indigo-800 border-r border-indigo-200">
          Auditor Remark
        </th>

        {/* Draft Report Sub-columns */}
        <th className="py-1.5 px-2.5 text-left min-w-[160px] max-w-[200px] bg-amber-50/50 text-amber-800 border-r border-slate-200">
          Draft Remark
        </th>
        <th className="py-1.5 px-2.5 text-left min-w-[160px] max-w-[200px] bg-amber-50/50 text-amber-800 border-r border-amber-200">
          Auditor Remark
        </th>

        {/* Final Report Sub-columns */}
        <th className="py-1.5 px-2.5 text-left min-w-[160px] max-w-[200px] bg-purple-50/50 text-purple-800 border-r border-slate-200">
          Final Remark
        </th>
        <th className="py-1.5 px-2.5 text-left min-w-[160px] max-w-[200px] bg-purple-50/50 text-purple-800 border-r border-purple-200">
          Auditor Remark
        </th>
      </tr>
    </thead>
  );
};
