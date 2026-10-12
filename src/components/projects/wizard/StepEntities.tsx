'use client';

import React from 'react';
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
      <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-400">
        Specify any custom Client/Regulator and Auditee enterprise. If they don&apos;t exist in CRM, they will be auto-created and linked to the project.
      </div>

      {/* Client Entity (Regulator) */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
          Client Entity (Regulator / Commission)
        </h4>
        {clientEntities.length > 0 && (
          <form.Field name="selectedClientId">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {(field: any) => (
              <FormSelect
                field={field}
                label="Select Existing CRM Client (Optional)"
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
              label="Client Name"
              placeholder="e.g. Bangladesh Telecommunication Regulatory Commission (BTRC)"
              required
            />
          )}
        </form.Field>
      </div>

      {/* Auditee Entity (Operator) */}
      <div className="space-y-2 pt-2 border-t border-slate-800/80">
        <h4 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
          Auditee Entity (Audited Company / Operator)
        </h4>
        {auditeeEntities.length > 0 && (
          <form.Field name="selectedAuditeeId">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {(field: any) => (
              <FormSelect
                field={field}
                label="Select Existing CRM Auditee (Optional)"
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
  );
};
