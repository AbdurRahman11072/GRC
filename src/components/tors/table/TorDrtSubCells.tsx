'use client';

import React from 'react';
import Link from 'next/link';
import { CheckCircle2, RotateCcw, Clock } from 'lucide-react';
import type { ITorNode } from '../../../types/tor.types';
import { splitDrtTicketsByParty } from '../../../lib/torProgressUtils';

interface TorDrtSubCellsProps {
  node: ITorNode;
}

export const TorDrtSubCells: React.FC<TorDrtSubCellsProps> = ({ node }) => {
  const { btrcTickets, fhlTickets } = splitDrtTicketsByParty(node.drtTickets);
  const projectId = node.projectId;

  const renderDrtBadgeIcon = (status?: string) => {
    if (status === 'ACCEPTED' || status === 'DONE') {
      return <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600 shrink-0" />;
    }
    if (status === 'REVISION_REQUESTED') {
      return <RotateCcw className="w-2.5 h-2.5 text-rose-600 shrink-0" />;
    }
    return <Clock className="w-2.5 h-2.5 text-amber-500 shrink-0" />;
  };

  const getDrtUrl = (party: 'CLIENT' | 'AUDITEE', stream: 'collection' | 'analysis') => {
    if (!projectId) return '#';
    return `/projects/${projectId}?tab=drt&torId=${node.id}&party=${party}&stream=${stream}`;
  };

  return (
    <>
      {/* 1. DRT BTRC - Collection */}
      <td className="py-2 px-2.5 text-center align-middle border-r border-slate-200 bg-violet-50/20">
        <Link
          href={getDrtUrl('CLIENT', 'collection')}
          className="group flex flex-col items-center gap-1 hover:opacity-90 transition-opacity"
          title="Inspect BTRC Collection DRTs"
        >
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-violet-50 font-mono text-[11px] font-semibold text-violet-800 border border-violet-200 group-hover:bg-violet-100 transition-colors">
            <span>{(node.btrcCollectionObtained ?? 0).toFixed(1)}</span>
            <span className="text-violet-400">/</span>
            <span className="text-slate-500">{(node.btrcCollectionAllocated ?? 0).toFixed(1)}</span>
          </span>
          {btrcTickets.length > 0 ? (
            <div className="flex flex-wrap items-center justify-center gap-1 max-w-[130px]">
              {btrcTickets.slice(0, 2).map((t) => (
                <span
                  key={t.id}
                  title={`${t.requestCode}: ${t.description || t.title || ''}`}
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono border border-violet-200 bg-white text-violet-900 shadow-2xs"
                >
                  {renderDrtBadgeIcon(t.workflowStatus || (t as { lifecycleStatus?: string }).lifecycleStatus)}
                  <strong>{t.requestCode}</strong>
                </span>
              ))}
              {btrcTickets.length > 2 && (
                <span className="text-[10px] text-violet-600 font-medium">+{btrcTickets.length - 2}</span>
              )}
            </div>
          ) : (
            <span className="text-[10px] text-slate-400 font-mono">No DRT</span>
          )}
        </Link>
      </td>

      {/* 2. DRT BTRC - Audit Examination */}
      <td className="py-2 px-2.5 text-center align-middle border-r border-violet-200 bg-violet-50/20">
        <Link
          href={getDrtUrl('CLIENT', 'analysis')}
          className="group flex flex-col items-center gap-1 hover:opacity-90 transition-opacity"
          title="Inspect BTRC Audit Examination"
        >
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white font-mono text-[11px] font-semibold text-violet-900 border border-violet-200 shadow-2xs group-hover:border-violet-300 transition-colors">
            <span className="text-violet-700">{(node.btrcAnalysisObtained ?? 0).toFixed(1)}</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-500">{(node.btrcAnalysisAllocated ?? 0).toFixed(1)}</span>
          </span>
          <span className="text-[10px] text-slate-500 font-sans">
            {node.btrcAnalysisAllocated ? (
              (node.btrcAnalysisObtained ?? 0) >= (node.btrcAnalysisAllocated ?? 0) ? (
                <span className="text-emerald-700 font-medium">Examined</span>
              ) : (
                <span className="text-amber-700 font-medium">In Progress</span>
              )
            ) : (
              <span className="text-slate-400">Pending</span>
            )}
          </span>
        </Link>
      </td>

      {/* 3. DRT FHL - Collection */}
      <td className="py-2 px-2.5 text-center align-middle border-r border-slate-200 bg-blue-50/20">
        <Link
          href={getDrtUrl('AUDITEE', 'collection')}
          className="group flex flex-col items-center gap-1 hover:opacity-90 transition-opacity"
          title="Inspect FHL Collection DRTs"
        >
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 font-mono text-[11px] font-semibold text-blue-800 border border-blue-200 group-hover:bg-blue-100 transition-colors">
            <span>{(node.fhlCollectionObtained ?? 0).toFixed(1)}</span>
            <span className="text-blue-400">/</span>
            <span className="text-slate-500">{(node.fhlCollectionAllocated ?? 0).toFixed(1)}</span>
          </span>
          {fhlTickets.length > 0 ? (
            <div className="flex flex-wrap items-center justify-center gap-1 max-w-[130px]">
              {fhlTickets.slice(0, 2).map((t) => (
                <span
                  key={t.id}
                  title={`${t.requestCode}: ${t.description || t.title || ''}`}
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono border border-blue-200 bg-white text-blue-900 shadow-2xs"
                >
                  {renderDrtBadgeIcon(t.workflowStatus || (t as { lifecycleStatus?: string }).lifecycleStatus)}
                  <strong>{t.requestCode}</strong>
                </span>
              ))}
              {fhlTickets.length > 2 && (
                <span className="text-[10px] text-blue-600 font-medium">+{fhlTickets.length - 2}</span>
              )}
            </div>
          ) : (
            <span className="text-[10px] text-slate-400 font-mono">No DRT</span>
          )}
        </Link>
      </td>

      {/* 4. DRT FHL - Audit Examination */}
      <td className="py-2 px-2.5 text-center align-middle border-r border-blue-200 bg-blue-50/20">
        <Link
          href={getDrtUrl('AUDITEE', 'analysis')}
          className="group flex flex-col items-center gap-1 hover:opacity-90 transition-opacity"
          title="Inspect FHL Audit Examination"
        >
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white font-mono text-[11px] font-semibold text-blue-900 border border-blue-200 shadow-2xs group-hover:border-blue-300 transition-colors">
            <span className="text-blue-700">{(node.fhlAnalysisObtained ?? 0).toFixed(1)}</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-500">{(node.fhlAnalysisAllocated ?? 0).toFixed(1)}</span>
          </span>
          <span className="text-[10px] text-slate-500 font-sans">
            {node.fhlAnalysisAllocated ? (
              (node.fhlAnalysisObtained ?? 0) >= (node.fhlAnalysisAllocated ?? 0) ? (
                <span className="text-emerald-700 font-medium">Examined</span>
              ) : (
                <span className="text-amber-700 font-medium">In Progress</span>
              )
            ) : (
              <span className="text-slate-400">Pending</span>
            )}
          </span>
        </Link>
      </td>
    </>
  );
};
