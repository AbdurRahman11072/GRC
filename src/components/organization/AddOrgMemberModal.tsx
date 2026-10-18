'use client';

import React, { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { UserPlus, AlertCircle, CheckCircle2, Copy, Check, ShieldCheck, UserCheck } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { FormField } from '../form/FormField';
import { Badge } from '../ui/Badge';
import { useCreateUserMutation } from '../../store/api/authApi';

export interface AddOrgMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  orgId: string;
}

export const AddOrgMemberModal: React.FC<AddOrgMemberModalProps> = ({
  isOpen,
  onClose,
  orgId,
}) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [provisionedInfo, setProvisionedInfo] = useState<{
    name: string;
    email: string;
    password: string;
    role: string;
  } | null>(null);

  const [createUser, { isLoading }] = useCreateUserMutation();

  const form = useForm({
    defaultValues: {
      name: '',
      email: '',
      designation: '',
      phone: '',
      password: 'Welcome@2026',
      orgRole: 'AUDITOR' as 'ADMIN' | 'AUDITOR',
    },
    onSubmit: async ({ value }) => {
      setErrorMessage(null);
      if (!value.name?.trim()) return setErrorMessage('Full name is required');
      if (!value.email?.includes('@')) return setErrorMessage('Valid official email is required');
      if (!value.password || value.password.length < 8) {
        return setErrorMessage('Temporary password must be at least 8 characters');
      }

      try {
        await createUser({
          orgId,
          name: value.name.trim(),
          email: value.email.toLowerCase().trim(),
          designation: value.designation.trim() || undefined,
          phone: value.phone.trim() || undefined,
          password: value.password.trim(),
          orgRole: value.orgRole,
        }).unwrap();

        setProvisionedInfo({
          name: value.name.trim(),
          email: value.email.toLowerCase().trim(),
          password: value.password.trim(),
          role: value.orgRole,
        });
      } catch (err: unknown) {
        const error = err as { data?: { message?: string }; message?: string };
        setErrorMessage(error.data?.message || error.message || 'Failed to add member to organization');
      }
    },
  });

  const handleCopy = () => {
    if (!provisionedInfo) return;
    const text = `Zio Tech GRC Portal Access:\nName: ${provisionedInfo.name}\nEmail: ${provisionedInfo.email}\nTemporary Password: ${provisionedInfo.password}\nRole: ${provisionedInfo.role}\nLogin: ${window.location.origin}/login`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setProvisionedInfo(null);
    setErrorMessage(null);
    form.reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={provisionedInfo ? 'Staff Member Provisioned' : 'Add Organization Member'}
      description={
        provisionedInfo
          ? 'Share these login credentials with the member for their initial login'
          : 'Provision an auditor or administrator for your firm staffing pool'
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
                <CheckCircle2 className="w-4 h-4" /> Provisioned & Linked Successfully
              </span>
              <Badge variant={provisionedInfo.role === 'ADMIN' ? 'indigo' : 'cyan'} size="xs">
                {provisionedInfo.role}
              </Badge>
            </div>

            <div className="p-3 rounded-lg bg-white border border-emerald-200 space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-sans">Name:</span>
                <span className="text-slate-900 font-bold">{provisionedInfo.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-sans">Login Email:</span>
                <span className="text-cyan-700 font-bold">{provisionedInfo.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-sans">Temporary Password:</span>
                <span className="text-emerald-700 font-bold">{provisionedInfo.password}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-sans">Firm Role:</span>
                <span className="text-slate-800 font-bold">{provisionedInfo.role}</span>
              </div>
            </div>
            <p className="text-xs text-slate-600">
              This member is now in your firm staffing pool and can be assigned to audit projects.
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
            <Button type="button" variant="primary" size="sm" onClick={handleClose}>
              Done
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit(); }} className="space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <form.Field name="name">
              {(field) => <FormField field={field} label="Full Name *" placeholder="e.g. Mahfuzur Rahman" required />}
            </form.Field>
            <form.Field name="email">
              {(field) => <FormField field={field} type="email" label="Official Email *" placeholder="auditor@firm.com" required />}
            </form.Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <form.Field name="designation">
              {(field) => <FormField field={field} label="Designation" placeholder="e.g. IS Auditor" />}
            </form.Field>
            <form.Field name="phone">
              {(field) => <FormField field={field} label="Phone Number" placeholder="+880 1712..." />}
            </form.Field>
          </div>

          <form.Field name="password">
            {(field) => (
              <FormField
                field={field}
                label="Temporary Password *"
                placeholder="Welcome@2026"
                helperText="At least 8 characters. Member will use this to sign in."
                required
              />
            )}
          </form.Field>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Organization Role *
            </label>
            <form.Field name="orgRole">
              {(field) => (
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => field.handleChange('AUDITOR')}
                    className={`text-left p-3 rounded-xl border transition-all ${
                      field.state.value === 'AUDITOR'
                        ? 'bg-cyan-50 border-cyan-200 ring-1 ring-cyan-500/20'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                      <UserCheck className="w-3.5 h-3.5 text-cyan-600" />
                      <span>Auditor</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Staff auditor in pool. Can be assigned as PM, Supervisor, or Field Team.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => field.handleChange('ADMIN')}
                    className={`text-left p-3 rounded-xl border transition-all ${
                      field.state.value === 'ADMIN'
                        ? 'bg-indigo-50 border-indigo-200 ring-1 ring-indigo-500/20'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                      <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Administrator</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Firm administrator. Can create projects, add members, and manage CRM entities.
                    </p>
                  </button>
                </div>
              )}
            </form.Field>
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isLoading} leftIcon={<UserPlus className="w-4 h-4" />}>
              Provision Member
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
