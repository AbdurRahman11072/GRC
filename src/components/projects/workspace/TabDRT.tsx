'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  FilePlus,
  Table,
  LayoutGrid,
  Building,
  Building2,
  Users,
  FolderDown,
  FileCheck2,
} from 'lucide-react';
import { Button } from '../../ui/Button';
import { DrtMetricsBar } from './drt/DrtMetricsBar';
import { DrtTicketCard } from './drt/DrtTicketCard';
import { DrtTable } from './drt/DrtTable';
import { DrtModals } from './drt/DrtModals';
import { DrtTableFilters, type IDrtFilterState } from './drt/DrtTableFilters';
import { useGetTicketsQuery } from '../../../store/api/drtApi';
import { useGetTorTreeQuery } from '../../../store/api/torApi';
import { useGetMyProjectPermissionsQuery, useGetProjectByIdQuery } from '../../../store/api/projectApi';
import { useAppSelector } from '../../../store/hooks';
import { getProjectAuditYears } from '../../../utils/projectTimeframe';
import { getShortEntityName } from '../../../lib/utils';
import type { IDRTTicket, IDRTDocument, DRTPartySide, IProject } from '../../../types/project.types';
import type { ITorNode } from '../../../types/tor.types';

export interface TabDRTProps {
  projectId: string;
  project?: IProject | null;
  initialTorId?: string;
  onClearTorFilter?: () => void;
}

const defaultFilterState: IDrtFilterState = {
  searchTerm: '',
  drtId: '',
  torId: 'ALL',
  drtFor: 'ALL',
  department: 'ALL',
  status: 'ALL',
};

