'use client';

import React, { useState } from 'react';
import { Layers, PlusCircle } from 'lucide-react';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';
import { TorTreeNode } from '../../tors/TorTreeNode';
import { CreateTorModal } from '../../tors/CreateTorModal';
import { StreamWeightModal } from '../../tors/StreamWeightModal';
import { useGetTorTreeQuery, useDeleteTorMutation } from '../../../store/api/torApi';
import type { ITorNode } from '../../../types/tor.types';

interface TabToRProps {
  projectId: string;
}

export const TabToR: React.FC<TabToRProps> = ({ projectId }) => {
  const { data: treeData, isLoading } = useGetTorTreeQuery(projectId);
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

  // Flatten tree for parent selection
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
  const totalCollectionMarks = flatNodes.reduce(
    (acc, n) =>
      acc + (n.streamWeights || []).reduce((wAcc, w) => wAcc + (w.dataCollectionAllocated || 0), 0),
    0
  );
  const totalAnalysisMarks = flatNodes.reduce(
    (acc, n) =>
      acc + (n.streamWeights || []).reduce((wAcc, w) => wAcc + (w.dataAnalysisAllocated || 0), 0),
    0
  );

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
    <div className="space-y-5">
      {/* Tab Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-4 text-xs text-slate-600">
          <span>
            Total Clauses: <strong className="text-slate-900">{totalNodesCount}</strong>
          </span>
          <span>
            Collection Marks: <strong className="text-indigo-600">{totalCollectionMarks.toFixed(1)}</strong>
          </span>
          <span>
            Analysis Marks: <strong className="text-cyan-700">{totalAnalysisMarks.toFixed(1)}</strong>
          </span>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handleOpenAddRoot}
          leftIcon={<PlusCircle className="w-4 h-4" />}
        >
          + Add ToR Clause
        </Button>
      </div>

      {/* Tree Node Rendering */}
      {isLoading ? (
        <div className="py-12 text-center text-xs text-slate-500">
          Loading Terms of Reference WBS tree...
        </div>
      ) : treeNodes.length > 0 ? (
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2">
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
        <Card className="p-8 text-center border-dashed border-slate-300 bg-white shadow-xs space-y-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
            <Layers className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-sm font-semibold text-slate-900">No ToR Clauses Configured Yet</h3>
            <p className="text-xs text-slate-500">
              Create the first Terms of Reference root category (e.g. "1.0 Systems & Infrastructure") to begin structuring your audit scope.
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

      {/* Creation Modal */}
      <CreateTorModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        projectId={projectId}
        defaultParentId={activeParentId}
        flatNodes={flatNodes}
      />

      {/* Stream Weight Allocation Modal */}
      {weightModalNode && (
        <StreamWeightModal
          isOpen={!!weightModalNode}
          onClose={() => setWeightModalNode(null)}
          torNode={weightModalNode}
        />
      )}
    </div>
  );
};
