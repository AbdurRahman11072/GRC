'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  BarChart2,
  Layers,
  Table,
  FileSpreadsheet,
} from 'lucide-react';
import { Button } from '../../../ui/Button';
import { Badge } from '../../../ui/Badge';
import { DrtTableFilters, type IDrtFilterState } from '../drt/DrtTableFilters';
import { DrtProgressRemarkModal } from '../drt/DrtProgressRemarkModal';
import { DrtProgressTable } from './DrtProgressTable';
import { IndividualDrtProgressReport } from './IndividualDrtProgressReport';
import { useGetTicketsQuery } from '../../../../store/api/drtApi';
import { useGetTorTreeQuery } from '../../../../store/api/torApi';
import { useGetProjectByIdQuery } from '../../../../store/api/projectApi';
import { getProjectAuditYears } from '../../../../utils/projectTimeframe';
import { getShortEntityName } from '../../../../lib/utils';
import {
  DrtProgressPhase,
  DRT_PROGRESS_PHASES,
  getDrtStagePercentage,
  updateDrtProgressData,
} from '../../../../lib/drtProgressUtils';
import type { IDRTTicket } from '../../../../types/drt.types';
import type { ITorNode } from '../../../../types/tor.types';

export interface DrtProgressPageViewProps {
  projectId: string;
}

const defaultFilterState: IDrtFilterState = {
  searchTerm: '',
  drtId: '',
  torId: 'ALL',
  drtFor: 'ALL',
  department: 'ALL',
  status: 'ALL',
};

