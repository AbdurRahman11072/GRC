import type { ITorNode, TorProgressReportPhase, ITorProgressStageData } from '../types/tor.types';
import type { IDRTTicket } from '../types/project.types';
import type { TorFilterState } from '../components/tors/table/TorTableFilters';
import {
  DrtProgressPhase,
  getDrtStageData,
  getDrtStagePercentage,
  getPhaseTargetYear,
  getPhaseTargetYears,
  formatPhaseYearsLabel,
  getDrtYearCollectionData,
} from './drtProgressUtils';
import { getTorProgressPercentage, getTorStagePercentage } from './torPercentageUtils';

export const REPORT_PHASES: { key: TorProgressReportPhase; label: string; shortLabel: string }[] = [
  { key: 'FIRST_PROGRESS', label: '1st Progress Report', shortLabel: '1st Progress' },
  { key: 'SECOND_PROGRESS', label: '2nd Progress Report', shortLabel: '2nd Progress' },
  { key: 'THIRD_PROGRESS', label: '3rd Progress Report', shortLabel: '3rd Progress' },
  { key: 'FOURTH_PROGRESS', label: '4th Progress Report', shortLabel: '4th Progress' },
  { key: 'FIFTH_PROGRESS', label: '5th Progress Report', shortLabel: '5th Progress' },
  { key: 'INCENTIVE_REPORT', label: 'Incentive Report', shortLabel: 'Incentive Report' },
  { key: 'DRAFT_REPORT', label: 'Draft Audit Report', shortLabel: 'Draft Report' },
  { key: 'FINAL_REPORT', label: 'Final Audit Report', shortLabel: 'Final Report' },
];

export { getTorProgressPercentage };

export function isTorDrtEligible(code?: string, level?: number): boolean {
  if (level !== undefined && level === 1) return true;
  if (!code) return false;
  return code.split('.').filter(Boolean).length === 2;
}

export function splitDrtTicketsByParty(tickets?: IDRTTicket[]): {
  btrcTickets: IDRTTicket[];
  fhlTickets: IDRTTicket[];
} {
  if (!tickets || tickets.length === 0) return { btrcTickets: [], fhlTickets: [] };
  const btrcTickets = tickets.filter(
    (t) => t.assignedTeamBucket === 'CLIENT' || (t as { clientContactId?: string }).clientContactId
  );
  const fhlTickets = tickets.filter((t) => t.assignedTeamBucket !== 'CLIENT');
  return { btrcTickets, fhlTickets };
}

