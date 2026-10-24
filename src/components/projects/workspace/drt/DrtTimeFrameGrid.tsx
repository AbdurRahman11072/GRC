'use client';

import React from 'react';
import { Calendar, CheckCircle2, Clock, AlertTriangle, MinusCircle } from 'lucide-react';
import type { PeriodEvidenceStatus } from '../../../../types/project.types';

export interface ITimeFrameStatusItem {
  periodLabel: string;
  evidenceStatus: PeriodEvidenceStatus;
  remark?: string | null;
  periodId?: string | null;
}

export interface DrtTimeFrameGridProps {
  value: ITimeFrameStatusItem[];
  onChange?: (items: ITimeFrameStatusItem[]) => void;
  readOnly?: boolean;
}

export const DEFAULT_AUDIT_YEARS = [
  '2020',
  '2021',
  '2022',
  '2023',
  '2024',
  '2025',
  '2026',
];

const statusStyles: Record<
  PeriodEvidenceStatus,
  { label: string; badge: string; icon: React.ComponentType<{ className?: string }> }
> = {
  IN_PROGRESS: {
    label: 'In Progress',
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: Clock,
  },
  PARTIAL: {
    label: 'Partial',
    badge: 'bg-sky-50 text-sky-700 border-sky-200',
    icon: AlertTriangle,
  },
  COMPLETED: {
    label: 'Completed',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: CheckCircle2,
  },
  SHARED: {
    label: 'Shared',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: CheckCircle2,
  },
  NOT_SHARED: {
    label: 'Not Shared',
    badge: 'bg-rose-50 text-rose-700 border-rose-200',
    icon: AlertTriangle,
  },
  NOT_APPLICABLE: {
    label: 'N/A',
    badge: 'bg-slate-100 text-slate-600 border-slate-200',
    icon: MinusCircle,
  },
};

export const DrtTimeFrameGrid: React.FC<DrtTimeFrameGridProps> = ({
  value,
  onChange,
  readOnly = false,
}) => {
  const updateStatus = (index: number, newStatus: PeriodEvidenceStatus) => {
    if (readOnly || !onChange) return;
    const next = [...value];
    next[index] = { ...next[index], evidenceStatus: newStatus };
    onChange(next);
  };

  const updateRemark = (index: number, newRemark: string) => {
    if (readOnly || !onChange) return;
    const next = [...value];
    next[index] = { ...next[index], remark: newRemark };
    onChange(next);
  };

  const setAllStatus = (targetStatus: PeriodEvidenceStatus) => {
    if (readOnly || !onChange) return;
    const next = value.map((item) => ({ ...item, evidenceStatus: targetStatus }));
    onChange(next);
  };

  const completedCount = value.filter(
    (v) => v.evidenceStatus === 'COMPLETED' || v.evidenceStatus === 'SHARED'
  ).length;

  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-indigo-600" />
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Audit Timeline Grid ({value.length} Years)
          </span>
          <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 border border-indigo-200">
            {completedCount}/{value.length} Completed
          </span>
        </div>

        {!readOnly && onChange && (
          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="text-slate-500 font-medium">Quick set:</span>
            <button
              type="button"
              onClick={() => setAllStatus('COMPLETED')}
              className="text-xs px-2 py-0.5 rounded font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
            >
              All Done
            </button>
            <button
              type="button"
              onClick={() => setAllStatus('IN_PROGRESS')}
              className="text-xs px-2 py-0.5 rounded font-medium bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors"
            >
              All In Progress
            </button>
            <button
              type="button"
              onClick={() => setAllStatus('NOT_APPLICABLE')}
              className="text-xs px-2 py-0.5 rounded font-medium bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200 transition-colors"
            >
              All N/A
            </button>
          </div>
        )}
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
        {value.map((item, index) => {
          const cfg = statusStyles[item.evidenceStatus] || statusStyles.IN_PROGRESS;
          const Icon = cfg.icon;

          return (
            <div
              key={item.periodLabel}
              className="flex flex-col sm:flex-row sm:items-center gap-2 rounded-lg border border-slate-200 bg-white p-2 text-xs shadow-2xs transition-colors hover:border-slate-300"
            >
              <div className="flex items-center justify-between sm:justify-start gap-2.5 sm:w-44 shrink-0">
                <span className="font-mono font-bold text-slate-800 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-[11px]">
                  {item.periodLabel}
                </span>

                {readOnly ? (
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold border ${cfg.badge}`}
                  >
                    <Icon className="w-3 h-3" />
                    {cfg.label}
                  </span>
                ) : (
                  <select
                    value={item.evidenceStatus}
                    onChange={(e) => updateStatus(index, e.target.value as PeriodEvidenceStatus)}
                    aria-label={`Status for year ${item.periodLabel}`}
                    className={`rounded border px-2 py-0.5 text-[11px] font-semibold outline-none bg-white ${cfg.badge}`}
                  >
                    <option value="IN_PROGRESS" className="bg-white text-amber-700">
                      In Progress
                    </option>
                    <option value="PARTIAL" className="bg-white text-sky-700">
                      Partial
                    </option>
                    <option value="COMPLETED" className="bg-white text-emerald-700">
                      Completed
                    </option>
                    <option value="NOT_APPLICABLE" className="bg-white text-slate-600">
                      Not Applicable
                    </option>
                  </select>
                )}
              </div>

              <div className="flex-1 min-w-0">
                {readOnly ? (
                  <span className="text-[11px] text-slate-500 italic">
                    {item.remark || 'No remark provided'}
                  </span>
                ) : (
                  <input
                    type="text"
                    value={item.remark || ''}
                    placeholder={`Auditor / Supervisor remark for ${item.periodLabel}...`}
                    onChange={(e) => updateRemark(index, e.target.value)}
                    className="w-full rounded border border-slate-200 bg-slate-50/50 px-2.5 py-1 text-[11px] text-slate-800 placeholder-slate-400 focus:bg-white focus:border-indigo-600 focus:outline-none"
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
