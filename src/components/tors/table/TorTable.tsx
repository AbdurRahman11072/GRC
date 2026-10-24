'use client';

import React, { useState, useMemo } from 'react';
import { Search, Filter, Layers } from 'lucide-react';
import { TorTableRow } from './TorTableRow';
import type { ITorNode } from '../../../types/tor.types';

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
}

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
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Extract unique departments from all nodes
  const departments = useMemo(() => {
    const depts = new Set<string>();
    const walk = (nodes: ITorNode[]) => {
      nodes.forEach((n) => {
        if (n.department) depts.add(n.department);
        if (n.children) walk(n.children);
      });
    };
    walk(treeNodes);
    return Array.from(depts);
  }, [treeNodes]);

  // Filter nodes recursively while preserving matching children or parents
  const filteredNodes = useMemo(() => {
    if (!searchTerm.trim() && deptFilter === 'ALL' && statusFilter === 'ALL') {
      return treeNodes;
    }

    const term = searchTerm.toLowerCase().trim();

    const filterNode = (node: ITorNode): ITorNode | null => {
      const matchSearch =
        !term ||
        node.code.toLowerCase().includes(term) ||
        node.title.toLowerCase().includes(term) ||
        (node.description && node.description.toLowerCase().includes(term));

      const matchDept = deptFilter === 'ALL' || node.department === deptFilter;
      const matchStatus = statusFilter === 'ALL' || node.complianceStatus === statusFilter;

      const selfMatches = matchSearch && matchDept && matchStatus;

      let filteredChildren: ITorNode[] = [];
      if (node.children && node.children.length > 0) {
        filteredChildren = node.children
          .map(filterNode)
          .filter((c): c is ITorNode => c !== null);
      }

      if (selfMatches || filteredChildren.length > 0) {
        return {
          ...node,
          children: filteredChildren,
        };
      }

      return null;
    };

    return treeNodes.map(filterNode).filter((n): n is ITorNode => n !== null);
  }, [treeNodes, searchTerm, deptFilter, statusFilter]);

  return (
    <div className="space-y-3">
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 rounded-xl border border-slate-200 bg-white p-3 shadow-2xs">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search ToR ID (e.g. 1.1), title, or requirement..."
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              aria-label="Filter by department"
              className="py-1.5 px-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors"
            >
              <option value="ALL">All Departments</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by compliance status"
            className="py-1.5 px-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors"
          >
            <option value="ALL">All Compliance</option>
            <option value="COMPLIANT">Compliant</option>
            <option value="PARTIALLY_COMPLIANT">Partially Compliant</option>
            <option value="NON_COMPLIANT">Non-Compliant</option>
            <option value="NOT_EVALUATED">Not Evaluated</option>
          </select>
        </div>
      </div>

      {/* Enterprise Data Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/90 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              <th className="py-2.5 px-3 w-28 whitespace-nowrap">ToR ID</th>
              <th className="py-2.5 px-3 min-w-[240px]">Title & Scope</th>
              <th className="py-2.5 px-3 min-w-[200px]">DRT Document Status</th>
              <th className="py-2.5 px-3 text-center w-32 whitespace-nowrap">Collection Marks</th>
              <th className="py-2.5 px-3 text-center w-32 whitespace-nowrap">Analysis Marks</th>
              <th className="py-2.5 px-3 text-center w-28 whitespace-nowrap">Compliance</th>
              <th className="py-2.5 px-3 text-right w-56 min-w-[220px] whitespace-nowrap">Actions</th>
            </tr>
          </thead>
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
                />
              ))
            ) : (
              <tr>
                <td colSpan={7} className="py-12 text-center text-xs text-slate-500">
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