export function getTorStageData(
  node: ITorNode,
  phase: TorProgressReportPhase,
  auditYears?: string[],
  progressYearMapping?: Record<string, string[]> | null
): ITorProgressStageData {
  const targetYears = getPhaseTargetYears(phase, auditYears, progressYearMapping);
  const targetYear = formatPhaseYearsLabel(targetYears) || undefined;

  if (node.progressStages && node.progressStages.length > 0) {
    const stage = node.progressStages.find((s) => s.stageKey === phase);
    if (stage) {
      if (targetYear) {
        const cleanName = stage.stageName.replace(/\s*\([^)]*\)$/, '');
        return { ...stage, stageName: `${cleanName} (${targetYear})` };
      }
      return stage;
    }
  }

  const yearSuffix = targetYear ? ` (${targetYear})` : '';

  if (phase === 'FIRST_PROGRESS') {
    return {
      stageKey: phase,
      stageName: `1st Progress${yearSuffix}`,
      status: node.firstProgress || (node.complianceStatus ? 'IN_PROGRESS' : 'PENDING'),
      auditorRemark: node.firstProgressAuditorRemark || (node.complianceStatus ? 'Initial evidence logs collected and mapped to ToR.' : null),
    };
  }
  if (phase === 'SECOND_PROGRESS') {
    return {
      stageKey: phase,
      stageName: `2nd Progress${yearSuffix}`,
      status: node.secondProgress || (node.complianceStatus === 'COMPLIANT' ? 'PARTIALLY_COMPLIANT' : 'PENDING'),
      auditorRemark: node.secondProgressAuditorRemark || (node.analysisNotes ? 'Technical documentation under verification.' : null),
    };
  }
  if (phase === 'THIRD_PROGRESS') {
    return {
      stageKey: phase,
      stageName: `3rd Progress${yearSuffix}`,
      status: node.thirdProgress || (node.complianceStatus || 'PENDING'),
      auditorRemark: node.thirdProgressAuditorRemark || (node.complianceStatus === 'COMPLIANT' ? 'Validation completed against baseline criteria.' : null),
    };
  }
  if (phase === 'FOURTH_PROGRESS') {
    return {
      stageKey: phase,
      stageName: `4th Progress${yearSuffix}`,
      status: node.fourthProgress || (node.complianceStatus || 'PENDING'),
      auditorRemark: node.fourthProgressAuditorRemark || (node.complianceStatus === 'COMPLIANT' ? 'Fourth stage review verified against criteria.' : null),
    };
  }
  if (phase === 'FIFTH_PROGRESS') {
    return {
      stageKey: phase,
      stageName: `5th Progress${yearSuffix}`,
      status: node.fifthProgress || (node.complianceStatus || 'PENDING'),
      auditorRemark: node.fifthProgressAuditorRemark || (node.complianceStatus === 'COMPLIANT' ? 'Fifth stage milestone conformance confirmed.' : null),
    };
  }
  if (phase === 'INCENTIVE_REPORT') {
    return {
      stageKey: phase,
      stageName: 'Incentive Report',
      status: node.incentiveReport ? 'SUBMITTED' : 'PENDING',
      auditeeRemark: node.incentiveReport || null,
      auditorRemark: null,
    };
  }
  if (phase === 'DRAFT_REPORT') {
    return {
      stageKey: phase,
      stageName: 'Draft Report',
      status: node.draftRemark ? 'SUBMITTED' : 'IN_REVIEW',
      auditeeRemark: node.draftRemark || 'Draft findings response submitted by auditee focal team.',
      auditorRemark: node.draftAuditorRemark || (node.analysisNotes || 'Under preliminary audit committee review.'),
    };
  }
  return {
    stageKey: 'FINAL_REPORT',
    stageName: 'Final Report',
    status: node.finalRemark ? 'FINALIZED' : 'PENDING',
    auditeeRemark: node.finalRemark || 'Final clarification provided on ToR execution metrics.',
    auditorRemark: node.finalAuditorRemark || (node.complianceStatus === 'COMPLIANT' ? 'Full compliance affirmed.' : 'Observations recorded in final report.'),
  };
}

export function getProgressBadgeClasses(status?: string): string {
  if (!status) return 'bg-slate-100 text-slate-600 border-slate-200';
  const s = status.toUpperCase();
  if (['COMPLIANT', 'FINALIZED', 'ACCEPTED', 'DONE'].includes(s)) return 'bg-emerald-50 text-emerald-700 border-emerald-300 font-medium';
  if (['PARTIALLY_COMPLIANT', 'PARTIAL', 'SUBMITTED'].includes(s)) return 'bg-amber-50 text-amber-700 border-amber-300 font-medium';
  if (['IN_PROGRESS', 'IN_REVIEW'].includes(s)) return 'bg-blue-50 text-blue-700 border-blue-300 font-medium';
  if (['NON_COMPLIANT', 'REVISION_REQUESTED'].includes(s)) return 'bg-rose-50 text-rose-700 border-rose-300 font-medium';
  return 'bg-slate-50 text-slate-600 border-slate-200';
}

