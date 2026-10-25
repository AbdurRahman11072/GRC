'use client';

import React, { useState } from 'react';
import {
  ChevronRight,
  ChevronDown,
  Plus,
  SlidersHorizontal,
  Trash2,
  FilePlus,
  Award,
  Layers,
  Edit2,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import type { ITorNode } from '../../types/tor.types';

export interface TorTreeNodeProps {
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
  onEditTor?: (node: ITorNode) => void;
}

export const TorTreeNode: React.FC<TorTreeNodeProps> = ({
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
  onEditTor,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;
  const childTickets = node.drtTickets || [];

  const colObtained = node.dataCollectionObtained ?? 0;
  const colAllocated = node.dataCollectionAllocated ?? 0;
  const anaObtained = node.dataAnalysisObtained ?? 0;
  const anaAllocated = node.dataAnalysisAllocated ?? 0;

  return (
    <div className="space-y-1">
      <div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-all shadow-2xs"
        style={{ marginLeft: `${level * 18}px` }}
      >
        <div className="flex items-start gap-2 min-w-0">
          {hasChildren ? (
            <button
              type="button"
              onClick={() => setIsExpanded((prev) => !prev)}
              className="mt-0.5 p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 shrink-0"
            >
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          ) : (
            <span className="w-6 shrink-0" />
          )}

          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap text-xs">
              <Badge variant="indigo" size="xs">{node.code}</Badge>
              <span className="font-semibold text-slate-900 truncate" title={node.title}>{node.title}</span>
              {node.department && (
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                  {node.department}
                </span>
              )}
              {node.complianceStatus && (
                <Badge
                  size="xs"
                  variant={
                    node.complianceStatus === 'COMPLIANT'
                      ? 'success'
                      : node.complianceStatus === 'PARTIALLY_COMPLIANT'
                      ? 'warning'
                      : node.complianceStatus === 'NON_COMPLIANT'
                      ? 'danger'
                      : 'neutral'
                  }
                >
                  {node.complianceStatus}
                </Badge>
              )}
            </div>

            {/* Two-Stage Scoring Metrics */}
            <div className="flex items-center gap-2 flex-wrap text-[11px] text-slate-500">
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono">
                Collection: <strong className="text-indigo-600">{colObtained.toFixed(1)}</strong> / {colAllocated.toFixed(1)}
              </span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono">
                Analysis: <strong className="text-cyan-700">{anaObtained.toFixed(1)}</strong> / {anaAllocated.toFixed(1)}
              </span>
              {childTickets.length > 0 && (
                <span className="text-[11px] text-slate-500">
                  ({childTickets.length} DRT request{childTickets.length > 1 ? 's' : ''})
                </span>
              )}
            </div>

            {/* Child DRT Chips */}
            {childTickets.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                {childTickets.slice(0, 4).map((t) => (
                  <span
                    key={t.id}
                    className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-slate-200 bg-white text-slate-700 flex items-center gap-1"
                  >
                    <span>{t.requestCode}</span>
                    <span className="text-slate-400">({t.workflowStatus})</span>
                  </span>
                ))}
                {childTickets.length > 4 && (
                  <span className="text-[10px] text-slate-400">+{childTickets.length - 4} more</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0 self-end sm:self-center flex-wrap">
          {onFireDrt && (
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={() => onFireDrt(node.id)}
              leftIcon={<FilePlus className="w-3 h-3 text-indigo-600" />}
            >
              + DRT
            </Button>
          )}

          {canAwardMarks && onEvaluateAnalysis && (
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={() => onEvaluateAnalysis(node)}
              leftIcon={<Award className="w-3 h-3 text-cyan-600" />}
            >
              Analysis
            </Button>
          )}

          {canConfigureWeights && (
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={() => onConfigureWeights(node)}
              leftIcon={<SlidersHorizontal className="w-3 h-3 text-slate-500" />}
            >
              Weights
            </Button>
          )}

          {canManageTor && (
            <>
              {onEditTor && (
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={() => onEditTor(node)}
                  className="text-slate-400 hover:text-amber-600"
                >
                  <Edit2 className="w-3 h-3" />
                </Button>
              )}
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={() => onAddChild(node.id)}
                leftIcon={<Plus className="w-3 h-3 text-indigo-500" />}
              >
                Sub-clause
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={() => onDelete(node.id)}
                className="text-slate-400 hover:text-rose-500"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Recursive Children */}
      {hasChildren && isExpanded && (
        <div className="space-y-1">
          {node.children!.map((child) => (
            <TorTreeNode
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
              onEditTor={onEditTor}
            />
          ))}
        </div>
      )}
    </div>
  );
};
