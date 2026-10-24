'use client';

import React from 'react';
import { Layers, ShieldCheck, FileCheck, AlertTriangle } from 'lucide-react';

export interface DrtMetricsBarProps {
  totalTickets: number;
  totalSubmissions: number;
  acceptedTickets: number;
  overdueTickets: number;
}

export const DrtMetricsBar: React.FC<DrtMetricsBarProps> = ({
  totalTickets,
  totalSubmissions,
  acceptedTickets,
  overdueTickets,
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
        <div className="text-[11px] font-semibold text-slate-500 uppercase flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-indigo-600" />
          Total Requests
        </div>
        <div className="text-xl font-bold text-slate-900 mt-1">{totalTickets}</div>
      </div>

      <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
        <div className="text-[11px] font-semibold text-slate-500 uppercase flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-600" />
          Evidence Submissions
        </div>
        <div className="text-xl font-bold text-cyan-700 mt-1">{totalSubmissions}</div>
      </div>

      <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
        <div className="text-[11px] font-semibold text-slate-500 uppercase flex items-center gap-1.5">
          <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
          Accepted / Verified
        </div>
        <div className="text-xl font-bold text-emerald-700 mt-1">{acceptedTickets}</div>
      </div>

      <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
        <div className="text-[11px] font-semibold text-slate-500 uppercase flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
          Overdue SLAs
        </div>
        <div className="text-xl font-bold text-rose-600 mt-1">{overdueTickets}</div>
      </div>
    </div>
  );
};
