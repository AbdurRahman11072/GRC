'use client';

import React from 'react';
import { Building, ShieldCheck } from 'lucide-react';
import { FormField } from '../../form/FormField';
import { FormSelect } from '../../form/FormSelect';

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
  return (
    <div className="space-y-4">
      <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600">
        Specify the regulatory body (Client) and the audited enterprise (Auditee). If they don&apos;t exist in your CRM directory, they will be automatically created and linked to this workspace.
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Client Entity (Regulator) */}
        <div className="p-4 rounded-xl border border-cyan-200 bg-cyan-50/30 space-y-3.5">
          <div className="flex items-center gap-2 pb-2 border-b border-cyan-200">
            <Building className="w-4 h-4 text-cyan-700" />
            <h4 className="text-xs font-bold text-cyan-900 uppercase tracking-wider">
              Client Entity (Regulator / Commission)
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
                label="Client / Commission Name"
                placeholder="e.g. Bangladesh Telecommunication Regulatory Commission (BTRC)"
                required
              />
            )}
          </form.Field>
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
        </div>
      </div>
    </div>
  );
};
