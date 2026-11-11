'use client';

import React, { useState, useMemo } from 'react';
import {
  useGetProjectScorecardQuery,
  useRecalculateProjectMarksMutation,
} from '../../../store/api/scorecardApi';
import { ScorecardSummaryCards } from './scorecard/ScorecardSummaryCards';
import { ScorecardTable } from './scorecard/ScorecardTable';
import { EditWeightsModal } from './scorecard/EditWeightsModal';
import { PmEvaluationModal } from './scorecard/PmEvaluationModal';
import { Button } from '../../ui/Button';
import type { IProjectScorecard } from '../../../types/scorecard.types';

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

  const rawScorecard = data?.data;

  // Normalize scorecard in case an older or alternative payload shape is received
  const scorecard: IProjectScorecard | null = useMemo(() => {
    if (!rawScorecard) return null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw = rawScorecard as any;
    if (raw.fhlScorecard && raw.btrcScorecard) {
      return raw as IProjectScorecard;
    }

    const fhlAllocTotal = raw.fhl?.allocated?.total ?? 50;
    const fhlObtTotal = raw.fhl?.obtained?.total ?? 0;
    const btrcAllocTotal = raw.btrc?.allocated?.total ?? 40;
    const btrcObtTotal = raw.btrc?.obtained?.total ?? 0;
    const pmObt = raw.pm?.obtained ?? raw.pmObtainedMarks ?? 0;
    const pmAlloc = raw.pm?.allocated ?? raw.pmWeight ?? 10;

    return {
      projectId: raw.projectId || projectId,
      projectName: raw.projectName || 'Project Scorecard',
      clientWeight: raw.clientWeight ?? btrcAllocTotal,
      auditeeWeight: raw.auditeeWeight ?? fhlAllocTotal,
      pmWeight: pmAlloc,
      pmObtainedMarks: pmObt,
      pmEvaluationNotes: raw.pm?.notes ?? raw.pmEvaluationNotes,
      pmEvaluatedAt: raw.pm?.evaluatedAt ?? raw.pmEvaluatedAt,
      pmEvaluatedBy: raw.pmEvaluatedBy,
      fhlScorecard: raw.fhlScorecard || {
        streamBucket: 'AUDITEE',
        title: 'FHL Stream - Auditee Marks Breakdown',
        totalAllocatedMarks: fhlAllocTotal,
        totalObtainedMarks: fhlObtTotal,
        collectionAllocated: raw.fhl?.allocated?.collection ?? 0,
        collectionObtained: raw.fhl?.obtained?.collection ?? 0,
        analysisAllocated: raw.fhl?.allocated?.analysis ?? 0,
        analysisObtained: raw.fhl?.obtained?.analysis ?? 0,
        achievementRate: fhlAllocTotal > 0 ? Math.round((fhlObtTotal / fhlAllocTotal) * 100) : 0,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        rows: (raw.fhl?.rows || []).map((r: any, idx: number) => ({
          torId: r.torId,
          code: r.code,
          title: r.title,
          sortOrder: idx + 1,
          collectionAllocated: r.collectionAllocated ?? r.dataCollectionAllocated ?? 0,
          collectionObtained: r.collectionObtained ?? r.dataCollectionObtained ?? 0,
          analysisAllocated: r.analysisAllocated ?? r.dataAnalysisAllocated ?? 0,
          analysisObtained: r.analysisObtained ?? r.dataAnalysisObtained ?? 0,
          totalAllocated: r.totalAllocated ?? 0,
          totalObtained: r.totalObtained ?? 0,
          achievementPercentage: r.totalAllocated > 0 ? Math.round((r.totalObtained / r.totalAllocated) * 100) : 0,
        })),
      },
      btrcScorecard: raw.btrcScorecard || {
        streamBucket: 'CLIENT',
        title: 'BTRC Stream - Client Marks Breakdown',
        totalAllocatedMarks: btrcAllocTotal,
        totalObtainedMarks: btrcObtTotal,
        collectionAllocated: raw.btrc?.allocated?.collection ?? 0,
        collectionObtained: raw.btrc?.obtained?.collection ?? 0,
        analysisAllocated: raw.btrc?.allocated?.analysis ?? 0,
        analysisObtained: raw.btrc?.obtained?.analysis ?? 0,
        achievementRate: btrcAllocTotal > 0 ? Math.round((btrcObtTotal / btrcAllocTotal) * 100) : 0,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        rows: (raw.btrc?.rows || []).map((r: any, idx: number) => ({
          torId: r.torId,
          code: r.code,
          title: r.title,
          sortOrder: idx + 1,
          collectionAllocated: r.collectionAllocated ?? r.dataCollectionAllocated ?? 0,
          collectionObtained: r.collectionObtained ?? r.dataCollectionObtained ?? 0,
          analysisAllocated: r.analysisAllocated ?? r.dataAnalysisAllocated ?? 0,
          analysisObtained: r.analysisObtained ?? r.dataAnalysisObtained ?? 0,
          totalAllocated: r.totalAllocated ?? 0,
          totalObtained: r.totalObtained ?? 0,
          achievementPercentage: r.totalAllocated > 0 ? Math.round((r.totalObtained / r.totalAllocated) * 100) : 0,
        })),
      },
      combinedAuditTotalMarks: raw.combinedAuditTotalMarks ?? (fhlObtTotal + btrcObtTotal),
      finalProjectScore: raw.finalProjectScore ?? (raw.grandTotal?.obtained ?? (fhlObtTotal + btrcObtTotal + pmObt)),
      totalProjectMarks: raw.totalProjectMarks ?? 100,
    };
  }, [rawScorecard, projectId]);

  if (isLoading) {
    return (
      <div className="py-24 text-center text-xs text-slate-500 animate-pulse">
        Loading mathematical scoring matrix & ToR rollup data...
      </div>
    );
  }

  if (isError || !scorecard) {
    return (
      <div className="p-12 text-center space-y-2 bg-white rounded-xl border border-slate-200 shadow-2xs max-w-lg mx-auto my-8">
        <h3 className="text-sm font-bold text-slate-900">Unable to load project scorecard</h3>
        <p className="text-xs text-slate-500">
          An error occurred while compiling marks. Please click Recalculate or try again.
        </p>
        <div className="pt-2">
          <Button
            variant="outline"
            size="xs"
            onClick={() => refetch()}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

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
