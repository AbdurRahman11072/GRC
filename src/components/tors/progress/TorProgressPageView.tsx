'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  BarChart2,
  FileSpreadsheet,
  Layers,
  SlidersHorizontal,
  Table,
} from 'lucide-react';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import {
  TorTableFilters,
  type TorFilterState,
} from '../table/TorTableFilters';
import {
  TorProgressTable,
  type TorReportFilter,
} from './TorProgressTable';
import { IndividualTorProgressReport } from './IndividualTorProgressReport';
import { TorProgressSummaryModal } from './TorProgressSummaryModal';
import { ConfigureProgressYearsModal } from './ConfigureProgressYearsModal';
import { useGetTorTreeQuery } from '../../../store/api/torApi';
import { useGetTicketsQuery } from '../../../store/api/drtApi';
import { useGetProjectByIdQuery } from '../../../store/api/projectApi';
import { getShortEntityName } from '../../../lib/utils';
import { getProjectAuditYears } from '../../../utils/projectTimeframe';
import {
  DRT_PROGRESS_PHASES,
  getPhaseTargetYear,
  type DrtProgressPhase,
} from '../../../lib/drtProgressUtils';
import {
  REPORT_PHASES,
  filterTorTree,
  countTorNodes,
  updateNodeRemarkRecursive,
  aggregateTorDrtProgress,
} from '../../../lib/torProgressUtils';
import type {
  ITorNode,
  TorProgressReportPhase,
  ITorProgressStageData,
} from '../../../types/tor.types';

export interface TorProgressPageViewProps {
  projectId: string;
}

const defaultFilters: TorFilterState = {
  searchTerm: '',
  department: 'ALL',
  assignedUser: 'ALL',
  progressStatus: 'ALL',
  drtStream: 'ALL',
};

