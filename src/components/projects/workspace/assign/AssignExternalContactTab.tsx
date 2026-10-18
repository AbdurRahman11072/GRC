'use client';

import React, { useState } from 'react';
import { Shield, Building2, AlertCircle } from 'lucide-react';
import { Button } from '../../../ui/Button';
import { Badge } from '../../../ui/Badge';
import {
  useGetEntityContactsQuery,
  useCreateEntityContactMutation,
} from '../../../../store/api/crmApi';
import { useAddProjectMemberMutation } from '../../../../store/api/projectApi';

interface AssignExternalContactTabProps {
  projectId: string;
  target: 'CLIENT' | 'AUDITEE';
  entityId?: string;
  entityName?: string;
  existingMemberUserIds: string[];
  onSuccess: (info?: { name: string; email: string; password?: string; role: string }) => void;
  onCancel: () => void;
}

const DEPARTMENTS = [
  'Engineering',
  'IT & Billing',
  'Finance & Accounts',
  'Legal & Licensing',
  'Marketing & Sales',
  'Operations & Maintenance',
];

export const AssignExternalContactTab: React.FC<AssignExternalContactTabProps> = ({
  projectId,
  target,
  entityId,
  entityName,
  existingMemberUserIds,
  onSuccess,
  onCancel,
}) => {
  const isClient = target === 'CLIENT';
  const [mode, setMode] = useState<'EXISTING' | 'NEW'>('EXISTING');
  const [selectedContactId, setSelectedContactId] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // New contact fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [designation, setDesignation] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [password, setPassword] = useState('Welcome@2026');

  const { data: contactsData, isLoading: isLoadingContacts } = useGetEntityContactsQuery(
    { entityId: entityId || '' },
    { skip: !entityId }
  );

  const [createContact, { isLoading: isCreatingContact }] = useCreateEntityContactMutation();
  const [addMember, { isLoading: isAddingMember }] = useAddProjectMemberMutation();

  const isSubmitting = isCreatingContact || isAddingMember;

  const contacts = contactsData?.data || [];
  const availableContacts = contacts.filter(
    (c) => !c.userId || !existingMemberUserIds.includes(c.userId)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    try {
      if (mode === 'EXISTING') {
        if (!selectedContactId) {
          setErrorMsg('Please select a registered contact from the dropdown');
          return;
        }
        const contact = contacts.find((c) => c.id === selectedContactId);
        if (!contact) return;

        await addMember({
          projectId,
          userId: contact.userId || undefined,
          name: contact.name,
          email: contact.email,
          designation: contact.department ? `${contact.department} — ${contact.designation || 'Lead'}` : contact.designation || undefined,
          phone: contact.phone || undefined,
          teamBucket: isClient ? 'CLIENT' : 'AUDITEE',
          projectRole: isClient ? 'CLIENT_REPRESENTATIVE' : 'AUDITEE_REPRESENTATIVE',
        }).unwrap();

        onSuccess({
          name: contact.name,
          email: contact.email,
          role: isClient ? 'Client Representative' : `Auditee (${contact.department || 'Staff'})`,
        });
      } else {
        if (!name.trim()) return setErrorMsg('Full name is required');
        if (!email.includes('@')) return setErrorMsg('Valid email is required');

        // 1. Create contact under CRM entity
        let userId: string | undefined = undefined;
        let provisionedPass: string | undefined = undefined;

        if (entityId) {
          const contactRes = await createContact({
            entityId,
            name: name.trim(),
            email: email.toLowerCase().trim(),
            phone: phone.trim() || undefined,
            designation: designation.trim() || undefined,
            department: isClient ? undefined : department,
            password: password.trim() || undefined,
          }).unwrap();

          userId = contactRes.data?.userId || undefined;
          provisionedPass = contactRes.data?.provisionedPassword || password.trim();
        }

        // 2. Add as project member
        await addMember({
          projectId,
          userId,
          name: name.trim(),
          email: email.toLowerCase().trim(),
          designation: !isClient ? `${department} — ${designation || 'Lead'}` : designation || undefined,
          phone: phone.trim() || undefined,
          password: password.trim(),
          teamBucket: isClient ? 'CLIENT' : 'AUDITEE',
          projectRole: isClient ? 'CLIENT_REPRESENTATIVE' : 'AUDITEE_REPRESENTATIVE',
        }).unwrap();

        onSuccess({
          name: name.trim(),
          email: email.toLowerCase().trim(),
          password: provisionedPass || password.trim(),
          role: isClient ? 'Client Representative' : `Auditee (${department})`,
        });
      }
    } catch (err: unknown) {
      const error = err as { data?: { message?: string }; message?: string };
      setErrorMsg(error.data?.message || error.message || 'Failed to assign contact');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Banner */}
      <div className={`p-3 rounded-lg border text-xs flex items-center gap-2.5 ${
        isClient ? 'bg-amber-50/60 border-amber-200 text-amber-900' : 'bg-cyan-50/60 border-cyan-200 text-cyan-900'
      }`}>
        {isClient ? <Shield className="w-4 h-4 text-amber-600 shrink-0" /> : <Building2 className="w-4 h-4 text-cyan-600 shrink-0" />}
        <div>
          <span className="font-bold">{entityName || (isClient ? 'Regulatory Body' : 'Audited Enterprise')}</span>
          <span className="text-[11px] block text-slate-500">
            {isClient ? 'Read-only regulatory compliance oversight' : 'Focal point for departmental DRT data requests'}
          </span>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-xs text-rose-600">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Mode Switcher */}
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
        <button
          type="button"
          onClick={() => { setMode('EXISTING'); setErrorMsg(null); }}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
            mode === 'EXISTING' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Select Pre-Registered ({availableContacts.length})
        </button>
        <button
          type="button"
          onClick={() => { setMode('NEW'); setErrorMsg(null); }}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
            mode === 'NEW' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          + Add New Contact
        </button>
      </div>

      {mode === 'EXISTING' ? (
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-700">
            Select {isClient ? 'Regulator Focal Person' : 'Department Representative'} *
          </label>
          {isLoadingContacts ? (
            <div className="text-xs text-slate-400 py-2">Loading contacts...</div>
          ) : availableContacts.length > 0 ? (
            <select
              value={selectedContactId}
              onChange={(e) => setSelectedContactId(e.target.value)}
              className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2.5 font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500/20"
              required
            >
              <option value="">-- Choose from registered contacts --</option>
              {availableContacts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.email}) {c.department ? `[${c.department}]` : ''} {c.designation ? `• ${c.designation}` : ''}
                </option>
              ))}
            </select>
          ) : (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-500">
              No unregistered contacts found for this entity. Switch to &quot;Add New Contact&quot; to register a representative.
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Farhana Yasmin"
                className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Official Email *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contact@enterprise.com"
                className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Designation</label>
              <input
                type="text"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder={isClient ? 'Director, Inspection' : 'Transmission Lead'}
                className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2"
              />
            </div>
            {!isClient ? (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Department *</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2"
                >
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Temporary Password *</label>
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2 font-mono"
                  required
                />
              </div>
            )}
          </div>
          {!isClient && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Temporary Password *</label>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2 font-mono"
                required
              />
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
        <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
          {mode === 'EXISTING' ? 'Assign to Project' : 'Register & Assign'}
        </Button>
      </div>
    </form>
  );
};
