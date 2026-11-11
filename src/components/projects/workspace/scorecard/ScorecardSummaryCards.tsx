'use client';

import React from 'react';
import { Award, Building2, Sliders, RefreshCw, UserCheck, CheckCircle2 } from 'lucide-react';
import { Button } from '../../../ui/Button';
import type { IProjectScorecard } from '../../../../types/scorecard.types';

interface ScorecardSummaryCardsProps {
  scorecard: IProjectScorecard;
  onOpenEditWeights: () => void;
  onOpenPmEvaluation: () => void;
  onRecalculate: () => void;
  isRecalculating: boolean;
  isManagerOrAdmin: boolean;
}

export const ScorecardSummaryCards: React.FC<ScorecardSummaryCardsProps> = ({
  scorecard,
  onOpenEditWeights,
  onOpenPmEvaluation,
  onRecalculate,
  isRecalculating,
  isManagerOrAdmin,
}) => {
  const fhlAch = scorecard?.fhlScorecard?.achievementRate ?? 0;
  const btrcAch = scorecard?.btrcScorecard?.achievementRate ?? 0;
  const pmAch =
    (scorecard?.pmWeight ?? 0) > 0
      ? Math.round(((scorecard?.pmObtainedMarks ?? 0) / scorecard.pmWeight) * 100)
      : 0;
  const overallRate = Math.round(((scorecard?.finalProjectScore ?? 0) / 100) * 100);

  return (
    <div className="space-y-4">
      {/* Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-4 h-4 text-indigo-600" />
            Project Mark Scorecard &amp; Weight Breakdown
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Macro evaluation across Auditee (FHL), Client (BTRC), and PM Discretionary performance envelopes.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {isManagerOrAdmin && (
            <>
              <Button
                variant="outline"
                size="xs"
                onClick={onOpenEditWeights}
                leftIcon={<Sliders className="w-3.5 h-3.5 text-indigo-600" />}
              >
                Configure Weights
              </Button>
              <Button
                variant="outline"
                size="xs"
                onClick={onOpenPmEvaluation}
                leftIcon={<UserCheck className="w-3.5 h-3.5 text-amber-600" />}
              >
                PM Discretionary ({(scorecard?.pmObtainedMarks ?? 0).toFixed(1)}/{(scorecard?.pmWeight ?? 0).toFixed(0)})
              </Button>
            </>
          )}
          <Button
            variant="primary"
            size="xs"
            onClick={onRecalculate}
            disabled={isRecalculating}
            isLoading={isRecalculating}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isRecalculating ? 'animate-spin' : ''}`} />}
          >
            Recalculate Rollup
          </Button>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: FHL Stream (Auditee) */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between shadow-2xs hover:border-emerald-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-emerald-600" />
              FHL (Auditee Stream)
            </span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              {fhlAch}%
            </span>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold font-mono text-slate-900">
                {(scorecard?.fhlScorecard?.totalObtainedMarks ?? 0).toFixed(2)}
              </span>
              <span className="text-xs text-slate-500 font-medium">/ {(scorecard?.auditeeWeight ?? 0).toFixed(2)} marks</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, fhlAch)}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-500 font-medium mt-2">
              <span>Col: <strong className="text-slate-700 font-mono">{(scorecard?.fhlScorecard?.collectionObtained ?? 0).toFixed(1)}/{(scorecard?.fhlScorecard?.collectionAllocated ?? 0).toFixed(1)}</strong></span>
              <span>Ana: <strong className="text-slate-700 font-mono">{(scorecard?.fhlScorecard?.analysisObtained ?? 0).toFixed(1)}/{(scorecard?.fhlScorecard?.analysisAllocated ?? 0).toFixed(1)}</strong></span>
            </div>
          </div>
        </div>

        {/* Card 2: BTRC Stream (Client) */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between shadow-2xs hover:border-sky-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-sky-600" />
              BTRC (Client Stream)
            </span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
              {btrcAch}%
            </span>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold font-mono text-slate-900">
                {(scorecard?.btrcScorecard?.totalObtainedMarks ?? 0).toFixed(2)}
              </span>
              <span className="text-xs text-slate-500 font-medium">/ {(scorecard?.clientWeight ?? 0).toFixed(2)} marks</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden">
              <div
                className="bg-sky-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, btrcAch)}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-500 font-medium mt-2">
              <span>Col: <strong className="text-slate-700 font-mono">{(scorecard?.btrcScorecard?.collectionObtained ?? 0).toFixed(1)}/{(scorecard?.btrcScorecard?.collectionAllocated ?? 0).toFixed(1)}</strong></span>
              <span>Ana: <strong className="text-slate-700 font-mono">{(scorecard?.btrcScorecard?.analysisObtained ?? 0).toFixed(1)}/{(scorecard?.btrcScorecard?.analysisAllocated ?? 0).toFixed(1)}</strong></span>
            </div>
          </div>
        </div>

        {/* Card 3: PM Discretionary */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between shadow-2xs hover:border-amber-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-amber-600" />
              PM Discretionary
            </span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              {pmAch}%
            </span>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold font-mono text-slate-900">
                {(scorecard?.pmObtainedMarks ?? 0).toFixed(2)}
              </span>
              <span className="text-xs text-slate-500 font-medium">/ {(scorecard?.pmWeight ?? 0).toFixed(2)} marks</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden">
              <div
                className="bg-amber-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, pmAch)}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-2 truncate">
              {scorecard?.pmEvaluationNotes ? scorecard.pmEvaluationNotes : 'Team adherence & cooperation mark'}
            </p>
          </div>
        </div>

        {/* Card 4: Overall Final Score */}
        <div className="bg-gradient-to-br from-indigo-50/90 via-white to-emerald-50/60 border border-indigo-200/80 rounded-xl p-4 flex flex-col justify-between shadow-2xs hover:border-indigo-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-indigo-600" />
              Final Audit Mark
            </span>
            <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-600 text-white shadow-2xs">
              {overallRate}%
            </span>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black font-mono text-slate-900">
                {(scorecard?.finalProjectScore ?? 0).toFixed(2)}
              </span>
              <span className="text-xs font-bold text-indigo-600">/ 100.00</span>
            </div>
            <div className="w-full bg-indigo-100 rounded-full h-2.5 mt-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-600 to-emerald-500 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, overallRate)}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-600 font-medium mt-2">
              <span>Audits: <strong className="text-slate-800 font-mono">{(scorecard?.combinedAuditTotalMarks ?? 0).toFixed(1)}/80</strong></span>
              <span>PM: <strong className="text-slate-800 font-mono">{(scorecard?.pmObtainedMarks ?? 0).toFixed(1)}/20</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
