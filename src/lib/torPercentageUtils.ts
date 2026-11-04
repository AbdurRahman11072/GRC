import type { ITorNode } from '../types/tor.types';

/**
 * Derives a clean 0-100 percentage for a ToR node's 1st progress.
 * Evaluates explicit numeric progress, stage scores, status keywords,
 * or falls back to data collection marks and linked DRT completion.
 */
export function getTorProgressPercentage(node: ITorNode): number {
  // 1. Check explicit string or numeric values in firstProgress
  if (node.firstProgress) {
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

  // 2. Check dynamic progressStages if present
  if (node.progressStages && node.progressStages.length > 0) {
    const stage1 = node.progressStages.find((s) => s.stageKey === 'FIRST_PROGRESS');
    if (stage1) {
      if (typeof stage1.score === 'number') {
        return Math.max(0, Math.min(100, Math.round(stage1.score)));
      }
      if (stage1.status) {
        const match = String(stage1.status).match(/(\d+(?:\.\d+)?)/);
        if (match) {
          const parsed = parseFloat(match[1]);
          if (!isNaN(parsed)) return Math.max(0, Math.min(100, Math.round(parsed)));
        }
      }
    }
  }

  // 3. Fallback: Calculate from Data Collection allocated vs obtained marks
  if (node.dataCollectionAllocated && node.dataCollectionAllocated > 0) {
    const marksPct = ((node.dataCollectionObtained || 0) / node.dataCollectionAllocated) * 100;
    return Math.max(0, Math.min(100, Math.round(marksPct)));
  }

  // 4. Fallback: Calculate from linked DRT ticket statuses
  if (node.drtTickets && node.drtTickets.length > 0) {
    const doneCount = node.drtTickets.filter(
      (t) => t.reviewOutcome === 'DONE' || t.workflowStatus === 'ACCEPTED'
    ).length;
    return Math.round((doneCount / node.drtTickets.length) * 100);
  }

  return 0;
}

export function getTorStagePercentage(node: ITorNode, phase: string): number {
  if (phase === 'FIRST_PROGRESS') {
    return getTorProgressPercentage(node);
  }

  // 1. Check progressStages
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

  // 2. Check direct node fields
  const nodeAny = node as any;
  let raw: string | null | undefined = null;
  if (phase === 'SECOND_PROGRESS') raw = nodeAny.secondProgress;
  else if (phase === 'THIRD_PROGRESS') raw = nodeAny.thirdProgress;
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

  return 0;
}

