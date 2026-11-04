'use client';

import React, { useState } from 'react';
import { Filter, X, Search, Layers, Building2, ShieldCheck, CheckCircle2, RotateCcw } from 'lucide-react';

export interface IDrtFilterState {
  searchTerm: string;
  drtId: string;
  torId: string;
  drtFor: 'ALL' | 'CLIENT' | 'AUDITEE';
  department: string;
  status: 'ALL' | 'PENDING' | 'SUBMITTED' | 'ACCEPTED' | 'OVERDUE';
}

export interface DrtTableFiltersProps {
  filters: IDrtFilterState;
  onChange: (filters: IDrtFilterState) => void;
  onReset: () => void;
  torOptions: Array<{ id: string; code: string; title: string }>;
  departments: string[];
  clientName?: string;
  auditeeName?: string;
  totalCount: number;
  filteredCount: number;
}

export const DrtTableFilters: React.FC<DrtTableFiltersProps> = ({
  filters,
  onChange,
  onReset,
  torOptions,
  departments,
  clientName = 'BTRC',
  auditeeName = 'FHL',
  totalCount,
  filteredCount,
}) => {
  const [isExpanded, setIsExpanded] = useState(Boolean(filters.torId !== 'ALL' || filters.drtId || filters.department !== 'ALL'));

  const activeFilterCount =
    (filters.torId !== 'ALL' ? 1 : 0) +
    (filters.drtId.trim() ? 1 : 0) +
    (filters.drtFor !== 'ALL' ? 1 : 0) +
    (filters.department !== 'ALL' ? 1 : 0) +
    (filters.status !== 'ALL' ? 1 : 0);

  const selectedTor = torOptions.find((t) => t.id === filters.torId);

  const update = (patch: Partial<IDrtFilterState>) => {
    onChange({ ...filters, ...patch });
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs space-y-3">
      {/* Top Bar: Search, Filter Toggle Button & Count */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filters.searchTerm}
            onChange={(e) => update({ searchTerm: e.target.value })}
            placeholder="Search DRT code, description, remarks..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg text-xs bg-slate-50 border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border ${
              isExpanded || activeFilterCount > 0
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>

          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={onReset}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 flex items-center gap-1 transition-colors cursor-pointer"
              title="Reset all filters"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear</span>
            </button>
          )}

          <span className="text-[11px] text-slate-400 hidden md:inline-block">
            {filteredCount} of {totalCount} DRTs
          </span>
        </div>
      </div>

      {/* Expanded Filter Panel */}
      {isExpanded && (
        <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {/* 1. ToR ID Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Layers className="w-3 h-3 text-indigo-500" />
              ToR Clause
            </label>
            <select
              value={filters.torId}
              onChange={(e) => update({ torId: e.target.value })}
              className="w-full py-1.5 px-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-indigo-600 focus:bg-white"
            >
              <option value="ALL">All ToR Clauses</option>
              {torOptions.map((t) => (
                <option key={t.id} value={t.id}>
                  [{t.code}] {t.title}
                </option>
              ))}
            </select>
          </div>

          {/* 2. DRT ID Search */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Search className="w-3 h-3 text-slate-500" />
              DRT ID / Code
            </label>
            <input
              type="text"
              value={filters.drtId}
              onChange={(e) => update({ drtId: e.target.value })}
              placeholder="e.g. M1001-C"
              className="w-full py-1.5 px-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white"
            />
          </div>

          {/* 3. DRT For (Client vs Auditee) */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-cyan-600" />
              DRT For
            </label>
            <select
              value={filters.drtFor}
              onChange={(e) => update({ drtFor: e.target.value as any })}
              className="w-full py-1.5 px-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-indigo-600 focus:bg-white"
            >
              <option value="ALL">All Parties</option>
              <option value="CLIENT">{clientName} (Client)</option>
              <option value="AUDITEE">{auditeeName} (Auditee)</option>
            </select>
          </div>

          {/* 4. Department Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Building2 className="w-3 h-3 text-purple-600" />
              Department
            </label>
            <select
              value={filters.department}
              onChange={(e) => update({ department: e.target.value })}
              className="w-full py-1.5 px-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-indigo-600 focus:bg-white"
            >
              <option value="ALL">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* 5. Status Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => update({ status: e.target.value as any })}
              className="w-full py-1.5 px-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-indigo-600 focus:bg-white"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending / Open</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="OVERDUE">Overdue</option>
            </select>
          </div>
        </div>
      )}

      {/* Active Filter Chips */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
          <span className="text-slate-400 font-medium">Active:</span>
          {selectedTor && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold">
              ToR: [{selectedTor.code}] {selectedTor.title}
              <button type="button" onClick={() => update({ torId: 'ALL' })} className="hover:text-indigo-900 cursor-pointer"><X className="w-3 h-3" /></button>
            </span>
          )}
          {filters.drtId.trim() && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 font-semibold font-mono">
              ID: {filters.drtId}
              <button type="button" onClick={() => update({ drtId: '' })} className="hover:text-slate-900 cursor-pointer"><X className="w-3 h-3" /></button>
            </span>
          )}
          {filters.drtFor !== 'ALL' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200 font-semibold">
              Party: {filters.drtFor === 'CLIENT' ? clientName : auditeeName}
              <button type="button" onClick={() => update({ drtFor: 'ALL' })} className="hover:text-sky-900 cursor-pointer"><X className="w-3 h-3" /></button>
            </span>
          )}
          {filters.department !== 'ALL' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 font-semibold">
              Dept: {filters.department}
              <button type="button" onClick={() => update({ department: 'ALL' })} className="hover:text-purple-900 cursor-pointer"><X className="w-3 h-3" /></button>
            </span>
          )}
          {filters.status !== 'ALL' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
              Status: {filters.status}
              <button type="button" onClick={() => update({ status: 'ALL' })} className="hover:text-emerald-900 cursor-pointer"><X className="w-3 h-3" /></button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};
