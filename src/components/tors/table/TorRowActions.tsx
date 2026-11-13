'use client';

import React from 'react';
import Link from 'next/link';
import {
  Eye,
  BarChart2,
  FilePlus,
  Plus,
  Award,
  SlidersHorizontal,
  Edit2,
  Trash2,
} from 'lucide-react';
import type { ITorNode } from '../../../types/tor.types';
import { isTorDrtEligible } from '../../../lib/torProgressUtils';

export interface TorRowActionsProps {
  node: ITorNode;
  level?: number;
  canManageTor?: boolean;
  canConfigureWeights?: boolean;
  canAwardMarks?: boolean;
  onSelectTor?: (node: ITorNode) => void;
  onFireDrt?: (torId: string) => void;
  onAddChild: (parentId: string) => void;
  onEvaluateAnalysis?: (node: ITorNode) => void;
  onConfigureWeights: (node: ITorNode) => void;
  onEditTor?: (node: ITorNode) => void;
  onDelete: (nodeId: string) => void;
}

export const TorRowActions: React.FC<TorRowActionsProps> = ({
  node,
  level = 0,
  canManageTor = true,
  canConfigureWeights = true,
  canAwardMarks = true,
  onSelectTor,
  onFireDrt,
  onAddChild,
  onEvaluateAnalysis,
  onConfigureWeights,
  onEditTor,
  onDelete,
}) => {
  // Show DRT button on 1.1 clauses (level 1), not root 1 or 2
  const canIssueDrt = isTorDrtEligible(node.code, level);
  const codeParts = node.code ? node.code.split('.').filter(Boolean) : [];
  // Only root clauses (e.g. 1, 2) can have sub-clauses (1.1). Sub-clauses cannot have 1.1.1.
  const canAddSubClause = canManageTor && (level === 0 || codeParts.length <= 1);

  return (
    <td className="py-2 px-3 whitespace-nowrap text-right align-middle w-48 min-w-[200px] border-l border-slate-200">
      <div className="flex items-center justify-end gap-1.5 flex-nowrap">
        <Link
          href={`/projects/${node.projectId}/tor-progress?torId=${node.id}`}
          title={`View Individual ToR Progress Report for ${node.code}`}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 transition-colors shrink-0 shadow-2xs"
        >
          <BarChart2 className="w-3 h-3 text-emerald-600" />
          <span>Progress</span>
        </Link>
        {onSelectTor && (
          <button
            type="button"
            onClick={() => onSelectTor(node)}
            title="View ToR Details"
            className="p-1.5 rounded-md text-slate-500 hover:text-indigo-700 hover:bg-indigo-50 border border-transparent hover:border-indigo-200 transition-colors shrink-0 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        )}
        {canAddSubClause && (
          <button
            type="button"
            onClick={() => onAddChild(node.id)}
            title="Add Sub-Clause"
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors shrink-0 shadow-2xs cursor-pointer"
          >
            <Plus className="w-3 h-3 text-slate-600" />
            <span>Sub</span>
          </button>
        )}
        {canAwardMarks && onEvaluateAnalysis && (
          <button
            type="button"
            onClick={() => onEvaluateAnalysis(node)}
            title="Evaluate Analysis Marks & Findings"
            className="p-1.5 rounded-md text-slate-500 hover:text-cyan-700 hover:bg-cyan-50 border border-transparent hover:border-cyan-200 transition-colors shrink-0 cursor-pointer"
          >
            <Award className="w-3.5 h-3.5" />
          </button>
        )}
        {canConfigureWeights && (
          <button
            type="button"
            onClick={() => onConfigureWeights(node)}
            title="Configure Stream Weight Allocation"
            className="p-1.5 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-colors shrink-0 cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>
        )}
        {canManageTor && onEditTor && (
          <button
            type="button"
            title="Edit ToR Clause"
            onClick={() => onEditTor(node)}
            className="p-1.5 rounded-md text-slate-400 hover:text-amber-600 hover:bg-amber-50 border border-transparent hover:border-amber-200 transition-colors shrink-0 cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
        )}
        {canManageTor && (
          <button
            type="button"
            title="Delete clause"
            onClick={() => onDelete(node.id)}
            className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors shrink-0 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </td>
  );
};
