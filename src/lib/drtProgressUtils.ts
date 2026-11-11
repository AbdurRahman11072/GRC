import type { IDRTTicket } from '../types/drt.types';

export type DrtProgressPhase =
  | 'FIRST_PROGRESS'
  | 'SECOND_PROGRESS'
  | 'THIRD_PROGRESS'
  | 'FOURTH_PROGRESS'
  | 'FIFTH_PROGRESS';

export interface IDrtStageData {
  phase: DrtProgressPhase;
  stageName: string;
  targetYear?: string;
  status: string;
  score?: number;
  auditeeRemark: string | null;
  auditorRemark: string | null;
}

export const DRT_PROGRESS_PHASES: { key: DrtProgressPhase; label: string; shortLabel: string }[] = [
  { key: 'FIRST_PROGRESS', label: '1st Progress Report', shortLabel: '1st Progress' },
  { key: 'SECOND_PROGRESS', label: '2nd Progress Report', shortLabel: '2nd Progress' },
  { key: 'THIRD_PROGRESS', label: '3rd Progress Report', shortLabel: '3rd Progress' },
  { key: 'FOURTH_PROGRESS', label: '4th Progress Report', shortLabel: '4th Progress' },
  { key: 'FIFTH_PROGRESS', label: '5th Progress Report', shortLabel: '5th Progress' },
];

/**
 * Resolves the target audit years for a progress stage.
 * If progressYearMapping has an explicit configuration for this phase, uses that.
 * Otherwise, falls back to the default reverse-chronological order from auditYears.
 */
export function getPhaseTargetYears(
  phase: DrtProgressPhase | string,
  auditYears?: string[],
  progressYearMapping?: Record<string, string[]> | null
): string[] {
  if (
    progressYearMapping &&
    Array.isArray(progressYearMapping[phase]) &&
    progressYearMapping[phase].length > 0
  ) {
    return progressYearMapping[phase];
  }

  if (!auditYears || auditYears.length === 0) return [];
  const reversed = [...auditYears].reverse();
  if (phase === 'FIRST_PROGRESS') return reversed[0] ? [reversed[0]] : [];
  if (phase === 'SECOND_PROGRESS') return reversed[1] ? [reversed[1]] : [];
  if (phase === 'THIRD_PROGRESS') return reversed[2] ? [reversed[2]] : [];
  if (phase === 'FOURTH_PROGRESS') return reversed[3] ? [reversed[3]] : [];
  if (phase === 'FIFTH_PROGRESS') return reversed[4] ? [reversed[4]] : [];
  return [];
}

/**
 * Formats a list of years into a human-friendly label, e.g. "2025, 2026" or "2024".
 */
export function formatPhaseYearsLabel(years?: string[]): string {
  if (!years || years.length === 0) return '';
  return [...years].sort((a, b) => b.localeCompare(a)).join(', ');
}

/**
 * Returns formatted target year(s) string for a progress stage, e.g. "2025, 2026" or "2024".
 */
export function getPhaseTargetYear(
  phase: DrtProgressPhase | string,
  auditYears?: string[],
  progressYearMapping?: Record<string, string[]> | null
): string | undefined {
  const years = getPhaseTargetYears(phase, auditYears, progressYearMapping);
  return years.length > 0 ? formatPhaseYearsLabel(years) : undefined;
}

export interface IDrtYearCollectionResult {
  year: string;
  evidenceStatus: string;
  percentage: number;
  remark: string | null;
  isNotApplicable: boolean;
}

/**
 * Retrieves the data collection percentage and remark for a specific audit year from a DRT ticket.
 */
export function getDrtYearCollectionData(
  ticket: IDRTTicket,
  year: string
): IDrtYearCollectionResult {
  const match = (ticket.periodStatuses || []).find((p) => p.periodLabel === year);
  const status = match?.evidenceStatus || 'IN_PROGRESS';
  const remark = match?.remark || null;

  let percentage = 0;
  let isNotApplicable = false;

  if (status === 'COMPLETED' || status === 'SHARED') {
    percentage = 100;
  } else if (status === 'PARTIAL') {
    percentage = 50;
  } else if (status === 'NOT_APPLICABLE') {
    percentage = 100;
    isNotApplicable = true;
  } else {
    // 'NOT_SHARED' | 'IN_PROGRESS'
    percentage = 0;
  }

  return {
    year,
    evidenceStatus: status,
    percentage,
    remark,
    isNotApplicable,
  };
}

