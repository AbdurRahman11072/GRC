'use client';

import React from 'react';
import { useStore } from '@tanstack/react-form';
import { Building, ShieldCheck } from 'lucide-react';
import { FormField } from '../../form/FormField';
import { FormSelect } from '../../form/FormSelect';
import { Badge } from '../../ui/Badge';
import { useGetEntityContactsQuery } from '../../../store/api/crmApi';

interface StepEntitiesProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any;
  clientEntities: Array<{ label: string; value: string | number }>;
  auditeeEntities: Array<{ label: string; value: string | number }>;
}

export const StepEntities: React.FC<StepEntitiesProps> = ({
  form,
  clientEntities,
  auditeeEntities,
}) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const selectedClientId = useStore(form.store, (s: any) => s.values.selectedClientId);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const selectedAuditeeId = useStore(form.store, (s: any) => s.values.selectedAuditeeId);

  const { data: clientContactsData } = useGetEntityContactsQuery(
    { entityId: selectedClientId },
    { skip: !selectedClientId }
  );
  const clientContacts = clientContactsData?.data || [];

  const { data: auditeeContactsData } = useGetEntityContactsQuery(
    { entityId: selectedAuditeeId },
    { skip: !selectedAuditeeId }
  );
  const auditeeContacts = auditeeContactsData?.data || [];

  return (
    <div className="space-y-4">
      <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600">
        Specify the regulatory body (Client) and the audited enterprise (Auditee). Pre-registered contacts will be automatically loaded so you can assign stakeholders with a single click.
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Client Entity (Regulator) */}
        <div className="p-4 rounded-xl border border-cyan-200 bg-cyan-50/30 space-y-3.5">
          <div className="flex items-center gap-2 pb-2 border-b border-cyan-200">
            <Building className="w-4 h-4 text-cyan-700" />
            <h4 className="text-xs font-bold text-cyan-900 uppercase tracking-wider">
              Client Entity (Regulator / Authority)
            </h4>
          </div>

          {clientEntities.length > 0 && (
            <form.Field name="selectedClientId">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(field: any) => (
                <FormSelect
                  field={field}
                  label="Select Existing CRM Client"
                  options={[{ label: 'Enter custom client below', value: '' }, ...clientEntities]}
                />
              )}
            </form.Field>
          )}

          <form.Field name="customClientName">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {(field: any) => (
              <FormField
                field={field}
                label="Client / Authority Name"
                placeholder="e.g. Bangladesh Telecommunication Regulatory Commission (BTRC)"
                required
              />
            )}
          </form.Field>

          {/* Client Pre-Registered Contacts Selector */}
          {selectedClientId && (
            <div className="pt-2 border-t border-cyan-200/60 space-y-2">
              <label className="block text-xs font-semibold text-cyan-900">
                Assign Regulator Representative(s)
              </label>
              {clientContacts.length > 0 ? (
                <form.Field name="clientContactIds">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {(field: any) => {
                    const selected: string[] = field.state.value || [];
                    const toggle = (id: string) => {
                      field.handleChange(
                        selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]
                      );
                    };
                    return (
                      <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                        {clientContacts.map((c) => {
                          const isChecked = selected.includes(c.id);
                          return (
                            <label
                              key={c.id}
                              onClick={() => toggle(c.id)}
                              className={`flex items-center justify-between p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                                isChecked
                                  ? 'bg-cyan-100/70 border-cyan-300 ring-1 ring-cyan-500/20'
                                  : 'bg-white border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              <div className="min-w-0">
                                <div className="font-semibold text-slate-800 truncate">{c.name}</div>
                                <div className="text-[10px] text-slate-500 truncate">{c.designation || c.email}</div>
                              </div>
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {}}
                                className="rounded text-cyan-600 focus:ring-cyan-500 ml-2"
                              />
                            </label>
                          );
                        })}
                      </div>
                    );
                  }}
                </form.Field>
              ) : (
                <p className="text-[11px] text-slate-500 italic">
                  No pre-registered contacts for this entity. You can add them later in CRM or project settings.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Auditee Entity (Operator) */}
        <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/30 space-y-3.5">
          <div className="flex items-center gap-2 pb-2 border-b border-indigo-200">
            <ShieldCheck className="w-4 h-4 text-indigo-700" />
            <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider">
              Auditee Entity (Audited Enterprise / Operator)
            </h4>
          </div>

          {auditeeEntities.length > 0 && (
            <form.Field name="selectedAuditeeId">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(field: any) => (
                <FormSelect
                  field={field}
                  label="Select Existing CRM Auditee"
                  options={[{ label: 'Enter custom auditee below', value: '' }, ...auditeeEntities]}
                />
              )}
            </form.Field>
          )}

          <form.Field name="customAuditeeName">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {(field: any) => (
              <FormField
                field={field}
                label="Auditee Company Name"
                placeholder="e.g. Fiber@Home Limited"
                required
              />
            )}
          </form.Field>

          {/* Auditee Department Representatives Selector */}
          {selectedAuditeeId && (
            <div className="pt-2 border-t border-indigo-200/60 space-y-2">
              <label className="block text-xs font-semibold text-indigo-900">
                Assign Department Representatives
              </label>
              {auditeeContacts.length > 0 ? (
                <form.Field name="auditeeContactIds">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {(field: any) => {
                    const selected: string[] = field.state.value || [];
                    const toggle = (id: string) => {
                      field.handleChange(
                        selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]
                      );
                    };
                    return (
                      <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                        {auditeeContacts.map((c) => {
                          const isChecked = selected.includes(c.id);
                          return (
                            <label
                              key={c.id}
                              onClick={() => toggle(c.id)}
                              className={`flex items-center justify-between p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                                isChecked
                                  ? 'bg-indigo-100/70 border-indigo-300 ring-1 ring-indigo-500/20'
                                  : 'bg-white border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-semibold text-slate-800 truncate">{c.name}</span>
                                  {c.department && <Badge variant="indigo" size="xs">{c.department}</Badge>}
                                </div>
                                <div className="text-[10px] text-slate-500 truncate">{c.designation || c.email}</div>
                              </div>
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {}}
                                className="rounded text-indigo-600 focus:ring-indigo-500 ml-2"
                              />
                            </label>
                          );
                        })}
                      </div>
                    );
                  }}
                </form.Field>
              ) : (
                <p className="text-[11px] text-slate-500 italic">
                  No pre-registered contacts for this entity. You can add them later in CRM or project settings.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
