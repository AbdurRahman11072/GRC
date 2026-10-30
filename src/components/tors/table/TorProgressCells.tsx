'use client';

import React from 'react';
import { MessageSquare, Edit3 } from 'lucide-react';
import type { ITorNode, TorProgressReportPhase } from '../../../types/tor.types';
import { getTorStageData, getProgressBadgeClasses } from '../../../lib/torProgressUtils';

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
  const stageDraft = getTorStageData(node, 'DRAFT_REPORT');
  const stageFinal = getTorStageData(node, 'FINAL_REPORT');

  const renderRemarkButton = (remark: string | null | undefined, phase: TorProgressReportPhase, label: string) => {
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

  const renderProgressPill = (status?: string, phase?: TorProgressReportPhase) => {
    return (
      <button
        type="button"
        onClick={() => phase && onOpenRemarkModal(node, phase)}
        title="Click to change status or edit remark"
        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border cursor-pointer hover:opacity-85 transition-opacity ${getProgressBadgeClasses(
          status
        )}`}
      >
        {status ? status.replace(/_/g, ' ') : 'PENDING'}
      </button>
    );
  };

  return (
    <>
      {/* 1. 1st Progress */}
      <td className="py-2 px-2.5 text-center align-middle border-r border-slate-200 bg-emerald-50/10">
        {renderProgressPill(stage1.status, 'FIRST_PROGRESS')}
      </td>
      <td className="py-2 px-2.5 align-middle border-r border-emerald-200 bg-emerald-50/10 min-w-[160px] max-w-[200px]">
        {renderRemarkButton(stage1.auditorRemark, 'FIRST_PROGRESS', 'auditor remark')}
      </td>

      {/* 2. 2nd Progress */}
      <td className="py-2 px-2.5 text-center align-middle border-r border-slate-200 bg-sky-50/10">
        {renderProgressPill(stage2.status, 'SECOND_PROGRESS')}
      </td>
      <td className="py-2 px-2.5 align-middle border-r border-sky-200 bg-sky-50/10 min-w-[160px] max-w-[200px]">
        {renderRemarkButton(stage2.auditorRemark, 'SECOND_PROGRESS', 'auditor remark')}
      </td>

      {/* 3. 3rd Progress */}
      <td className="py-2 px-2.5 text-center align-middle border-r border-slate-200 bg-indigo-50/10">
        {renderProgressPill(stage3.status, 'THIRD_PROGRESS')}
      </td>
      <td className="py-2 px-2.5 align-middle border-r border-indigo-200 bg-indigo-50/10 min-w-[160px] max-w-[200px]">
        {renderRemarkButton(stage3.auditorRemark, 'THIRD_PROGRESS', 'auditor remark')}
      </td>

      {/* 4. Draft Report */}
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
