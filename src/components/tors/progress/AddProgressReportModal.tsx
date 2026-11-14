'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  Sparkles,
  Check,
  AlertCircle,
  Clock,
  FileCheck2,
  TrendingUp,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { Modal } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import {
  DRT_PROGRESS_PHASES,
  type DrtProgressPhase,
  formatCutoffDateDisplay,
  getDrtProgressByCutoff,
} from '../../../lib/drtProgressUtils';
import { useUpdateProjectMutation } from '../../../store/api/projectApi';
import type { IDRTTicket } from '../../../types/project.types';

export interface AddProgressReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  currentCutoffs?: Record<string, string> | null;
  auditYears?: string[];
  allProjectTickets?: IDRTTicket[];
  initialPhase?: DrtProgressPhase;
  onSuccess?: () => void;
}

export const AddProgressReportModal: React.FC<AddProgressReportModalProps> = ({
  isOpen,
  onClose,
  projectId,
  currentCutoffs,
  auditYears = [],
  allProjectTickets = [],
  initialPhase,
  onSuccess,
}) => {
  const [updateProject, { isLoading: isSaving }] = useUpdateProjectMutation();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Determine the next unset milestone by default
  const defaultNextPhase = useMemo(() => {
    if (initialPhase) return initialPhase;
    const existing = currentCutoffs || {};
    const unset = DRT_PROGRESS_PHASES.find((p) => !existing[p.key]);
    return unset ? unset.key : 'FIRST_PROGRESS';
  }, [currentCutoffs, initialPhase]);

  const [selectedPhase, setSelectedPhase] = useState<DrtProgressPhase>(defaultNextPhase);
  const [cutoffDate, setCutoffDate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
      const phaseToUse = initialPhase || defaultNextPhase;
      setSelectedPhase(phaseToUse);
      const existingDate = currentCutoffs?.[phaseToUse] || '';
      if (existingDate) {
        setCutoffDate(existingDate);
      } else {
        // Default to today's date formatted as YYYY-MM-DD
        const today = new Date().toISOString().split('T')[0];
        setCutoffDate(today);
      }
      setNotes('');
    }
  }, [isOpen, currentCutoffs, initialPhase, defaultNextPhase]);

  // When user switches phase inside modal, load that phase's existing date if any
  const handleSelectPhase = (phaseKey: DrtProgressPhase) => {
    setSelectedPhase(phaseKey);
    const existing = currentCutoffs?.[phaseKey] || '';
    if (existing) {
      setCutoffDate(existing);
    } else {
      const today = new Date().toISOString().split('T')[0];
      setCutoffDate(today);
    }
  };

  // Preset date helpers
  const handleApplyPreset = (daysAhead: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    setCutoffDate(d.toISOString().split('T')[0]);
  };

  const handleApplyQuarterEnd = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentQuarter = Math.floor(currentMonth / 3);
    const quarterEndMonths = [2, 5, 8, 11]; // Mar, Jun, Sep, Dec
    const targetMonth = quarterEndMonths[currentQuarter];
    const targetYear = now.getFullYear();
    const lastDay = new Date(targetYear, targetMonth + 1, 0).getDate();
    const mStr = String(targetMonth + 1).padStart(2, '0');
    const dStr = String(lastDay).padStart(2, '0');
    setCutoffDate(`${targetYear}-${mStr}-${dStr}`);
  };

  // Real-time Impact Preview: Calculate how many tickets and docs are captured by this cutoff date
  const previewImpact = useMemo(() => {
    if (!cutoffDate || allProjectTickets.length === 0) {
      return { eligibleTicketsCount: 0, totalDocsCount: 0, avgPercentage: 0 };
    }

    let totalDocs = 0;
    let sumPercentages = 0;
    let activeTickets = 0;

    const cutoffTime = new Date(cutoffDate).setHours(23, 59, 59, 999);

    allProjectTickets.forEach((t) => {
      const res = getDrtProgressByCutoff(t, cutoffDate, auditYears);
      if (res.percentage > 0 || res.eligibleDocsCount > 0) {
        activeTickets++;
        totalDocs += res.eligibleDocsCount;
        sumPercentages += res.percentage;
      }
    });

    const avg =
      allProjectTickets.length > 0
        ? Math.round(sumPercentages / allProjectTickets.length)
        : 0;

    return {
      eligibleTicketsCount: activeTickets,
      totalDocsCount: totalDocs,
      avgPercentage: avg,
    };
  }, [cutoffDate, allProjectTickets, auditYears]);

  const activePhaseItem = DRT_PROGRESS_PHASES.find((p) => p.key === selectedPhase);

  const handleSave = async () => {
    if (!cutoffDate) {
      setErrorMsg('Please select a valid deadline cutoff date for this progress report.');
      return;
    }

    try {
      setErrorMsg(null);
      const updatedCutoffs = {
        ...(currentCutoffs || {}),
        [selectedPhase]: cutoffDate,
      };

      await updateProject({
        id: projectId,
        body: {
          progressCutoffDates: updatedCutoffs,
        },
      }).unwrap();

      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (err: unknown) {
      console.error('Failed to add progress report cutoff date:', err);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const message = (err as any)?.data?.message || 'Failed to add progress report. Please try again.';
      setErrorMsg(message);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      title="Add / Activate Progress Report"
      description="Declare a milestone progress report by setting its evaluation cutoff deadline. All DRT evidence submitted on or before this date will be calculated into this report."
      footer={
        <div className="flex items-center justify-between w-full">
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
            Activate {activePhaseItem?.shortLabel || 'Progress Report'}
          </Button>
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

        {/* Milestone Selector Grid */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
            1. Select Progress Milestone to Add / Update
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {DRT_PROGRESS_PHASES.map((p, idx) => {
              const isSelected = p.key === selectedPhase;
              const hasExisting = Boolean(currentCutoffs?.[p.key]);
              const existingDate = currentCutoffs?.[p.key];

              return (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => handleSelectPhase(p.key)}
                  className={`flex flex-col items-center text-center p-2.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs ring-2 ring-emerald-200'
                      : hasExisting
                      ? 'bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100/70'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span
                    className={`font-mono text-[10px] font-bold ${
                      isSelected ? 'text-emerald-100' : 'text-slate-400'
                    }`}
                  >
                    0{idx + 1}
                  </span>
                  <span className="text-xs font-bold mt-0.5">{p.shortLabel}</span>
                  <span
                    className={`text-[9px] mt-1 font-mono truncate max-w-full ${
                      isSelected
                        ? 'text-emerald-100'
                        : hasExisting
                        ? 'text-emerald-700 font-semibold'
                        : 'text-slate-400 italic'
                    }`}
                  >
                    {hasExisting && existingDate
                      ? formatCutoffDateDisplay(existingDate)
                      : 'Unset'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Cutoff Date Selection Card */}
        <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                2. Evaluation Cutoff Deadline Date
              </label>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Evidence received on or prior to midnight of this date counts toward{' '}
                <strong>{activePhaseItem?.label}</strong>.
              </p>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={() => handleApplyPreset(0)}
                className="text-[10px] h-6 px-2"
              >
                Today
              </Button>
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={() => handleApplyPreset(30)}
                className="text-[10px] h-6 px-2"
              >
                +30 Days
              </Button>
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={handleApplyQuarterEnd}
                className="text-[10px] h-6 px-2"
              >
                End of Quarter
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <input
                type="date"
                value={cutoffDate}
                onChange={(e) => setCutoffDate(e.target.value)}
                className="w-full text-xs font-mono font-medium rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:outline-none focus:border-indigo-600 shadow-2xs"
              />
            </div>
            {cutoffDate && (
              <Badge variant="success" size="sm">
                Deadline: {formatCutoffDateDisplay(cutoffDate)}
              </Badge>
            )}
          </div>
        </div>

        {/* Live Impact Preview */}
        {allProjectTickets.length > 0 && cutoffDate && (
          <div className="p-3.5 bg-indigo-50/60 border border-indigo-200/80 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
                Live Scope Preview as of {formatCutoffDateDisplay(cutoffDate)}:
              </span>
              <span className="text-xs font-mono font-bold text-indigo-700 bg-white px-2 py-0.5 rounded border border-indigo-200">
                Avg Completion: {previewImpact.avgPercentage}%
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white/80 p-2 rounded-lg border border-indigo-100 flex items-center justify-between">
                <span className="text-slate-600">Active DRTs Captured:</span>
                <strong className="font-mono text-indigo-900">
                  {previewImpact.eligibleTicketsCount} / {allProjectTickets.length}
                </strong>
              </div>
              <div className="bg-white/80 p-2 rounded-lg border border-indigo-100 flex items-center justify-between">
                <span className="text-slate-600">Evidence Files Counted:</span>
                <strong className="font-mono text-emerald-700">
                  {previewImpact.totalDocsCount} documents
                </strong>
              </div>
            </div>
          </div>
        )}

        {/* Explanatory Rule Banner */}
        <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-start gap-2.5 text-xs text-amber-900">
          <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-[11px] leading-relaxed">
            <strong className="block font-semibold text-amber-950">
              Audit Integrity &amp; Roll-Forward Rule:
            </strong>
            Documents submitted after this cutoff date will be safely preserved but will not count toward this milestone report; they will automatically roll forward into the subsequent report.
          </div>
        </div>
      </div>
    </Modal>
  );
};
