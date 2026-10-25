'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Search, Tags, AlertCircle, Save } from 'lucide-react';
import { Modal } from '../../../ui/Modal';
import { Button } from '../../../ui/Button';
import { Badge } from '../../../ui/Badge';
import { useMapToRsMutation } from '../../../../store/api/drtApi';
import { useGetTorTreeQuery } from '../../../../store/api/torApi';
import type { IDRTTicket } from '../../../../types/project.types';
import type { ITorNode } from '../../../../types/tor.types';

export interface ManageDrtTorsModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: IDRTTicket | null;
  projectId: string;
}

export const ManageDrtTorsModal: React.FC<ManageDrtTorsModalProps> = ({
  isOpen,
  onClose,
  ticket,
  projectId,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [mapToRs, { isLoading }] = useMapToRsMutation();
  const { data: treeData } = useGetTorTreeQuery(projectId, { skip: !isOpen });

  const flatTors: ITorNode[] = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tree: ITorNode[] = Array.isArray(treeData?.data) ? (treeData?.data as any) : (treeData?.data as any)?.tree || [];
    const flatten = (nodes: ITorNode[]): ITorNode[] =>
      nodes.flatMap((n) => [n, ...(n.children ? flatten(n.children) : [])]);
    return flatten(tree);
  }, [treeData]);

  // Extract initial linked ToR IDs from ticket
  useEffect(() => {
    if (isOpen && ticket) {
      const ids: string[] = [];
      if (ticket.torId) ids.push(ticket.torId);
      if (ticket.tors && Array.isArray(ticket.tors)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ticket.tors.forEach((t: any) => {
          const id = t.id || t.torId || t.tor?.id;
          if (id && !ids.includes(id)) ids.push(id);
        });
      }
      setSelectedIds(ids);
      setSearch('');
      setErrorMessage(null);
    }
  }, [isOpen, ticket]);

  const filteredTors = useMemo(() => {
    if (!search.trim()) return flatTors;
    const q = search.trim().toLowerCase();
    return flatTors.filter(
      (t) =>
        t.code.toLowerCase().includes(q) ||
        t.title.toLowerCase().includes(q) ||
        (t.department && t.department.toLowerCase().includes(q))
    );
  }, [flatTors, search]);

  const toggleTor = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    if (!ticket) return;
    setErrorMessage(null);
    try {
      await mapToRs({
        ticketId: ticket.id,
        torIds: selectedIds,
        action: 'SET',
      }).unwrap();
      onClose();
    } catch (err: unknown) {
      const error = err as { data?: { message?: string }; message?: string };
      setErrorMessage(error.data?.message || error.message || 'Failed to update ToR mappings');
    }
  };

  if (!ticket) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Manage ToR Activities — ${ticket.requestCode}`}
      description="Attach multiple Terms of Reference clauses satisfied by this DRT document request"
      size="lg"
    >
      {errorMessage && (
        <div className="mb-3 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-start gap-2 text-xs text-rose-500">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Ticket Context Header */}
      <div className="mb-4 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="indigo" size="sm">{ticket.requestCode}</Badge>
          <span className="font-semibold text-slate-900">{ticket.title || ticket.requestCode}</span>
          {ticket.department && (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
              {ticket.department}
            </span>
          )}
        </div>
        <p className="text-[11px] text-slate-500">
          Currently mapped to <strong className="text-indigo-600 font-bold">{selectedIds.length}</strong> ToR {selectedIds.length === 1 ? 'activity' : 'activities'}.
        </p>
      </div>

      {/* Search Input & Selection Helpers */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ToR code (e.g. 1.1, 2.1) or title..."
            className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs bg-white border border-slate-200 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600/20"
          />
        </div>
        <div className="flex items-center gap-1.5 text-xs shrink-0">
          <Button
            type="button"
            size="xs"
            variant="ghost"
            onClick={() => setSelectedIds(flatTors.map((t) => t.id))}
            className="text-[11px]"
          >
            Select All
          </Button>
          <Button
            type="button"
            size="xs"
            variant="ghost"
            onClick={() => setSelectedIds([])}
            className="text-[11px] text-slate-500"
          >
            Clear
          </Button>
        </div>
      </div>

      {/* ToR Checklist */}
      <div className="max-h-72 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100 bg-white">
        {filteredTors.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400">
            No Terms of Reference clauses found matching &quot;{search}&quot;.
          </div>
        ) : (
          filteredTors.map((tor) => {
            const isSelected = selectedIds.includes(tor.id);
            return (
              <label
                key={tor.id}
                className={`flex items-start gap-2.5 p-2.5 cursor-pointer hover:bg-slate-50 transition-colors ${
                  isSelected ? 'bg-indigo-50/40' : ''
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleTor(tor.id)}
                  className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-mono font-bold text-xs text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-200/60">
                      {tor.code}
                    </span>
                    <span className="font-medium text-slate-900 text-xs truncate max-w-sm" title={tor.title}>
                      {tor.title}
                    </span>
                    {tor.department && (
                      <span className="text-[10px] text-purple-700 bg-purple-50 px-1.5 rounded border border-purple-200">
                        {tor.department}
                      </span>
                    )}
                  </div>
                  {tor.objective && (
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{tor.objective}</p>
                  )}
                </div>
              </label>
            );
          })
        )}
      </div>

      {/* Footer Actions */}
      <div className="pt-4 mt-3 border-t border-slate-200 flex items-center justify-between">
        <div className="text-[11px] text-slate-500">
          <strong className="text-slate-900 font-bold">{selectedIds.length}</strong> selected
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleSave}
            isLoading={isLoading}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Save Mappings
          </Button>
        </div>
      </div>
    </Modal>
  );
};
