'use client';

import React, { useState } from 'react';
import { UserCheck, ShieldCheck, Users, ShieldAlert, AlertCircle } from 'lucide-react';
import { Button } from '../../../ui/Button';
import { Badge } from '../../../ui/Badge';
import { useGetOrgMembersQuery, useAddProjectMemberMutation } from '../../../../store/api/projectApi';
import { useAppSelector } from '../../../../store/hooks';
import type { ProjectFunctionalRole } from '../../../../types/project.types';
import { ALL_PROJECT_ROLES } from '../MemberRoleDropdown';

interface AssignFirmStaffTabProps {
  projectId: string;
  existingMemberUserIds: string[];
  onSuccess: (info?: { name: string; email: string; password?: string; role: string }) => void;
  onCancel: () => void;
}

export const AssignFirmStaffTab: React.FC<AssignFirmStaffTabProps> = ({
  projectId,
  existingMemberUserIds,
  onSuccess,
  onCancel,
}) => {
  const [mode, setMode] = useState<'EXISTING' | 'NEW'>('EXISTING');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [functionalRole, setFunctionalRole] = useState<ProjectFunctionalRole>('FIELD_MEMBER');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // New auditor state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [designation, setDesignation] = useState('');
  const [password, setPassword] = useState('Welcome@2026');

  const currentOrgId = useAppSelector((state) => state.auth.currentOrgId);
  const { data: orgMembersData, isLoading: isLoadingPool } = useGetOrgMembersQuery(
    currentOrgId || '',
    { skip: !currentOrgId }
  );

  const [addMember, { isLoading: isSubmitting }] = useAddProjectMemberMutation();

  const availableAuditors = (orgMembersData?.data || []).filter(
    (m) => !existingMemberUserIds.includes(m.id)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    try {
      if (mode === 'EXISTING') {
        if (!selectedUserId) {
          setErrorMsg('Please select a firm staff member from the dropdown');
          return;
        }
        const member = availableAuditors.find((m) => m.id === selectedUserId);
        const isAdministrator = functionalRole === 'ADMINISTRATOR' || functionalRole === 'ADMIN' || functionalRole === 'PROJECT_MANAGER';
        const isClient = functionalRole === 'CLIENT' || functionalRole === 'CLIENT_REPRESENTATIVE';
        const isAuditee = functionalRole === 'AUDITEE' || functionalRole === 'AUDITEE_REPRESENTATIVE';
        const teamBucket = isAdministrator ? 'ADMINISTRATOR' : isClient ? 'CLIENT' : isAuditee ? 'AUDITEE' : 'ORG_MEMBER';

        await addMember({
          projectId,
          userId: selectedUserId,
          teamBucket,
          projectRole: functionalRole,
        }).unwrap();

        onSuccess({
          name: member?.name || 'Firm Auditor',
          email: member?.email || '',
          role: functionalRole,
        });
      } else {
        if (!name.trim()) return setErrorMsg('Full name is required');
        if (!email.includes('@')) return setErrorMsg('Valid email address is required');

        const isAdministrator = functionalRole === 'ADMINISTRATOR' || functionalRole === 'ADMIN' || functionalRole === 'PROJECT_MANAGER';
        const isClient = functionalRole === 'CLIENT' || functionalRole === 'CLIENT_REPRESENTATIVE';
        const isAuditee = functionalRole === 'AUDITEE' || functionalRole === 'AUDITEE_REPRESENTATIVE';
        const teamBucket = isAdministrator ? 'ADMINISTRATOR' : isClient ? 'CLIENT' : isAuditee ? 'AUDITEE' : 'ORG_MEMBER';

        await addMember({
          projectId,
          name: name.trim(),
          email: email.toLowerCase().trim(),
          designation: designation.trim() || undefined,
          password: password.trim(),
          teamBucket,
          projectRole: functionalRole,
        }).unwrap();

        onSuccess({
          name: name.trim(),
          email: email.toLowerCase().trim(),
          password: password.trim(),
          role: functionalRole,
        });
      }
    } catch (err: unknown) {
      const error = err as { data?: { message?: string }; message?: string };
      setErrorMsg(error.data?.message || error.message || 'Failed to assign firm staff');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
          Select from Firm Staff ({availableAuditors.length})
        </button>
        <button
          type="button"
          onClick={() => { setMode('NEW'); setErrorMsg(null); }}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
            mode === 'NEW' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          + Provision New Auditor
        </button>
      </div>

      {mode === 'EXISTING' ? (
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-700">Select Available Auditor *</label>
          {isLoadingPool ? (
            <div className="text-xs text-slate-400 py-2">Loading auditor pool...</div>
          ) : availableAuditors.length > 0 ? (
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2.5 font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500/20"
              required
            >
              <option value="">-- Choose an auditor from firm pool --</option>
              {availableAuditors.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.email}) {m.designation ? `• ${m.designation}` : ''}
                </option>
              ))}
            </select>
          ) : (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
              All firm staff are already assigned to this project, or none are available in the pool.
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
                placeholder="e.g. Mahfuzur Rahman"
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
                placeholder="auditor@firm.com"
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
                placeholder="e.g. IS Auditor"
                className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2"
              />
            </div>
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
          </div>
        </div>
      )}

      {/* Role Picker (Dropdown Menu) */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-slate-700">
          Organization Role in This Project *
        </label>
        <select
          value={functionalRole}
          onChange={(e) => setFunctionalRole(e.target.value as ProjectFunctionalRole)}
          className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2.5 font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500/20"
        >
          {ALL_PROJECT_ROLES.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label} — {r.desc}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
        <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
          {mode === 'EXISTING' ? 'Assign Staff Member' : 'Provision & Assign'}
        </Button>
      </div>
    </form>
  );
};
