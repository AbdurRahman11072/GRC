import { prisma } from '../../../lib/prisma';
import type {
  IScorecardRow,
  IStreamScorecardData,
  IProjectScorecardResponse,
} from '../tor/torRollup.types';

const round2 = (val: number) => Math.round(val * 100) / 100;

export const getProjectScorecard = async (
  projectId: string
): Promise<IProjectScorecardResponse | null> => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      projectName: true,
      clientWeight: true,
      auditeeWeight: true,
      pmWeight: true,
      pmObtainedMarks: true,
      pmEvaluationNotes: true,
      pmEvaluatedAt: true,
      pmEvaluatedBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      tors: {
        where: { parentId: null },
        orderBy: { sortOrder: 'asc' },
        select: {
          id: true,
          code: true,
          title: true,
          sortOrder: true,
          fhlCollectionAllocated: true,
          fhlCollectionObtained: true,
          fhlAnalysisAllocated: true,
          fhlAnalysisObtained: true,
          btrcCollectionAllocated: true,
          btrcCollectionObtained: true,
          btrcAnalysisAllocated: true,
          btrcAnalysisObtained: true,
        },
      },
    },
  });

  if (!project) return null;

  const fhlRows: IScorecardRow[] = project.tors.map((t, idx) => {
    const colAlloc = t.fhlCollectionAllocated || 0;
    const anaAlloc = t.fhlAnalysisAllocated || 0;
    const colObt = t.fhlCollectionObtained || 0;
    const anaObt = t.fhlAnalysisObtained || 0;
    const totalAlloc = round2(colAlloc + anaAlloc);
    const totalObt = round2(colObt + anaObt);
    return {
      torId: t.id,
      code: t.code,
      title: t.title,
      sortOrder: t.sortOrder ?? idx + 1,
      collectionAllocated: round2(colAlloc),
      collectionObtained: round2(colObt),
      analysisAllocated: round2(anaAlloc),
      analysisObtained: round2(anaObt),
      dataCollectionAllocated: round2(colAlloc),
      dataAnalysisAllocated: round2(anaAlloc),
      totalAllocated: totalAlloc,
      dataCollectionObtained: round2(colObt),
      dataAnalysisObtained: round2(anaObt),
      totalObtained: totalObt,
      achievementPercentage: totalAlloc > 0 ? Math.round((totalObt / totalAlloc) * 100) : 0,
    };
  });

  const btrcRows: IScorecardRow[] = project.tors.map((t, idx) => {
    const colAlloc = t.btrcCollectionAllocated || 0;
    const anaAlloc = t.btrcAnalysisAllocated || 0;
    const colObt = t.btrcCollectionObtained || 0;
    const anaObt = t.btrcAnalysisObtained || 0;
    const totalAlloc = round2(colAlloc + anaAlloc);
    const totalObt = round2(colObt + anaObt);
    return {
      torId: t.id,
      code: t.code,
      title: t.title,
      sortOrder: t.sortOrder ?? idx + 1,
      collectionAllocated: round2(colAlloc),
      collectionObtained: round2(colObt),
      analysisAllocated: round2(anaAlloc),
      analysisObtained: round2(anaObt),
      dataCollectionAllocated: round2(colAlloc),
      dataAnalysisAllocated: round2(anaAlloc),
      totalAllocated: totalAlloc,
      dataCollectionObtained: round2(colObt),
      dataAnalysisObtained: round2(anaObt),
      totalObtained: totalObt,
      achievementPercentage: totalAlloc > 0 ? Math.round((totalObt / totalAlloc) * 100) : 0,
    };
  });

  const fhlAllocatedCol = round2(fhlRows.reduce((acc, r) => acc + r.dataCollectionAllocated, 0));
  const fhlAllocatedAna = round2(fhlRows.reduce((acc, r) => acc + r.dataAnalysisAllocated, 0));
  const fhlObtainedCol = round2(fhlRows.reduce((acc, r) => acc + r.dataCollectionObtained, 0));
  const fhlObtainedAna = round2(fhlRows.reduce((acc, r) => acc + r.dataAnalysisObtained, 0));

  const btrcAllocatedCol = round2(btrcRows.reduce((acc, r) => acc + r.dataCollectionAllocated, 0));
  const btrcAllocatedAna = round2(btrcRows.reduce((acc, r) => acc + r.dataAnalysisAllocated, 0));
  const btrcObtainedCol = round2(btrcRows.reduce((acc, r) => acc + r.dataCollectionObtained, 0));
  const btrcObtainedAna = round2(btrcRows.reduce((acc, r) => acc + r.dataAnalysisObtained, 0));

  const fhlAllocatedTotal = round2(fhlAllocatedCol + fhlAllocatedAna);
  const fhlTotalObtained = round2(fhlObtainedCol + fhlObtainedAna);
  const btrcAllocatedTotal = round2(btrcAllocatedCol + btrcAllocatedAna);
  const btrcTotalObtained = round2(btrcObtainedCol + btrcObtainedAna);
  const pmObtained = round2(project.pmObtainedMarks || 0);

  const fhlAchievementRate = fhlAllocatedTotal > 0 ? Math.round((fhlTotalObtained / fhlAllocatedTotal) * 100) : 0;
  const btrcAchievementRate = btrcAllocatedTotal > 0 ? Math.round((btrcTotalObtained / btrcAllocatedTotal) * 100) : 0;

  const fhlScorecard: IStreamScorecardData = {
    streamBucket: 'AUDITEE',
    title: 'FHL Stream - Auditee Marks Breakdown',
    totalAllocatedMarks: fhlAllocatedTotal || project.auditeeWeight || 50,
    totalObtainedMarks: fhlTotalObtained,
    collectionAllocated: fhlAllocatedCol,
    collectionObtained: fhlObtainedCol,
    analysisAllocated: fhlAllocatedAna,
    analysisObtained: fhlObtainedAna,
    achievementRate: fhlAchievementRate,
    rows: fhlRows,
  };

  const btrcScorecard: IStreamScorecardData = {
    streamBucket: 'CLIENT',
    title: 'BTRC Stream - Client Marks Breakdown',
    totalAllocatedMarks: btrcAllocatedTotal || project.clientWeight || 40,
    totalObtainedMarks: btrcTotalObtained,
    collectionAllocated: btrcAllocatedCol,
    collectionObtained: btrcObtainedCol,
    analysisAllocated: btrcAllocatedAna,
    analysisObtained: btrcObtainedAna,
    achievementRate: btrcAchievementRate,
    rows: btrcRows,
  };

  return {
    projectId: project.id,
    projectName: project.projectName || 'Project Scorecard',
    clientWeight: project.clientWeight,
    auditeeWeight: project.auditeeWeight,
    pmWeight: project.pmWeight,
    pmObtainedMarks: pmObtained,
    pmEvaluationNotes: project.pmEvaluationNotes,
    pmEvaluatedAt: project.pmEvaluatedAt,
    pmEvaluatedBy: project.pmEvaluatedBy,
    fhlScorecard,
    btrcScorecard,
    combinedAuditTotalMarks: round2(fhlTotalObtained + btrcTotalObtained),
    finalProjectScore: round2(fhlTotalObtained + btrcTotalObtained + pmObtained),
    totalProjectMarks: 100.0,
    fhl: {
      allocated: {
        collection: fhlAllocatedCol,
        analysis: fhlAllocatedAna,
        total: fhlAllocatedTotal,
      },
      obtained: {
        collection: fhlObtainedCol,
        analysis: fhlObtainedAna,
        total: fhlTotalObtained,
      },
      rows: fhlRows,
    },
    btrc: {
      allocated: {
        collection: btrcAllocatedCol,
        analysis: btrcAllocatedAna,
        total: btrcAllocatedTotal,
      },
      obtained: {
        collection: btrcObtainedCol,
        analysis: btrcObtainedAna,
        total: btrcTotalObtained,
      },
      rows: btrcRows,
    },
    pm: {
      allocated: project.pmWeight,
      obtained: pmObtained,
      notes: project.pmEvaluationNotes,
      evaluatedAt: project.pmEvaluatedAt,
    },
    grandTotal: {
      allocated: 100.0,
      obtained: round2(fhlTotalObtained + btrcTotalObtained + pmObtained),
    },
  };
};
