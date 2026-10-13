'use client';

import React, { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { UserPlus, AlertCircle, CheckCircle2, Copy, Check } from 'lucide-react';
import { Modal } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import { FormField } from '../../form/FormField';
import { Badge } from '../../ui/Badge';
import { useAddProjectMemberMutation } from '../../../store/api/projectApi';
import type { ProjectRole } from '../../../types/project.types';

export interface AssignMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  defaultRole?: ProjectRole;
}

const roleOptions: Array<{ value: ProjectRole; label: string; desc: string }> = [
  { value: 'ADMINISTRATOR', label: 'Administrator', desc: 'Project oversight & macro management' },
  { value: 'ORG_MEMBER', label: 'Org Member', desc: 'Audit firm auditor • Uploads & evaluates evidence' },
  { value: 'CLIENT', label: 'Client (Regulator)', desc: 'Regulator body (BTRC) • Read-only oversight' },
  { value: 'AUDITEE', label: 'Auditee Enterprise', desc: 'Enterprise staff (Fiber@Home) • SLA tracking' },
];

export const AssignMemberModal: React.FC<AssignMemberModalProps> = ({
  isOpen,
  onClose,
  projectId,
  defaultRole = 'ORG_MEMBER',
}) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [provisionedInfo, setProvisionedInfo] = useState<{
    name: string;
    email: string;
    password: string;
    role: ProjectRole;
  } | null>(null);

  const [addMember, { isLoading }] = useAddProjectMemberMutation();

  const form = useForm({
    defaultValues: {
      name: '',
      email: '',
      designation: '',
      password: 'Welcome@2026',
      teamBucket: defaultRole as ProjectRole,
    },
    onSubmit: async ({ value }) => {
      setErrorMessage(null);
      if (!value.name?.trim()) return setErrorMessage('Full name is required');
      if (!value.email?.includes('@')) return setErrorMessage('Valid email address is required');
      if (!value.password || value.password.length < 6) return setErrorMessage('Password must be >= 6 characters');

      try {
        await addMember({
          projectId,
          name: value.name.trim(),
          email: value.email.toLowerCase().trim(),
          designation: value.designation.trim() || undefined,
          password: value.password.trim(),
          teamBucket: value.teamBucket,
        }).unwrap();

        setProvisionedInfo({
          name: value.name.trim(),
          email: value.email.toLowerCase().trim(),
          password: value.password.trim(),
          role: value.teamBucket,
        });
      } catch (err: unknown) {
        const error = err as { data?: { message?: string }; message?: string };
        setErrorMessage(error.data?.message || error.message || 'Failed to assign member');
      }
    },
  });

  const handleCopy = () => {
    if (!provisionedInfo) return;
    const text = `Zio Tech GRC Portal Access:\nEmail: ${provisionedInfo.email}\nPassword: ${provisionedInfo.password}\nRole: ${provisionedInfo.role}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setProvisionedInfo(null);
    form.reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={provisionedInfo ? 'User Provisioned & Assigned' : 'Add Project Member'}
      description={
        provisionedInfo
          ? 'Share these login credentials with the user for their portal access'
          : 'Create member login credentials and assign to project collaborative role'
      }
      size="md"
    >
      {errorMessage && (
        <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-600">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {provisionedInfo ? (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                <CheckCircle2 className="w-4 h-4" /> Account Provisioned & Assigned
              </span>
              <Badge variant="success" size="xs">{provisionedInfo.role}</Badge>
            </div>

            <div className="p-3 rounded-lg bg-white border border-emerald-200 space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Name:</span>
                <span className="text-slate-900 font-bold">{provisionedInfo.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Login Email:</span>
                <span className="text-cyan-700 font-bold">{provisionedInfo.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Portal Password:</span>
                <span className="text-emerald-700 font-bold">{provisionedInfo.password}</span>
              </div>
            </div>
            <p className="text-xs text-slate-600">
              The user can now log in at /login with these credentials to access their dashboard.
            </p>
          </div>

          <div className="flex items-center justify-between pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopy}
              leftIcon={copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            >
              {copied ? 'Copied to Clipboard!' : 'Copy Credentials'}
            </Button>
            <Button type="button" variant="primary" size="sm" onClick={handleClose}>Done</Button>
          </div>
        </div>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit(); }} className="space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <form.Field name="name">
              {(field) => <FormField field={field} label="Full Name *" placeholder="e.g. Farhana Yasmin" required />}
            </form.Field>
            <form.Field name="email">
              {(field) => <FormField field={field} type="email" label="Official Email *" placeholder="user@domain.com" required />}
            </form.Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <form.Field name="designation">
              {(field) => <FormField field={field} label="Designation" placeholder="e.g. Network Auditor" />}
            </form.Field>
            <form.Field name="password">
              {(field) => <FormField field={field} label="Password *" placeholder="Welcome@2026" required />}
            </form.Field>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Collaborative Team Bucket *
            </label>
            <form.Field name="teamBucket">
              {(field) => (
                <div className="grid grid-cols-1 gap-2">
                  {roleOptions.map((opt) => {
                    const isSelected = field.state.value === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => field.handleChange(opt.value)}
                        className={`text-left p-2.5 rounded-lg border transition-all ${
                          isSelected
                            ? 'bg-indigo-50 border-indigo-200 ring-1 ring-indigo-500/20'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-bold ${isSelected ? 'text-indigo-700' : 'text-slate-800'}`}>
                            {opt.label}
                          </span>
                          {isSelected && <Badge variant="indigo" size="xs">Selected</Badge>}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{opt.desc}</p>
                      </button>
                    );
                  })}
                </div>
              )}
            </form.Field>
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isLoading} leftIcon={<UserPlus className="w-4 h-4" />}>
              Add Member
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
