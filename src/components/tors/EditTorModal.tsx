'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from '@tanstack/react-form';
import { Edit3, AlertCircle } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { FormField, FormTextarea } from '../form/FormField';
import { useUpdateTorMutation } from '../../store/api/torApi';
import type { ITorNode } from '../../types/tor.types';

const DEPT_OPTIONS = [
  'IT & Infrastructure',
  'Transmission & Network Operations',
  'Billing & Revenue Assurance',
  'Legal & Regulatory Affairs',
  'Finance & Accounts',
  'Operations & Maintenance',
];

export interface EditTorModalProps {
  isOpen: boolean;
  onClose: () => void;
  torNode: ITorNode | null;
  flatNodes?: ITorNode[];
  onSuccess?: (updatedNode: ITorNode) => void;
}

export const EditTorModal: React.FC<EditTorModalProps> = ({
  isOpen,
  onClose,
  torNode,
  flatNodes = [],
  onSuccess,
}) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [updateTor, { isLoading }] = useUpdateTorMutation();

  // Filter out current node and descendants to prevent circular parenting
  const eligibleParents = useMemo(() => {
    if (!torNode) return flatNodes;
    const invalidIds = new Set<string>();
    const stack = [torNode.id];
    while (stack.length > 0) {
      const cur = stack.pop()!;
      invalidIds.add(cur);
      flatNodes.forEach((n) => {
        if (n.parentId === cur && !invalidIds.has(n.id)) stack.push(n.id);
      });
    }
    return flatNodes.filter((n) => !invalidIds.has(n.id));
  }, [torNode, flatNodes]);

  const form = useForm({
    defaultValues: {
      code: torNode?.code || '',
      title: torNode?.title || '',
      objective: torNode?.objective || '',
      description: torNode?.description || '',
      department: torNode?.department || '',
      parentId: torNode?.parentId || '',
      sortOrder: torNode?.sortOrder ?? 0,
    },
    onSubmit: async ({ value }) => {
      if (!torNode) return;
      setErrorMessage(null);
      if (!value.code?.trim()) return setErrorMessage('ToR code is required');
      if (!value.title?.trim() || value.title.trim().length < 2) {
        return setErrorMessage('ToR title must be at least 2 characters');
      }

      try {
        const res = await updateTor({
          id: torNode.id,
          code: value.code.trim(),
          title: value.title.trim(),
          objective: value.objective?.trim() || null,
          description: value.description?.trim() || null,
          department: value.department?.trim() || null,
          parentId: value.parentId || null,
          sortOrder: Number(value.sortOrder) || 0,
        }).unwrap();

        onClose();
        if (onSuccess && res.data) onSuccess(res.data);
      } catch (err: unknown) {
        const error = err as { data?: { message?: string }; message?: string };
        setErrorMessage(error.data?.message || error.message || 'Failed to update ToR clause');
      }
    },
  });

  const syncedTorIdRef = React.useRef<string | null>(null);

  useEffect(() => {
    if (torNode && isOpen && syncedTorIdRef.current !== torNode.id) {
      syncedTorIdRef.current = torNode.id;
      form.setFieldValue('code', torNode.code || '');
      form.setFieldValue('title', torNode.title || '');
      form.setFieldValue('objective', torNode.objective || '');
      form.setFieldValue('description', torNode.description || '');
      form.setFieldValue('department', torNode.department || '');
      form.setFieldValue('parentId', torNode.parentId || '');
      form.setFieldValue('sortOrder', torNode.sortOrder ?? 0);
      setErrorMessage(null);
    } else if (!isOpen) {
      syncedTorIdRef.current = null;
    }
  }, [torNode, isOpen]);

  if (!torNode) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit ToR Clause: ${torNode.code}`}
      description="Update clause code, title, scope description, or target department"
      size="md"
    >
      {errorMessage && (
        <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-start gap-2.5 text-xs text-rose-500">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit(); }} className="space-y-4">
        <form.Field name="parentId">
          {(field) => (
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Parent ToR Category
              </label>
              <select
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg text-sm bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-500/30"
              >
                <option value="">Root Category (Top Level)</option>
                {eligibleParents.map((n) => (
                  <option key={n.id} value={n.id}>{n.code} — {n.title}</option>
                ))}
              </select>
            </div>
          )}
        </form.Field>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <form.Field name="code">
              {(field) => <FormField field={field} label="ToR Code" placeholder="e.g. 1.1 or M100" required />}
            </form.Field>
          </div>
          <div>
            <form.Field name="sortOrder">
              {(field) => <FormField field={field} type="number" label="Sort Order" placeholder="0" />}
            </form.Field>
          </div>
        </div>

        <form.Field name="title">
          {(field) => <FormField field={field} label="ToR Title" placeholder="e.g. Core Network Architecture" required />}
        </form.Field>

        <form.Field name="objective">
          {(field) => <FormTextarea field={field} label="ToR Objective" placeholder="Objective..." rows={2} />}
        </form.Field>

        <form.Field name="description">
          {(field) => <FormTextarea field={field} label="ToR Scope" placeholder="Evidence & analysis required..." rows={2} />}
        </form.Field>

        <form.Field name="department">
          {(field) => (
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Target Department</label>
              <input
                list="edit-tor-dept-list"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="e.g. IT, Billing, Legal"
                className="w-full px-3.5 py-2.5 rounded-lg text-sm bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-500/20"
              />
              <datalist id="edit-tor-dept-list">
                {DEPT_OPTIONS.map((dept) => <option key={dept} value={dept} />)}
              </datalist>
            </div>
          )}
        </form.Field>

        <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isLoading}>Cancel</Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isLoading} leftIcon={<Edit3 className="w-4 h-4" />}>
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};
