import { prisma } from '../../../lib/prisma';
import type {
  IScorecardRow,
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
      clientWeight: true,
      auditeeWeight: true,
      pmWeight: true,
      pmObtainedMarks: true,
      pmEvaluationNotes: true,
      pmEvaluatedAt: true,
      tors: {
        where: { parentId: null },
        orderBy: { sortOrder: 'asc' },
        select: {
          id: true,
          code: true,
          title: true,
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

  const fhlRows: IScorecardRow[] = project.tors.map((t) => {
    const colAlloc = t.fhlCollectionAllocated || 0;
    const anaAlloc = t.fhlAnalysisAllocated || 0;
    const colObt = t.fhlCollectionObtained || 0;
    const anaObt = t.fhlAnalysisObtained || 0;
    return {
      torId: t.id,
      code: t.code,
      title: t.title,
      dataCollectionAllocated: round2(colAlloc),
      dataAnalysisAllocated: round2(anaAlloc),
      totalAllocated: round2(colAlloc + anaAlloc),
      dataCollectionObtained: round2(colObt),
      dataAnalysisObtained: round2(anaObt),
      totalObtained: round2(colObt + anaObt),
    };
  });

  const btrcRows: IScorecardRow[] = project.tors.map((t) => {
    const colAlloc = t.btrcCollectionAllocated || 0;
    const anaAlloc = t.btrcAnalysisAllocated || 0;
    const colObt = t.btrcCollectionObtained || 0;
    const anaObt = t.btrcAnalysisObtained || 0;
    return {
      torId: t.id,
      code: t.code,
      title: t.title,
      dataCollectionAllocated: round2(colAlloc),
      dataAnalysisAllocated: round2(anaAlloc),
      totalAllocated: round2(colAlloc + anaAlloc),
      dataCollectionObtained: round2(colObt),
      dataAnalysisObtained: round2(anaObt),
      totalObtained: round2(colObt + anaObt),
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

  const fhlTotalObtained = round2(fhlObtainedCol + fhlObtainedAna);
  const btrcTotalObtained = round2(btrcObtainedCol + btrcObtainedAna);
  const pmObtained = round2(project.pmObtainedMarks || 0);

  return {
    projectId: project.id,
    fhl: {
      allocated: {
        collection: fhlAllocatedCol,
        analysis: fhlAllocatedAna,
        total: round2(fhlAllocatedCol + fhlAllocatedAna),
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
        total: round2(btrcAllocatedCol + btrcAllocatedAna),
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
