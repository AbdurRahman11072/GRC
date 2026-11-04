'use client';

import React from 'react';
import { DEFAULT_AUDIT_YEARS } from './DrtTimeFrameGrid';

export interface DrtTableHeaderProps {
  auditYears?: string[];
}

export const DrtTableHeader: React.FC<DrtTableHeaderProps> = ({
  auditYears = DEFAULT_AUDIT_YEARS,
}) => {
  return (
    <thead>
      <tr className="border-b border-slate-300 bg-slate-100/90 text-[11px] font-bold text-slate-700 uppercase tracking-wider select-none">
        {/* 1. SL (Sticky Left) */}
        <th className="sticky left-0 z-20 bg-slate-100 py-2.5 px-2 text-center border-r border-slate-300 w-12 min-w-[48px] max-w-[48px] whitespace-nowrap">
          SL
        </th>

        {/* 2. ID (Sticky Left) */}
        <th className="sticky left-[48px] z-20 bg-slate-100 py-2.5 px-2.5 text-center border-r border-slate-300 w-24 min-w-[96px] max-w-[96px] whitespace-nowrap">
          ID
        </th>

        {/* 3. Request Description (Sticky Left) */}
        <th className="sticky left-[144px] z-20 bg-slate-100 py-2.5 px-3 border-r border-slate-300 min-w-[280px] max-w-sm whitespace-nowrap shadow-[2px_0_4px_-2px_rgba(0,0,0,0.06)]">
          Request Description
        </th>

        {/* 4. ToR ID */}
        <th className="py-2.5 px-2.5 text-center border-r border-slate-300 w-24 bg-emerald-50/60 text-emerald-900 whitespace-nowrap font-mono">
          ToR ID
        </th>

        {/* 5. DRT For */}
        <th className="py-2.5 px-3 text-center border-r border-slate-300 w-36 bg-blue-50/60 text-blue-900 whitespace-nowrap">
          DRT For
        </th>

        {/* 6. Department */}
        <th className="py-2.5 px-3 text-center border-r border-slate-300 w-36 bg-slate-50 text-slate-800 whitespace-nowrap">
          Department
        </th>

        {/* 7. Assigned To */}
        <th className="py-2.5 px-3 text-center border-r border-slate-300 w-40 bg-indigo-50/40 text-indigo-900 whitespace-nowrap">
          Assigned To
        </th>

        {/* 8. Date of Request */}
        <th className="py-2.5 px-3 border-r border-slate-300 whitespace-nowrap">
          Date of Request
        </th>

        {/* 9. Expected Date */}
        <th className="py-2.5 px-3 border-r border-slate-300 whitespace-nowrap">
          Expected Date
        </th>

        {/* 10. Actual Date */}
        <th className="py-2.5 px-3 border-r border-slate-300 whitespace-nowrap">
          Actual Date
        </th>

        {/* 11. Excess Days */}
        <th className="py-2.5 px-3 border-r border-slate-300 whitespace-nowrap text-center">
          Excess Days
        </th>

        {/* 12. Status (Auditor) */}
        <th className="py-2.5 px-3 border-r border-slate-300 whitespace-nowrap">
          Status (Auditor)
        </th>

        {/* 13. Unified Cloud Link */}
        <th className="py-2.5 px-3 border-r border-slate-300 whitespace-nowrap bg-sky-50/40 text-sky-900">
          Cloud Link
        </th>

        {/* 14. Unified Collection Status */}
        <th className="py-2.5 px-3 border-r border-slate-300 whitespace-nowrap bg-emerald-50/40 text-emerald-900">
          Collection Status
        </th>

        {/* 15. Individual Audit Year Columns */}
        {auditYears.map((year) => (
          <th
            key={year}
            className="py-2.5 px-2 text-center border-r border-slate-300 min-w-[55px] whitespace-nowrap bg-amber-50/40 text-amber-950 font-bold"
          >
            {year}
          </th>
        ))}

        {/* 16. Completeness */}
        <th className="py-2.5 px-3 border-r border-slate-300 whitespace-nowrap text-center">
          Completeness
        </th>

        {/* 17. 1st Progress Report (3 columns) */}
        <th className="py-2.5 px-3 border-r border-slate-300 min-w-[95px] bg-emerald-50/50 text-emerald-950 font-bold whitespace-nowrap text-center">
          1st Progress (%)
        </th>
        <th className="py-2.5 px-3 border-r border-slate-300 min-w-[150px] bg-emerald-50/30 text-emerald-900 whitespace-nowrap">
          1st Auditee Remark
        </th>
        <th className="py-2.5 px-3 border-r border-slate-300 min-w-[150px] bg-emerald-50/30 text-emerald-900 whitespace-nowrap">
          1st Auditor Remark
        </th>

        {/* 18. 2nd Progress Report (3 columns) */}
        <th className="py-2.5 px-3 border-r border-slate-300 min-w-[95px] bg-sky-50/50 text-sky-950 font-bold whitespace-nowrap text-center">
          2nd Progress
        </th>
        <th className="py-2.5 px-3 border-r border-slate-300 min-w-[150px] bg-sky-50/30 text-sky-900 whitespace-nowrap">
          2nd Auditee Remark
        </th>
        <th className="py-2.5 px-3 border-r border-slate-300 min-w-[150px] bg-sky-50/30 text-sky-900 whitespace-nowrap">
          2nd Auditor Remark
        </th>

        {/* 19. 3rd Progress Report (3 columns) */}
        <th className="py-2.5 px-3 border-r border-slate-300 min-w-[95px] bg-blue-50/50 text-blue-950 font-bold whitespace-nowrap text-center">
          3rd Progress
        </th>
        <th className="py-2.5 px-3 border-r border-slate-300 min-w-[150px] bg-blue-50/30 text-blue-900 whitespace-nowrap">
          3rd Auditee Remark
        </th>
        <th className="py-2.5 px-3 border-r border-slate-300 min-w-[150px] bg-blue-50/30 text-blue-900 whitespace-nowrap">
          3rd Auditor Remark
        </th>

        {/* 20. 4th Progress Report (3 columns) */}
        <th className="py-2.5 px-3 border-r border-slate-300 min-w-[95px] bg-purple-50/50 text-purple-950 font-bold whitespace-nowrap text-center">
          4th Progress
        </th>
        <th className="py-2.5 px-3 border-r border-slate-300 min-w-[150px] bg-purple-50/30 text-purple-900 whitespace-nowrap">
          4th Auditee Remark
        </th>
        <th className="py-2.5 px-3 border-r border-slate-300 min-w-[150px] bg-purple-50/30 text-purple-900 whitespace-nowrap">
          4th Auditor Remark
        </th>

        {/* 21. 5th Progress Report (3 columns) */}
        <th className="py-2.5 px-3 border-r border-slate-300 min-w-[95px] bg-amber-50/50 text-amber-950 font-bold whitespace-nowrap text-center">
          5th Progress
        </th>
        <th className="py-2.5 px-3 border-r border-slate-300 min-w-[150px] bg-amber-50/30 text-amber-900 whitespace-nowrap">
          5th Auditee Remark
        </th>
        <th className="py-2.5 px-3 border-r border-slate-300 min-w-[150px] bg-amber-50/30 text-amber-900 whitespace-nowrap">
          5th Auditor Remark
        </th>

        {/* 22. Data Upload */}
        <th className="py-2.5 px-3 border-r border-slate-300 whitespace-nowrap text-center">
          Data Upload
        </th>

        {/* 23. Actions */}
        <th className="py-2.5 px-3 text-center w-36 whitespace-nowrap">
          Actions
        </th>
      </tr>
    </thead>
  );
};
