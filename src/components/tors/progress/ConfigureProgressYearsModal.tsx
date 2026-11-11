'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  Check,
  RotateCcw,
  SlidersHorizontal,
  Trash2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { Modal } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { DRT_PROGRESS_PHASES, type DrtProgressPhase } from '../../../lib/drtProgressUtils';
import { useUpdateProjectMutation } from '../../../store/api/projectApi';

export interface ConfigureProgressYearsModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  auditYears: string[];
  currentMapping?: Record<string, string[]> | null;
}

export const ConfigureProgressYearsModal: React.FC<ConfigureProgressYearsModalProps> = ({
  isOpen,
  onClose,
  projectId,
  auditYears,
  currentMapping,
}) => {
  const [updateProject, { isLoading: isSaving }] = useUpdateProjectMutation();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sorted years in descending order (e.g. 2026, 2025, 2024...)
  const sortedYears = useMemo(() => {
    return [...auditYears].sort((a, b) => b.localeCompare(a));
  }, [auditYears]);

  // Generate default reverse mapping from available auditYears
  const defaultMapping = useMemo(() => {
    const map: Record<string, string[]> = {};
    DRT_PROGRESS_PHASES.forEach((p, index) => {
      if (sortedYears[index]) {
        map[p.key] = [sortedYears[index]];
      } else {
        map[p.key] = [];
      }
    });
    return map;
  }, [sortedYears]);

  // Local state for the year mapping
  const [localMapping, setLocalMapping] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
      if (currentMapping && Object.keys(currentMapping).length > 0) {
        // Deep copy
        const copy: Record<string, string[]> = {};
        DRT_PROGRESS_PHASES.forEach((p) => {
          copy[p.key] = Array.isArray(currentMapping[p.key]) ? [...currentMapping[p.key]] : [];
        });
        setLocalMapping(copy);
      } else {
        setLocalMapping(defaultMapping);
      }
    }
  }, [isOpen, currentMapping, defaultMapping]);

  // Toggle year selection for a stage
  const handleToggleYear = (phaseKey: DrtProgressPhase, year: string) => {
    setLocalMapping((prev) => {
      const current = prev[phaseKey] || [];
      const exists = current.includes(year);
      const updated = exists
        ? current.filter((y) => y !== year)
        : [...current, year].sort((a, b) => b.localeCompare(a));
      return { ...prev, [phaseKey]: updated };
    });
  };

  // Quick Action: Reset to default reverse chronological mapping
  const handleResetToDefault = () => {
    setLocalMapping(defaultMapping);
  };

  // Quick Action: Clear all assigned years
  const handleClearAll = () => {
    const cleared: Record<string, string[]> = {};
    DRT_PROGRESS_PHASES.forEach((p) => {
      cleared[p.key] = [];
    });
    setLocalMapping(cleared);
  };

  // Check unassigned years
  const assignedYearsSet = useMemo(() => {
    const set = new Set<string>();
    Object.values(localMapping).forEach((years) => {
      years.forEach((y) => set.add(y));
    });
    return set;
  }, [localMapping]);

  const unassignedYears = useMemo(() => {
    return sortedYears.filter((y) => !assignedYearsSet.has(y));
  }, [sortedYears, assignedYearsSet]);

  const handleSave = async () => {
    try {
      setErrorMsg(null);
      await updateProject({
        id: projectId,
        body: {
          progressYearMapping: localMapping,
        },
      }).unwrap();
      onClose();
    } catch (err: unknown) {
      console.error('Failed to update progress year mapping:', err);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const message = (err as any)?.data?.message || 'Failed to save progress year mapping. Please try again.';
      setErrorMsg(message);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      title="Configure Progress Report Years"
      description="Assign which audit year(s) are tracked by each of the 5 progress reports. Stages can track a single year or combine multiple years (e.g. 1st Progress = 2025, 2026)."
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={handleResetToDefault}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              title="Reset to 1-to-1 reverse chronological order"
            >
              Auto-Assign (Reverse)
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={handleClearAll}
              leftIcon={<Trash2 className="w-3.5 h-3.5 text-rose-500" />}
            >
              Clear All
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleSave}
              isLoading={isSaving}
              leftIcon={<Check className="w-4 h-4" />}
            >
              Save Configuration
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

        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <span className="font-semibold text-slate-700">Audit Coverage Years:</span>
            <span className="font-mono text-slate-600">
              {sortedYears.length > 0 ? sortedYears.join(', ') : 'No audit years configured'}
            </span>
          </div>
          {unassignedYears.length > 0 ? (
            <Badge variant="warning" size="xs">
              {unassignedYears.length} unassigned ({unassignedYears.join(', ')})
            </Badge>
          ) : (
            <Badge variant="success" size="xs">
              All {sortedYears.length} years assigned
            </Badge>
          )}
        </div>

        {/* Progress Stages Grid */}
        <div className="space-y-3">
          {DRT_PROGRESS_PHASES.map((phase) => {
            const assigned = localMapping[phase.key] || [];
            const isAssigned = assigned.length > 0;

            return (
              <div
                key={phase.key}
                className={`p-3.5 rounded-xl border transition-all ${
                  isAssigned
                    ? 'bg-white border-slate-300 shadow-2xs'
                    : 'bg-slate-50/60 border-dashed border-slate-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800">
                      {phase.label}
                    </span>
                    <span className="text-[11px] text-slate-400">({phase.shortLabel})</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {isAssigned ? (
                      <Badge variant="info" size="xs">
                        {assigned.length} {assigned.length === 1 ? 'Year' : 'Years'} ({assigned.join(', ')})
                      </Badge>
                    ) : (
                      <span className="text-[11px] italic text-slate-400">
                        No years assigned
                      </span>
                    )}
                  </div>
                </div>

                {/* Years Selector Pills */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {sortedYears.map((year) => {
                    const isSelected = assigned.includes(year);
                    return (
                      <button
                        key={year}
                        type="button"
                        onClick={() => handleToggleYear(phase.key, year)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-2xs border border-indigo-600'
                            : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                        <span>{year}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-3 rounded-lg bg-indigo-50/60 border border-indigo-100 text-[11px] text-indigo-900 leading-relaxed flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
          <div>
            <strong>How Progress Scoring Works with Multiple Years:</strong>
            <p className="mt-0.5 text-indigo-800">
              When multiple years are assigned to a progress stage (e.g., 2025 and 2026 for 1st Progress), the completeness percentage for each linked DRT is averaged across those years. The ToR progress percentage will automatically reflect this average across all assigned years.
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
};
