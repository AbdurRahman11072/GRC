'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  RotateCcw,
  Sparkles,
  Check,
  AlertCircle,
  Clock,
  Trash2,
} from 'lucide-react';
import { Modal } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import {
  DRT_PROGRESS_PHASES,
  type DrtProgressPhase,
  formatCutoffDateDisplay,
} from '../../../lib/drtProgressUtils';
import { useUpdateProjectMutation } from '../../../store/api/projectApi';

export interface ConfigureProgressCutoffsModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  auditYears?: string[];
  currentCutoffs?: Record<string, string> | null;
  projectStartDate?: string | null;
  projectEndDate?: string | null;
}

export const ConfigureProgressCutoffsModal: React.FC<ConfigureProgressCutoffsModalProps> = ({
  isOpen,
  onClose,
  projectId,
  auditYears = [],
  currentCutoffs,
  projectStartDate,
  projectEndDate,
}) => {
  const [updateProject, { isLoading: isSaving }] = useUpdateProjectMutation();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Generate sensible default milestone dates spaced evenly across the project or year
  const defaultCutoffs = useMemo(() => {
    const map: Record<string, string> = {};
    const baseYear = auditYears.length > 0 ? parseInt(auditYears[0], 10) : new Date().getFullYear();
    const currentYear = isNaN(baseYear) ? new Date().getFullYear() : baseYear;

    const quarters = [
      `${currentYear}-03-31`,
      `${currentYear}-06-30`,
      `${currentYear}-09-30`,
      `${currentYear}-12-31`,
      `${currentYear + 1}-03-31`,
    ];

    DRT_PROGRESS_PHASES.forEach((p, idx) => {
      map[p.key] = quarters[idx] || '';
    });
    return map;
  }, [auditYears]);

  const [localCutoffs, setLocalCutoffs] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
      if (currentCutoffs && Object.keys(currentCutoffs).length > 0) {
        const copy: Record<string, string> = {};
        DRT_PROGRESS_PHASES.forEach((p) => {
          copy[p.key] = currentCutoffs[p.key] || '';
        });
        setLocalCutoffs(copy);
      } else {
        setLocalCutoffs(defaultCutoffs);
      }
    }
  }, [isOpen, currentCutoffs, defaultCutoffs]);

  const handleChangeDate = (phaseKey: DrtProgressPhase, dateStr: string) => {
    setLocalCutoffs((prev) => ({
      ...prev,
      [phaseKey]: dateStr,
    }));
  };

  const handleResetDefaults = () => {
    setLocalCutoffs(defaultCutoffs);
  };

  const handleClearAll = () => {
    const cleared: Record<string, string> = {};
    DRT_PROGRESS_PHASES.forEach((p) => {
      cleared[p.key] = '';
    });
    setLocalCutoffs(cleared);
  };

  const handleSave = async () => {
    try {
      setErrorMsg(null);
      await updateProject({
        id: projectId,
        body: {
          progressCutoffDates: localCutoffs,
        },
      }).unwrap();
      onClose();
    } catch (err: unknown) {
      console.error('Failed to update progress cutoff dates:', err);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const message = (err as any)?.data?.message || 'Failed to save cutoff dates. Please try again.';
      setErrorMsg(message);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      title="Configure Progress Report Cutoff Dates"
      description="Set evaluation deadline dates for each progress report. In real-world audits, any document submitted on a DRT on or before a report's cutoff date is evaluated in that report."
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={handleResetDefaults}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              title="Reset to default quarterly milestone dates"
            >
              Default Quarters
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={handleClearAll}
              leftIcon={<Trash2 className="w-3.5 h-3.5 text-slate-400" />}
            >
              Clear
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" size="xs" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="xs"
              onClick={handleSave}
              isLoading={isSaving}
              leftIcon={<Check className="w-3.5 h-3.5" />}
            >
              Save Milestone Dates
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {errorMsg && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-start gap-2.5 text-xs text-amber-900">
          <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold block text-amber-950">
              How Date-Driven Progress Works
            </strong>
            <p className="mt-0.5 text-amber-800 leading-relaxed text-[11px]">
              Each DRT ticket evaluates all documents submitted on or before that report&apos;s cutoff date. If a document is submitted after the cutoff date, it will not count in this report and will roll forward to the next milestone report.
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
          {DRT_PROGRESS_PHASES.map((p, idx) => {
            const dateVal = localCutoffs[p.key] || '';
            const displayStr = dateVal ? formatCutoffDateDisplay(dateVal) : 'Not configured';

            return (
              <div
                key={p.key}
                className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-500">
                      0{idx + 1}.
                    </span>
                    <strong className="text-xs font-bold text-slate-800">
                      {p.label}
                    </strong>
                    {dateVal && (
                      <Badge variant="success" size="xs">
                        {displayStr}
                      </Badge>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Includes all DRT evidence received on or before midnight of this date.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <input
                      type="date"
                      value={dateVal}
                      onChange={(e) => handleChangeDate(p.key, e.target.value)}
                      className="text-xs font-mono font-medium rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-indigo-600 shadow-2xs"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
};

// Re-export under legacy name for backwards compatibility
export { ConfigureProgressCutoffsModal as ConfigureProgressYearsModal };
