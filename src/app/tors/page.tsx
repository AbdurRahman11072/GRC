'use client';

import React, { useState } from 'react';
import {
  Layers,
  PlusCircle,
  FileSpreadsheet,
  Building,
  Sliders,
  CheckCircle2,
  FolderKanban,
} from 'lucide-react';
import { Shell } from '../../components/layout/Shell';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { TorTreeNode } from '../../components/tors/TorTreeNode';
import { CreateTorModal } from '../../components/tors/CreateTorModal';
import { StreamWeightModal } from '../../components/tors/StreamWeightModal';
import { useGetProjectsQuery } from '../../store/api/projectApi';
import { useGetTorTreeQuery, useDeleteTorMutation } from '../../store/api/torApi';
import { useAppSelector } from '../../store/hooks';
import type { ITorNode } from '../../types/tor.types';

export default function TorsPage() {
  const { user, organizations, currentOrgId } = useAppSelector((state) => state.auth);
  const activeOrg = organizations.find((o) => o.orgId === currentOrgId) || organizations[0];
  const isOrgAdmin =
    user?.isSuperAdmin || activeOrg?.orgRole === 'OWNER' || activeOrg?.orgRole === 'ADMIN';

  const { data: projectsData, isLoading: isLoadingProjects } = useGetProjectsQuery(undefined, {
    skip: !isOrgAdmin,
  });
  const projects = projectsData?.data || [];

  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const activeProjectId = selectedProjectId || (projects[0]?.id ?? '');

  const { data: treeData, isLoading: isLoadingTree } = useGetTorTreeQuery(
    activeProjectId,
    { skip: !activeProjectId || !isOrgAdmin }
  );
  const rawData = treeData?.data as any;
  const treeNodes: ITorNode[] = Array.isArray(rawData)
    ? rawData
    : Array.isArray(rawData?.tree)
    ? rawData.tree
    : [];

  const [deleteTor] = useDeleteTorMutation();

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeParentId, setActiveParentId] = useState<string | null>(null);
  const [weightModalNode, setWeightModalNode] = useState<ITorNode | null>(null);

  if (!isOrgAdmin) {
    return (
      <Shell>
        <div className="py-24 text-center space-y-3 max-w-md mx-auto">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <Building className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Access Restricted</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Terms of Reference (ToR) WBS structure is restricted to Organization Administrators. Please use your Dashboard to view and upload against your assigned DRT tasks.
          </p>
        </div>
      </Shell>
    );
  }

  // Flatten tree for parent selection
  const flatNodes = React.useMemo(() => {
    const list: ITorNode[] = [];
    const walk = (nodes: ITorNode[]) => {
      nodes.forEach((n) => {
        list.push(n);
        if (n.children?.length) walk(n.children);
      });
    };
    walk(treeNodes);
    return list;
  }, [treeNodes]);

  const totalNodesCount = flatNodes.length;
  const totalCollectionMarks = flatNodes.reduce((acc, n) => acc + (n.streamWeights || []).reduce((wA, w) => wA + (w.dataCollectionAllocated || 0), 0), 0);
  const totalAnalysisMarks = flatNodes.reduce((acc, n) => acc + (n.streamWeights || []).reduce((wA, w) => wA + (w.dataAnalysisAllocated || 0), 0), 0);

  const handleOpenAddRoot = () => {
    setActiveParentId(null);
    setIsCreateModalOpen(true);
  };

  const handleOpenAddChild = (parentId: string) => {
    setActiveParentId(parentId);
    setIsCreateModalOpen(true);
  };

  const handleDeleteNode = async (nodeId: string) => {
    if (confirm('Are you sure you want to delete this ToR node and its sub-clauses?')) {
      try {
        await deleteTor(nodeId).unwrap();
      } catch {
        // Handled by API error interceptor
      }
    }
  };

  return (
    <Shell>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="indigo" size="sm">
                Audit Engine
              </Badge>
              <Badge variant="cyan" size="sm">
                WBS & Marks Engine
              </Badge>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Terms of Reference (ToR) Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              Define hierarchical compliance clauses, configure stream weights (Data Collection vs Analysis marks), and link DRT evidence.
            </p>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={handleOpenAddRoot}
            disabled={!activeProjectId}
            leftIcon={<PlusCircle className="w-4 h-4" />}
          >
            + Add ToR Node
          </Button>
        </div>

        {/* Project Selector Bar & Macro Stats */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Audit Project:
            </span>
            <select
              value={activeProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="px-3 py-1.5 rounded-lg text-xs bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-600"
            >
              {projects.length === 0 ? (
                <option value="">No Active Projects Found</option>
              ) : (
                projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.projectName} ({p.status})
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-4 text-xs text-slate-600">
            <span>
              Clauses: <strong className="text-slate-900">{totalNodesCount}</strong>
            </span>
            <span>
              Collection Marks: <strong className="text-indigo-600">{totalCollectionMarks.toFixed(1)}</strong>
            </span>
            <span>
              Analysis Marks: <strong className="text-cyan-700">{totalAnalysisMarks.toFixed(1)}</strong>
            </span>
          </div>
        </div>

        {/* WBS Tree View */}
        {isLoadingProjects || isLoadingTree ? (
          <div className="py-12 text-center text-xs text-slate-500">
            Loading Terms of Reference WBS tree...
          </div>
        ) : treeNodes.length > 0 ? (
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
            {treeNodes.map((rootNode) => (
              <TorTreeNode
                key={rootNode.id}
                node={rootNode}
                onAddChild={handleOpenAddChild}
                onConfigureWeights={(node) => setWeightModalNode(node)}
                onDelete={handleDeleteNode}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <Card className="p-8 text-center border-dashed border-slate-300 bg-white space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
              <Layers className="w-6 h-6" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-sm font-semibold text-slate-900">No ToR Clauses Configured</h3>
              <p className="text-xs text-slate-600">
                {activeProjectId
                  ? 'Add the first Terms of Reference root category (e.g., "1.0 Operational Auditing") to begin organizing clauses.'
                  : 'Create or select an audit project workspace first.'}
              </p>
            </div>
            {activeProjectId && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleOpenAddRoot}
                leftIcon={<PlusCircle className="w-4 h-4" />}
              >
                + Create Root ToR Clause
              </Button>
            )}
          </Card>
        )}
      </div>

      {/* Creation Modal */}
      {activeProjectId && (
        <CreateTorModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          projectId={activeProjectId}
          defaultParentId={activeParentId}
          flatNodes={flatNodes}
        />
      )}

      {/* Stream Weights Allocation Modal */}
      {weightModalNode && (
        <StreamWeightModal
          isOpen={!!weightModalNode}
          onClose={() => setWeightModalNode(null)}
          torNode={weightModalNode}
        />
      )}
    </Shell>
  );
}
