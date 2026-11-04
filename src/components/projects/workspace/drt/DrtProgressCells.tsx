'use client';

import React from 'react';
import { Edit3 } from 'lucide-react';
import type { IDRTTicket } from '../../../../types/drt.types';
import {
  DrtProgressPhase,
  DRT_PROGRESS_PHASES,
  getDrtStageData,
  getDrtStagePercentage,
} from '../../../../lib/drtProgressUtils';

export interface DrtProgressCellsProps {
  ticket: IDRTTicket;
  onOpenProgressModal: (ticket: IDRTTicket, phase: DrtProgressPhase) => void;
}

export const DrtProgressCells: React.FC<DrtProgressCellsProps> = ({
  ticket,
  onOpenProgressModal,
}) => {
  const renderRemarkButton = (
    remark: string | null | undefined,
    phase: DrtProgressPhase,
    label: string
  ) => (
    <button
      type="button"
      onClick={() => onOpenProgressModal(ticket, phase)}
      title={remark || `Click to add ${label}`}
      className="group flex items-start gap-1 text-left w-full p-1 -m-1 rounded hover:bg-slate-100 transition-colors cursor-pointer"
    >
      {remark ? (
        <span className="text-[11px] text-slate-700 line-clamp-2 leading-tight">
          {remark}
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 italic group-hover:text-indigo-600 transition-colors">
          <Edit3 className="w-2.5 h-2.5" />
          <span>Add remark...</span>
        </span>
      )}
    </button>
  );

  return (
    <>
      {DRT_PROGRESS_PHASES.map((p, idx) => {
        const stage = getDrtStageData(ticket, p.key);
        const stagePct = getDrtStagePercentage(ticket, p.key);
        const bgTint =
          idx === 0
            ? 'bg-emerald-50/10'
            : idx === 1
            ? 'bg-sky-50/10'
            : idx === 2
            ? 'bg-blue-50/10'
            : idx === 3
            ? 'bg-purple-50/10'
            : 'bg-amber-50/10';

        return (
          <React.Fragment key={p.key}>
            {/* Progress Percentage & Bar Column */}
            <td className={`py-2 px-2.5 text-center align-middle border-r border-slate-200 ${bgTint}`}>
              <button
                type="button"
                onClick={() => onOpenProgressModal(ticket, p.key)}
                title={`${p.label}: ${stagePct}% (${stage.status || 'PENDING'}) - Click to edit`}
                className="group inline-flex flex-col items-center gap-1 p-1 -m-1 rounded hover:bg-white/80 transition-colors cursor-pointer w-full"
              >
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full font-mono text-[11px] font-bold border transition-transform group-hover:scale-105 ${
                    stagePct === 100
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      : stagePct >= 50
                      ? 'bg-sky-50 text-sky-700 border-sky-300'
                      : stagePct > 0
                      ? 'bg-amber-50 text-amber-700 border-amber-300'
                      : 'bg-slate-100 text-slate-600 border-slate-300'
                  }`}
                >
                  {stagePct}%
                </span>
                <div className="w-14 h-1.5 bg-slate-200/80 rounded-full overflow-hidden shadow-2xs">
                  <div
                    className={`h-full transition-all duration-300 rounded-full ${
                      stagePct === 100
                        ? 'bg-emerald-500'
                        : stagePct >= 50
                        ? 'bg-sky-500'
                        : stagePct > 0
                        ? 'bg-amber-500'
                        : 'bg-slate-300'
                    }`}
                    style={{ width: `${stagePct}%` }}
                  />
                </div>
              </button>
            </td>

            {/* Auditee Remark Column */}
            <td className="py-2 px-2.5 align-middle border-r border-slate-200 min-w-[150px] max-w-[200px]">
              {renderRemarkButton(stage.auditeeRemark, p.key, `${p.shortLabel} Auditee Remark`)}
            </td>

            {/* Auditor Remark Column */}
            <td className="py-2 px-2.5 align-middle border-r border-slate-200 min-w-[150px] max-w-[200px]">
              {renderRemarkButton(stage.auditorRemark, p.key, `${p.shortLabel} Auditor Remark`)}
            </td>
          </React.Fragment>
        );
      })}
    </>
  );
};
