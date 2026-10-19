'use client';

import React from 'react';
import type { IProjectMember } from '../../../../types/project.types';

export interface DrtSquadFieldsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any;
  orgMembers: IProjectMember[];
  clientMembers: IProjectMember[];
  auditeeMembers: IProjectMember[];
}

export const DrtSquadFields: React.FC<DrtSquadFieldsProps> = ({
  form,
  orgMembers,
  clientMembers,
  auditeeMembers,
}) => {
  return (
    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          Assign 4-Party Squad
        </h4>
        <span className="text-[10px] text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
          Internal + Stakeholders
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Audit Supervisor (Internal Firm) */}
        <form.Field name="supervisorId">
          {(field: any) => (
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Audit Supervisor (Firm)
              </label>
              <select
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-white border border-slate-200 text-slate-800 focus:outline-none focus:border-indigo-600"
              >
                <option value="">-- Select Supervisor --</option>
                {orgMembers.map((m) => (
                  <option key={m.userId} value={m.userId}>
                    {m.user?.name || m.user?.email}
                  </option>
                ))}
              </select>
            </div>
          )}
        </form.Field>

        {/* Field Member Uploader (Internal Firm) */}
        <form.Field name="fieldMemberId">
          {(field: any) => (
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Field Member (Uploader)
              </label>
              <select
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-white border border-slate-200 text-slate-800 focus:outline-none focus:border-indigo-600"
              >
                <option value="">-- Select Field Member --</option>
                {orgMembers.map((m) => (
                  <option key={m.userId} value={m.userId}>
                    {m.user?.name || m.user?.email}
                  </option>
                ))}
              </select>
            </div>
          )}
        </form.Field>

        {/* Client Focal (Regulator) */}
        <form.Field name="clientContactId">
          {(field: any) => (
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Client Focal (Regulator)
              </label>
              <select
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-white border border-slate-200 text-slate-800 focus:outline-none focus:border-indigo-600"
              >
                <option value="">-- Select Client Focal --</option>
                {clientMembers.map((m) => (
                  <option key={m.userId} value={m.userId}>
                    {m.user?.name || m.user?.email}
                  </option>
                ))}
              </select>
            </div>
          )}
        </form.Field>

        {/* Auditee Focal (Enterprise) */}
        <form.Field name="auditeeContactId">
          {(field: any) => (
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Auditee Focal (Enterprise Dept)
              </label>
              <select
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-white border border-slate-200 text-slate-800 focus:outline-none focus:border-indigo-600"
              >
                <option value="">-- Select Auditee Focal --</option>
                {auditeeMembers.map((m) => (
                  <option key={m.userId} value={m.userId}>
                    {m.user?.name || m.user?.email}
                    {m.user?.designation ? ` (${m.user.designation})` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}
        </form.Field>
      </div>
    </div>
  );
};
