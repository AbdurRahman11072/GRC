'use client';

import React from 'react';
import { DEFAULT_AUDIT_YEARS } from './DrtTimeFrameGrid';

export interface DrtTableHeaderProps {
  auditYears?: string[];
  stream?: 'collection' | 'analysis';
}

export const DrtTableHeader: React.FC<DrtTableHeaderProps> = ({
  auditYears = DEFAULT_AUDIT_YEARS,
  stream = 'collection',
}) => {
  const isAnalysis = stream === 'analysis';

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

        {/* 12. Mode-Specific Column: Review / Analysis Status */}
        {isAnalysis ? (
          <th className="py-2.5 px-3 border-r border-slate-300 whitespace-nowrap bg-purple-50/60 text-purple-950 text-center">
            Analysis Status
          </th>
        ) : (
          <th className="py-2.5 px-3 border-r border-slate-300 whitespace-nowrap">
            Status (Auditor)
          </th>
        )}

        {/* 13. Mode-Specific Column: Cloud Link vs. Analysis Marks */}
        {isAnalysis ? (
          <th className="py-2.5 px-3 border-r border-slate-300 whitespace-nowrap bg-indigo-50/60 text-indigo-950 text-center">
            Analysis Marks
          </th>
        ) : (
          <th className="py-2.5 px-3 border-r border-slate-300 whitespace-nowrap bg-sky-50/40 text-sky-900">
            Cloud Link
          </th>
        )}

        {/* 14. Mode-Specific Column: Collection Status vs. Verification Tier */}
        {isAnalysis ? (
          <th className="py-2.5 px-3 border-r border-slate-300 whitespace-nowrap bg-violet-50/60 text-violet-950 text-center">
            Verification
          </th>
        ) : (
          <th className="py-2.5 px-3 border-r border-slate-300 whitespace-nowrap bg-emerald-50/40 text-emerald-900">
            Collection Status
          </th>
        )}

        {/* 15. Individual Audit Year Columns */}
        {auditYears.map((year) => (
          <th
            key={year}
            className={`py-2.5 px-2 text-center border-r border-slate-300 min-w-[65px] whitespace-nowrap font-bold ${
              isAnalysis
                ? 'bg-indigo-50/50 text-indigo-950'
                : 'bg-amber-50/40 text-amber-950'
            }`}
          >
            {year}
          </th>
        ))}

        {/* 16. Completeness vs Findings */}
        {isAnalysis ? (
          <th className="py-2.5 px-3 border-r border-slate-300 whitespace-nowrap text-center bg-amber-50/30 text-amber-950">
            Audit Findings
          </th>
        ) : (
          <th className="py-2.5 px-3 border-r border-slate-300 whitespace-nowrap text-center">
            Completeness
          </th>
        )}

        {/* 17. Data Upload vs Examination Action */}
        {isAnalysis ? (
          <th className="py-2.5 px-3 border-r border-slate-300 whitespace-nowrap text-center bg-indigo-50/30 text-indigo-950">
            Examine
          </th>
        ) : (
          <th className="py-2.5 px-3 border-r border-slate-300 whitespace-nowrap text-center">
            Data Upload
          </th>
        )}

        {/* 18. Actions */}
        <th className="py-2.5 px-3 text-center w-36 whitespace-nowrap">
          Actions
        </th>
      </tr>
    </thead>
  );
};
