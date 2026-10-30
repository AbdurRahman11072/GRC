'use client';

import React, { useState } from 'react';
import { ChevronRight, ChevronDown, UserCheck } from 'lucide-react';
import type { ITorNode, TorProgressReportPhase } from '../../../types/tor.types';
import { TorDrtSubCells } from './TorDrtSubCells';
import { TorProgressCells } from './TorProgressCells';
import { TorRowActions } from './TorRowActions';

export interface TorTableRowProps {
  node: ITorNode;
  level?: number;
  canManageTor?: boolean;
  canConfigureWeights?: boolean;
  canAwardMarks?: boolean;
  onAddChild: (parentId: string) => void;
  onConfigureWeights: (node: ITorNode) => void;
  onDelete: (nodeId: string) => void;
  onFireDrt?: (torId: string) => void;
  onEvaluateAnalysis?: (node: ITorNode) => void;
  onSelectTor?: (node: ITorNode) => void;
  onEditTor?: (node: ITorNode) => void;
  onOpenRemarkModal: (node: ITorNode, phase: TorProgressReportPhase) => void;
}

export const TorTableRow: React.FC<TorTableRowProps> = ({
  node,
  level = 0,
  canManageTor = true,
  canConfigureWeights = true,
  canAwardMarks = true,
  onAddChild,
  onConfigureWeights,
  onDelete,
  onFireDrt,
  onEvaluateAnalysis,
  onSelectTor,
  onEditTor,
  onOpenRemarkModal,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = Boolean(node.children && node.children.length > 0);
  const isRoot = level === 0;
  const assigned = node.assignedMembers || [];

  return (
    <>
      <tr
        className={`border-b border-slate-100 hover:bg-slate-50/70 transition-colors text-xs ${
          isRoot ? 'bg-white' : 'bg-slate-50/30'
        }`}
      >
        {/* 1. ToR ID (Sticky Left) */}
        <td className="sticky left-0 z-10 bg-white/95 py-2.5 px-3 whitespace-nowrap font-mono align-middle border-r border-slate-200 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.05)]">
          <div className="flex items-center gap-1.5" style={{ paddingLeft: `${level * 16}px` }}>
            {hasChildren ? (
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-0.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>
            ) : level > 0 ? (
              <span className="w-3.5 inline-block text-slate-300 font-sans text-center">└</span>
            ) : (
              <span className="w-3.5" />
            )}
            <button
              type="button"
              onClick={() => onSelectTor?.(node)}
              title="Click to view ToR details"
              className={`font-mono font-bold px-2 py-0.5 rounded text-xs shadow-2xs cursor-pointer hover:opacity-90 transition-opacity ${
                isRoot ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-700 border border-indigo-200/80'
              }`}
            >
              {node.code}
            </button>
          </div>
        </td>

        {/* 2. ToR Scope (Sticky Left) */}
        <td className="sticky left-[110px] z-10 bg-white/95 py-2.5 px-3 min-w-[240px] max-w-[300px] align-middle border-r border-slate-200 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.05)]">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span
                onClick={() => onSelectTor?.(node)}
                title={node.title}
                className={`text-slate-900 cursor-pointer hover:text-indigo-600 transition-colors ${
                  isRoot ? 'font-bold text-xs' : 'font-semibold text-xs'
                }`}
              >
                {node.title}
              </span>
              {node.department && (
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                  {node.department}
                </span>
              )}
            </div>
            {node.description && (
              <p className="text-[11px] text-slate-500 line-clamp-1">{node.description}</p>
            )}
          </div>
        </td>

        {/* 3. Assigned To */}
        <td className="py-2.5 px-3 min-w-[140px] align-middle border-r border-slate-200">
          {assigned.length > 0 ? (
            <div className="flex flex-col gap-1 max-w-[150px]">
              {assigned.slice(0, 2).map((a) => (
                <div
                  key={a.id}
                  title={`${a.user?.name || 'Member'} (${a.assignmentRole || a.projectRole || 'Field'})`}
                  className="flex items-center gap-1.5 text-[11px] text-slate-700"
                >
                  <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-[9px] shrink-0">
                    {(a.user?.name || 'M').charAt(0).toUpperCase()}
                  </div>
                  <span className="truncate font-medium">{a.user?.name || 'Field Member'}</span>
                </div>
              ))}
              {assigned.length > 2 && (
                <span className="text-[10px] text-slate-500 font-medium pl-6">
                  +{assigned.length - 2} more
                </span>
              )}
            </div>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 italic">
              <UserCheck className="w-3 h-3 text-slate-300" />
              Unassigned
            </span>
          )}
        </td>

        {/* 4. DRT BTRC & DRT FHL Sub-Cells (4 columns) */}
        <TorDrtSubCells node={node} />

        {/* 5. Progress & Remark Cells (10 columns: 1st, 2nd, 3rd, Draft, Final) */}
        <TorProgressCells node={node} onOpenRemarkModal={onOpenRemarkModal} />

        {/* 6. Sticky Right: Actions */}
        <TorRowActions
          node={node}
          canManageTor={canManageTor}
          canConfigureWeights={canConfigureWeights}
          canAwardMarks={canAwardMarks}
          onSelectTor={onSelectTor}
          onFireDrt={onFireDrt}
          onAddChild={onAddChild}
          onEvaluateAnalysis={onEvaluateAnalysis}
          onConfigureWeights={onConfigureWeights}
          onEditTor={onEditTor}
          onDelete={onDelete}
        />
      </tr>

      {/* Child Rows */}
      {hasChildren &&
        isExpanded &&
        node.children!.map((child) => (
          <TorTableRow
            key={child.id}
            node={child}
            level={level + 1}
            canManageTor={canManageTor}
            canConfigureWeights={canConfigureWeights}
            canAwardMarks={canAwardMarks}
            onAddChild={onAddChild}
            onConfigureWeights={onConfigureWeights}
            onDelete={onDelete}
            onFireDrt={onFireDrt}
            onEvaluateAnalysis={onEvaluateAnalysis}
            onSelectTor={onSelectTor}
            onEditTor={onEditTor}
            onOpenRemarkModal={onOpenRemarkModal}
          />
        ))}
    </>
  );
};