export function updateNodeRemarkRecursive(
  nodes: ITorNode[],
  nodeId: string,
  phase: TorProgressReportPhase,
  updatedData: Partial<ITorProgressStageData>
): ITorNode[] {
  return nodes.map((n) => {
    if (n.id === nodeId) {
      const currentStages = n.progressStages ? [...n.progressStages] : [];
      const idx = currentStages.findIndex((s) => s.stageKey === phase);
      const newStage: ITorProgressStageData = {
        stageKey: phase,
        stageName: phase.replace('_', ' '),
        status: updatedData.status || 'PENDING',
        auditorRemark: updatedData.auditorRemark ?? null,
        auditeeRemark: updatedData.auditeeRemark ?? null,
        updatedAt: updatedData.updatedAt || new Date().toISOString(),
      };
      if (idx >= 0) currentStages[idx] = { ...currentStages[idx], ...newStage };
      else currentStages.push(newStage);

      const patch: Partial<ITorNode> = { progressStages: currentStages };
      if (phase === 'FIRST_PROGRESS') {
        patch.firstProgress = updatedData.status;
        patch.firstProgressAuditorRemark = updatedData.auditorRemark;
      } else if (phase === 'SECOND_PROGRESS') {
        patch.secondProgress = updatedData.status;
        patch.secondProgressAuditorRemark = updatedData.auditorRemark;
      } else if (phase === 'THIRD_PROGRESS') {
        patch.thirdProgress = updatedData.status;
        patch.thirdProgressAuditorRemark = updatedData.auditorRemark;
      } else if (phase === 'FOURTH_PROGRESS') {
        patch.fourthProgress = updatedData.status;
        patch.fourthProgressAuditorRemark = updatedData.auditorRemark;
      } else if (phase === 'FIFTH_PROGRESS') {
        patch.fifthProgress = updatedData.status;
        patch.fifthProgressAuditorRemark = updatedData.auditorRemark;
      } else if (phase === 'INCENTIVE_REPORT') {
        patch.incentiveReport = updatedData.auditeeRemark || updatedData.status;
        patch.incentiveAuditorRemark = null;
      } else if (phase === 'DRAFT_REPORT') {
        patch.draftRemark = updatedData.auditeeRemark;
        patch.draftAuditorRemark = updatedData.auditorRemark;
      } else if (phase === 'FINAL_REPORT') {
        patch.finalRemark = updatedData.auditeeRemark;
        patch.finalAuditorRemark = updatedData.auditorRemark;
      }
      return { ...n, ...patch };
    }
    if (n.children && n.children.length > 0) {
      return { ...n, children: updateNodeRemarkRecursive(n.children, nodeId, phase, updatedData) };
    }
    return n;
  });
}

export function filterTorTree(nodes: ITorNode[], filters: TorFilterState): ITorNode[] {
  const term = filters.searchTerm.toLowerCase().trim();

  const matchesFilter = (node: ITorNode): boolean => {
    if (term) {
      const matchesCode = node.code.toLowerCase().includes(term);
      const matchesTitle = node.title.toLowerCase().includes(term);
      const matchesDesc = Boolean(node.description && node.description.toLowerCase().includes(term));
      const matchesDrt = Boolean(node.drtTickets?.some((t) => t.requestCode.toLowerCase().includes(term)));
      if (!matchesCode && !matchesTitle && !matchesDesc && !matchesDrt) return false;
    }
    if (filters.department !== 'ALL' && node.department !== filters.department) return false;
    if (filters.assignedUser !== 'ALL') {
      if (filters.assignedUser === 'UNASSIGNED') {
        if (node.assignedMembers && node.assignedMembers.length > 0) return false;
      } else if (!node.assignedMembers?.some((am) => am.userId === filters.assignedUser)) {
        return false;
      }
    }
    if (filters.progressStatus !== 'ALL') {
      const statuses = ['FIRST_PROGRESS', 'SECOND_PROGRESS', 'THIRD_PROGRESS', 'FOURTH_PROGRESS', 'FIFTH_PROGRESS'] as const;
      const matches = statuses.some((p) => getTorStageData(node, p).status === filters.progressStatus);
      if (!matches && node.complianceStatus !== filters.progressStatus) return false;
    }
    if (filters.drtStream !== 'ALL') {
      const tickets = node.drtTickets || [];
      if (filters.drtStream === 'HAS_DRT' && tickets.length === 0) return false;
      if (filters.drtStream === 'NO_DRT' && tickets.length > 0) return false;
      if (filters.drtStream === 'BTRC_DRT' && !tickets.some((t) => t.assignedTeamBucket === 'CLIENT')) return false;
      if (filters.drtStream === 'FHL_DRT' && !tickets.some((t) => t.assignedTeamBucket !== 'CLIENT')) return false;
    }
    return true;
  };

  const filterNode = (node: ITorNode): ITorNode | null => {
    if (node.code && node.code.split('.').filter(Boolean).length >= 3) return null;
    const selfMatches = matchesFilter(node);
    let filteredChildren: ITorNode[] = [];
    if (node.children && node.children.length > 0) {
      filteredChildren = node.children.map(filterNode).filter((c): c is ITorNode => c !== null);
    }
    if (selfMatches || filteredChildren.length > 0) return { ...node, children: filteredChildren };
    return null;
  };

  return nodes.map(filterNode).filter((n): n is ITorNode => n !== null);
}