export const DrtProgressPageView: React.FC<DrtProgressPageViewProps> = ({ projectId }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTicketId = searchParams?.get('ticketId') || '';

  const [selectedTicketId, setSelectedTicketId] = useState<string>(initialTicketId);
  const [activePhase, setActivePhase] = useState<'ALL' | DrtProgressPhase>('ALL');
  const [filters, setFilters] = useState<IDrtFilterState>(defaultFilterState);
  const [progressModal, setProgressModal] = useState<{
    ticket: IDRTTicket;
    phase: DrtProgressPhase;
  } | null>(null);

  useEffect(() => {
    setSelectedTicketId(initialTicketId);
  }, [initialTicketId]);

  const handleSelectTicket = (ticketId: string) => {
    setSelectedTicketId(ticketId);
    if (ticketId) {
      router.replace(`/projects/${projectId}/drt-progress?ticketId=${ticketId}`, {
        scroll: false,
      });
    } else {
      router.replace(`/projects/${projectId}/drt-progress`, { scroll: false });
    }
  };

  const { data: projData, isLoading: isProjectLoading } = useGetProjectByIdQuery(projectId, {
    skip: !projectId,
  });
  const project = projData?.data;
  const clientName = getShortEntityName(project?.client?.name, 'BTRC');
  const auditeeName = getShortEntityName(project?.auditee?.name, 'FHL');
  const auditYears = useMemo(() => getProjectAuditYears(project), [project]);

  const { data: treeData } = useGetTorTreeQuery(projectId, { skip: !projectId });
  const torOptions = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw: any = treeData?.data;
    const tree: ITorNode[] = Array.isArray(raw)
      ? raw
      : Array.isArray(raw?.tree)
      ? raw.tree
      : [];
    const flatten = (nodes: ITorNode[]): ITorNode[] =>
      nodes.flatMap((n) => [n, ...(n.children ? flatten(n.children) : [])]);
    return flatten(tree).map((t) => ({ id: t.id, code: t.code, title: t.title }));
  }, [treeData]);

  const { data: ticketsData, isLoading: isTicketsLoading } = useGetTicketsQuery(
    {
      projectId,
      search: filters.searchTerm.trim() || undefined,
    },
    { skip: !projectId }
  );

  const [localTickets, setLocalTickets] = useState<IDRTTicket[]>([]);

  useEffect(() => {
    if (ticketsData?.data) {
      setLocalTickets(ticketsData.data);
    }
  }, [ticketsData?.data]);

  const departments = useMemo(() => {
    const depts = new Set<string>();
    localTickets.forEach((t) => {
      if (t.department?.trim()) depts.add(t.department.trim());
    });
    return Array.from(depts).sort();
  }, [localTickets]);

  const filteredTickets = useMemo(() => {
    return localTickets.filter((t) => {
      if (filters.drtId.trim()) {
        const q = filters.drtId.toLowerCase().trim();
        if (!t.requestCode.toLowerCase().includes(q)) return false;
      }
      if (filters.torId !== 'ALL') {
        const tid = filters.torId;
        const matchesTor =
          t.torId === tid ||
          t.tor?.id === tid ||
          t.tors?.some((m) => m.torId === tid || m.tor?.id === tid);
        if (!matchesTor) return false;
      }
      if (filters.drtFor !== 'ALL' && t.assignedTeamBucket !== filters.drtFor) return false;
      if (filters.department !== 'ALL' && t.department !== filters.department) return false;
      if (filters.status !== 'ALL') {
        if (filters.status === 'PENDING' && t.workflowStatus !== 'OPEN') return false;
        if (filters.status === 'SUBMITTED' && t.workflowStatus !== 'SUBMITTED') return false;
        if (filters.status === 'ACCEPTED' && t.workflowStatus !== 'ACCEPTED') return false;
        if (filters.status === 'OVERDUE') {
          const isOverdue =
            t.expectedDateOfReceipt &&
            new Date(t.expectedDateOfReceipt) < new Date() &&
            t.workflowStatus !== 'ACCEPTED';
          if (!isOverdue) return false;
        }
      }
      return true;
    });
  }, [localTickets, filters]);

  const selectedTicket = useMemo(
    () => localTickets.find((t) => t.id === selectedTicketId) || null,
    [localTickets, selectedTicketId]
  );

  // Compute KPI metrics for each of the 5 phases
  const phaseSummaries = useMemo(() => {
    return DRT_PROGRESS_PHASES.map((p) => {
      if (localTickets.length === 0) {
        return { ...p, avgPct: 0, completedCount: 0, remarksCount: 0 };
      }
      let sumPct = 0;
      let completedCount = 0;
      let remarksCount = 0;

      localTickets.forEach((t) => {
        const pct = getDrtStagePercentage(t, p.key);
        sumPct += pct;
        if (pct === 100) completedCount += 1;

        const keyPrefix =
          p.key === 'FIRST_PROGRESS'
            ? 'firstProgress'
            : p.key === 'SECOND_PROGRESS'
            ? 'secondProgress'
            : p.key === 'THIRD_PROGRESS'
            ? 'thirdProgress'
            : p.key === 'FOURTH_PROGRESS'
            ? 'fourthProgress'
            : 'fifthProgress';
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const auditeeRem = (t as any)[`${keyPrefix}AuditeeRemark`];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const auditorRem = (t as any)[`${keyPrefix}AuditorRemark`];
        if (auditeeRem || auditorRem) remarksCount += 1;
      });

      return {
        ...p,
        avgPct: Math.round(sumPct / localTickets.length),
        completedCount,
        remarksCount,
      };
    });
  }, [localTickets]);

  const handleSaveProgress = (
    ticketId: string,
    phase: DrtProgressPhase,
    updatedData: {
      status?: string;
      percentage?: number;
      auditeeRemark?: string | null;
      auditorRemark?: string | null;
    }
  ) => {
    setLocalTickets((prev) => updateDrtProgressData(prev, ticketId, phase, updatedData));
  };

  if (isProjectLoading) {
    return (
      <div className="py-20 text-center text-xs text-slate-500">
        Loading DRT Progress Reports workspace...
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 flex-wrap">
            <Link href={`/projects/${projectId}?tab=drt`}>
              <Button variant="ghost" size="xs" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
                Back to DRT Table
              </Button>
            </Link>
            <span className="text-slate-300">/</span>
            <Badge variant="indigo" size="xs" dot>
              DRT Progress &amp; Remarks
            </Badge>
            {project?.projectName && (
              <span className="text-xs font-semibold text-slate-600 truncate max-w-xs">
                {project.projectName}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Link href={`/projects/${projectId}/tor-progress`}>
              <Button
                variant="outline"
                size="xs"
                leftIcon={<Layers className="w-3.5 h-3.5 text-emerald-600" />}
              >
                ToR Progress &amp; Rollup Reports
              </Button>
            </Link>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-2 border-t border-slate-100">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-indigo-600" />
              <span>DRT 1st–5th Progress &amp; Remarks Hub</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Track and evaluate 1st through 5th Progress percentages, Auditee Remarks, and Auditor Observations across all DRT tickets or inspect any individual DRT dossier.
            </p>
          </div>

          {/* Mode Toggle: All DRTs Matrix vs Individual DRT Report */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => handleSelectTicket('')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                !selectedTicket
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>All DRTs Matrix ({localTickets.length})</span>
            </button>

            <div className="flex items-center gap-1.5">
              <FileSpreadsheet className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedTicketId}
                onChange={(e) => handleSelectTicket(e.target.value)}
                className="text-xs font-medium rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-indigo-600 max-w-[260px]"
              >
                <option value="">Inspect Individual DRT Report...</option>
                {localTickets.map((t) => (
                  <option key={t.id} value={t.id}>
                    [{t.requestCode}] {t.description.slice(0, 48)}
                    {t.description.length > 48 ? '...' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Render either Individual DRT Progress Dossier OR All-DRTs Progress Matrix */}
      {selectedTicket ? (
        <IndividualDrtProgressReport
          projectId={projectId}
          ticket={selectedTicket}
          allTickets={localTickets}
          auditYears={auditYears}
          clientName={clientName}
          auditeeName={auditeeName}
          onBackToAll={() => handleSelectTicket('')}
          onSelectTicket={handleSelectTicket}
          onOpenProgressModal={(ticket, phase) => setProgressModal({ ticket, phase })}
        />
      ) : (
        <>
          {/* 5 Phase Summary Table (Equal Column Widths) */}
          <div className="w-full overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-2xs">
            <table className="w-full table-fixed border-collapse text-left text-xs min-w-[750px]">
              <thead>
                <tr className="bg-slate-100/90 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                  {phaseSummaries.map((p) => (
                    <th
                      key={p.key}
                      onClick={() => setActivePhase(activePhase === p.key ? 'ALL' : p.key)}
                      className={`py-2.5 px-3 text-center border-r last:border-r-0 border-slate-200 w-1/5 cursor-pointer transition-colors ${
                        activePhase === p.key
                          ? 'bg-indigo-100 text-indigo-900'
                          : 'hover:bg-slate-200/60'
                      }`}
                    >
                      {p.shortLabel}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {phaseSummaries.map((p) => {
                    const isSelected = activePhase === p.key;
                    return (
                      <td
                        key={p.key}
                        onClick={() => setActivePhase(isSelected ? 'ALL' : p.key)}
                        className={`py-2.5 px-3 text-center border-r last:border-r-0 border-slate-200 w-1/5 cursor-pointer transition-colors ${
                          isSelected ? 'bg-indigo-50/70' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1">
                          <span>Avg:</span>
                          <span className="font-mono text-indigo-700">{p.avgPct}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-1">
                          <div
                            className="h-full bg-indigo-600 rounded-full"
                            style={{ width: `${p.avgPct}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-500">
                          <span>
                            Done: <strong>{p.completedCount}/{localTickets.length}</strong>
                          </span>
                          <span>
                            Remarks: <strong>{p.remarksCount}</strong>
                          </span>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Filters */}
          <DrtTableFilters
            filters={filters}
            onChange={setFilters}
            onReset={() => setFilters(defaultFilterState)}
            torOptions={torOptions}
            departments={departments}
            clientName={clientName}
            auditeeName={auditeeName}
            totalCount={localTickets.length}
            filteredCount={filteredTickets.length}
          />

          {/* Phase Switcher Pills */}
          <div className="flex items-center justify-between gap-3 flex-wrap px-1">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs overflow-x-auto">
              <button
                type="button"
                onClick={() => setActivePhase('ALL')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  activePhase === 'ALL'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All 5 Phases
              </button>
              {DRT_PROGRESS_PHASES.map((p) => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => setActivePhase(p.key)}
                  className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap cursor-pointer ${
                    activePhase === p.key
                      ? 'bg-white text-indigo-700 shadow-2xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {p.shortLabel}
                </button>
              ))}
            </div>

            <span className="text-xs text-slate-500">
              Tip: Click any <strong>DRT ID</strong> or <strong>Report</strong> button to open its Individual DRT Progress Dossier.
            </span>
          </div>

          {/* Matrix Table */}
          {isTicketsLoading ? (
            <div className="p-12 text-center text-xs text-slate-500 bg-white rounded-xl border border-slate-200">
              Loading DRT progress matrix...
            </div>
          ) : (
            <DrtProgressTable
              projectId={projectId}
              tickets={filteredTickets}
              auditYears={auditYears}
              clientName={clientName}
              auditeeName={auditeeName}
              activePhase={activePhase}
              onSelectTicket={handleSelectTicket}
              onOpenProgressModal={(ticket, phase) => setProgressModal({ ticket, phase })}
            />
          )}
        </>
      )}

      {/* Progress & Remarks Edit Modal */}
      {progressModal && (
        <DrtProgressRemarkModal
          isOpen={Boolean(progressModal)}
          onClose={() => setProgressModal(null)}
          ticket={progressModal.ticket}
          phase={progressModal.phase}
          onSave={handleSaveProgress}
        />
      )}
    </div>
  );
};
