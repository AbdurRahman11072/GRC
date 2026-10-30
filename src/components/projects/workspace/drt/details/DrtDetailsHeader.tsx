'use client';

import React, { useState } from 'react';
import { Copy, Check, Target, Award, Building2, Tag, Clock } from 'lucide-react';
import { Badge } from '../../../../ui/Badge';
import { formatDate } from '../../../../../lib/utils';
import type { IDRTTicket } from '../../../../../types/project.types';

export interface DrtDetailsHeaderProps {
  ticket: IDRTTicket;
}

export const DrtDetailsHeader: React.FC<DrtDetailsHeaderProps> = ({ ticket }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(ticket.requestCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const torCodes: string[] = ticket.tors?.map((t: any) => t.code || t.tor?.code).filter(Boolean) || [];
  if (ticket.tor?.code && !torCodes.includes(ticket.tor.code)) {
    torCodes.unshift(ticket.tor.code);
  }

  const colObt = ticket.collectionObtained ?? 0;
  const colAlc = ticket.collectionAllocated ?? 0;
  const anaObt = ticket.analysisObtained ?? 0;
  const anaAlc = ticket.analysisAllocated ?? 0;
  const totalObt = colObt + anaObt;
  const totalAlc = colAlc + anaAlc || ticket.allocatedWeight || 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
      {/* Top Banner / Identity */}
      <div className="p-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-start justify-between gap-5">
        <div className="space-y-2 flex-1 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center gap-1 bg-indigo-50 border border-indigo-200 text-indigo-700 px-2.5 py-0.5 rounded-md font-mono font-bold text-xs">
              <span>{ticket.requestCode}</span>
              <button
                type="button"
                onClick={handleCopyCode}
                title="Copy Request Code"
                className="hover:text-indigo-900 transition-colors ml-1"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-indigo-400" />}
              </button>
            </div>

            {ticket.department && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                <Building2 className="w-3 h-3 text-slate-500" />
                {ticket.department}
              </span>
            )}

            <Badge
              variant={
                ticket.workflowStatus === 'ACCEPTED'
                  ? 'success'
                  : ticket.workflowStatus === 'SUBMITTED'
                  ? 'info'
                  : ticket.workflowStatus === 'REVISION_REQUESTED'
                  ? 'danger'
                  : 'neutral'
              }
            >
              {ticket.workflowStatus || 'OPEN'}
            </Badge>

            {ticket.reviewOutcome && (
              <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider border bg-amber-50 text-amber-800 border-amber-200">
                Review: {ticket.reviewOutcome.replace(/_/g, ' ')}
              </span>
            )}
          </div>

          <h1 className="text-lg font-bold text-slate-900 leading-snug">
            {ticket.title || `Data Request ${ticket.requestCode}`}
          </h1>

          {/* Description */}
          <div
            className="text-xs text-slate-600 leading-relaxed max-w-4xl"
            dangerouslySetInnerHTML={{ __html: ticket.description }}
          />

          {/* Linked ToR Tags */}
          {torCodes.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap pt-1 text-xs text-slate-500">
              <Tag className="w-3.5 h-3.5 text-indigo-600" />
              <span className="font-medium text-slate-600">Linked ToR Clauses:</span>
              {torCodes.map((c) => (
                <span
                  key={c}
                  className="px-2 py-0.5 rounded font-mono font-semibold text-[11px] bg-indigo-50/80 text-indigo-700 border border-indigo-200"
                >
                  {c}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Marks & SLA Metrics Card */}
        <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 shrink-0 min-w-[200px]">
          <div className="text-left md:text-right">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center md:justify-end gap-1">
              <Award className="w-3.5 h-3.5 text-amber-500" /> Audit Weight & Marks
            </span>
            <div className="text-base font-mono font-bold text-slate-900 mt-0.5">
              {totalObt.toFixed(1)} <span className="text-xs font-normal text-slate-500">/ {totalAlc.toFixed(1)} pts</span>
            </div>
            <div className="text-[11px] text-slate-500 font-mono mt-0.5 space-x-2">
              <span>Col: <strong>{colObt.toFixed(1)}/{colAlc.toFixed(1)}</strong></span>
              <span>•</span>
              <span>Ana: <strong>{anaObt.toFixed(1)}/{anaAlc.toFixed(1)}</strong></span>
            </div>
          </div>

          {ticket.expectedDateOfReceipt && (
            <div className="text-left md:text-right pt-2 border-t border-slate-200/70 w-full flex items-center justify-between md:justify-end gap-1.5 text-xs text-slate-600">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>SLA Target: <strong className="font-semibold text-slate-800">{formatDate(ticket.expectedDateOfReceipt)}</strong></span>
            </div>
          )}
        </div>
      </div>

      {/* Immediate Next Requirement Banner (if set) */}
      {ticket.currentRequirement && (
        <div className="px-5 py-2.5 bg-cyan-50/70 border-b border-cyan-100 flex items-start gap-2.5 text-xs text-cyan-900">
          <Target className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold uppercase tracking-wider text-[10px] text-cyan-800 block">
              Immediate Requirement / Expected Deliverable
            </strong>
            <p className="mt-0.5 leading-relaxed">{ticket.currentRequirement}</p>
          </div>
        </div>
      )}
    </div>
  );
};