export const TabDRT: React.FC<TabDRTProps> = ({ projectId, project, initialTorId, onClearTorFilter }) => {
  const searchParams = useSearchParams();
  const urlParty = searchParams?.get('party')?.toUpperCase();
  const urlStream = searchParams?.get('stream')?.toLowerCase();

  const [selectedParty, setSelectedParty] = useState<'CLIENT' | 'AUDITEE' | 'ALL'>(() => {
    if (urlParty === 'CLIENT') return 'CLIENT';
    if (urlParty === 'AUDITEE') return 'AUDITEE';
    return 'ALL';
  });

  const [selectedStream, setSelectedStream] = useState<'collection' | 'analysis'>(() => {
    if (urlStream === 'analysis') return 'analysis';
    return 'collection';
  });

  const [filters, setFilters] = useState<IDrtFilterState>({
    ...defaultFilterState,
    torId: initialTorId || 'ALL',
  });
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  useEffect(() => {
    if (initialTorId) setFilters((prev) => ({ ...prev, torId: initialTorId }));
  }, [initialTorId]);

  useEffect(() => {
    if (urlParty === 'CLIENT' || urlParty === 'AUDITEE' || urlParty === 'ALL') {
      setSelectedParty(urlParty);
    }
  }, [urlParty]);

  useEffect(() => {
    if (urlStream === 'analysis' || urlStream === 'collection') {
      setSelectedStream(urlStream);
    }
  }, [urlStream]);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [uploadTicket, setUploadTicket] = useState<{ ticket: IDRTTicket; side: DRTPartySide; initialPeriodLabel?: string } | null>(null);
  const [reviewTarget, setReviewTarget] = useState<{ ticket: IDRTTicket; doc?: IDRTDocument } | null>(null);
  const [squadTicket, setSquadTicket] = useState<IDRTTicket | null>(null);
  const [periodModal, setPeriodModal] = useState<{ ticket: IDRTTicket; year: string } | null>(null);
  const [torsTicket, setTorsTicket] = useState<IDRTTicket | null>(null);
  const [analysisTicket, setAnalysisTicket] = useState<{ ticket: IDRTTicket; year?: string } | null>(null);
  const [remarkModal, setRemarkModal] = useState<{ ticket: IDRTTicket; side: 'AUDITOR' | 'AUDITEE' } | null>(null);

  const currentUser = useAppSelector((state) => state.auth.user);
  const currentOrgMembership = useAppSelector((state) =>
    state.auth.organizations.find((o) => o.orgId === state.auth.currentOrgId)
  );

  const isOrgAdmin =
    currentUser?.isSuperAdmin ||
    currentOrgMembership?.orgRole === 'OWNER' ||
    currentOrgMembership?.orgRole === 'ADMIN';

  const { data: permData } = useGetMyProjectPermissionsQuery(projectId);
  const permissions = permData?.data;
  const canCreateTicket = isOrgAdmin || permissions?.canAssignDrt;
  const canUpload = isOrgAdmin || permissions?.canUploadDocument;
  const canReview = isOrgAdmin || permissions?.canCheckDocument;

  const { data: projData } = useGetProjectByIdQuery(projectId, { skip: Boolean(project) });
  const currentProject = project || projData?.data;
  const clientName = getShortEntityName(currentProject?.client?.name, 'BTRC');
  const auditeeName = getShortEntityName(currentProject?.auditee?.name, 'FHL');
  const auditYears = useMemo(() => getProjectAuditYears(currentProject), [currentProject]);

  const { data: treeData } = useGetTorTreeQuery(projectId);
  const torOptions = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw: any = treeData?.data;
    const tree: ITorNode[] = Array.isArray(raw) ? raw : Array.isArray(raw?.tree) ? raw.tree : [];
    const flatten = (nodes: ITorNode[]): ITorNode[] =>
      nodes.flatMap((n) => [n, ...(n.children ? flatten(n.children) : [])]);
    return flatten(tree).map((t) => ({ id: t.id, code: t.code, title: t.title }));
  }, [treeData]);

  const { data: ticketsData, isLoading } = useGetTicketsQuery({
    projectId,
    search: filters.searchTerm.trim() || undefined,
  });

  const localTickets = useMemo(() => ticketsData?.data || [], [ticketsData?.data]);

  const clientCount = useMemo(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    () => localTickets.filter((t) => t.assignedTeamBucket === 'CLIENT' || (t as any).clientContactId != null).length,
    [localTickets]
  );
  const auditeeCount = useMemo(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    () => localTickets.filter((t) => t.assignedTeamBucket !== 'CLIENT' && !(t as any).clientContactId).length,
    [localTickets]
  );

  const departments = useMemo(() => {
    const depts = new Set<string>();
    localTickets.forEach((t) => { if (t.department?.trim()) depts.add(t.department.trim()); });
    return Array.from(depts).sort();
  }, [localTickets]);

  const filteredTickets = useMemo(() => {
    return localTickets.filter((t) => {
      // 1. Party / Stakeholder tab filter
      if (selectedParty === 'CLIENT') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const isClient = t.assignedTeamBucket === 'CLIENT' || (t as any).clientContactId != null;
        if (!isClient) return false;
      } else if (selectedParty === 'AUDITEE') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const isClient = t.assignedTeamBucket === 'CLIENT' || (t as any).clientContactId != null;
        if (isClient) return false;
      }

      // 2. Search / Code
      if (filters.drtId.trim()) {
        const q = filters.drtId.toLowerCase().trim();
        if (!t.requestCode.toLowerCase().includes(q)) return false;
      }

      // 3. ToR Filter
      if (filters.torId !== 'ALL') {
        const tid = filters.torId;
        const matchesTor =
          t.torId === tid ||
          t.tor?.id === tid ||
          t.tors?.some((m) => m.torId === tid || m.tor?.id === tid);
        if (!matchesTor) return false;
      }

      // 4. Manual filters
      if (filters.drtFor !== 'ALL' && t.assignedTeamBucket !== filters.drtFor) return false;
      if (filters.department !== 'ALL' && t.department !== filters.department) return false;
      if (filters.status !== 'ALL') {
        if (filters.status === 'PENDING' && t.workflowStatus !== 'OPEN') return false;
        if (filters.status === 'SUBMITTED' && t.workflowStatus !== 'SUBMITTED') return false;
        if (filters.status === 'ACCEPTED' && t.workflowStatus !== 'ACCEPTED') return false;
        if (filters.status === 'OVERDUE') {
          const isOverdue = t.expectedDateOfReceipt && new Date(t.expectedDateOfReceipt) < new Date() && t.workflowStatus !== 'ACCEPTED';
          if (!isOverdue) return false;
        }
      }
      return true;
    });
  }, [localTickets, selectedParty, filters]);

  const totalTickets = localTickets.length;
  const acceptedTickets = localTickets.filter((t) => t.workflowStatus === 'ACCEPTED').length;
  const totalSubmissions = localTickets.reduce((acc, t) => acc + (t.drtDocuments?.length || 0), 0);
  const overdueTickets = localTickets.filter((t) => t.expectedDateOfReceipt && new Date(t.expectedDateOfReceipt) < new Date() && t.workflowStatus !== 'ACCEPTED').length;

  return (
    <div className="space-y-4">
      {/* Metrics Bar */}
      <DrtMetricsBar totalTickets={totalTickets} totalSubmissions={totalSubmissions} acceptedTickets={acceptedTickets} overdueTickets={overdueTickets} />

      {/* Primary Party Switcher & Dual Stream (Collection vs Analysis) Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
        {/* Stakeholder Party Tabs */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">
            Stakeholder View:
          </span>
          <button
            type="button"
            onClick={() => setSelectedParty('AUDITEE')}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              selectedParty === 'AUDITEE'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>{auditeeName} (Auditee)</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                selectedParty === 'AUDITEE' ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-600'
              }`}
            >
              {auditeeCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedParty('CLIENT')}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              selectedParty === 'CLIENT'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>{clientName} (Client)</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                selectedParty === 'CLIENT' ? 'bg-indigo-700 text-white' : 'bg-slate-200 text-slate-600'
              }`}
            >
              {clientCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedParty('ALL')}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              selectedParty === 'ALL'
                ? 'bg-slate-800 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>All Stakeholders</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                selectedParty === 'ALL' ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-600'
              }`}
            >
              {totalTickets}
            </span>
          </button>
        </div>

        {/* Dual Stream Switcher Tabs: Data Collection vs Data Analysis */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg text-xs border border-slate-200">
          <button
            type="button"
            onClick={() => setSelectedStream('collection')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
              selectedStream === 'collection'
                ? 'bg-white text-emerald-700 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FolderDown className="w-3.5 h-3.5 text-emerald-600" />
            <span>Data Collection</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedStream('analysis')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
              selectedStream === 'analysis'
                ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileCheck2 className="w-3.5 h-3.5 text-indigo-600" />
            <span>Data Analysis</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <DrtTableFilters
        filters={filters} onChange={setFilters}
        onReset={() => { setFilters(defaultFilterState); onClearTorFilter?.(); }}
        torOptions={torOptions} departments={departments}
        clientName={clientName} auditeeName={auditeeName}
        totalCount={totalTickets} filteredCount={filteredTickets.length}
      />

      {/* Actions and View Mode Bar */}
      <div className="flex items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'table' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>Table View</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('cards')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'cards' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Cards View</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {canCreateTicket && (
            <Button size="sm" variant="primary" onClick={() => setIsCreateOpen(true)} leftIcon={<FilePlus className="w-4 h-4" />}>
              Fire DRT Request
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-xs text-slate-500">Loading DRT requests...</div>
      ) : filteredTickets.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-xl border border-dashed border-slate-200">
          <p className="text-xs text-slate-500">No DRT request tickets match your filter criteria.</p>
          {canCreateTicket && (
            <Button size="sm" variant="outline" className="mt-3" onClick={() => setIsCreateOpen(true)} leftIcon={<FilePlus className="w-4 h-4" />}>
              Issue First DRT Ticket
            </Button>
          )}
        </div>
      ) : viewMode === 'table' ? (
        <DrtTable
          projectId={projectId}
          tickets={filteredTickets}
          clientName={clientName}
          auditeeName={auditeeName}
          auditYears={auditYears}
          stream={selectedStream}
          onManageSquad={(t) => setSquadTicket(t)}
          onManageTors={(t) => setTorsTicket(t)}
          onOpenPeriodModal={(t, year) => setPeriodModal({ ticket: t, year })}
          onOpenUploadModal={(t, side) => setUploadTicket({ ticket: t, side })}
          onOpenAnalysisModal={(t, year) => setAnalysisTicket({ ticket: t, year })}
        />
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filteredTickets.map((ticket) => (
            <DrtTicketCard
              key={ticket.id}
              projectId={projectId}
              ticket={ticket}
              clientName={clientName}
              auditeeName={auditeeName}
              onUpload={(t, side) => setUploadTicket({ ticket: t, side })}
              onReview={(t, doc) => setReviewTarget({ ticket: t, doc })}
              onManageSquad={(t) => setSquadTicket(t)}
              onManageTors={(t) => setTorsTicket(t)}
              canUpload={Boolean(canUpload)}
              canReview={Boolean(canReview)}
            />
          ))}
        </div>
      )}

      <DrtModals
        projectId={projectId}
        auditYears={auditYears}
        clientName={clientName}
        auditeeName={auditeeName}
        isCreateOpen={isCreateOpen}
        onCloseCreate={() => setIsCreateOpen(false)}
        uploadTicket={uploadTicket}
        onCloseUpload={() => setUploadTicket(null)}
        reviewTarget={reviewTarget}
        onCloseReview={() => setReviewTarget(null)}
        squadTicket={squadTicket}
        onCloseSquad={() => setSquadTicket(null)}
        periodModal={periodModal}
        onClosePeriod={() => setPeriodModal(null)}
        onOpenUploadFromPeriod={(t, yr) => setUploadTicket({ ticket: t, side: 'AUDITEE', initialPeriodLabel: yr })}
        torsTicket={torsTicket}
        onCloseTors={() => setTorsTicket(null)}
        analysisTicket={analysisTicket}
        onCloseAnalysis={() => setAnalysisTicket(null)}
        remarkModal={remarkModal}
        onCloseRemark={() => setRemarkModal(null)}
      />
    </div>
  );
};