export function countTorNodes(nodes: ITorNode[]): number {
  return nodes.reduce((acc, n) => acc + 1 + (n.children ? countTorNodes(n.children) : 0), 0);
}

export interface ITorDrtStageSummaryItem {
  ticketId: string;
  requestCode: string;
  description: string;
  torId?: string;
  torCode?: string;
  targetYear?: string;
  party: 'CLIENT' | 'AUDITEE';
  department?: string | null;
  percentage: number;
  evidenceStatus?: string;
  status: string;
  auditeeRemark: string | null;
  auditorRemark: string | null;
  isNotApplicable?: boolean;
}

export interface ITorDrtStageRollup {
  phase: DrtProgressPhase;
  targetYear?: string;
  totalDrtCount: number;
  reportedDrtCount: number;
  avgDrtPercentage: number;
  effectivePercentage: number;
  autoCompiledAuditeeSummary: string;
  autoCompiledAuditorSummary: string;
  items: ITorDrtStageSummaryItem[];
}

/**
 * Recursively collects all unique DRT tickets attached to a ToR node and its child Sub-ToR clauses.
 * Merges with `allProjectTickets` (when provided) so M:N junction (`DRTTicketToR`) and live ticket updates are included.
 */
export function collectAllTorDrtTickets(
  node: ITorNode,
  allProjectTickets?: IDRTTicket[]
): Array<{ ticket: IDRTTicket; sourceTorId: string; sourceTorCode: string }> {
  const resultMap = new Map<
    string,
    { ticket: IDRTTicket; sourceTorId: string; sourceTorCode: string }
  >();
  const projectTicketById = new Map<string, IDRTTicket>();
  (allProjectTickets || []).forEach((t) => projectTicketById.set(t.id, t));

  const walk = (n: ITorNode) => {
    // 1. Direct drtTickets on the ToR node
    (n.drtTickets || []).forEach((t) => {
      if (!t?.id) return;
      const latestTicket = projectTicketById.get(t.id) || t;
      if (!resultMap.has(t.id)) {
        resultMap.set(t.id, {
          ticket: latestTicket,
          sourceTorId: n.id,
          sourceTorCode: n.code,
        });
      }
    });

    // 2. Any ticket in allProjectTickets mapped to n.id via torId or M:N tors[]
    if (allProjectTickets && allProjectTickets.length > 0) {
      allProjectTickets.forEach((t) => {
        const matchesTor =
          t.torId === n.id ||
          t.tor?.id === n.id ||
          t.tors?.some((m) => m.torId === n.id || m.tor?.id === n.id);
        if (matchesTor && !resultMap.has(t.id)) {
          resultMap.set(t.id, {
            ticket: t,
            sourceTorId: n.id,
            sourceTorCode: n.code,
          });
        }
      });
    }

    // 3. Recurse into child Sub-ToRs
    (n.children || []).forEach(walk);
  };

  walk(node);
  return Array.from(resultMap.values());
}

/**
 * Collects and aggregates DRT progress % and remarks for a ToR node (and its Sub-ToRs).
 * When auditYears are provided, maps the phase (1st, 2nd, etc.) to the target audit year (e.g. 2026, 2025...)
 * in reverse-chronological order and aggregates data collection statuses for that specific year.
 */
