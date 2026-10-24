'use client';

import React, { useState } from 'react';
import { Layers, PlusCircle } from 'lucide-react';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';
import { TorTable } from '../../tors/table/TorTable';
import { CreateTorModal } from '../../tors/CreateTorModal';
import { EditTorModal } from '../../tors/EditTorModal';
import { StreamWeightModal } from '../../tors/StreamWeightModal';
import { TorAnalysisModal } from '../../tors/TorAnalysisModal';
import { TorDetailsDrawer } from '../../tors/details/TorDetailsDrawer';
import { CreateDrtDrawer } from './CreateDrtDrawer';
import { useGetTorTreeQuery, useDeleteTorMutation } from '../../../store/api/torApi';
import { useGetMyProjectPermissionsQuery } from '../../../store/api/projectApi';
import type { ITorNode } from '../../../types/tor.types';

export interface TabToRProps {
  projectId: string;
}

export const TabToR: React.FC<TabToRProps> = ({ projectId }) => {
  const { data: permData } = useGetMyProjectPermissionsQuery(projectId);
  const permissions = permData?.data;
  const canManageTor = permissions ? permissions.canCreateTor : true;
  const canConfigureWeights = permissions ? permissions.canAwardMarks : true;
  const canAwardMarks = permissions ? permissions.canAwardMarks : true;

  const { data: treeData, isLoading } = useGetTorTreeQuery(projectId);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawData = treeData?.data as any;
  const treeNodes: ITorNode[] = Array.isArray(rawData)
    ? rawData
    : Array.isArray(rawData?.tree)
    ? rawData.tree
    : [];

  const [deleteTor] = useDeleteTorMutation();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeParentId, setActiveParentId] = useState<string | null>(null);
  const [weightModalNode, setWeightModalNode] = useState<ITorNode | null>(null);
  const [fireDrtTorId, setFireDrtTorId] = useState<string | null>(null);
  const [evaluateTor, setEvaluateTor] = useState<ITorNode | null>(null);
  const [selectedTor, setSelectedTor] = useState<ITorNode | null>(null);
  const [editingTor, setEditingTor] = useState<ITorNode | null>(null);

  // Flatten tree for parent selection & macro metrics
  const flattenNodes = (nodes: ITorNode[]): ITorNode[] => {
    if (!Array.isArray(nodes)) return [];
    let result: ITorNode[] = [];
    nodes.forEach((n) => {
      result.push(n);
      if (n.children && n.children.length > 0) {
        result = result.concat(flattenNodes(n.children));
      }
    });
    return result;
  };
  const flatNodes = flattenNodes(treeNodes);

  // Macro metrics
  const totalNodesCount = flatNodes.length;
  const totalCollectionObtained = flatNodes.reduce((acc, n) => acc + (n.dataCollectionObtained || 0), 0);
  const totalCollectionAllocated = flatNodes.reduce((acc, n) => acc + (n.dataCollectionAllocated || 0), 0);
  const totalAnalysisObtained = flatNodes.reduce((acc, n) => acc + (n.dataAnalysisObtained || 0), 0);
  const totalAnalysisAllocated = flatNodes.reduce((acc, n) => acc + (n.dataAnalysisAllocated || 0), 0);

  const handleOpenAddRoot = () => {
    setActiveParentId(null);
    setIsCreateModalOpen(true);
  };

  const handleOpenAddChild = (parentId: string) => {
    setActiveParentId(parentId);
    setIsCreateModalOpen(true);
  };

  const handleDeleteNode = async (nodeId: string) => {
    if (confirm('Are you sure you want to delete this ToR clause and all its sub-clauses?')) {
      try {
        await deleteTor(nodeId).unwrap();
      } catch {
        // Handled by API error interceptor
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Tab Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-4 text-xs text-slate-600 flex-wrap">
          <span>
            Total Clauses: <strong className="text-slate-900 font-bold">{totalNodesCount}</strong>
          </span>
          <span className="flex items-center gap-1.5">
            Data Collection:
            <strong className="text-cyan-700 font-mono font-bold bg-cyan-50 border border-cyan-200/80 px-2 py-0.5 rounded-md">
              {totalCollectionObtained.toFixed(1)} / {totalCollectionAllocated.toFixed(1)}
            </strong>
          </span>
          <span className="flex items-center gap-1.5">
            Data Analysis:
            <strong className="text-indigo-600 font-mono font-bold bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 rounded-md">
              {totalAnalysisObtained.toFixed(1)} / {totalAnalysisAllocated.toFixed(1)}
            </strong>
          </span>
        </div>

        {canManageTor && (
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenAddRoot}
            leftIcon={<PlusCircle className="w-4 h-4" />}
          >
            + Add ToR Clause
          </Button>
        )}
      </div>

      {/* Table Rendering */}
      {isLoading ? (
        <div className="py-12 text-center text-xs text-slate-500">
          Loading Terms of Reference table...
        </div>
      ) : treeNodes.length > 0 ? (
        <TorTable
          treeNodes={treeNodes}
          canManageTor={canManageTor}
          canConfigureWeights={canConfigureWeights}
          canAwardMarks={canAwardMarks}
          onAddChild={handleOpenAddChild}
          onConfigureWeights={(node) => setWeightModalNode(node)}
          onDelete={handleDeleteNode}
          onFireDrt={(torId) => setFireDrtTorId(torId)}
          onEvaluateAnalysis={(node) => setEvaluateTor(node)}
          onSelectTor={(node) => setSelectedTor(node)}
          onEditTor={(node) => setEditingTor(node)}
        />
      ) : (
        <Card className="p-8 text-center border-dashed border-slate-200 bg-white shadow-2xs space-y-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
            <Layers className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-sm font-semibold text-slate-900">No ToR Clauses Configured Yet</h3>
            <p className="text-xs text-slate-500">
              Create the first Terms of Reference category to begin structuring your audit scope and issuing DRTs.
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenAddRoot}
            leftIcon={<PlusCircle className="w-4 h-4" />}
          >
            + Create Root ToR Clause
          </Button>
        </Card>
      )}

      {/* Modals & Drawers */}
      <CreateTorModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        projectId={projectId}
        defaultParentId={activeParentId}
        flatNodes={flatNodes}
      />

      <EditTorModal
        isOpen={!!editingTor}
        onClose={() => setEditingTor(null)}
        torNode={editingTor}
        flatNodes={flatNodes}
      />

      {weightModalNode && (
        <StreamWeightModal
          isOpen={!!weightModalNode}
          onClose={() => setWeightModalNode(null)}
          torNode={weightModalNode}
        />
      )}

      <TorAnalysisModal
        isOpen={!!evaluateTor}
        onClose={() => setEvaluateTor(null)}
        tor={evaluateTor}
      />

      <CreateDrtDrawer
        isOpen={!!fireDrtTorId}
        onClose={() => setFireDrtTorId(null)}
        projectId={projectId}
        defaultTorId={fireDrtTorId}
      />

      <TorDetailsDrawer
        isOpen={!!selectedTor}
        onClose={() => setSelectedTor(null)}
        torNode={selectedTor}
        canManageTor={canManageTor}
        canConfigureWeights={canConfigureWeights}
        canAwardMarks={canAwardMarks}
        onFireDrt={(torId) => {
          setSelectedTor(null);
          setFireDrtTorId(torId);
        }}
        onConfigureWeights={(node) => {
          setSelectedTor(null);
          setWeightModalNode(node);
        }}
        onEvaluateAnalysis={(node) => {
          setSelectedTor(null);
          setEvaluateTor(node);
        }}
        onEditTor={(node) => {
          setSelectedTor(null);
          setEditingTor(node);
        }}
      />
    </div>
  );
};
