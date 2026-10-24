'use client';

import React, { useState } from 'react';
import {
  ChevronRight, ChevronDown, Plus, SlidersHorizontal, Trash2, FilePlus, Award, CheckCircle2, Clock, RotateCcw, Eye,
} from 'lucide-react';
import { Badge } from '../../ui/Badge';
import type { ITorNode } from '../../../types/tor.types';

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
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = Boolean(node.children && node.children.length > 0);
  const tickets = node.drtTickets || [];
  const colObt = node.dataCollectionObtained ?? 0;
  const colAlloc = node.dataCollectionAllocated ?? 0;
  const anaObt = node.dataAnalysisObtained ?? 0;
  const anaAlloc = node.dataAnalysisAllocated ?? 0;
  const isRoot = level === 0;

  const renderDrtBadge = (status: string) => {
    if (status === 'ACCEPTED') return <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />;
    if (status === 'REVISION_REQUESTED') return <RotateCcw className="w-3 h-3 text-rose-600 shrink-0" />;
    return <Clock className="w-3 h-3 text-amber-500 shrink-0" />;
  };

  return (
    <>
      <tr className={`border-b border-slate-100 hover:bg-slate-50/80 transition-colors text-xs ${isRoot ? 'bg-white' : 'bg-slate-50/30'}`}>
        {/* ToR Code */}
        <td className="py-2.5 px-3 whitespace-nowrap font-mono align-middle">
          <div className="flex items-center gap-1.5" style={{ paddingLeft: `${level * 18}px` }}>
            {hasChildren ? (
              <button type="button" onClick={() => setIsExpanded(!isExpanded)} className="p-0.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
                {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>
            ) : level > 0 ? (
              <span className="w-3.5 inline-block text-slate-300 font-sans text-center">└</span>
            ) : <span className="w-3.5" />}
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

        {/* Title & Department */}
        <td className="py-2.5 px-3 min-w-[240px] max-w-sm align-middle">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span onClick={() => onSelectTor?.(node)} title="Click to view ToR details" className={`text-slate-900 cursor-pointer hover:text-indigo-600 transition-colors ${isRoot ? 'font-bold text-sm' : 'font-semibold text-xs'}`}>
                {node.title}
              </span>
              {node.department && (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                  {node.department}
                </span>
              )}
            </div>
            {node.description && <p className="text-[11px] text-slate-500 line-clamp-1">{node.description}</p>}
          </div>
        </td>

        {/* DRT Status */}
        <td className="py-2.5 px-3 min-w-[200px] align-middle">
          {tickets.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {tickets.map((t) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const status = t.workflowStatus || (t as any).lifecycleStatus || 'OPEN';
                return (
                  <span key={t.id} title={`${t.requestCode}: ${t.description || t.title || ''}`} className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-mono border border-slate-200 bg-white text-slate-700 shadow-2xs">
                    {renderDrtBadge(status)}
                    <strong className="text-slate-900">{t.requestCode}</strong>
                    <span className="text-[10px] text-slate-500 uppercase">{status.replace('_', ' ')}</span>
                  </span>
                );
              })}
            </div>
          ) : <span className="text-slate-400 font-mono text-xs">—</span>}
        </td>

        {/* Marks */}
        <td className="py-2.5 px-3 whitespace-nowrap text-center align-middle">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-slate-50 font-mono text-[11px] border border-slate-200 shadow-2xs">
            <strong className="text-cyan-700 font-bold">{colObt.toFixed(1)}</strong><span className="text-slate-400">/</span><span className="text-slate-600">{colAlloc.toFixed(1)}</span>
          </span>
        </td>
        <td className="py-2.5 px-3 whitespace-nowrap text-center align-middle">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-slate-50 font-mono text-[11px] border border-slate-200 shadow-2xs">
            <strong className="text-indigo-600 font-bold">{anaObt.toFixed(1)}</strong><span className="text-slate-400">/</span><span className="text-slate-600">{anaAlloc.toFixed(1)}</span>
          </span>
        </td>

        {/* Compliance */}
        <td className="py-2.5 px-3 whitespace-nowrap text-center align-middle">
          {node.complianceStatus ? (
            <Badge size="xs" variant={node.complianceStatus === 'COMPLIANT' ? 'success' : node.complianceStatus === 'PARTIALLY_COMPLIANT' ? 'warning' : node.complianceStatus === 'NON_COMPLIANT' ? 'danger' : 'neutral'}>
              {node.complianceStatus.replace('_', ' ')}
            </Badge>
          ) : <span className="text-slate-300 font-mono text-xs">—</span>}
        </td>

        {/* Actions Toolbar */}
        <td className="py-2.5 px-3 whitespace-nowrap text-right align-middle w-56 min-w-[220px]">
          <div className="flex items-center justify-end gap-1.5 flex-nowrap">
            {onSelectTor && (
              <button type="button" onClick={() => onSelectTor(node)} title="View ToR Details" className="p-1.5 rounded-md text-slate-500 hover:text-indigo-700 hover:bg-indigo-50 border border-transparent hover:border-indigo-200 transition-colors shrink-0">
                <Eye className="w-4 h-4" />
              </button>
            )}
            {onFireDrt && (
              <button type="button" onClick={() => onFireDrt(node.id)} title="Issue DRT Data Request for this clause" className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 transition-colors shrink-0 shadow-2xs">
                <FilePlus className="w-3.5 h-3.5 text-indigo-600" /><span>+ DRT</span>
              </button>
            )}
            {canManageTor && (
              <button type="button" onClick={() => onAddChild(node.id)} title="Add Sub-Clause" className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors shrink-0 shadow-2xs">
                <Plus className="w-3.5 h-3.5 text-slate-600" /><span>Sub</span>
              </button>
            )}
            {canAwardMarks && onEvaluateAnalysis && (
              <button type="button" onClick={() => onEvaluateAnalysis(node)} title="Evaluate Analysis Marks & Findings" className="p-1.5 rounded-md text-slate-500 hover:text-cyan-700 hover:bg-cyan-50 border border-transparent hover:border-cyan-200 transition-colors shrink-0">
                <Award className="w-4 h-4" />
              </button>
            )}
            {canConfigureWeights && (
              <button type="button" onClick={() => onConfigureWeights(node)} title="Configure Stream Weight Allocation" className="p-1.5 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-colors shrink-0">
                <SlidersHorizontal className="w-4 h-4" />
              </button>
            )}
            {canManageTor && (
              <button type="button" title="Delete clause" onClick={() => onDelete(node.id)} className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors shrink-0">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </td>
      </tr>

      {/* Child Rows */}
      {hasChildren && isExpanded && node.children!.map((child) => (
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
        />
      ))}
    </>
  );
};
