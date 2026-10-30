'use client';

import React from 'react';
import {
  Eye,
  FilePlus,
  Plus,
  Award,
  SlidersHorizontal,
  Edit2,
  Trash2,
} from 'lucide-react';
import type { ITorNode } from '../../../types/tor.types';

export interface TorRowActionsProps {
  node: ITorNode;
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
  return (
    <td className="sticky right-0 z-10 bg-white/95 py-2 px-3 whitespace-nowrap text-right align-middle w-48 min-w-[200px] border-l border-slate-200 shadow-[-2px_0_4px_-2px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-end gap-1.5 flex-nowrap">
        {onSelectTor && (
          <button
            type="button"
            onClick={() => onSelectTor(node)}
            title="View ToR Details"
            className="p-1.5 rounded-md text-slate-500 hover:text-indigo-700 hover:bg-indigo-50 border border-transparent hover:border-indigo-200 transition-colors shrink-0"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        )}
        {onFireDrt && (
          <button
            type="button"
            onClick={() => onFireDrt(node.id)}
            title="Issue DRT Data Request for this clause"
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 transition-colors shrink-0 shadow-2xs"
          >
            <FilePlus className="w-3 h-3 text-indigo-600" />
            <span>+ DRT</span>
          </button>
        )}
        {canManageTor && (
          <button
            type="button"
            onClick={() => onAddChild(node.id)}
            title="Add Sub-Clause"
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors shrink-0 shadow-2xs"
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
            className="p-1.5 rounded-md text-slate-500 hover:text-cyan-700 hover:bg-cyan-50 border border-transparent hover:border-cyan-200 transition-colors shrink-0"
          >
            <Award className="w-3.5 h-3.5" />
          </button>
        )}
        {canConfigureWeights && (
          <button
            type="button"
            onClick={() => onConfigureWeights(node)}
            title="Configure Stream Weight Allocation"
            className="p-1.5 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-colors shrink-0"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>
        )}
        {canManageTor && onEditTor && (
          <button
            type="button"
            title="Edit ToR Clause"
            onClick={() => onEditTor(node)}
            className="p-1.5 rounded-md text-slate-400 hover:text-amber-600 hover:bg-amber-50 border border-transparent hover:border-amber-200 transition-colors shrink-0"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
        )}
        {canManageTor && (
          <button
            type="button"
            title="Delete clause"
            onClick={() => onDelete(node.id)}
            className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </td>
  );
};
