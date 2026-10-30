'use client';

import React from 'react';
import { Search, Filter, X, User, Layers } from 'lucide-react';

export interface TorFilterState {
  searchTerm: string;
  department: string;
  assignedUser: string;
  progressStatus: string;
  drtStream: string;
}

export interface TorTableFiltersProps {
  filters: TorFilterState;
  onChange: (filters: TorFilterState) => void;
  onReset: () => void;
  departments: string[];
  assignedMembers: { id: string; name: string }[];
  totalResults: number;
  filteredResults: number;
}

export const TorTableFilters: React.FC<TorTableFiltersProps> = ({
  filters,
  onChange,
  onReset,
  departments,
  assignedMembers,
  totalResults,
  filteredResults,
}) => {
  const isFiltered =
    Boolean(filters.searchTerm.trim()) ||
    filters.department !== 'ALL' ||
    filters.assignedUser !== 'ALL' ||
    filters.progressStatus !== 'ALL' ||
    filters.drtStream !== 'ALL';

  const update = (patch: Partial<TorFilterState>) => {
    onChange({ ...filters, ...patch });
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs space-y-2.5">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={filters.searchTerm}
            onChange={(e) => update({ searchTerm: e.target.value })}
            placeholder="Search clause code (e.g. 1.1), scope, remarks, or DRT code..."
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors"
          />
        </div>

        {/* Filter Controls Row */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Department Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filters.department}
              onChange={(e) => update({ department: e.target.value })}
              aria-label="Filter by department"
              className="py-1.5 px-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors"
            >
              <option value="ALL">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Assigned To Filter */}
          <div className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filters.assignedUser}
              onChange={(e) => update({ assignedUser: e.target.value })}
              aria-label="Filter by assigned member"
              className="py-1.5 px-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors"
            >
              <option value="ALL">All Assignees</option>
              <option value="UNASSIGNED">Unassigned</option>
              {assignedMembers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* Progress Status Filter */}
          <select
            value={filters.progressStatus}
            onChange={(e) => update({ progressStatus: e.target.value })}
            aria-label="Filter by progress status"
            className="py-1.5 px-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors"
          >
            <option value="ALL">All Progress Statuses</option>
            <option value="COMPLIANT">Compliant</option>
            <option value="PARTIALLY_COMPLIANT">Partially Compliant</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="NON_COMPLIANT">Non-Compliant</option>
            <option value="PENDING">Pending</option>
          </select>

          {/* DRT Stream Filter */}
          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filters.drtStream}
              onChange={(e) => update({ drtStream: e.target.value })}
              aria-label="Filter by DRT stream"
              className="py-1.5 px-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors"
            >
              <option value="ALL">All DRTs</option>
              <option value="HAS_DRT">Has Linked DRTs</option>
              <option value="NO_DRT">No DRTs Linked</option>
              <option value="BTRC_DRT">Has BTRC (Client) DRT</option>
              <option value="FHL_DRT">Has FHL (Auditee) DRT</option>
            </select>
          </div>

          {/* Clear Filters Button */}
          {isFiltered && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
            >
              <X className="w-3 h-3" />
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Results Count Bar */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
        <span>
          Showing <strong className="text-slate-800 font-semibold">{filteredResults}</strong> of{' '}
          <strong className="text-slate-800 font-semibold">{totalResults}</strong> ToR clauses
        </span>
        {isFiltered && (
          <span className="text-indigo-600 font-medium">
            Active filters applied
          </span>
        )}
      </div>
    </div>
  );
};