export function getDrtStagePercentage(
  ticket: IDRTTicket,
  phase: DrtProgressPhase | string,
  auditYears?: string[],
  progressYearMapping?: Record<string, string[]> | null
): number {
  const targetYears = getPhaseTargetYears(phase, auditYears, progressYearMapping);
  if (targetYears.length > 0) {
    const yearResults = targetYears.map((yr) => getDrtYearCollectionData(ticket, yr));
    const applicable = yearResults.filter((r) => !r.isNotApplicable);
    if (applicable.length > 0) {
      const sum = applicable.reduce((acc, r) => acc + r.percentage, 0);
      return Math.round(sum / applicable.length);
    }
    if (yearResults.every((r) => r.isNotApplicable)) {
      return 100;
    }
    return 0;
  }

  let val: string | null | undefined = null;
  if (phase === 'FIRST_PROGRESS') val = ticket.firstProgress;
  else if (phase === 'SECOND_PROGRESS') val = ticket.secondProgress;
  else if (phase === 'THIRD_PROGRESS') val = ticket.thirdProgress;
  else if (phase === 'FOURTH_PROGRESS') val = ticket.fourthProgress;
  else if (phase === 'FIFTH_PROGRESS') val = ticket.fifthProgress;

  if (val) {
    const match = String(val).match(/(\d+(?:\.\d+)?)/);
    if (match) {
      const parsed = parseFloat(match[1]);
      if (!isNaN(parsed)) return Math.min(100, Math.max(0, Math.round(parsed)));
    }
    const upper = String(val).toUpperCase();
    if (['DONE', 'ACCEPTED', 'COMPLIANT', 'FINALIZED', 'COMPLETED'].includes(upper)) return 100;
    if (['PARTIAL', 'PARTIALLY_COMPLIANT', 'SUBMITTED'].includes(upper)) return 50;
    if (['IN_PROGRESS', 'IN_REVIEW'].includes(upper)) return 35;
    if (['PENDING', 'NOT_APPLICABLE', 'NON_COMPLIANT'].includes(upper)) return 0;
  }

  if (phase === 'FIRST_PROGRESS') {
    if (ticket.reviewOutcome === 'DONE' || ticket.workflowStatus === 'ACCEPTED') return 100;
    if (ticket.reviewOutcome === 'PARTIAL') return 50;
  }
  return 0;
}

export function getDrtProgressPercentage(
  ticket: IDRTTicket,
  auditYears?: string[],
  progressYearMapping?: Record<string, string[]> | null
): number {
  return getDrtStagePercentage(ticket, 'FIRST_PROGRESS', auditYears, progressYearMapping);
}

