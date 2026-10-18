'use client';

import React, { useState, useMemo } from 'react';
import { FileCheck, Search, Filter, Layers, Upload, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { DrtTorRow } from './drt/DrtTorRow';
import { UploadTorDocumentModal } from './drt/UploadTorDocumentModal';
import { AssignTorMemberModal } from './drt/AssignTorMemberModal';
import { useGetTorTreeQuery } from '../../../store/api/torApi';
import { useAppSelector } from '../../../store/hooks';
import type { ITorNode } from '../../../types/tor.types';

interface TabDRTProps {
  projectId: string;
}

export const TabDRT: React.FC<TabDRTProps> = ({ projectId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<'ALL' | 'SUBMITTED' | 'PENDING' | 'MY_TORS'>('ALL');
  const [activeUploadTor, setActiveUploadTor] = useState<ITorNode | null>(null);
  const [activeAssignTor, setActiveAssignTor] = useState<ITorNode | null>(null);

  const currentUser = useAppSelector((state) => state.auth.user);
  const currentOrgMembership = useAppSelector((state) =>
    state.auth.organizations.find((o) => o.orgId === state.auth.currentOrgId)
  );

  const isOrgAdmin =
    currentUser?.isSuperAdmin ||
    currentOrgMembership?.orgRole === 'OWNER' ||
    currentOrgMembership?.orgRole === 'ADMIN';

  const { data: treeData, isLoading } = useGetTorTreeQuery(projectId);

  // Flatten recursive ToR tree into array of clauses
  const flatNodes = useMemo(() => {
    const rawData = treeData?.data as any;
    const tree = Array.isArray(rawData) ? rawData : rawData?.tree || [];
    const result: ITorNode[] = [];
    const flatten = (nodes: ITorNode[]) => {
      nodes.forEach((n) => {
        result.push(n);
        if (n.children && n.children.length > 0) flatten(n.children);
      });
    };
    flatten(tree);
    return result;
  }, [treeData]);

  // Base accessible nodes: Non-admin org members ONLY see DRTs assigned to them by admin
  const accessibleNodes = useMemo(() => {
    if (isOrgAdmin) return flatNodes;
    return flatNodes.filter((n) =>
      Boolean(
        currentUser?.id &&
          n.assignedMembers?.some(
            (m) => m.userId === currentUser.id || m.user?.id === currentUser.id
          )
      )
    );
  }, [flatNodes, currentUser, isOrgAdmin]);

  // Filtered ToR items
  const filteredNodes = useMemo(() => {
    return accessibleNodes.filter((n) => {
      // Search query filter
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matches =
          n.code.toLowerCase().includes(q) ||
          n.title.toLowerCase().includes(q) ||
          (n.department && n.department.toLowerCase().includes(q));
        if (!matches) return false;
      }

      const docsCount = n.documents?.length || 0;
      const isAssignedToMe = Boolean(
        currentUser?.id && n.assignedMembers?.some((m) => m.userId === currentUser.id)
      );

      if (filterMode === 'SUBMITTED') return docsCount > 0;
      if (filterMode === 'PENDING') return docsCount === 0;
      if (filterMode === 'MY_TORS') return isAssignedToMe;
      return true;
    });
  }, [accessibleNodes, searchTerm, filterMode, currentUser]);

  // Aggregate stats
  const totalDocs = useMemo(() => {
    return accessibleNodes.reduce((acc, n) => acc + (n.documents?.length || 0), 0);
  }, [accessibleNodes]);

  const acceptedDocs = useMemo(() => {
    return accessibleNodes.reduce((acc, n) => {
      const docs = n.documents || [];
      return acc + docs.filter((d) => d.status === 'ACCEPTED').length;
    }, 0);
  }, [accessibleNodes]);

  return (
    <div className="space-y-5">
      {/* DRT Metric Summary Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-4 text-xs text-slate-600 flex-wrap">
          <span className="flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-indigo-600" />
            {isOrgAdmin ? 'Total ToR Clauses: ' : 'Your Assigned DRTs: '}
            <strong className="text-slate-900">{accessibleNodes.length}</strong>
          </span>
          <span className="flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-cyan-600" />
            Submitted Documents: <strong className="text-cyan-800">{totalDocs}</strong>
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Accepted: <strong className="text-emerald-700">{acceptedDocs}</strong>
          </span>
        </div>

        {/* Search input */}
        <div className="relative min-w-[240px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search code, title, or department..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg text-xs bg-slate-50 border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
        {[
          {
            id: 'ALL',
            label: isOrgAdmin
              ? `All ToRs (${accessibleNodes.length})`
              : `All Assigned DRTs (${accessibleNodes.length})`,
          },
          { id: 'SUBMITTED', label: 'With Documents' },
          { id: 'PENDING', label: 'Pending Evidence' },
          ...(isOrgAdmin ? [{ id: 'MY_TORS', label: 'Assigned to Me' }] : []),
        ].map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilterMode(f.id as any)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              filterMode === f.id
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* DRT ToRs Table */}
      {isLoading ? (
        <div className="py-14 text-center text-xs text-slate-500">
          Loading Data Request Tracker (ToRs and documents)...
        </div>
      ) : filteredNodes.length > 0 ? (
        <div className="space-y-3">
          {filteredNodes.map((node) => (
            <DrtTorRow
              key={node.id}
              tor={node}
              currentUserId={currentUser?.id}
              isOrgAdmin={isOrgAdmin}
              onOpenUpload={(tor) => setActiveUploadTor(tor)}
              onOpenAssign={(tor) => setActiveAssignTor(tor)}
            />
          ))}
        </div>
      ) : (
        <Card className="py-12 text-center text-xs text-slate-500 bg-white border-slate-200">
          No ToR clauses match the selected filter.
        </Card>
      )}

      {/* Upload Document Modal */}
      <UploadTorDocumentModal
        isOpen={Boolean(activeUploadTor)}
        onClose={() => setActiveUploadTor(null)}
        tor={activeUploadTor}
      />

      {/* Assign Member Modal */}
      <AssignTorMemberModal
        isOpen={Boolean(activeAssignTor)}
        onClose={() => setActiveAssignTor(null)}
        tor={activeAssignTor}
        projectId={projectId}
      />
    </div>
  );
};
