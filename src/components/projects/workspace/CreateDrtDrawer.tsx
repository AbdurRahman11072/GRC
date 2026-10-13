'use client';

import React, { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { FilePlus, AlertCircle } from 'lucide-react';
import { Drawer } from '../../ui/Drawer';
import { Button } from '../../ui/Button';
import { FormField, FormTextarea } from '../../form/FormField';
import { useCreateTicketMutation } from '../../../store/api/drtApi';
import type { ProjectRole } from '../../../types/project.types';

export interface CreateDrtDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
}

const deptSuggestions = [
  'IT & Infrastructure',
  'Transmission & Network Operations',
  'Billing & Revenue Assurance',
  'Legal & Regulatory Affairs',
  'Finance & Accounts',
  'Customer Care & Operations',
];

export const CreateDrtDrawer: React.FC<CreateDrtDrawerProps> = ({
  isOpen,
  onClose,
  projectId,
}) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createTicket, { isLoading }] = useCreateTicketMutation();

  const form = useForm({
    defaultValues: {
      requestCode: '',
      assignedTeamBucket: 'AUDITEE' as ProjectRole,
      department: '',
      description: '',
      dateOfRequest: new Date().toISOString().split('T')[0],
      expectedDateOfReceipt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      allocatedWeight: 1,
    },
    onSubmit: async ({ value }) => {
      setErrorMessage(null);
      if (!value.requestCode || value.requestCode.trim().length < 1) {
        setErrorMessage('Request Code (e.g. M1001, S2001) is required');
        return;
      }
      if (!value.description || value.description.trim().length < 2) {
        setErrorMessage('Data request description is required');
        return;
      }

      try {
        await createTicket({
          projectId,
          requestCode: value.requestCode.trim(),
          assignedTeamBucket: value.assignedTeamBucket,
          department: value.department ? value.department.trim() : undefined,
          description: value.description.trim(),
          dateOfRequest: value.dateOfRequest,
          expectedDateOfReceipt: value.expectedDateOfReceipt,
          allocatedWeight: Number(value.allocatedWeight) || 1,
        }).unwrap();

        form.reset();
        onClose();
      } catch (err: unknown) {
        const error = err as { data?: { message?: string }; message?: string };
        setErrorMessage(
          error.data?.message || error.message || 'Failed to create DRT request ticket'
        );
      }
    },
  });

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Create DRT Request Ticket"
      description="Issue a Data Request Tracking ticket with SLA deadline"
      size="lg"
    >
      {errorMessage && (
        <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-start gap-2.5 text-xs text-rose-400">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit(); }} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <form.Field name="requestCode">
            {(field) => (
              <FormField field={field} label="Request Code *" placeholder="e.g. M1001, S2001" required />
            )}
          </form.Field>

          <form.Field name="assignedTeamBucket">
            {(field) => (
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Assigned Team *
                </label>
                <select
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value as ProjectRole)}
                  className="w-full px-3.5 py-2.5 rounded-lg text-sm bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-600"
                >
                  <option value="AUDITEE">Auditee (Target Enterprise Personnel)</option>
                  <option value="CLIENT">Client (Regulator Oversight)</option>
                  <option value="ORG_MEMBER">Org Member (Audit Firm Auditor)</option>
                  <option value="ADMINISTRATOR">Administrator (Company Management)</option>
                </select>
              </div>
            )}
          </form.Field>
        </div>

        {/* Target Auditee Department */}
        <form.Field name="department">
          {(field) => (
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Target Auditee Department
              </label>
              <input
                list="dept-suggestions"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="e.g. IT & Infrastructure, Billing, Legal"
                className="w-full px-3.5 py-2.5 rounded-lg text-sm bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600"
              />
              <datalist id="dept-suggestions">
                {deptSuggestions.map((d) => (
                  <option key={d} value={d} />
                ))}
              </datalist>
              <p className="text-[11px] text-slate-500 mt-1">
                Informs team members which auditee department to approach for this data.
              </p>
            </div>
          )}
        </form.Field>

        <form.Field name="description">
          {(field) => (
            <FormTextarea
              field={field}
              label="Information / Evidence Required *"
              placeholder="Specify the exact documentation, configuration exports, or log records required..."
              rows={4}
              required
            />
          )}
        </form.Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <form.Field name="dateOfRequest">
            {(field) => <FormField field={field} type="date" label="Date of Request" />}
          </form.Field>

          <form.Field name="expectedDateOfReceipt">
            {(field) => <FormField field={field} type="date" label="Expected Receipt Date (SLA)" />}
          </form.Field>
        </div>

        <div className="pt-5 border-t border-slate-200 flex items-center justify-end gap-3">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isLoading} leftIcon={<FilePlus className="w-4 h-4" />}>
            Issue DRT Ticket
          </Button>
        </div>
      </form>
    </Drawer>
  );
};
