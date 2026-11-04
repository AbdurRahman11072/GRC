import type { ITorNode, TorProgressReportPhase, ITorProgressStageData } from '../types/tor.types';
import type { IDRTTicket } from '../types/project.types';
import type { TorFilterState } from '../components/tors/table/TorTableFilters';

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

export { getTorProgressPercentage } from './torPercentageUtils';

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

export function getTorStageData(node: ITorNode, phase: TorProgressReportPhase): ITorProgressStageData {
  if (node.progressStages && node.progressStages.length > 0) {
    const stage = node.progressStages.find((s) => s.stageKey === phase);
    if (stage) return stage;
  }

  if (phase === 'FIRST_PROGRESS') {
    return {
      stageKey: phase,
      stageName: '1st Progress',
      status: node.firstProgress || (node.complianceStatus ? 'IN_PROGRESS' : 'PENDING'),
      auditorRemark: node.firstProgressAuditorRemark || (node.complianceStatus ? 'Initial evidence logs collected and mapped to ToR.' : null),
    };
  }
  if (phase === 'SECOND_PROGRESS') {
    return {
      stageKey: phase,
      stageName: '2nd Progress',
      status: node.secondProgress || (node.complianceStatus === 'COMPLIANT' ? 'PARTIALLY_COMPLIANT' : 'PENDING'),
      auditorRemark: node.secondProgressAuditorRemark || (node.analysisNotes ? 'Technical documentation under verification.' : null),
    };
  }
  if (phase === 'THIRD_PROGRESS') {
    return {
      stageKey: phase,
      stageName: '3rd Progress',
      status: node.thirdProgress || (node.complianceStatus || 'PENDING'),
      auditorRemark: node.thirdProgressAuditorRemark || (node.complianceStatus === 'COMPLIANT' ? 'Validation completed against baseline criteria.' : null),
    };
  }
  if (phase === 'FOURTH_PROGRESS') {
    return {
      stageKey: phase,
      stageName: '4th Progress',
      status: node.fourthProgress || (node.complianceStatus || 'PENDING'),
      auditorRemark: node.fourthProgressAuditorRemark || (node.complianceStatus === 'COMPLIANT' ? 'Fourth stage review verified against criteria.' : null),
    };
  }
  if (phase === 'FIFTH_PROGRESS') {
    return {
      stageKey: phase,
      stageName: '5th Progress',
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
