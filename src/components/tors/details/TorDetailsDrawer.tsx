'use client';

import React, { useState } from 'react';
import { FilePlus, Award, SlidersHorizontal, FolderTree, X } from 'lucide-react';
import { Drawer } from '../../ui/Drawer';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { useGetTorByIdQuery } from '../../../store/api/torApi';
import type { ITorNode } from '../../../types/tor.types';

export interface TorDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  torNode: ITorNode | null;
  canConfigureWeights?: boolean;
  canAwardMarks?: boolean;
  onFireDrt?: (torId: string) => void;
  onConfigureWeights?: (node: ITorNode) => void;
  onEvaluateAnalysis?: (node: ITorNode) => void;
}

export const TorDetailsDrawer: React.FC<TorDetailsDrawerProps> = ({
  isOpen,
  onClose,
  torNode,
  canConfigureWeights,
  canAwardMarks,
  onFireDrt,
  onConfigureWeights,
  onEvaluateAnalysis,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'drt' | 'weights' | 'children'>('overview');
  const { data: detailData } = useGetTorByIdQuery(torNode?.id || '', { skip: !isOpen || !torNode?.id });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tor: any = (detailData?.data as any) || torNode;

  if (!torNode || !tor) return null;

  const tickets = tor.drtTickets || [];
  const weights = tor.streamWeights || [];
  const children = tor.children || [];
  const colObt = tor.dataCollectionObtained ?? 0;
  const colAlloc = tor.dataCollectionAllocated ?? 0;
  const anaObt = tor.dataAnalysisObtained ?? 0;
  const anaAlloc = tor.dataAnalysisAllocated ?? 0;
  const colPct = colAlloc > 0 ? Math.min(100, Math.round((colObt / colAlloc) * 100)) : 0;
  const anaPct = anaAlloc > 0 ? Math.min(100, Math.round((anaObt / anaAlloc) * 100)) : 0;

  return (
    <Drawer isOpen={isOpen} onClose={onClose} size="3xl">
      <div className="space-y-4">
        {/* Header */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-1 rounded-md bg-indigo-600 text-white font-mono font-bold text-xs shadow-2xs">
                {tor.code}
              </span>
              {tor.department && (
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                  {tor.department}
                </span>
              )}
              {tor.complianceStatus && (
                <Badge size="xs" variant={tor.complianceStatus === 'COMPLIANT' ? 'success' : tor.complianceStatus === 'PARTIALLY_COMPLIANT' ? 'warning' : tor.complianceStatus === 'NON_COMPLIANT' ? 'danger' : 'neutral'}>
                  {tor.complianceStatus.replace('_', ' ')}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              {onFireDrt && (
                <Button size="xs" variant="outline" onClick={() => onFireDrt(tor.id)} className="text-indigo-700 border-indigo-200 bg-white" leftIcon={<FilePlus className="w-3.5 h-3.5" />}>+ DRT</Button>
              )}
              {canAwardMarks && onEvaluateAnalysis && (
                <Button size="xs" variant="outline" onClick={() => onEvaluateAnalysis(tor)} className="text-cyan-700 border-cyan-200 bg-white" leftIcon={<Award className="w-3.5 h-3.5" />}>Evaluate</Button>
              )}
              {canConfigureWeights && onConfigureWeights && (
                <Button size="xs" variant="outline" onClick={() => onConfigureWeights(tor)} className="text-slate-700 border-slate-200 bg-white" leftIcon={<SlidersHorizontal className="w-3.5 h-3.5" />}>Weights</Button>
              )}
              <button
                type="button"
                onClick={onClose}
                aria-label="Close drawer"
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors ml-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          <h2 className="text-base font-bold text-slate-900 leading-snug">{tor.title}</h2>
          {tor.parent && (
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <FolderTree className="w-3.5 h-3.5 text-slate-400" />
              <span>Parent: <strong className="text-slate-700 font-mono">{tor.parent.code}</strong> — {tor.parent.title}</span>
            </p>
          )}
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 gap-4 text-xs font-semibold">
          {[
            { id: 'overview', label: 'Overview & Scope' },
            { id: 'drt', label: `Linked DRTs (${tickets.length})` },
            { id: 'weights', label: `Stream Weights (${weights.length})` },
            { id: 'children', label: `Sub-Clauses (${children.length})` },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id as typeof activeTab)}
              className={`pb-2.5 transition-colors border-b-2 -mb-px ${activeTab === t.id ? 'border-indigo-600 text-indigo-700 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-3.5 text-xs">
            {tor.description && (
              <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Audit Scope & Description</span>
                <p className="text-slate-700 leading-relaxed">{tor.description}</p>
              </div>
            )}
            {tor.objective && (
              <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Audit Objective & Verification</span>
                <p className="text-slate-700 leading-relaxed">{tor.objective}</p>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-cyan-50/60 border border-cyan-200/80 space-y-2">
                <div className="flex items-center justify-between font-bold text-cyan-900">
                  <span>Data Collection Marks</span>
                  <span className="font-mono">{colObt.toFixed(1)} / {colAlloc.toFixed(1)}</span>
                </div>
                <div className="w-full bg-cyan-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-cyan-600 h-2 rounded-full" style={{ width: `${colPct}%` }} />
                </div>
                <span className="text-[10px] text-cyan-700 block text-right font-medium">{colPct}% satisfied</span>
              </div>
              <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-200/80 space-y-2">
                <div className="flex items-center justify-between font-bold text-indigo-900">
                  <span>Data Analysis Marks</span>
                  <span className="font-mono">{anaObt.toFixed(1)} / {anaAlloc.toFixed(1)}</span>
                </div>
                <div className="w-full bg-indigo-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${anaPct}%` }} />
                </div>
                <span className="text-[10px] text-indigo-700 block text-right font-medium">{anaPct}% analyzed</span>
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-400">Analysis Findings</span>
                {tor.analyzedBy && <span className="text-[11px] text-slate-500">By <strong>{tor.analyzedBy.name}</strong></span>}
              </div>
              <p className="text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100 leading-relaxed">
                {tor.analysisNotes || 'No specific audit findings or analysis commentary recorded yet.'}
              </p>
            </div>
          </div>
        )}

        {activeTab === 'drt' && (
          <div className="space-y-2.5">
            {tickets.length > 0 ? (
              tickets.map((t: any) => (
                <div key={t.id} className="p-3 rounded-xl bg-white border border-slate-200 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200/60">{t.requestCode}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${t.workflowStatus === 'ACCEPTED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>{t.workflowStatus || 'OPEN'}</span>
                  </div>
                  <h4 className="font-semibold text-slate-900">{t.title || t.description}</h4>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                    <span>Supervisor: <strong>{t.supervisor?.name || 'Unassigned'}</strong></span>
                    <span>Evidence files: <strong>{t.drtDocuments?.length || 0}</strong></span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-slate-500 border border-dashed rounded-xl space-y-2">
                <p>No DRT data requests linked to this ToR clause yet.</p>
                {onFireDrt && <Button size="xs" variant="primary" onClick={() => onFireDrt(tor.id)} leftIcon={<FilePlus className="w-3.5 h-3.5" />}>Issue DRT</Button>}
              </div>
            )}
          </div>
        )}

        {activeTab === 'weights' && (
          <div className="space-y-2">
            {weights.length > 0 ? (
              <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-500 border-b border-slate-200">
                    <tr><th className="p-2.5">Stream Bucket</th><th className="p-2.5 text-center">Collection Alloc.</th><th className="p-2.5 text-center">Analysis Alloc.</th><th className="p-2.5 text-center">Analysis Obtained</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {weights.map((w: any) => (
                      <tr key={w.id || w.streamBucket}>
                        <td className="p-2.5 font-medium text-slate-800">{w.streamBucket.replace('_', ' ')}</td>
                        <td className="p-2.5 text-center font-mono text-cyan-700">{w.dataCollectionAllocated}</td>
                        <td className="p-2.5 text-center font-mono text-indigo-700">{w.dataAnalysisAllocated}</td>
                        <td className="p-2.5 text-center font-mono text-slate-700">{w.dataAnalysisObtained ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="p-6 text-center text-xs text-slate-500 border border-dashed rounded-xl">No custom stream weights configured yet.</p>
            )}
          </div>
        )}

        {activeTab === 'children' && (
          <div className="space-y-2">
            {children.length > 0 ? (
              children.map((child: any) => (
                <div key={child.id} className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-2"><span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded text-[11px] border border-indigo-200">{child.code}</span><strong className="text-slate-900">{child.title}</strong></div>
                    {child.department && <span className="text-[10px] text-purple-600 block">{child.department}</span>}
                  </div>
                  <span className="text-slate-500 font-mono text-[11px]">Marks: {child.dataCollectionObtained ?? 0} / {child.dataCollectionAllocated ?? 0}</span>
                </div>
              ))
            ) : (
              <p className="p-6 text-center text-xs text-slate-500 border border-dashed rounded-xl">This is a leaf clause with no sub-clauses.</p>
            )}
          </div>
        )}
      </div>
    </Drawer>
  );
};
