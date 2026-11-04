'use client';

import React from 'react';
import { Edit3 } from 'lucide-react';
import type { ITorNode, TorProgressReportPhase } from '../../../types/tor.types';
import { getTorStageData } from '../../../lib/torProgressUtils';
import { getTorStagePercentage } from '../../../lib/torPercentageUtils';

interface TorProgressCellsProps {
  node: ITorNode;
  onOpenRemarkModal: (node: ITorNode, phase: TorProgressReportPhase) => void;
}

export const TorProgressCells: React.FC<TorProgressCellsProps> = ({
  node,
  onOpenRemarkModal,
}) => {
  const stage1 = getTorStageData(node, 'FIRST_PROGRESS');
  const stage2 = getTorStageData(node, 'SECOND_PROGRESS');
  const stage3 = getTorStageData(node, 'THIRD_PROGRESS');
  const stage4 = getTorStageData(node, 'FOURTH_PROGRESS');
  const stage5 = getTorStageData(node, 'FIFTH_PROGRESS');
  const stageDraft = getTorStageData(node, 'DRAFT_REPORT');
  const stageFinal = getTorStageData(node, 'FINAL_REPORT');

  const renderRemarkButton = (
    remark: string | null | undefined,
    phase: TorProgressReportPhase,
    label: string
  ) => {
    return (
      <button
        type="button"
        onClick={() => onOpenRemarkModal(node, phase)}
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
  };

  const renderProgressCell = (phase: TorProgressReportPhase, label: string) => {
    const pct = getTorStagePercentage(node, phase);
    const stage = getTorStageData(node, phase);
    return (
      <button
        type="button"
        onClick={() => onOpenRemarkModal(node, phase)}
        title={`${label}: ${pct}% (${stage.status || 'PENDING'}) - Click to edit`}
        className="group inline-flex flex-col items-center gap-1 p-1 -m-1 rounded hover:bg-white/80 transition-colors cursor-pointer w-full"
      >
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full font-mono text-[11px] font-bold border transition-transform group-hover:scale-105 ${
            pct === 100
              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
              : pct >= 50
              ? 'bg-sky-50 text-sky-700 border-sky-300'
              : pct > 0
              ? 'bg-amber-50 text-amber-700 border-amber-300'
              : 'bg-slate-100 text-slate-600 border-slate-300'
          }`}
        >
          {pct}%
        </span>
        <div className="w-14 h-1.5 bg-slate-200/80 rounded-full overflow-hidden shadow-2xs">
          <div
            className={`h-full transition-all duration-300 rounded-full ${
              pct === 100
                ? 'bg-emerald-500'
                : pct >= 50
                ? 'bg-sky-500'
                : pct > 0
                ? 'bg-amber-500'
                : 'bg-slate-300'
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </button>
    );
  };

  return (
    <>
      {/* 1. 1st Progress */}
      <td className="py-2 px-2.5 text-center align-middle border-r border-slate-200 bg-emerald-50/10">
        {renderProgressCell('FIRST_PROGRESS', '1st Progress')}
      </td>
      <td className="py-2 px-2.5 align-middle border-r border-emerald-200 bg-emerald-50/10 min-w-[160px] max-w-[200px]">
        {renderRemarkButton(stage1.auditorRemark, 'FIRST_PROGRESS', 'auditor remark')}
      </td>

      {/* 2. 2nd Progress */}
      <td className="py-2 px-2.5 text-center align-middle border-r border-slate-200 bg-sky-50/10">
        {renderProgressCell('SECOND_PROGRESS', '2nd Progress')}
      </td>
      <td className="py-2 px-2.5 align-middle border-r border-sky-200 bg-sky-50/10 min-w-[160px] max-w-[200px]">
        {renderRemarkButton(stage2.auditorRemark, 'SECOND_PROGRESS', 'auditor remark')}
      </td>

      {/* 3. 3rd Progress */}
      <td className="py-2 px-2.5 text-center align-middle border-r border-slate-200 bg-indigo-50/10">
        {renderProgressCell('THIRD_PROGRESS', '3rd Progress')}
      </td>
      <td className="py-2 px-2.5 align-middle border-r border-indigo-200 bg-indigo-50/10 min-w-[160px] max-w-[200px]">
        {renderRemarkButton(stage3.auditorRemark, 'THIRD_PROGRESS', 'auditor remark')}
      </td>

      {/* 4. 4th Progress */}
      <td className="py-2 px-2.5 text-center align-middle border-r border-slate-200 bg-cyan-50/10">
        {renderProgressCell('FOURTH_PROGRESS', '4th Progress')}
      </td>
      <td className="py-2 px-2.5 align-middle border-r border-cyan-200 bg-cyan-50/10 min-w-[160px] max-w-[200px]">
        {renderRemarkButton(stage4.auditorRemark, 'FOURTH_PROGRESS', 'auditor remark')}
      </td>

      {/* 5. 5th Progress */}
      <td className="py-2 px-2.5 text-center align-middle border-r border-slate-200 bg-rose-50/10">
        {renderProgressCell('FIFTH_PROGRESS', '5th Progress')}
      </td>
      <td className="py-2 px-2.5 align-middle border-r border-rose-200 bg-rose-50/10 min-w-[160px] max-w-[200px]">
        {renderRemarkButton(stage5.auditorRemark, 'FIFTH_PROGRESS', 'auditor remark')}
      </td>

      {/* 6. Draft Report */}
      <td className="py-2 px-2.5 align-middle border-r border-slate-200 bg-amber-50/10 min-w-[160px] max-w-[200px]">
        {renderRemarkButton(stageDraft.auditeeRemark, 'DRAFT_REPORT', 'draft remark')}
      </td>
      <td className="py-2 px-2.5 align-middle border-r border-amber-200 bg-amber-50/10 min-w-[160px] max-w-[200px]">
        {renderRemarkButton(stageDraft.auditorRemark, 'DRAFT_REPORT', 'auditor remark')}
      </td>

      {/* 5. Final Report */}
      <td className="py-2 px-2.5 align-middle border-r border-slate-200 bg-purple-50/10 min-w-[160px] max-w-[200px]">
        {renderRemarkButton(stageFinal.auditeeRemark, 'FINAL_REPORT', 'final remark')}
      </td>
      <td className="py-2 px-2.5 align-middle border-r border-purple-200 bg-purple-50/10 min-w-[160px] max-w-[200px]">
        {renderRemarkButton(stageFinal.auditorRemark, 'FINAL_REPORT', 'auditor remark')}
      </td>
    </>
  );
};
