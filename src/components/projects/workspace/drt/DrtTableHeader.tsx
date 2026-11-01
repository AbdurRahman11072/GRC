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
        {/* 1. SL */}
        <th className="py-2.5 px-2 text-center border-r border-slate-300 w-12 whitespace-nowrap">
          SL
        </th>

        {/* 2. ID (Sticky Left) */}
        <th className="sticky left-0 z-20 bg-slate-100 py-2.5 px-2.5 text-center border-r border-slate-300 w-24 whitespace-nowrap shadow-[2px_0_4px_-2px_rgba(0,0,0,0.06)]">
          ID
        </th>

        {/* 3. Request Description */}
        <th className="py-2.5 px-3 border-r border-slate-300 min-w-[280px] max-w-sm whitespace-nowrap">
          Request Description
        </th>

        {/* 4. ToR Clause */}
        <th className="py-2.5 px-2 text-center border-r border-slate-300 w-28 bg-emerald-50/60 text-emerald-900 whitespace-nowrap">
          ToR Clause
        </th>

        {/* 5. Department */}
        <th className="py-2.5 px-3 text-center border-r border-slate-300 w-36 bg-slate-50 text-slate-800 whitespace-nowrap">
          Department
        </th>

        {/* 6. Assigned To */}
        <th className="py-2.5 px-3 text-center border-r border-slate-300 w-40 bg-indigo-50/40 text-indigo-900 whitespace-nowrap">
          Assigned To
        </th>

        {/* 7. Date of Request */}
        <th className="py-2.5 px-3 border-r border-slate-300 whitespace-nowrap">
          Date of Request
        </th>

        {/* 8. Expected Date */}
        <th className="py-2.5 px-3 border-r border-slate-300 whitespace-nowrap">
          Expected Date
        </th>

        {/* 9. Actual Date */}
        <th className="py-2.5 px-3 border-r border-slate-300 whitespace-nowrap">
          Actual Date
        </th>

        {/* 10. Status (Auditor) */}
        <th className="py-2.5 px-3 border-r border-slate-300 whitespace-nowrap">
          Status (Auditor)
        </th>

        {/* 11. Excess Days */}
        <th className="py-2.5 px-3 border-r border-slate-300 whitespace-nowrap text-center">
          Excess Days
        </th>

        {/* 12. Client Cloud Link */}
        <th className="py-2.5 px-3 border-r border-slate-300 whitespace-nowrap bg-sky-50/50 text-sky-900">
          Client Cloud Link
        </th>

        {/* 13. Auditee Cloud Link */}
        <th className="py-2.5 px-3 border-r border-slate-300 whitespace-nowrap bg-emerald-50/50 text-emerald-900">
          Auditee Cloud Link
        </th>

        {/* 14. Client Collection Status */}
        <th className="py-2.5 px-3 border-r border-slate-300 whitespace-nowrap bg-sky-50/50 text-sky-900">
          Client Collection Status
        </th>

        {/* 15. Auditee Collection Status */}
        <th className="py-2.5 px-3 border-r border-slate-300 whitespace-nowrap bg-emerald-50/50 text-emerald-900">
          Auditee Collection Status
        </th>

        {/* 16. Individual Audit Year Columns */}
        {auditYears.map((year) => (
          <th
            key={year}
            className="py-2.5 px-2 text-center border-r border-slate-300 min-w-[55px] whitespace-nowrap bg-amber-50/40 text-amber-950 font-bold"
          >
            {year}
          </th>
        ))}

        {/* 17. Completeness */}
        <th className="py-2.5 px-3 border-r border-slate-300 whitespace-nowrap text-center">
          Completeness
        </th>

        {/* 18. Auditor Remarks */}
        <th className="py-2.5 px-3 border-r border-slate-300 min-w-[180px] max-w-[220px] whitespace-nowrap">
          Auditor Remarks
        </th>

        {/* 19. Auditee Remarks */}
        <th className="py-2.5 px-3 border-r border-slate-300 min-w-[180px] max-w-[220px] whitespace-nowrap">
          Auditee Remarks
        </th>

        {/* 20. Data Upload */}
        <th className="py-2.5 px-3 border-r border-slate-300 whitespace-nowrap text-center">
          Data Upload
        </th>

        {/* 21. Actions */}
        <th className="py-2.5 px-3 text-center w-36 whitespace-nowrap">
          Actions
        </th>
      </tr>
    </thead>
  );
};