export const TorProgressPageView: React.FC<TorProgressPageViewProps> = ({
  projectId,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTorId = searchParams?.get('torId') || '';

  const [selectedTorId, setSelectedTorId] = useState<string>(initialTorId);
  const [activeFilter, setActiveFilter] = useState<TorReportFilter>('ALL');
  const [filters, setFilters] = useState<TorFilterState>(defaultFilters);
  const [isConfigYearsOpen, setIsConfigYearsOpen] = useState(false);
  const [summaryModal, setSummaryModal] = useState<{
    node: ITorNode;
    phase: TorProgressReportPhase;
  } | null>(null);

  useEffect(() => {
    setSelectedTorId(initialTorId);
  }, [initialTorId]);

  const handleSelectTor = (torId: string) => {
    setSelectedTorId(torId);
    if (torId) {
      router.replace(`/projects/${projectId}/tor-progress?torId=${torId}`, {
        scroll: false,
      });
    } else {
      router.replace(`/projects/${projectId}/tor-progress`, { scroll: false });
    }
  };

  const { data: projData, isLoading: isProjectLoading } = useGetProjectByIdQuery(
    projectId,
    { skip: !projectId }
  );
  const project = projData?.data;
  const progressYearMapping = project?.progressYearMapping;
  const clientName = getShortEntityName(project?.client?.name, 'BTRC');
  const auditeeName = getShortEntityName(project?.auditee?.name, 'FHL');
  const auditYears = useMemo(() => getProjectAuditYears(project), [project]);

  const { data: treeData, isLoading: isTreeLoading } = useGetTorTreeQuery(
    projectId,
    { skip: !projectId }
  );

  const { data: ticketsData } = useGetTicketsQuery(
    { projectId },
    { skip: !projectId }
  );
  const allProjectTickets = useMemo(
    () => ticketsData?.data || [],
    [ticketsData?.data]
  );

  const [localNodes, setLocalNodes] = useState<ITorNode[]>([]);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw: any = treeData?.data;
    const parsed: ITorNode[] = Array.isArray(raw)
      ? raw
      : Array.isArray(raw?.tree)
      ? raw.tree
      : [];
    if (parsed.length > 0) {
      setLocalNodes(parsed);
    }
  }, [treeData?.data]);

  // Flatten all ToR nodes (up to level 1.1)
  const flatNodes = useMemo(() => {
    const flatten = (nodes: ITorNode[]): ITorNode[] =>
      nodes
        .filter((n) => !n.code || n.code.split('.').filter(Boolean).length <= 2)
        .flatMap((n) => [n, ...(n.children ? flatten(n.children) : [])]);
    return flatten(localNodes);
  }, [localNodes]);

  const selectedTorNode = useMemo(
    () => flatNodes.find((n) => n.id === selectedTorId) || null,
    [flatNodes, selectedTorId]
  );

  // Extract departments and assigned users for filter dropdowns
  const { departments, assignedUsers } = useMemo(() => {
    const depts = new Set<string>();
    const usersMap = new Map<string, string>();
    flatNodes.forEach((n) => {
      if (n.department) depts.add(n.department);
      (n.assignedMembers || []).forEach((am) => {
        if (am.userId && am.user?.name) usersMap.set(am.userId, am.user.name);
      });
    });
    return {
      departments: Array.from(depts).sort(),
      assignedUsers: Array.from(usersMap.entries()).map(([id, name]) => ({
        id,
        name,
      })),
    };
  }, [flatNodes]);

  const filteredTree = useMemo(
    () => filterTorTree(localNodes, filters),
    [localNodes, filters]
  );
  const totalCount = useMemo(() => countTorNodes(localNodes), [localNodes]);
  const filteredCount = useMemo(
    () => countTorNodes(filteredTree),
    [filteredTree]
  );

  // Compute ToR Phase KPI Rollup Cards
  const phaseKpis = useMemo(() => {
    return DRT_PROGRESS_PHASES.map((p) => {
      const targetYear = getPhaseTargetYear(p.key, auditYears, progressYearMapping);
      if (flatNodes.length === 0) {
        return { ...p, targetYear, avgPct: 0, completedClauses: 0 };
      }
      let sumPct = 0;
      let completedClauses = 0;
      flatNodes.forEach((node) => {
        const rollup = aggregateTorDrtProgress(
          node,
          p.key as DrtProgressPhase,
          allProjectTickets,
          auditYears,
          progressYearMapping
        );
        sumPct += rollup.effectivePercentage;
        if (rollup.effectivePercentage === 100) completedClauses += 1;
      });
      return {
        ...p,
        targetYear,
        avgPct: Math.round(sumPct / flatNodes.length),
        completedClauses,
      };
    });
  }, [flatNodes, allProjectTickets, auditYears, progressYearMapping]);

  const handleSaveSummary = (
    nodeId: string,
    phase: TorProgressReportPhase,
    updatedData: Partial<ITorProgressStageData>
  ) => {
    setLocalNodes((prev) =>
      updateNodeRemarkRecursive(prev, nodeId, phase, updatedData)
    );
  };

  if (isProjectLoading) {
    return (
      <div className="py-20 text-center text-xs text-slate-500">
        Loading ToR Progress &amp; DRT Rollup Reports...
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 flex-wrap">
            <Link href={`/projects/${projectId}?tab=tors`}>
              <Button
                variant="ghost"
                size="xs"
                leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
              >
                Back to ToR WBS Table
              </Button>
            </Link>
            <span className="text-slate-300">/</span>
            <Badge variant="success" size="xs" dot>
              ToR Progress &amp; DRT Rollup Reports
            </Badge>
            {project?.projectName && (
              <span className="text-xs font-semibold text-slate-600 truncate max-w-xs">
                {project.projectName}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="xs"
              onClick={() => setIsConfigYearsOpen(true)}
              leftIcon={<SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600" />}
            >
              Configure Progress Years
            </Button>
            <Link href={`/projects/${projectId}?tab=drt`}>
              <Button
                variant="outline"
                size="xs"
                leftIcon={<FileSpreadsheet className="w-3.5 h-3.5 text-indigo-600" />}
              >
                DRT Requests Hub ({allProjectTickets.length})
              </Button>
            </Link>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-2 border-t border-slate-100">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-emerald-600" />
              <span>ToR Progress, DRT Rollup &amp; Milestone Reports</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Automatically collects 1st–5th Progress percentages and Auditee/Auditor remarks from each ToR&apos;s linked DRTs (and child Sub-ToRs), alongside Incentive, Draft, and Final Audit Reports.
            </p>
          </div>

          {/* Mode Toggle: All ToRs Matrix vs Individual ToR Dossier */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => handleSelectTor('')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                !selectedTorNode
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>All ToRs WBS Matrix ({flatNodes.length})</span>
            </button>

            <div className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedTorId}
                onChange={(e) => handleSelectTor(e.target.value)}
                className="text-xs font-medium rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-indigo-600 max-w-[260px]"
              >
                <option value="">Inspect Individual ToR Report...</option>
                {flatNodes.map((n) => (
                  <option key={n.id} value={n.id}>
                    [ToR {n.code}] {n.title.slice(0, 46)}
                    {n.title.length > 46 ? '...' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Render either Individual ToR Progress Dossier OR All-ToRs WBS Matrix */}
      {selectedTorNode ? (
        <IndividualTorProgressReport
          projectId={projectId}
          node={selectedTorNode}
          flatNodes={flatNodes}
          allProjectTickets={allProjectTickets}
          auditYears={auditYears}
          progressYearMapping={progressYearMapping}
          clientName={clientName}
          auditeeName={auditeeName}
          onBackToAll={() => handleSelectTor('')}
          onSelectTor={handleSelectTor}
          onOpenSummaryModal={(node, phase) => setSummaryModal({ node, phase })}
        />
      ) : (
        <>
          {/* 5 Phase Rollup Summary Table (Equal Column Widths) */}
          <div className="w-full overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-2xs">
            <table className="w-full table-fixed border-collapse text-left text-xs min-w-[750px]">
              <thead>
                <tr className="bg-slate-100/90 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                  {phaseKpis.map((p) => (
                    <th
                      key={p.key}
                      onClick={() =>
                        setActiveFilter(
                          activeFilter === p.key ? 'ALL' : (p.key as TorReportFilter)
                        )
                      }
                      className={`py-2.5 px-3 text-center border-r last:border-r-0 border-slate-200 w-1/5 cursor-pointer transition-colors ${
                        activeFilter === p.key
                          ? 'bg-emerald-100 text-emerald-900'
                          : 'hover:bg-slate-200/60'
                      }`}
                    >
                      {p.shortLabel}{p.targetYear ? ` (${p.targetYear})` : ''}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {phaseKpis.map((p) => {
                    const isSelected = activeFilter === p.key;
                    return (
                      <td
                        key={p.key}
                        onClick={() =>
                          setActiveFilter(
                            isSelected ? 'ALL' : (p.key as TorReportFilter)
                          )
                        }
                        className={`py-2.5 px-3 text-center border-r last:border-r-0 border-slate-200 w-1/5 cursor-pointer transition-colors ${
                          isSelected ? 'bg-emerald-50/70' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1">
                          <span>Avg:</span>
                          <span className="font-mono text-emerald-700">{p.avgPct}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-1">
                          <div
                            className="h-full bg-emerald-600 rounded-full"
                            style={{ width: `${p.avgPct}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-500">
                          <span>
                            100% Clauses:{' '}
                            <strong>
                              {p.completedClauses}/{flatNodes.length}
                            </strong>
                          </span>
                          <span>{p.targetYear ? `Year ${p.targetYear}` : 'DRT Rollup'}</span>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Filters */}
          <TorTableFilters
            filters={filters}
            onChange={setFilters}
            onReset={() => setFilters(defaultFilters)}
            departments={departments}
            assignedMembers={assignedUsers}
            totalResults={totalCount}
            filteredResults={filteredCount}
          />

          {/* Report Switcher Pills */}
          <div className="flex items-center justify-between gap-3 flex-wrap px-1">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveFilter('ALL')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  activeFilter === 'ALL'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Reports &amp; Phases
              </button>
              {REPORT_PHASES.map((p) => {
                const targetYear = getPhaseTargetYear(p.key, auditYears, progressYearMapping);
                const label = targetYear ? `${p.shortLabel} (${targetYear})` : p.shortLabel;
                return (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => setActiveFilter(p.key)}
                    className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap cursor-pointer ${
                      activeFilter === p.key
                        ? 'bg-white text-indigo-700 shadow-2xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            <span className="text-xs text-slate-500">
              Tip: Click any <strong>ToR Code</strong> or <strong>Dossier</strong> button to view its Individual ToR Progress &amp; DRT Rollup Report.
            </span>
          </div>

          {/* Matrix Table */}
          {isTreeLoading ? (
            <div className="p-12 text-center text-xs text-slate-500 bg-white rounded-xl border border-slate-200">
              Loading ToR progress &amp; report rollup matrix...
            </div>
          ) : (
            <TorProgressTable
              treeNodes={filteredTree}
              allProjectTickets={allProjectTickets}
              auditYears={auditYears}
              progressYearMapping={progressYearMapping}
              activeFilter={activeFilter}
              onSelectTor={handleSelectTor}
              onOpenSummaryModal={(node, phase) =>
                setSummaryModal({ node, phase })
              }
            />
          )}
        </>
      )}

      {/* ToR Progress & DRT Rollup Summary Modal */}
      {summaryModal && (
        <TorProgressSummaryModal
          isOpen={Boolean(summaryModal)}
          onClose={() => setSummaryModal(null)}
          projectId={projectId}
          node={summaryModal.node}
          phase={summaryModal.phase}
          allProjectTickets={allProjectTickets}
          auditYears={auditYears}
          progressYearMapping={progressYearMapping}
          clientName={clientName}
          auditeeName={auditeeName}
          onSave={handleSaveSummary}
        />
      )}

      {/* Configure Progress Years Modal */}
      {isConfigYearsOpen && (
        <ConfigureProgressYearsModal
          isOpen={isConfigYearsOpen}
          onClose={() => setIsConfigYearsOpen(false)}
          projectId={projectId}
          auditYears={auditYears}
          currentMapping={progressYearMapping}
        />
      )}
    </div>
  );
};
