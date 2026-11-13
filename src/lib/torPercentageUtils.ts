import type { ITorNode } from '../types/tor.types';
import {
  DrtProgressPhase,
  getDrtStagePercentage,
  getPhaseTargetYear,
  getPhaseTargetYears,
} from './drtProgressUtils';

const DRT_PHASES: DrtProgressPhase[] = [
  'FIRST_PROGRESS',
  'SECOND_PROGRESS',
  'THIRD_PROGRESS',
  'FOURTH_PROGRESS',
  'FIFTH_PROGRESS',
];

function collectNodeDrtTicketsRecursive(node: ITorNode) {
  const map = new Map<string, NonNullable<ITorNode['drtTickets']>[number]>();
  const walk = (n: ITorNode) => {
    (n.drtTickets || []).forEach((t) => {
      if (t?.id) map.set(t.id, t);
    });
    (n.children || []).forEach(walk);
  };
  walk(node);
  return Array.from(map.values());
}

/**
 * Derives a clean 0-100 percentage for a ToR node's progress stage.
 * When auditYears/progressYearMapping are provided, maps the stage to the corresponding audit year(s)
 * and calculates the average completeness of linked DRTs for those assigned year(s).
 */
export function getTorProgressPercentage(
  node: ITorNode,
  auditYears?: string[],
  progressYearMapping?: Record<string, string[]> | null,
  progressCutoffDates?: Record<string, string> | null
): number {
  return getTorStagePercentage(node, 'FIRST_PROGRESS', auditYears, progressYearMapping, progressCutoffDates);
}

export function getTorStagePercentage(
  node: ITorNode,
  phase: string,
  auditYears?: string[],
  progressYearMapping?: Record<string, string[]> | null,
  progressCutoffDates?: Record<string, string> | null
): number {
  // 1. Roll up from linked DRT tickets
  if (DRT_PHASES.includes(phase as DrtProgressPhase)) {
    const tickets = collectNodeDrtTicketsRecursive(node);
    if (tickets.length > 0) {
      const sum = tickets.reduce(
        (acc, t) =>
          acc +
          getDrtStagePercentage(
            t,
            phase as DrtProgressPhase,
            auditYears,
            progressYearMapping,
            progressCutoffDates
          ),
        0
      );
      return Math.round(sum / tickets.length);
    }
  }

  // 2. Check explicit string or numeric values in firstProgress for 1st progress
  if (phase === 'FIRST_PROGRESS' && node.firstProgress) {
    const raw = String(node.firstProgress).trim();
    const match = raw.match(/(\d+(?:\.\d+)?)/);
    if (match) {
      const parsed = parseFloat(match[1]);
      if (!isNaN(parsed)) {
        return Math.max(0, Math.min(100, Math.round(parsed)));
      }
    }

    const upper = raw.toUpperCase();
    if (['COMPLIANT', 'DONE', 'ACCEPTED', 'COMPLETED'].includes(upper)) return 100;
    if (['PARTIALLY_COMPLIANT', 'PARTIAL'].includes(upper)) return 50;
    if (['IN_PROGRESS', 'SUBMITTED', 'IN_REVIEW'].includes(upper)) return 35;
    if (['NOT_STARTED', 'PENDING', 'NOT_APPLICABLE'].includes(upper)) return 0;
  }

  // 3. Check dynamic progressStages
  if (node.progressStages && node.progressStages.length > 0) {
    const st = node.progressStages.find((s) => s.stageKey === phase);
    if (st) {
      if (typeof st.score === 'number') return Math.max(0, Math.min(100, Math.round(st.score)));
      if (st.status) {
        const match = String(st.status).match(/(\d+(?:\.\d+)?)/);
        if (match) {
          const parsed = parseFloat(match[1]);
          if (!isNaN(parsed)) return Math.max(0, Math.min(100, Math.round(parsed)));
        }
        const upper = String(st.status).toUpperCase();
        if (['COMPLIANT', 'DONE', 'ACCEPTED', 'COMPLETED'].includes(upper)) return 100;
        if (['PARTIALLY_COMPLIANT', 'PARTIAL'].includes(upper)) return 50;
        if (['IN_PROGRESS', 'SUBMITTED', 'IN_REVIEW'].includes(upper)) return 35;
      }
    }
  }

  // 4. Check direct node fields
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nodeAny = node as any;
  let raw: string | null | undefined = null;
  if (phase === 'SECOND_PROGRESS') raw = nodeAny.secondProgress;
  else if (phase === 'THIRD_PROGRESS') raw = nodeAny.thirdProgress;
  else if (phase === 'FOURTH_PROGRESS') raw = nodeAny.fourthProgress;
  else if (phase === 'FIFTH_PROGRESS') raw = nodeAny.fifthProgress;
  else if (phase === 'DRAFT_REPORT') raw = nodeAny.draftReportProgress || nodeAny.draftReport;
  else if (phase === 'FINAL_REPORT') raw = nodeAny.finalReportProgress || nodeAny.finalReport;

  if (raw) {
    const match = String(raw).match(/(\d+(?:\.\d+)?)/);
    if (match) {
      const parsed = parseFloat(match[1]);
      if (!isNaN(parsed)) return Math.max(0, Math.min(100, Math.round(parsed)));
    }
    const upper = String(raw).toUpperCase();
    if (['COMPLIANT', 'DONE', 'ACCEPTED', 'COMPLETED'].includes(upper)) return 100;
    if (['PARTIALLY_COMPLIANT', 'PARTIAL'].includes(upper)) return 50;
    if (['IN_PROGRESS', 'SUBMITTED', 'IN_REVIEW'].includes(upper)) return 35;
  }

  // 5. Fallback for 1st progress: Calculate from Data Collection marks
  if (phase === 'FIRST_PROGRESS' && node.dataCollectionAllocated && node.dataCollectionAllocated > 0) {
    const marksPct = ((node.dataCollectionObtained || 0) / node.dataCollectionAllocated) * 100;
    return Math.max(0, Math.min(100, Math.round(marksPct)));
  }

  return 0;
}

