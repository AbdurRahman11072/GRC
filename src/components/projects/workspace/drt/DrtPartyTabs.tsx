'use client';

import React from 'react';
import { Building, Building2 } from 'lucide-react';
import { RichTextEditor } from '../../../ui/RichTextEditor';

export interface DrtPartyTabsProps {
  activeTab: 'CLIENT' | 'AUDITEE';
  setActiveTab: (tab: 'CLIENT' | 'AUDITEE') => void;
  clientName?: string;
  auditeeName?: string;
  clientDepartment: string;
  setClientDepartment: (val: string) => void;
  clientDescription: string;
  setClientDescription: (val: string) => void;
  auditeeDepartment: string;
  setAuditeeDepartment: (val: string) => void;
  auditeeDescription: string;
  setAuditeeDescription: (val: string) => void;
}

const deptSuggestions = [
  'IT & Infrastructure',
  'Transmission & Network Operations',
  'Billing & Revenue Assurance',
  'Legal & Regulatory Affairs',
  'Finance & Accounts',
  'Customer Care & Operations',
];

export const DrtPartyTabs: React.FC<DrtPartyTabsProps> = ({
  activeTab,
  setActiveTab,
  clientName = 'BTRC',
  auditeeName = 'FHL',
  clientDepartment,
  setClientDepartment,
  clientDescription,
  setClientDescription,
  auditeeDepartment,
  setAuditeeDepartment,
  auditeeDescription,
  setAuditeeDescription,
}) => {
  return (
    <div className="space-y-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 shadow-2xs">
      <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
        <div>
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
            Party-Specific Requirements
          </span>
          <span className="text-[11px] text-slate-500">
            Separate department routing and descriptions for each stakeholder
          </span>
        </div>
        <div className="inline-flex p-0.5 rounded-lg bg-slate-200/80">
          <button
            type="button"
            onClick={() => setActiveTab('CLIENT')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'CLIENT'
                ? 'bg-white text-indigo-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building className="w-3.5 h-3.5 text-indigo-600" />
            <span>Client ({clientName})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('AUDITEE')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'AUDITEE'
                ? 'bg-white text-emerald-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Auditee ({auditeeName})</span>
          </button>
        </div>
      </div>

      {activeTab === 'CLIENT' ? (
        <div className="space-y-3 animate-in fade-in duration-150">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              {clientName} Department
            </label>
            <input
              list="client-dept-suggestions"
              value={clientDepartment}
              onChange={(e) => setClientDepartment(e.target.value)}
              placeholder="e.g. Legal & Regulatory Affairs, Technical Division"
              className="w-full px-3 py-2 rounded-lg text-xs bg-white border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600"
            />
            <datalist id="client-dept-suggestions">
              {deptSuggestions.map((d) => (
                <option key={d} value={d} />
              ))}
            </datalist>
          </div>

          <RichTextEditor
            label={`${clientName} Request Description (Rich Text) *`}
            value={clientDescription}
            onChange={setClientDescription}
            placeholder={`Specify regulatory information, letters, or approvals required from ${clientName}...`}
          />
        </div>
      ) : (
        <div className="space-y-3 animate-in fade-in duration-150">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              {auditeeName} Department
            </label>
            <input
              list="auditee-dept-suggestions"
              value={auditeeDepartment}
              onChange={(e) => setAuditeeDepartment(e.target.value)}
              placeholder="e.g. IT & Infrastructure, Billing & Revenue"
              className="w-full px-3 py-2 rounded-lg text-xs bg-white border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600"
            />
            <datalist id="auditee-dept-suggestions">
              {deptSuggestions.map((d) => (
                <option key={d} value={d} />
              ))}
            </datalist>
          </div>

          <RichTextEditor
            label={`${auditeeName} Request Description (Rich Text) *`}
            value={auditeeDescription}
            onChange={setAuditeeDescription}
            placeholder={`Specify operational documentation, configuration exports, or log records required from ${auditeeName}...`}
          />
        </div>
      )}
    </div>
  );
};
