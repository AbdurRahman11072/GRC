'use client';

import React, { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import {
  Users,
  UserPlus,
  Mail,
  Phone,
  Trash2,
  Building2,
  Shield,
  CheckCircle2,
  Copy,
  Check,
  AlertCircle,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { FormField } from '../form/FormField';
import { Badge } from '../ui/Badge';
import {
  useGetEntityContactsQuery,
  useCreateEntityContactMutation,
  useDeleteEntityContactMutation,
} from '../../store/api/crmApi';
import type { ICrmEntity } from '../../types/project.types';

export interface EntityContactsModalProps {
  isOpen: boolean;
  onClose: () => void;
  entity: ICrmEntity | null;
}

const DEPARTMENTS = [
  'Engineering',
  'IT & Billing',
  'Finance & Accounts',
  'Legal & Licensing',
  'Marketing & Sales',
  'Operations & Maintenance',
];

export const EntityContactsModal: React.FC<EntityContactsModalProps> = ({
  isOpen,
  onClose,
  entity,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [provisionedInfo, setProvisionedInfo] = useState<{
    name: string;
    email: string;
    password?: string;
  } | null>(null);

  const isClient = entity?.entityType === 'CLIENT';

  const { data: contactsData, isLoading } = useGetEntityContactsQuery(
    { entityId: entity?.id || '' },
    { skip: !entity?.id || !isOpen }
  );

  const [createContact, { isLoading: isCreating }] = useCreateEntityContactMutation();
  const [deleteContact, { isLoading: isDeleting }] = useDeleteEntityContactMutation();

  const contacts = contactsData?.data || [];

  const form = useForm({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      designation: '',
      department: isClient ? '' : 'Engineering',
      password: 'Welcome@2026',
    },
    onSubmit: async ({ value }) => {
      if (!entity) return;
      setErrorMessage(null);
      if (!value.name?.trim()) return setErrorMessage('Contact name is required');
      if (!value.email?.includes('@')) return setErrorMessage('Valid email address is required');

      try {
        const res = await createContact({
          entityId: entity.id,
          name: value.name.trim(),
          email: value.email.toLowerCase().trim(),
          phone: value.phone.trim() || undefined,
          designation: value.designation.trim() || undefined,
          department: isClient ? undefined : value.department.trim() || undefined,
          password: value.password.trim() || undefined,
        }).unwrap();

        if (res.data?.provisionedPassword) {
          setProvisionedInfo({
            name: value.name.trim(),
            email: value.email.toLowerCase().trim(),
            password: res.data.provisionedPassword,
          });
        }
        form.reset();
        setIsAdding(false);
      } catch (err: unknown) {
        const error = err as { data?: { message?: string }; message?: string };
        setErrorMessage(error.data?.message || error.message || 'Failed to add contact');
      }
    },
  });

  const handleDelete = async (contactId: string) => {
    if (!entity) return;
    try {
      await deleteContact({ entityId: entity.id, contactId }).unwrap();
    } catch (err: unknown) {
      const error = err as { data?: { message?: string }; message?: string };
      setErrorMessage(error.data?.message || error.message || 'Failed to delete contact');
    }
  };

  const handleCopy = () => {
    if (!provisionedInfo) return;
    const text = `Portal Access Credentials:\nName: ${provisionedInfo.name}\nEmail: ${provisionedInfo.email}\nPassword: ${provisionedInfo.password}\nLogin: ${window.location.origin}/login`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => { setProvisionedInfo(null); setIsAdding(false); onClose(); }}
      title={`${entity?.name || 'Entity'} — Contacts & Representatives`}
      description={
        isClient
          ? 'Manage regulatory focal persons and inspection officers for this regulatory client'
          : 'Manage department contacts (Engineering, IT, Finance) for this audited enterprise'
      }
      size="lg"
    >
      <div className="space-y-4">
        {errorMessage && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2 text-xs text-rose-600">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {provisionedInfo && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                <CheckCircle2 className="w-4 h-4" /> Login Account Provisioned
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                leftIcon={copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              >
                {copied ? 'Copied!' : 'Copy Credentials'}
              </Button>
            </div>
            <div className="text-xs font-mono text-slate-700 space-y-0.5">
              <div>Email: <strong>{provisionedInfo.email}</strong></div>
              <div>Password: <strong>{provisionedInfo.password}</strong></div>
            </div>
          </div>
        )}

        {/* Action Toggle */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Registered Contacts ({contacts.length})
          </span>
          {!isAdding && (
            <Button variant="primary" size="sm" onClick={() => setIsAdding(true)} leftIcon={<UserPlus className="w-3.5 h-3.5" />}>
              Add Contact
            </Button>
          )}
        </div>

        {/* Add Contact Form */}
        {isAdding && (
          <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit(); }} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <UserPlus className="w-4 h-4 text-indigo-600" />
              New {isClient ? 'Regulator Focal Person' : 'Department Representative'}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <form.Field name="name">
                {(f) => <FormField field={f} label="Full Name *" placeholder="e.g. Md. Shafiul Islam" required />}
              </form.Field>
              <form.Field name="email">
                {(f) => <FormField field={f} type="email" label="Official Email *" placeholder="contact@domain.com" required />}
              </form.Field>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <form.Field name="designation">
                {(f) => <FormField field={f} label="Designation" placeholder={isClient ? 'Director, Inspection' : 'Transmission Lead'} />}
              </form.Field>
              <form.Field name="phone">
                {(f) => <FormField field={f} label="Phone Number" placeholder="+880 1712..." />}
              </form.Field>
            </div>
            {!isClient && (
              <form.Field name="department">
                {(f) => (
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">Auditee Department *</label>
                    <select
                      value={f.state.value}
                      onChange={(e) => f.handleChange(e.target.value)}
                      className="w-full text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-800"
                    >
                      {DEPARTMENTS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                )}
              </form.Field>
            )}
            <div className="flex items-center justify-end gap-2 pt-1">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsAdding(false)}>Cancel</Button>
              <Button type="submit" variant="primary" size="sm" isLoading={isCreating}>Save Contact</Button>
            </div>
          </form>
        )}

        {/* Contacts List */}
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {isLoading ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading contacts...</div>
          ) : contacts.length > 0 ? (
            contacts.map((c) => (
              <div key={c.id} className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3 hover:border-slate-300 transition-colors">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-slate-900 truncate">{c.name}</span>
                    {c.department && <Badge variant="cyan" size="xs">{c.department}</Badge>}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">{c.designation || 'Representative'}</div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono mt-0.5">
                    <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{c.email}</span>
                    {c.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{c.phone}</span>}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(c.id)}
                  disabled={isDeleting}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-xs text-slate-400">
              No contacts registered for this entity yet. Click &quot;Add Contact&quot; to add focal persons.
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
