'use client';

import React from 'react';
import { UserCheck, Users, ShieldAlert, Check } from 'lucide-react';
import type { IOrgUserMember } from '../../../types/project.types';

interface StepAuditTeamProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any;
  members: IOrgUserMember[];
  isLoading?: boolean;
}

export const StepAuditTeam: React.FC<StepAuditTeamProps> = ({
  form,
  members,
  isLoading = false,
}) => {
  return (
    <div className="space-y-5">
      <div className="p-3.5 rounded-lg bg-indigo-50/50 border border-indigo-100 text-xs text-indigo-900 leading-relaxed">
        <strong>Audit Team Hierarchy & Governance:</strong> Project Managers can create ToRs and delegate DRTs. Supervisors check evidence and award marks. Field Team members upload documents and update ticket progress.
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-xs text-slate-500 animate-pulse">
          Loading organization members...
        </div>
      ) : members.length === 0 ? (
        <div className="py-6 px-4 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-500">
          No other organization members found. You can invite team members from the Organization Settings page, or assign yourself to lead this workspace.
        </div>
      ) : (
        <div className="space-y-5">
          {/* 1. Project Manager (Single Select) */}
          <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/20 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-purple-100">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-purple-700" />
                <h4 className="text-xs font-bold text-purple-900 uppercase tracking-wider">
                  Project Manager (Lead)
                </h4>
              </div>
              <span className="text-[11px] font-medium text-purple-600 bg-purple-100/70 px-2 py-0.5 rounded-full">
                WBS & Delegation Authority
              </span>
            </div>

            <form.Field name="projectManagerId">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(field: any) => (
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    Designated Project Manager
                  </label>
                  <select
                    value={field.state.value || ''}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="w-full bg-white border border-purple-200 rounded-lg px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  >
                    <option value="">Select a Project Manager...</option>
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.email}) {m.designation ? `— ${m.designation}` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </form.Field>
          </div>

          {/* 2. Supervisors (Multi-Select) */}
          <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/20 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-blue-100">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-blue-700" />
                <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider">
                  Supervisor(s)
                </h4>
              </div>
              <span className="text-[11px] font-medium text-blue-600 bg-blue-100/70 px-2 py-0.5 rounded-full">
                Review & Marks Authority
              </span>
            </div>

            <form.Field name="supervisorIds">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(field: any) => {
                const selected: string[] = field.state.value || [];

                const toggleSupervisor = (id: string) => {
                  if (selected.includes(id)) {
                    field.handleChange(selected.filter((item) => item !== id));
                  } else {
                    field.handleChange([...selected, id]);
                  }
                };

                return (
                  <div className="space-y-2">
                    <p className="text-xs text-slate-600">
                      Select one or more supervisors responsible for verifying deliverables and allocating marks:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                      {members.map((m) => {
                        const isChecked = selected.includes(m.id);
                        return (
                          <button
                            type="button"
                            key={m.id}
                            onClick={() => toggleSupervisor(m.id)}
                            className={`flex items-center justify-between p-2.5 rounded-lg border text-left text-xs transition-all ${
                              isChecked
                                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                : 'bg-white text-slate-800 border-slate-200 hover:border-blue-300'
                            }`}
                          >
                            <div className="truncate pr-2">
                              <p className="font-semibold truncate">{m.name}</p>
                              <p
                                className={`text-[10px] truncate ${
                                  isChecked ? 'text-blue-100' : 'text-slate-400'
                                }`}
                              >
                                {m.designation || m.email}
                              </p>
                            </div>
                            <div
                              className={`w-4 h-4 shrink-0 rounded flex items-center justify-center border ${
                                isChecked
                                  ? 'bg-white text-blue-600 border-white'
                                  : 'border-slate-300'
                              }`}
                            >
                              {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              }}
            </form.Field>
          </div>

          {/* 3. Field Team Members (Multi-Select) */}
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-emerald-100">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-700" />
                <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                  Field Team
                </h4>
              </div>
              <span className="text-[11px] font-medium text-emerald-600 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                Document & Evidence Upload
              </span>
            </div>

            <form.Field name="fieldTeamIds">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(field: any) => {
                const selected: string[] = field.state.value || [];

                const toggleFieldMember = (id: string) => {
                  if (selected.includes(id)) {
                    field.handleChange(selected.filter((item) => item !== id));
                  } else {
                    field.handleChange([...selected, id]);
                  }
                };

                return (
                  <div className="space-y-2">
                    <p className="text-xs text-slate-600">
                      Select field team members to upload evidence documents and interface with auditee departments:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                      {members.map((m) => {
                        const isChecked = selected.includes(m.id);
                        return (
                          <button
                            type="button"
                            key={m.id}
                            onClick={() => toggleFieldMember(m.id)}
                            className={`flex items-center justify-between p-2.5 rounded-lg border text-left text-xs transition-all ${
                              isChecked
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                : 'bg-white text-slate-800 border-slate-200 hover:border-emerald-300'
                            }`}
                          >
                            <div className="truncate pr-2">
                              <p className="font-semibold truncate">{m.name}</p>
                              <p
                                className={`text-[10px] truncate ${
                                  isChecked ? 'text-emerald-100' : 'text-slate-400'
                                }`}
                              >
                                {m.designation || m.email}
                              </p>
                            </div>
                            <div
                              className={`w-4 h-4 shrink-0 rounded flex items-center justify-center border ${
                                isChecked
                                  ? 'bg-white text-emerald-600 border-white'
                                  : 'border-slate-300'
                              }`}
                            >
                              {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              }}
            </form.Field>
          </div>
        </div>
      )}
    </div>
  );
};
