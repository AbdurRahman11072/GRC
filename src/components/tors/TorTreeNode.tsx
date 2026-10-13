'use client';

import React, { useState } from 'react';
import {
  ChevronRight,
  ChevronDown,
  Plus,
  SlidersHorizontal,
  Trash2,
  FileSpreadsheet,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import type { ITorNode } from '../../types/tor.types';

export interface TorTreeNodeProps {
  node: ITorNode;
  level?: number;
  onAddChild: (parentId: string) => void;
  onConfigureWeights: (node: ITorNode) => void;
  onDelete: (nodeId: string) => void;
}

export const TorTreeNode: React.FC<TorTreeNodeProps> = ({
  node,
  level = 0,
  onAddChild,
  onConfigureWeights,
  onDelete,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const hasChildren = node.children && node.children.length > 0;

  // Calculate sum of allocated marks across all streams
  const totalAllocatedMarks = (node.streamWeights || []).reduce(
    (acc, curr) => acc + (curr.dataCollectionAllocated || 0) + (curr.dataAnalysisAllocated || 0),
    0
  );

  return (
    <div className="space-y-1">
      <div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all shadow-2xs"
        style={{ marginLeft: `${level * 20}px` }}
      >
        <div className="flex items-start gap-2.5 min-w-0">
          {/* Expand/Collapse Button */}
          {hasChildren ? (
            <button
              type="button"
              onClick={() => setIsExpanded((prev) => !prev)}
              className="mt-0.5 p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 shrink-0 transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          ) : (
            <span className="w-6 shrink-0" />
          )}

          {/* Clause Code & Title */}
          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="indigo" size="xs">
                {node.code}
              </Badge>
              <span className="text-sm font-semibold text-slate-900 truncate">
                {node.title}
              </span>
              {node.department && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-purple-50 text-purple-700 border border-purple-200">
                  🏢 Ask Dept: {node.department}
                </span>
              )}
              {totalAllocatedMarks > 0 && (
                <Badge variant="success" size="xs">
                  {totalAllocatedMarks.toFixed(1)} Marks
                </Badge>
              )}
              {node._count?.drtMappings ? (
                <span className="text-[11px] text-cyan-700 font-mono">
                  {node._count.drtMappings} DRT Requests
                </span>
              ) : null}
            </div>

            {node.description && (
              <p className="text-xs text-slate-500 line-clamp-1">
                {node.description}
              </p>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={() => onConfigureWeights(node)}
            leftIcon={<SlidersHorizontal className="w-3 h-3 text-cyan-400" />}
          >
            Weights
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={() => onAddChild(node.id)}
            leftIcon={<Plus className="w-3 h-3 text-indigo-400" />}
          >
            Sub-clause
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={() => onDelete(node.id)}
            className="text-slate-500 hover:text-rose-400"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Recursive Children Rendering */}
      {hasChildren && isExpanded && (
        <div className="space-y-1">
          {node.children!.map((child) => (
            <TorTreeNode
              key={child.id}
              node={child}
              level={level + 1}
              onAddChild={onAddChild}
              onConfigureWeights={onConfigureWeights}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};
