'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Calendar,
  CalendarCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  FileText,
  AlertCircle,
  TrendingUp,
  SlidersHorizontal,
  ExternalLink,
  ShieldCheck,
  FileCheck2,
  Layers,
  ChevronRight,
  PlusCircle,
} from 'lucide-react';
import { Button } from '../../../../ui/Button';
import { Badge } from '../../../../ui/Badge';
import {
  DRT_PROGRESS_PHASES,
  getPhaseCutoffDate,
  formatCutoffDateDisplay,
  getDrtProgressByCutoff,
  getDrtStagePercentage,
  getDrtStageData,
  type DrtProgressPhase,
} from '../../../../../lib/drtProgressUtils';
import { formatDate } from '../../../../../lib/utils';
import type { IDRTTicket, IProject, IDRTDocument } from '../../../../../types/project.types';

export interface DrtDetailsMilestoneProgressProps {
  projectId: string;
  ticket: IDRTTicket;
  project?: IProject | null;
  auditYears?: string[];
  onOpenAddReport?: (phase?: DrtProgressPhase) => void;
  onOpenConfigCutoffs?: () => void;
}

export const DrtDetailsMilestoneProgress: React.FC<DrtDetailsMilestoneProgressProps> = ({
  projectId,
  ticket,
  project,
  auditYears = [],
  onOpenAddReport,
  onOpenConfigCutoffs,
}) => {
  const [selectedPhase, setSelectedPhase] = useState<DrtProgressPhase>('FIRST_PROGRESS');

  const progressCutoffDates = project?.progressCutoffDates;
  const docs = ticket.drtDocuments || [];

  // Precompute metrics for all 5 phases
  const phaseMetrics = DRT_PROGRESS_PHASES.map((p) => {
    const cutoffDate = getPhaseCutoffDate(p.key, progressCutoffDates);
    const cutoffDisplay = cutoffDate ? formatCutoffDateDisplay(cutoffDate) : null;
    const stageData = getDrtStageData(ticket, p.key, auditYears, null, progressCutoffDates);
    const percentage = getDrtStagePercentage(ticket, p.key, auditYears, null, progressCutoffDates);

    let cutoffTime: number | null = null;
    if (cutoffDate) {
      cutoffTime = new Date(cutoffDate).setHours(23, 59, 59, 999);
    }

    const eligibleDocs = docs.filter((d) => {
      if (!cutoffTime) return true;
      const rawDate = d.receivedDate || d.createdAt;
      if (!rawDate) return false;
      const t = new Date(rawDate).getTime();
      return !isNaN(t) && t <= cutoffTime;
    });

    const rolledForwardDocs = docs.filter((d) => {
      if (!cutoffTime) return false;
      const rawDate = d.receivedDate || d.createdAt;
      if (!rawDate) return false;
      const t = new Date(rawDate).getTime();
      return !isNaN(t) && t > cutoffTime;
    });

    const cutoffResult = cutoffDate
      ? getDrtProgressByCutoff(ticket, cutoffDate, auditYears)
      : null;

    return {
      phase: p.key,
      label: p.label,
      shortLabel: p.shortLabel,
      cutoffDate,
      cutoffDisplay,
      percentage,
      stageData,
      cutoffResult,
      eligibleDocs,
      rolledForwardDocs,
    };
  });

  // Current active milestone details
  const activeMetric =
    phaseMetrics.find((m) => m.phase === selectedPhase) || phaseMetrics[0];

  // Overall milestone stats
  const completedPhases = phaseMetrics.filter((m) => m.percentage === 100);
  const highestProgress = Math.max(...phaseMetrics.map((m) => m.percentage));
  const hasConfiguredCutoffs = Boolean(
    progressCutoffDates && Object.keys(progressCutoffDates).length > 0
  );

  const getStepColorClass = (pct: number, isSelected: boolean) => {
    if (isSelected) {
      return pct === 100
        ? 'ring-4 ring-emerald-200 border-emerald-600 bg-emerald-600 text-white'
        : pct > 0
        ? 'ring-4 ring-sky-200 border-sky-600 bg-sky-600 text-white'
        : 'ring-4 ring-indigo-200 border-indigo-600 bg-indigo-600 text-white';
    }
    if (pct === 100) {
      return 'border-emerald-500 bg-emerald-50 text-emerald-700';
    }
    if (pct > 0) {
      return 'border-sky-500 bg-sky-50 text-sky-700';
    }
    return 'border-slate-300 bg-slate-100 text-slate-500';
  };

  const getPercentageBadge = (pct: number) => {
    if (pct === 100) {
      return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    }
    if (pct >= 50) {
      return 'bg-sky-100 text-sky-800 border-sky-300';
    }
    if (pct > 0) {
      return 'bg-amber-100 text-amber-800 border-amber-300';
    }
    return 'bg-slate-100 text-slate-600 border-slate-300';
  };

  return (
    <div className="space-y-6">
      {/* Top Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Peak Progress */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Peak Milestone Progress
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900">
              {highestProgress}%
            </span>
            <span className="text-xs text-slate-500">
              {completedPhases.length}/5 Milestones Completed
            </span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${highestProgress}%` }}
            />
          </div>
        </div>

        {/* Card 2: Eligible Evidence Files */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Submitted Documents
            </span>
            <FileText className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900">
              {docs.length}
            </span>
            <span className="text-xs text-slate-500">
              {activeMetric.eligibleDocs.length} in selected milestone
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Evaluated by upload &amp; received date
          </p>
        </div>

        {/* Card 3: Multi-Year Coverage */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Annual Scope Coverage
            </span>
            <ShieldCheck className="w-4 h-4 text-sky-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900">
              {activeMetric.cutoffResult
                ? activeMetric.cutoffResult.satisfiedYears.length
                : 0}
              <span className="text-sm font-normal text-slate-500">
                /{auditYears.length || '—'}
              </span>
            </span>
            <span className="text-xs text-slate-500">Years Covered</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Target years fulfilled on or before cutoff
          </p>
        </div>

        {/* Card 4: Cutoff Dates Status */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] font-bold uppercase tracking-wider">
                Milestone Deadlines
              </span>
              <Calendar className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-xs font-semibold text-slate-800 mt-1">
              {hasConfiguredCutoffs ? 'Cutoff Schedule Active' : 'Cutoff Dates Unset'}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              PM sets cutoffs in ToR Progress
            </p>
          </div>
          <div className="pt-2">
            <Link href={`/projects/${projectId}/tor-progress`}>
              <Button
                variant="outline"
                size="xs"
                className="w-full text-indigo-700 border-indigo-200 hover:bg-indigo-50"
                rightIcon={<ChevronRight className="w-3 h-3" />}
              >
                ToR Progress Hub
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Visual Stepper / Timeline Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 sm:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-emerald-600" />
              <span>Milestone Progress Timeline (1st &ndash; 5th Progress)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Click any milestone step to examine evidence documents submitted up to that cutoff deadline.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="neutral" size="xs">
              DRT: {ticket.requestCode}
            </Badge>
            {onOpenAddReport && (
              <Button
                variant="primary"
                size="xs"
                onClick={() => onOpenAddReport(selectedPhase)}
                leftIcon={<PlusCircle className="w-3.5 h-3.5" />}
              >
                + Add Progress Report
              </Button>
            )}
            {onOpenConfigCutoffs && (
              <Button
                variant="outline"
                size="xs"
                onClick={onOpenConfigCutoffs}
                leftIcon={<SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600" />}
              >
                Configure Cutoffs
              </Button>
            )}
          </div>
        </div>

        {/* Horizontal Visual Stepper */}
        <div className="relative py-4">
          {/* Connecting Line */}
          <div className="absolute top-1/2 left-6 right-6 -translate-y-1/2 h-1 bg-slate-200 hidden md:block z-0" />

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative z-10">
            {phaseMetrics.map((step, idx) => {
              const isSelected = step.phase === selectedPhase;
              return (
                <button
                  key={step.phase}
                  type="button"
                  onClick={() => setSelectedPhase(step.phase)}
                  className={`group flex flex-col items-center text-center p-3.5 rounded-xl transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-50/90 border border-indigo-200 shadow-xs'
                      : 'hover:bg-slate-50/50 border border-transparent'
                  }`}
                >
                  {/* Step Bubble */}
                  <div
                    className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-xs transition-all ${getStepColorClass(
                      step.percentage,
                      isSelected
                    )}`}
                  >
                    {step.percentage === 100 ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <span>{idx + 1}</span>
                    )}
                  </div>

                  {/* Step Title */}
                  <div className="mt-2.5 space-y-0.5">
                    <span
                      className={`block text-xs font-bold ${
                        isSelected ? 'text-indigo-900 font-extrabold' : 'text-slate-800'
                      }`}
                    >
                      {step.shortLabel}
                    </span>

                    {/* Cutoff Date */}
                    <span className="block text-[11px] font-mono text-slate-500">
                      {step.cutoffDisplay ? (
                        <span className="text-slate-600">{step.cutoffDisplay}</span>
                      ) : (
                        <span className="italic text-slate-400">Cutoff Unset</span>
                      )}
                    </span>
                  </div>

                  {/* Progress % Badge */}
                  <div className="mt-2">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full font-mono text-[11px] font-bold border ${getPercentageBadge(
                        step.percentage
                      )}`}
                    >
                      {step.percentage}%
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Milestone Detail Pane */}
        <div className="bg-slate-50/70 rounded-xl border border-slate-200 p-5 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                  {activeMetric.shortLabel} Snapshot
                </span>
                {activeMetric.cutoffDisplay && (
                  <span className="text-xs text-slate-600 font-mono">
                    Cutoff Deadline: <strong>{activeMetric.cutoffDisplay}</strong>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Evaluation of documents and submissions logged on or prior to the milestone cutoff.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg font-mono text-xs font-bold border ${getPercentageBadge(
                  activeMetric.percentage
                )}`}
              >
                <span>Progress:</span>
                <span>{activeMetric.percentage}%</span>
              </span>
            </div>
          </div>

          {/* Satisfied Audit Years Grid (if multi-year audit) */}
          {auditYears.length > 0 && (
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block">
                Annual Audit Scope Verification for {activeMetric.shortLabel}:
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                {auditYears.map((yr) => {
                  const isCovered =
                    activeMetric.cutoffResult?.satisfiedYears.includes(yr);
                  return (
                    <span
                      key={yr}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono font-semibold border ${
                        isCovered
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-slate-100 text-slate-400 border-slate-200'
                      }`}
                    >
                      {isCovered ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                      )}
                      <span>{yr}</span>
                      <span className="text-[10px] font-normal">
                        ({isCovered ? 'Submitted' : 'Pending'})
                      </span>
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Remarks Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-lg bg-white border border-slate-200 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-indigo-600" />
                Auditor Remark / Observation
              </span>
              <p className="text-xs text-slate-700 leading-relaxed">
                {activeMetric.stageData.auditorRemark || (
                  <span className="italic text-slate-400">
                    No auditor remark recorded for this milestone snapshot.
                  </span>
                )}
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-white border border-slate-200 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1">
                <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
                Auditee Submission Note
              </span>
              <p className="text-xs text-slate-700 leading-relaxed">
                {activeMetric.stageData.auditeeRemark || (
                  <span className="italic text-slate-400">
                    No auditee submission notes recorded for this stage.
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Evidence Documents Counted Under This Milestone */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-600" />
                <span>
                  Evidence Documents Submitted on or Before Cutoff (
                  {activeMetric.eligibleDocs.length})
                </span>
              </h3>
              {activeMetric.rolledForwardDocs.length > 0 && (
                <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  {activeMetric.rolledForwardDocs.length} later doc(s) roll into next milestone
                </span>
              )}
            </div>

            {activeMetric.eligibleDocs.length > 0 ? (
              <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100/70 text-[11px] font-bold text-slate-700 border-b border-slate-200 uppercase tracking-wider">
                      <th className="py-2 px-3">File Name</th>
                      <th className="py-2 px-3 text-center">Audit Year</th>
                      <th className="py-2 px-3">Received / Upload Date</th>
                      <th className="py-2 px-3">Uploaded By</th>
                      <th className="py-2 px-3 text-center">Review Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activeMetric.eligibleDocs.map((d: IDRTDocument) => (
                      <tr key={d.id} className="hover:bg-slate-50/70">
                        <td className="py-2 px-3 font-medium text-slate-900">
                          {d.fileUrl ? (
                            <a
                              href={d.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1"
                            >
                              <span>{d.fileName}</span>
                              <ExternalLink className="w-3 h-3 shrink-0" />
                            </a>
                          ) : (
                            <span>{d.fileName}</span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-center font-mono font-semibold text-slate-700">
                          {d.periodLabel || 'General'}
                        </td>
                        <td className="py-2 px-3 text-slate-600 font-mono">
                          {formatDate(d.receivedDate || d.createdAt)}
                        </td>
                        <td className="py-2 px-3 text-slate-600">
                          {d.uploadedBy?.name || 'Authorized Submitter'}
                        </td>
                        <td className="py-2 px-3 text-center">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                              d.status === 'ACCEPTED'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : d.status === 'REVISION_REQUESTED'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-sky-50 text-sky-700 border border-sky-200'
                            }`}
                          >
                            {d.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-white border border-slate-200 text-center space-y-1">
                <AlertCircle className="w-5 h-5 text-slate-400 mx-auto" />
                <p className="text-xs font-medium text-slate-700">
                  No evidence files were submitted prior to this milestone&apos;s cutoff date.
                </p>
                <p className="text-[11px] text-slate-400">
                  Documents submitted after the cutoff date are tracked in subsequent progress reports.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
