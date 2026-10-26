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
  const fhlAch = scorecard.fhlScorecard.achievementRate;
  const btrcAch = scorecard.btrcScorecard.achievementRate;
  const pmAch =
    scorecard.pmWeight > 0
      ? Math.round((scorecard.pmObtainedMarks / scorecard.pmWeight) * 100)
      : 0;
  const overallRate = Math.round((scorecard.finalProjectScore / 100) * 100);

  return (
    <div className="space-y-4">
      {/* Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 backdrop-blur-sm">
        <div>
          <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-400" />
            Project Mark Scorecard & Weight Breakdown
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Macro evaluation across Auditee (FHL), Client (BTRC), and PM Discretionary performance envelopes.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isManagerOrAdmin && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenEditWeights}
                className="text-xs h-8 border-slate-700 hover:bg-slate-800 text-slate-200"
              >
                <Sliders className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
                Configure Weights
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenPmEvaluation}
                className="text-xs h-8 border-slate-700 hover:bg-slate-800 text-slate-200"
              >
                <UserCheck className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
                PM Discretionary ({scorecard.pmObtainedMarks}/{scorecard.pmWeight})
              </Button>
            </>
          )}
          <Button
            variant="primary"
            size="sm"
            onClick={onRecalculate}
            disabled={isRecalculating}
            className="text-xs h-8 bg-emerald-600 hover:bg-emerald-500 text-white"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isRecalculating ? 'animate-spin' : ''}`} />
            Recalculate Rollup
          </Button>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: FHL Stream */}
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-blue-400" />
              FHL (Auditee Stream)
            </span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
              {fhlAch}%
            </span>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-slate-100">
                {scorecard.fhlScorecard.totalObtainedMarks.toFixed(2)}
              </span>
              <span className="text-xs text-slate-400">/ {scorecard.auditeeWeight.toFixed(2)} marks</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, fhlAch)}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 mt-1.5">
              <span>Col: {scorecard.fhlScorecard.collectionObtained.toFixed(1)}/{scorecard.fhlScorecard.collectionAllocated.toFixed(1)}</span>
              <span>Ana: {scorecard.fhlScorecard.analysisObtained.toFixed(1)}/{scorecard.fhlScorecard.analysisAllocated.toFixed(1)}</span>
            </div>
          </div>
        </div>

        {/* Card 2: BTRC Stream */}
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-violet-400" />
              BTRC (Client Stream)
            </span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">
              {btrcAch}%
            </span>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-slate-100">
                {scorecard.btrcScorecard.totalObtainedMarks.toFixed(2)}
              </span>
              <span className="text-xs text-slate-400">/ {scorecard.clientWeight.toFixed(2)} marks</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-violet-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, btrcAch)}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 mt-1.5">
              <span>Col: {scorecard.btrcScorecard.collectionObtained.toFixed(1)}/{scorecard.btrcScorecard.collectionAllocated.toFixed(1)}</span>
              <span>Ana: {scorecard.btrcScorecard.analysisObtained.toFixed(1)}/{scorecard.btrcScorecard.analysisAllocated.toFixed(1)}</span>
            </div>
          </div>
        </div>

        {/* Card 3: PM Discretionary */}
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-amber-400" />
              PM Discretionary
            </span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              {pmAch}%
            </span>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-slate-100">
                {scorecard.pmObtainedMarks.toFixed(2)}
              </span>
              <span className="text-xs text-slate-400">/ {scorecard.pmWeight.toFixed(2)} marks</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-amber-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, pmAch)}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5 truncate">
              {scorecard.pmEvaluationNotes ? scorecard.pmEvaluationNotes : 'Team adherence & engagement mark'}
            </p>
          </div>
        </div>

        {/* Card 4: Overall Final Score */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-emerald-500/30 rounded-xl p-4 flex flex-col justify-between shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Final Audit Mark
            </span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {overallRate}%
            </span>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-white">
                {scorecard.finalProjectScore.toFixed(2)}
              </span>
              <span className="text-xs text-emerald-400 font-medium">/ 100.00</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 mt-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, overallRate)}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 mt-1.5">
              <span>Audits: {scorecard.combinedAuditTotalMarks.toFixed(1)}/80</span>
              <span>PM: {scorecard.pmObtainedMarks.toFixed(1)}/20</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
