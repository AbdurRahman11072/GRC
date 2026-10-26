'use client';

import React, { useState } from 'react';
import {
  useGetProjectScorecardQuery,
  useRecalculateProjectMarksMutation,
} from '../../../store/api/scorecardApi';
import { ScorecardSummaryCards } from './scorecard/ScorecardSummaryCards';
import { ScorecardTable } from './scorecard/ScorecardTable';
import { EditWeightsModal } from './scorecard/EditWeightsModal';
import { PmEvaluationModal } from './scorecard/PmEvaluationModal';

interface TabScorecardProps {
  projectId: string;
  isManagerOrAdmin?: boolean;
}

export const TabScorecard: React.FC<TabScorecardProps> = ({
  projectId,
  isManagerOrAdmin = true,
}) => {
  const [isEditWeightsOpen, setIsEditWeightsOpen] = useState(false);
  const [isPmEvaluationOpen, setIsPmEvaluationOpen] = useState(false);

  const { data, isLoading, isError, refetch } = useGetProjectScorecardQuery(projectId, {
    skip: !projectId,
  });

  const [recalculateMarks, { isLoading: isRecalculating }] = useRecalculateProjectMarksMutation();

  const handleRecalculate = async () => {
    try {
      await recalculateMarks(projectId).unwrap();
      refetch();
    } catch (err) {
      console.error('Failed to recalculate marks:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center text-xs text-slate-500 animate-pulse">
        Loading mathematical scoring matrix & ToR rollup data...
      </div>
    );
  }

  if (isError || !data?.data) {
    return (
      <div className="py-16 text-center space-y-2">
        <h3 className="text-sm font-semibold text-slate-200">Unable to load project scorecard</h3>
        <p className="text-xs text-slate-400">
          An error occurred while compiling marks. Please click Recalculate or try again.
        </p>
        <button
          onClick={() => refetch()}
          className="mt-3 text-xs text-emerald-400 hover:underline"
        >
          Retry
        </button>
      </div>
    );
  }

  const scorecard = data.data;

  return (
    <div className="space-y-6">
      {/* 4 Summary Metric Cards & Toolbar */}
      <ScorecardSummaryCards
        scorecard={scorecard}
        onOpenEditWeights={() => setIsEditWeightsOpen(true)}
        onOpenPmEvaluation={() => setIsPmEvaluationOpen(true)}
        onRecalculate={handleRecalculate}
        isRecalculating={isRecalculating}
        isManagerOrAdmin={isManagerOrAdmin}
      />

      {/* Table 1: FHL - Mark Summary (Auditee Stream) */}
      <ScorecardTable scorecard={scorecard.fhlScorecard} accentColor="blue" />

      {/* Table 2: BTRC - Mark Summary (Client Stream) */}
      <ScorecardTable scorecard={scorecard.btrcScorecard} accentColor="violet" />

      {/* Modals */}
      <EditWeightsModal
        isOpen={isEditWeightsOpen}
        onClose={() => setIsEditWeightsOpen(false)}
        projectId={projectId}
        initialClientWeight={scorecard.clientWeight}
        initialAuditeeWeight={scorecard.auditeeWeight}
        initialPmWeight={scorecard.pmWeight}
      />

      <PmEvaluationModal
        isOpen={isPmEvaluationOpen}
        onClose={() => setIsPmEvaluationOpen(false)}
        projectId={projectId}
        maxPmWeight={scorecard.pmWeight}
        initialObtained={scorecard.pmObtainedMarks}
        initialNotes={scorecard.pmEvaluationNotes}
      />
    </div>
  );
};
