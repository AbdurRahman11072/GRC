'use client';

import React from 'react';
import { Calculator, Building2 } from 'lucide-react';
import { FormField } from '../../../form/FormField';

interface DrtMarksFieldsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any;
}

export const DrtMarksFields: React.FC<DrtMarksFieldsProps> = ({ form }) => {
  const colVal = Number(form.state.values.collectionAllocated) || 0;
  const anaVal = Number(form.state.values.analysisAllocated) || 0;
  const total = Number((colVal + anaVal).toFixed(2));

  return (
    <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
          <Calculator className="w-3.5 h-3.5 text-indigo-600" />
          DRT Atomic Mark Allocation
        </span>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 border border-indigo-200 text-indigo-700">
          Total: {total.toFixed(2)} Marks
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Stream Bucket */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
            <Building2 className="w-3 h-3" />
            Audit Stream *
          </label>
          <form.Field name="assignedTeamBucket">
            {(field: any) => (
              <select
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-xs bg-white border border-slate-200 text-slate-800 focus:outline-none focus:border-indigo-600"
              >
                <option value="AUDITEE">FHL (Auditee Stream)</option>
                <option value="CLIENT">BTRC (Client Stream)</option>
              </select>
            )}
          </form.Field>
        </div>

        {/* Collection Allocated */}
        <form.Field name="collectionAllocated">
          {(field: any) => (
            <FormField
              field={field}
              type="number"
              step="0.1"
              label="Collection Marks *"
              placeholder="e.g. 1.0"
            />
          )}
        </form.Field>

        {/* Analysis Allocated */}
        <form.Field name="analysisAllocated">
          {(field: any) => (
            <FormField
              field={field}
              type="number"
              step="0.1"
              label="Analysis Marks *"
              placeholder="e.g. 1.0"
            />
          )}
        </form.Field>
      </div>
    </div>
  );
};
