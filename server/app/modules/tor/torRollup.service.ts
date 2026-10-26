import { prisma } from '../../../lib/prisma';
import type { ITorMarksSummary } from './torRollup.types';
import { getProjectScorecard } from '../project/projectScorecard.service';

/**
 * Bottom-up recursive mark recalculation from DRT tickets -> Sub-ToRs -> Root ToRs
 */
export const recalculateTorTreeMarks = async (projectId: string) => {
  const tors = await prisma.tor.findMany({
    where: { projectId },
    include: {
      drtTickets: {
        select: {
          id: true,
          assignedTeamBucket: true,
          collectionAllocated: true,
          collectionObtained: true,
          analysisAllocated: true,
          analysisObtained: true,
        },
      },
      drtMappings: {
        include: {
          ticket: {
            select: {
              id: true,
              assignedTeamBucket: true,
              collectionAllocated: true,
              collectionObtained: true,
              analysisAllocated: true,
              analysisObtained: true,
            },
          },
        },
      },
    },
    orderBy: { sortOrder: 'asc' },
  });

  if (tors.length === 0) return null;

  const childrenMap = new Map<string, string[]>();
  tors.forEach((t) => {
    if (t.parentId) {
      const arr = childrenMap.get(t.parentId) || [];
      arr.push(t.id);
      childrenMap.set(t.parentId, arr);
    }
  });

  const marksMap = new Map<
    string,
    { fhl: ITorMarksSummary; btrc: ITorMarksSummary }
  >();

  const computeNodeMarks = (
    torId: string
  ): { fhl: ITorMarksSummary; btrc: ITorMarksSummary } => {
    if (marksMap.has(torId)) {
      return marksMap.get(torId)!;
    }

    const tor = tors.find((t) => t.id === torId);
    if (!tor) {
      const empty = {
        collectionAllocated: 0,
        collectionObtained: 0,
        analysisAllocated: 0,
        analysisObtained: 0,
      };
      return { fhl: { ...empty }, btrc: { ...empty } };
    }

    const childIds = childrenMap.get(torId) || [];

    if (childIds.length === 0) {
      const ticketMap = new Map<string, {
        assignedTeamBucket: string;
        collectionAllocated: number;
        collectionObtained: number;
        analysisAllocated: number;
        analysisObtained: number;
      }>();

      tor.drtTickets.forEach((dt) => ticketMap.set(dt.id, dt));
      tor.drtMappings.forEach((m) => {
        if (m.ticket) ticketMap.set(m.ticket.id, m.ticket);
      });

      const fhl: ITorMarksSummary = {
        collectionAllocated: 0,
        collectionObtained: 0,
        analysisAllocated: 0,
        analysisObtained: 0,
      };
      const btrc: ITorMarksSummary = {
        collectionAllocated: 0,
        collectionObtained: 0,
        analysisAllocated: 0,
        analysisObtained: 0,
      };

      ticketMap.forEach((t) => {
        const target = t.assignedTeamBucket === 'CLIENT' ? btrc : fhl;
        target.collectionAllocated += t.collectionAllocated || 0;
        target.collectionObtained += t.collectionObtained || 0;
        target.analysisAllocated += t.analysisAllocated || 0;
        target.analysisObtained += t.analysisObtained || 0;
      });

      const result = { fhl, btrc };
      marksMap.set(torId, result);
      return result;
    }

    const fhl: ITorMarksSummary = {
      collectionAllocated: 0,
      collectionObtained: 0,
      analysisAllocated: 0,
      analysisObtained: 0,
    };
    const btrc: ITorMarksSummary = {
      collectionAllocated: 0,
      collectionObtained: 0,
      analysisAllocated: 0,
      analysisObtained: 0,
    };

    childIds.forEach((cId) => {
      const cMarks = computeNodeMarks(cId);
      fhl.collectionAllocated += cMarks.fhl.collectionAllocated;
      fhl.collectionObtained += cMarks.fhl.collectionObtained;
      fhl.analysisAllocated += cMarks.fhl.analysisAllocated;
      fhl.analysisObtained += cMarks.fhl.analysisObtained;

      btrc.collectionAllocated += cMarks.btrc.collectionAllocated;
      btrc.collectionObtained += cMarks.btrc.collectionObtained;
      btrc.analysisAllocated += cMarks.btrc.analysisAllocated;
      btrc.analysisObtained += cMarks.btrc.analysisObtained;
    });

    const result = { fhl, btrc };
    marksMap.set(torId, result);
    return result;
  };

  tors.forEach((t) => computeNodeMarks(t.id));

  await prisma.$transaction(
    tors.map((t) => {
      const m = marksMap.get(t.id)!;
      const round2 = (val: number) => Math.round(val * 100) / 100;
      return prisma.tor.update({
        where: { id: t.id },
        data: {
          fhlCollectionAllocated: round2(m.fhl.collectionAllocated),
          fhlCollectionObtained: round2(m.fhl.collectionObtained),
          fhlAnalysisAllocated: round2(m.fhl.analysisAllocated),
          fhlAnalysisObtained: round2(m.fhl.analysisObtained),
          btrcCollectionAllocated: round2(m.btrc.collectionAllocated),
          btrcCollectionObtained: round2(m.btrc.collectionObtained),
          btrcAnalysisAllocated: round2(m.btrc.analysisAllocated),
          btrcAnalysisObtained: round2(m.btrc.analysisObtained),
          dataCollectionAllocated: round2(
            m.fhl.collectionAllocated + m.btrc.collectionAllocated
          ),
          dataCollectionObtained: round2(
            m.fhl.collectionObtained + m.btrc.collectionObtained
          ),
          dataAnalysisAllocated: round2(
            m.fhl.analysisAllocated + m.btrc.analysisAllocated
          ),
          dataAnalysisObtained: round2(
            m.fhl.analysisObtained + m.btrc.analysisObtained
          ),
        },
      });
    })
  );

  return getProjectScorecard(projectId);
};

export const TorRollupService = {
  recalculateTorTreeMarks,
  getProjectScorecard,
};