export function getDrtStageData(
  ticket: IDRTTicket,
  phase: DrtProgressPhase,
  auditYears?: string[],
  progressYearMapping?: Record<string, string[]> | null
): IDrtStageData {
  const targetYears = getPhaseTargetYears(phase, auditYears, progressYearMapping);
  const targetYearLabel = formatPhaseYearsLabel(targetYears);

  if (targetYears.length > 0) {
    const yearResults = targetYears.map((yr) => getDrtYearCollectionData(ticket, yr));
    const score = getDrtStagePercentage(ticket, phase, auditYears, progressYearMapping);
    const phaseItem = DRT_PROGRESS_PHASES.find((p) => p.key === phase);
    const stageName = phaseItem ? `${phaseItem.shortLabel} (${targetYearLabel})` : targetYearLabel;

    let statusText: string;
    if (targetYears.length === 1) {
      statusText = `${yearResults[0].evidenceStatus.replace(/_/g, ' ')} (${yearResults[0].percentage}%)`;
    } else {
      const summaryList = yearResults
        .map((yr) => `${yr.year}: ${yr.evidenceStatus.replace(/_/g, ' ')}`)
        .join(', ');
      statusText = `${summaryList} (${score}%)`;
    }

    const remarksList = yearResults
      .filter((r) => r.remark)
      .map((r) => (targetYears.length > 1 ? `[${r.year}]: ${r.remark}` : (r.remark as string)));
    const combinedRemarks = remarksList.length > 0 ? remarksList.join('; ') : null;

    return {
      phase,
      stageName,
      targetYear: targetYearLabel,
      status: statusText,
      score,
      auditeeRemark:
        ticket.assignedTeamBucket !== 'CLIENT' ? (combinedRemarks || ticket.remarks || null) : null,
      auditorRemark:
        ticket.assignedTeamBucket === 'CLIENT' ? combinedRemarks : null,
    };
  }

  switch (phase) {
    case 'FIRST_PROGRESS':
      return {
        phase,
        stageName: '1st Progress',
        status: ticket.firstProgress || (ticket.workflowStatus === 'ACCEPTED' ? 'DONE' : 'IN_PROGRESS'),
        score: getDrtProgressPercentage(ticket, auditYears, progressYearMapping),
        auditeeRemark: ticket.firstProgressAuditeeRemark || ticket.remarks || null,
        auditorRemark: ticket.firstProgressAuditorRemark || null,
      };
    case 'SECOND_PROGRESS':
      return {
        phase,
        stageName: '2nd Progress',
        status: ticket.secondProgress || (ticket.reviewOutcome === 'DONE' ? 'DONE' : 'PENDING'),
        auditeeRemark: ticket.secondProgressAuditeeRemark || null,
        auditorRemark: ticket.secondProgressAuditorRemark || null,
      };
    case 'THIRD_PROGRESS':
      return {
        phase,
        stageName: '3rd Progress',
        status: ticket.thirdProgress || 'PENDING',
        auditeeRemark: ticket.thirdProgressAuditeeRemark || null,
        auditorRemark: ticket.thirdProgressAuditorRemark || null,
      };
    case 'FOURTH_PROGRESS':
      return {
        phase,
        stageName: '4th Progress',
        status: ticket.fourthProgress || 'PENDING',
        auditeeRemark: ticket.fourthProgressAuditeeRemark || null,
        auditorRemark: ticket.fourthProgressAuditorRemark || null,
      };
    case 'FIFTH_PROGRESS':
      return {
        phase,
        stageName: '5th Progress',
        status: ticket.fifthProgress || 'PENDING',
        auditeeRemark: ticket.fifthProgressAuditeeRemark || null,
        auditorRemark: ticket.fifthProgressAuditorRemark || null,
      };
  }
}

export function getDrtProgressBadgeClasses(status?: string): string {
  if (!status) return 'bg-slate-100 text-slate-600 border-slate-200';
  const s = status.toUpperCase();
  if (['COMPLIANT', 'FINALIZED', 'ACCEPTED', 'DONE', '100%'].includes(s)) {
    return 'bg-emerald-50 text-emerald-700 border-emerald-300 font-medium';
  }
  if (['PARTIALLY_COMPLIANT', 'PARTIAL', 'SUBMITTED', '50%'].includes(s)) {
    return 'bg-amber-50 text-amber-700 border-amber-300 font-medium';
  }
  if (['IN_PROGRESS', 'IN_REVIEW'].includes(s)) {
    return 'bg-blue-50 text-blue-700 border-blue-300 font-medium';
  }
  if (['NON_COMPLIANT', 'REVISION_REQUESTED', '0%'].includes(s)) {
    return 'bg-rose-50 text-rose-700 border-rose-300 font-medium';
  }
  return 'bg-slate-50 text-slate-600 border-slate-200';
}

export function updateDrtProgressData(
  tickets: IDRTTicket[],
  ticketId: string,
  phase: DrtProgressPhase,
  data: { status?: string; auditorRemark?: string | null; auditeeRemark?: string | null }
): IDRTTicket[] {
  const pMap: Record<DrtProgressPhase, 'firstProgress' | 'secondProgress' | 'thirdProgress' | 'fourthProgress' | 'fifthProgress'> = {
    FIRST_PROGRESS: 'firstProgress',
    SECOND_PROGRESS: 'secondProgress',
    THIRD_PROGRESS: 'thirdProgress',
    FOURTH_PROGRESS: 'fourthProgress',
    FIFTH_PROGRESS: 'fifthProgress',
  };
  const key = pMap[phase];
  return tickets.map((t) =>
    t.id === ticketId
      ? { ...t, [key]: data.status, [`${key}AuditorRemark`]: data.auditorRemark, [`${key}AuditeeRemark`]: data.auditeeRemark }
      : t
  );
}

