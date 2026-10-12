'use client';

import React from 'react';
import { CalendarRange, Info } from 'lucide-react';
import { FormField } from '../../form/FormField';
import { FormTextarea } from '../../form/FormTextarea';

interface StepScopeProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any;
  auditStartYear?: string;
  auditEndYear?: string;
}

export const StepScope: React.FC<StepScopeProps> = ({
  form,
  auditStartYear = '2016',
  auditEndYear = '2026',
}) => {
  return (
    <div className="space-y-4">
      <form.Field name="projectName">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {(field: any) => (
          <FormField
            field={field}
            label="Project Workspace Title"
            placeholder="e.g. BTRC & Fiber@Home IS Audit (2016–2026 Data)"
            required
          />
        )}
      </form.Field>

      {/* Audit Historical Data Coverage Range (e.g. 2016–2026) */}
      <div className="p-3.5 rounded-xl bg-indigo-950/20 border border-indigo-500/30 space-y-3">
        <div className="flex items-center gap-2">
          <CalendarRange className="w-4 h-4 text-cyan-400" />
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Audit Data Range & Historical Coverage Window
          </h4>
        </div>

        <p className="text-[11px] text-slate-400 leading-relaxed">
          Specify the multi-year historical data range that the auditee and client teams are required to provide records and evidence for:
        </p>

        <div className="grid grid-cols-2 gap-3">
          <form.Field name="auditStartYear">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {(field: any) => (
              <FormField
                field={field}
                label="Coverage Start Year"
                type="number"
                placeholder="2016"
                required
              />
            )}
          </form.Field>

          <form.Field name="auditEndYear">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {(field: any) => (
              <FormField
                field={field}
                label="Coverage End Year"
                type="number"
                placeholder="2026"
                required
              />
            )}
          </form.Field>
        </div>

        <div className="flex items-start gap-2 pt-1 text-[11px] text-cyan-300/90 bg-cyan-950/30 p-2 rounded-lg border border-cyan-800/40">
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-cyan-400" />
          <span>
            Required Submission Scope: Auditee departments must supply compliance records covering{' '}
            <strong className="text-white">{auditStartYear} through {auditEndYear}</strong>.
          </span>
        </div>
      </div>

      {/* Audit Engagement Execution Dates */}
      <div className="grid grid-cols-2 gap-3">
        <form.Field name="startDate">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {(field: any) => (
            <FormField field={field} label="Audit Engagement Start Date" type="date" />
          )}
        </form.Field>
        <form.Field name="endDate">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {(field: any) => (
            <FormField field={field} label="Audit Engagement End Date" type="date" />
          )}
        </form.Field>
      </div>

      <form.Field name="projectScope">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {(field: any) => (
          <FormTextarea
            field={field}
            label="Audit Scope Summary"
            placeholder="Operational, infrastructure, and financial record compliance review."
            rows={2}
          />
        )}
      </form.Field>
    </div>
  );
};
