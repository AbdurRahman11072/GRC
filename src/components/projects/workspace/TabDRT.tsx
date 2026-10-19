'use client';

import React, { useState, useMemo } from 'react';
import {
  FilePlus,
  Search,
  Filter,
  Layers,
  FileCheck,
  AlertTriangle,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '../../ui/Button';
import { DrtTicketCard } from './drt/DrtTicketCard';
import { CreateDrtDrawer } from './CreateDrtDrawer';
import { UploadDrtDocumentModal } from './drt/UploadDrtDocumentModal';
import { ReviewDrtDocumentModal } from './drt/ReviewDrtDocumentModal';
import { AssignDrtSquadModal } from './drt/AssignDrtSquadModal';
import { useGetTicketsQuery } from '../../../store/api/drtApi';
import { useGetMyProjectPermissionsQuery } from '../../../store/api/projectApi';
import { useAppSelector } from '../../../store/hooks';
import type { IDRTTicket, IDRTDocument, DRTPartySide } from '../../../types/project.types';

export interface TabDRTProps {
  projectId: string;
}

export const TabDRT: React.FC<TabDRTProps> = ({ projectId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<
    'ALL' | 'PENDING' | 'SUBMITTED' | 'ACCEPTED' | 'OVERDUE'
  >('ALL');

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [uploadTicket, setUploadTicket] = useState<{
    ticket: IDRTTicket;
    side: DRTPartySide;
  } | null>(null);
  const [reviewDoc, setReviewDoc] = useState<IDRTDocument | null>(null);
  const [squadTicket, setSquadTicket] = useState<IDRTTicket | null>(null);

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

  const { data: ticketsData, isLoading } = useGetTicketsQuery({
    projectId,
    search: searchTerm.trim() || undefined,
  });

  const tickets = ticketsData?.data || [];

  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      if (filterMode === 'PENDING') return t.workflowStatus === 'OPEN';
      if (filterMode === 'SUBMITTED') return t.workflowStatus === 'SUBMITTED';
      if (filterMode === 'ACCEPTED') return t.workflowStatus === 'ACCEPTED';
      if (filterMode === 'OVERDUE') {
        return (
          t.expectedDateOfReceipt &&
          new Date(t.expectedDateOfReceipt) < new Date() &&
          t.workflowStatus !== 'ACCEPTED'
        );
      }
      return true;
    });
  }, [tickets, filterMode]);

  // Aggregate stats
  const totalTickets = tickets.length;
  const acceptedTickets = tickets.filter((t) => t.workflowStatus === 'ACCEPTED').length;
  const totalSubmissions = tickets.reduce(
    (acc, t) => acc + (t.drtDocuments?.length || 0),
    0
  );
  const overdueTickets = tickets.filter(
    (t) =>
      t.expectedDateOfReceipt &&
      new Date(t.expectedDateOfReceipt) < new Date() &&
      t.workflowStatus !== 'ACCEPTED'
  ).length;

  return (
    <div className="space-y-4">
      {/* Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-white rounded-xl border border-slate-200">
          <div className="text-[11px] font-semibold text-slate-500 uppercase flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
            Total Requests
          </div>
          <div className="text-xl font-bold text-slate-900 mt-1">{totalTickets}</div>
        </div>

        <div className="p-3 bg-white rounded-xl border border-slate-200">
          <div className="text-[11px] font-semibold text-slate-500 uppercase flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-600" />
            Evidence Submissions
          </div>
          <div className="text-xl font-bold text-cyan-700 mt-1">{totalSubmissions}</div>
        </div>

        <div className="p-3 bg-white rounded-xl border border-slate-200">
          <div className="text-[11px] font-semibold text-slate-500 uppercase flex items-center gap-1.5">
            <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
            Accepted / Verified
          </div>
          <div className="text-xl font-bold text-emerald-700 mt-1">{acceptedTickets}</div>
        </div>

        <div className="p-3 bg-white rounded-xl border border-slate-200">
          <div className="text-[11px] font-semibold text-slate-500 uppercase flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
            Overdue SLAs
          </div>
          <div className="text-xl font-bold text-rose-600 mt-1">{overdueTickets}</div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white rounded-xl border border-slate-200">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search code, title, department..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:border-indigo-600"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
            {(['ALL', 'PENDING', 'SUBMITTED', 'ACCEPTED', 'OVERDUE'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setFilterMode(mode)}
                className={`px-2.5 py-1 rounded-md font-medium capitalize transition-colors ${
                  filterMode === mode
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {mode.toLowerCase()}
              </button>
            ))}
          </div>

          {canCreateTicket && (
            <Button
              size="sm"
              variant="primary"
              onClick={() => setIsCreateOpen(true)}
              leftIcon={<FilePlus className="w-4 h-4" />}
            >
              Fire DRT Request
            </Button>
          )}
        </div>
      </div>

      {/* DRT Ticket Cards List */}
      {isLoading ? (
        <div className="p-8 text-center text-xs text-slate-500">Loading DRT requests...</div>
      ) : filteredTickets.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-xl border border-dashed border-slate-200">
          <p className="text-xs text-slate-500">No DRT request tickets match your filter criteria.</p>
          {canCreateTicket && (
            <Button
              size="sm"
              variant="outline"
              className="mt-3"
              onClick={() => setIsCreateOpen(true)}
              leftIcon={<FilePlus className="w-4 h-4" />}
            >
              Issue First DRT Ticket
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filteredTickets.map((ticket) => (
            <DrtTicketCard
              key={ticket.id}
              ticket={ticket}
              onUpload={(t, side) => setUploadTicket({ ticket: t, side })}
              onReview={(doc) => setReviewDoc(doc)}
              onManageSquad={(t) => setSquadTicket(t)}
              canUpload={Boolean(canUpload)}
              canReview={Boolean(canReview)}
            />
          ))}
        </div>
      )}

      {/* Modals & Drawers */}
      <CreateDrtDrawer
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        projectId={projectId}
      />

      <UploadDrtDocumentModal
        isOpen={Boolean(uploadTicket)}
        onClose={() => setUploadTicket(null)}
        ticket={uploadTicket?.ticket || null}
        defaultSide={uploadTicket?.side}
      />

      <ReviewDrtDocumentModal
        isOpen={Boolean(reviewDoc)}
        onClose={() => setReviewDoc(null)}
        document={reviewDoc}
      />

      <AssignDrtSquadModal
        isOpen={Boolean(squadTicket)}
        onClose={() => setSquadTicket(null)}
        ticket={squadTicket}
        projectId={projectId}
      />
    </div>
  );
};
