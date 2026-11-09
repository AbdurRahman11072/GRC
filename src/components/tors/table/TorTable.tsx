'use client';

import React, { useState, useMemo } from 'react';
import { Layers } from 'lucide-react';
import { TorTableHeader } from './TorTableHeader';
import { TorTableRow } from './TorTableRow';
import { TorTableFilters, type TorFilterState } from './TorTableFilters';
import type { ITorNode } from '../../../types/tor.types';
import { useHorizontalScroll } from '../../../hooks/useHorizontalScroll';
import {
  filterTorTree,
  countTorNodes,
} from '../../../lib/torProgressUtils';

export interface TorTableProps {
  treeNodes: ITorNode[];
  canManageTor?: boolean;
  canConfigureWeights?: boolean;
  canAwardMarks?: boolean;
  onAddChild: (parentId: string) => void;
  onConfigureWeights: (node: ITorNode) => void;
  onDelete: (nodeId: string) => void;
  onFireDrt?: (torId: string) => void;
  onEvaluateAnalysis?: (node: ITorNode) => void;
  onSelectTor?: (node: ITorNode) => void;
  onEditTor?: (node: ITorNode) => void;
  onNavigateToDrt?: (torId: string) => void;
}

const defaultFilters: TorFilterState = {
  searchTerm: '',
  department: 'ALL',
  assignedUser: 'ALL',
  progressStatus: 'ALL',
  drtStream: 'ALL',
};

export const TorTable: React.FC<TorTableProps> = ({
  treeNodes,
  canManageTor,
  canConfigureWeights,
  canAwardMarks,
  onAddChild,
  onConfigureWeights,
  onDelete,
  onFireDrt,
  onEvaluateAnalysis,
  onSelectTor,
  onEditTor,
  onNavigateToDrt,
}) => {
  const [filters, setFilters] = useState<TorFilterState>(defaultFilters);

  const { departments, assignedMembers } = useMemo(() => {
    const depts = new Set<string>();
    const membersMap = new Map<string, string>();

    const walk = (nodes: ITorNode[]) => {
      nodes.forEach((n) => {
        if (n.department) depts.add(n.department);
        n.assignedMembers?.forEach((am) => {
          if (am.userId && am.user?.name) {
            membersMap.set(am.userId, am.user.name);
          }
        });
        if (n.children) walk(n.children);
      });
    };
    walk(treeNodes);

    return {
      departments: Array.from(depts),
      assignedMembers: Array.from(membersMap.entries()).map(([id, name]) => ({ id, name })),
    };
  }, [treeNodes]);

  const filteredNodes = useMemo(() => filterTorTree(treeNodes, filters), [treeNodes, filters]);
  const totalCount = useMemo(() => countTorNodes(treeNodes), [treeNodes]);
  const filteredCount = useMemo(() => countTorNodes(filteredNodes), [filteredNodes]);

  const tableContainerRef = useHorizontalScroll<HTMLDivElement>({
    speed: 1.2,
    allowVerticalAtBoundaries: true,
  });

  return (
    <div className="space-y-3">
      {/* Search & Dynamic Filters Toolbar */}
      <TorTableFilters
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters(defaultFilters)}
        departments={departments}
        assignedMembers={assignedMembers}
        totalResults={totalCount}
        filteredResults={filteredCount}
      />

      {/* Enterprise Data Table */}
      <div
        ref={tableContainerRef}
        className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs max-w-full"
      >
        <table className="w-full text-left border-collapse min-w-[960px]">
          <TorTableHeader />
          <tbody>
            {filteredNodes.length > 0 ? (
              filteredNodes.map((rootNode) => (
                <TorTableRow
                  key={rootNode.id}
                  node={rootNode}
                  canManageTor={canManageTor}
                  canConfigureWeights={canConfigureWeights}
                  canAwardMarks={canAwardMarks}
                  onAddChild={onAddChild}
                  onConfigureWeights={onConfigureWeights}
                  onDelete={onDelete}
                  onFireDrt={onFireDrt}
                  onEvaluateAnalysis={onEvaluateAnalysis}
                  onSelectTor={onSelectTor}
                  onEditTor={onEditTor}
                  onNavigateToDrt={onNavigateToDrt}
                />
              ))
            ) : (
              <tr>
                <td colSpan={8} className="py-12 text-center text-xs text-slate-500">
                  <div className="flex flex-col items-center gap-2">
                    <Layers className="w-6 h-6 text-slate-400" />
                    <span>No Terms of Reference clauses found matching your filter criteria.</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
