'use client';

import React from 'react';
import { Edit3 } from 'lucide-react';
import type { ITorNode, TorProgressReportPhase } from '../../../types/tor.types';
import { getTorStageData } from '../../../lib/torProgressUtils';

interface TorIncentiveCellsProps {
  node: ITorNode;
  onOpenRemarkModal: (node: ITorNode, phase: TorProgressReportPhase) => void;
}

export const TorIncentiveCells: React.FC<TorIncentiveCellsProps> = ({
  node,
  onOpenRemarkModal,
}) => {
  const stageIncentive = getTorStageData(node, 'INCENTIVE_REPORT');

  const renderRemarkButton = (
    remark: string | null | undefined,
    label: string
  ) => {
    return (
      <button
        type="button"
        onClick={() => onOpenRemarkModal(node, 'INCENTIVE_REPORT')}
        title={remark || `Click to add ${label}`}
        className="group flex items-start gap-1 text-left w-full p-1 -m-1 rounded hover:bg-slate-100 transition-colors cursor-pointer"
      >
        {remark ? (
          <span className="text-[11px] text-slate-700 line-clamp-2 leading-tight">
            {remark}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 italic group-hover:text-teal-600 transition-colors">
            <Edit3 className="w-2.5 h-2.5" />
            <span>Add remark...</span>
          </span>
        )}
      </button>
    );
  };

  return (
    <>
      <td className="py-2 px-2.5 align-middle border-r border-slate-200 bg-teal-50/10 min-w-[160px] max-w-[200px]">
        {renderRemarkButton(stageIncentive.auditeeRemark, 'incentive remark')}
      </td>
      <td className="py-2 px-2.5 align-middle border-r border-teal-200 bg-teal-50/10 min-w-[160px] max-w-[200px]">
        {renderRemarkButton(stageIncentive.auditorRemark, 'auditor remark')}
      </td>
    </>
  );
};
