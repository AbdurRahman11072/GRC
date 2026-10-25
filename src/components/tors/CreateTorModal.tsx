'use client';

import React, { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { Layers, PlusCircle, AlertCircle } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { FormField, FormTextarea } from '../form/FormField';
import { useCreateTorMutation } from '../../store/api/torApi';
import type { ITorNode } from '../../types/tor.types';

export interface CreateTorModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  defaultParentId?: string | null;
  flatNodes?: ITorNode[];
  onSuccess?: (torId: string) => void;
}

export const CreateTorModal: React.FC<CreateTorModalProps> = ({
  isOpen,
  onClose,
  projectId,
  defaultParentId = null,
  flatNodes = [],
  onSuccess,
}) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createTor, { isLoading }] = useCreateTorMutation();

  const form = useForm({
    defaultValues: {
      code: '',
      title: '',
      objective: '',
      description: '',
      department: '',
      parentId: defaultParentId || '',
      sortOrder: 0,
    },
    onSubmit: async ({ value }) => {
      setErrorMessage(null);
      if (!value.code || value.code.trim().length < 1) {
        setErrorMessage('ToR code (e.g. "1.1" or "M100") is required');
        return;
      }
      if (!value.title || value.title.trim().length < 2) {
        setErrorMessage('ToR title must be at least 2 characters');
        return;
      }
      if (value.title.trim().length > 1000) {
        setErrorMessage('ToR title must not exceed 1000 characters');
        return;
      }

      try {
        const res = await createTor({
          projectId,
          code: value.code.trim(),
          title: value.title.trim(),
          objective: value.objective ? value.objective.trim() : undefined,
          description: value.description.trim() || undefined,
          department: value.department ? value.department.trim() : undefined,
          parentId: value.parentId ? value.parentId : null,
          sortOrder: Number(value.sortOrder) || 0,
        }).unwrap();

        form.reset();
        onClose();
        if (onSuccess && res.data?.id) {
          onSuccess(res.data.id);
        }
      } catch (err: unknown) {
        const error = err as { data?: { message?: string }; message?: string };
        setErrorMessage(
          error.data?.message || error.message || 'Failed to create Terms of Reference node'
        );
      }
    },
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add ToR"
      description="Create a Terms of Reference clause or activity within the hierarchical audit scope"
      size="md"
    >
      {errorMessage && (
        <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-start gap-2.5 text-xs text-rose-400">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
        className="space-y-4"
      >
        {/* Parent Node Selector */}
        <form.Field name="parentId">
          {(field) => (
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Parent ToR
              </label>
              <select
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg text-sm bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-500/30"
              >
                <option value="">Root Category (Top Level)</option>
                {flatNodes.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.code} — {n.title}
                  </option>
                ))}
              </select>
            </div>
          )}
        </form.Field>

        {/* Code & Sort Order Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <form.Field name="code">
              {(field) => (
                <FormField
                  field={field}
                  label="Tor Code "
                  placeholder="e.g. 1.1 or 2.1.3"
                  required
                />
              )}
            </form.Field>
          </div>

          <div>
            <form.Field name="sortOrder">
              {(field) => (
                <FormField
                  field={field}
                  type="number"
                  label="Sort Order"
                  placeholder="0"
                />
              )}
            </form.Field>
          </div>
        </div>

        {/* Title */}
        <form.Field name="title">
          {(field) => (
            <FormTextarea
              field={field}
              label="ToR Title"
              placeholder="e.g. Core Network Architecture & Redundancy"
              rows={2}
              maxLength={1000}
              required
            />
          )}
        </form.Field>

        {/* Objective */}
        <form.Field name="objective">
          {(field) => (
            <FormTextarea
              field={field}
              label="ToR Objective"
              placeholder="e.g. Verify regulatory conformance, reliability, and compliance standards..."
              rows={2}
            />
          )}
        </form.Field>

        {/* Description */}
        <form.Field name="description">
          {(field) => (
            <FormTextarea
              field={field}
              label="ToR Scope"
              placeholder="Detailed guidelines on what evidence and analysis are required for this ToR item..."
              rows={2}
            />
          )}
        </form.Field>

        {/* Target Auditee Department for DRT Data */}
        <form.Field name="department">
          {(field) => (
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Target Auditee Department
              </label>
              <input
                list="tor-dept-suggestions"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="e.g. IT & Infrastructure, Billing, Network, Legal"
                className="w-full px-3.5 py-2.5 rounded-lg text-sm bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-500/20"
              />
              <datalist id="tor-dept-suggestions">
                <option value="IT & Infrastructure" />
                <option value="Transmission & Network Operations" />
                <option value="Billing & Revenue Assurance" />
                <option value="Legal & Regulatory Affairs" />
                <option value="Finance & Accounts" />
                <option value="Operations & Maintenance" />
              </datalist>
              <p className="text-[11px] text-slate-500 mt-1">
                Shows team members which department they should ask for specific DRT data under this ToR.
              </p>
            </div>
          )}
        </form.Field>

        {/* Modal Action Controls */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isLoading}
            leftIcon={<PlusCircle className="w-4 h-4" />}
          >
            Create ToR Node
          </Button>
        </div>
      </form>
    </Modal>
  );
};