export function aggregateTorDrtProgress(
  node: ITorNode,
  phase: DrtProgressPhase,
  allProjectTickets?: IDRTTicket[],
  auditYears?: string[],
  progressYearMapping?: Record<string, string[]> | null
): ITorDrtStageRollup {
  const targetYears = getPhaseTargetYears(phase, auditYears, progressYearMapping);
  const targetYear = formatPhaseYearsLabel(targetYears) || undefined;
  const collected = collectAllTorDrtTickets(node, allProjectTickets);

  const items: ITorDrtStageSummaryItem[] = collected.map(
    ({ ticket, sourceTorId, sourceTorCode }) => {
      if (targetYears.length > 0) {
        const yearResults = targetYears.map((yr) => getDrtYearCollectionData(ticket, yr));
        const pct = getDrtStagePercentage(ticket, phase, auditYears, progressYearMapping);
        const allNotApp = yearResults.every((r) => r.isNotApplicable);

        let statusLabel: string;
        if (targetYears.length === 1) {
          statusLabel = `${yearResults[0].evidenceStatus.replace(/_/g, ' ')} (${yearResults[0].percentage}%)`;
        } else {
          const summaryList = yearResults
            .map((yr) => `${yr.year}: ${yr.evidenceStatus.replace(/_/g, ' ')}`)
            .join(', ');
          statusLabel = `${summaryList} (${pct}%)`;
        }

        const remarksList = yearResults
          .filter((r) => r.remark)
          .map((r) => (targetYears.length > 1 ? `[${r.year}]: ${r.remark}` : (r.remark as string)));
        const combinedRemarks = remarksList.length > 0 ? remarksList.join('; ') : null;

        return {
          ticketId: ticket.id,
          requestCode: ticket.requestCode,
          description: ticket.title || ticket.description,
          torId: sourceTorId,
          torCode: sourceTorCode,
          targetYear,
          party: ticket.assignedTeamBucket === 'CLIENT' ? 'CLIENT' : 'AUDITEE',
          department: ticket.department,
          percentage: pct,
          evidenceStatus: targetYears.length === 1 ? yearResults[0].evidenceStatus : undefined,
          status: statusLabel,
          auditeeRemark:
            ticket.assignedTeamBucket !== 'CLIENT' ? (combinedRemarks || ticket.remarks || null) : null,
          auditorRemark:
            ticket.assignedTeamBucket === 'CLIENT' ? combinedRemarks : null,
          isNotApplicable: allNotApp,
        };
      }

      // Fallback when auditYears are not available
      const stage = getDrtStageData(ticket, phase);
      const pct = getDrtStagePercentage(ticket, phase);
      return {
        ticketId: ticket.id,
        requestCode: ticket.requestCode,
        description: ticket.title || ticket.description,
        torId: sourceTorId,
        torCode: sourceTorCode,
        party: ticket.assignedTeamBucket === 'CLIENT' ? 'CLIENT' : 'AUDITEE',
        department: ticket.department,
        percentage: pct,
        status: stage.status || `${pct}%`,
        auditeeRemark: stage.auditeeRemark,
        auditorRemark: stage.auditorRemark,
        isNotApplicable: false,
      };
    }
  );

  const totalDrtCount = items.length;
  const applicableItems = items.filter((i) => !i.isNotApplicable);
  const reportedDrtCount = applicableItems.filter(
    (item) => item.percentage > 0 || Boolean(item.auditeeRemark) || Boolean(item.auditorRemark)
  ).length;

  const avgDrtPercentage =
    applicableItems.length > 0
      ? Math.round(applicableItems.reduce((acc, item) => acc + item.percentage, 0) / applicableItems.length)
      : totalDrtCount > 0 && items.every((i) => i.isNotApplicable)
      ? 100
      : 0;

  const torOwnPct = getTorStagePercentage(node, phase, auditYears, progressYearMapping);
  const effectivePercentage = totalDrtCount > 0 && torOwnPct === 0 ? avgDrtPercentage : torOwnPct;

  const auditeeLines = items
    .filter((i) => i.auditeeRemark)
    .map((i) => `[${i.requestCode}${targetYear ? ` - ${targetYear}` : ''} (${i.percentage}%)]: ${i.auditeeRemark}`);

  const auditorLines = items
    .filter((i) => i.auditorRemark)
    .map((i) => `[${i.requestCode}${targetYear ? ` - ${targetYear}` : ''} (${i.percentage}%)]: ${i.auditorRemark}`);

  const autoCompiledAuditeeSummary = auditeeLines.join('\n');
  const yearNote = targetYear ? `for ${targetYear}` : '';
  const autoCompiledAuditorSummary =
    auditorLines.length > 0
      ? auditorLines.join('\n')
      : totalDrtCount > 0
      ? `${reportedDrtCount}/${applicableItems.length} applicable DRTs collected ${yearNote} (${avgDrtPercentage}% completion).`
      : '';

  return {
    phase,
    targetYear,
    totalDrtCount,
    reportedDrtCount,
    avgDrtPercentage,
    effectivePercentage,
    autoCompiledAuditeeSummary,
    autoCompiledAuditorSummary,
    items,
  };
}
