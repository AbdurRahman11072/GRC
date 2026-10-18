'use client';

import React, { useState } from 'react';
import { UserCheck, ShieldCheck, Users, ShieldAlert, AlertCircle } from 'lucide-react';
import { Button } from '../../../ui/Button';
import { Badge } from '../../../ui/Badge';
import { useGetOrgMembersQuery, useAddProjectMemberMutation } from '../../../../store/api/projectApi';
import { useAppSelector } from '../../../../store/hooks';
import type { ProjectFunctionalRole } from '../../../../types/project.types';

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
  const [functionalRole, setFunctionalRole] = useState<ProjectFunctionalRole>('FIELD_TEAM');
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
        await addMember({
          projectId,
          userId: selectedUserId,
          teamBucket: functionalRole === 'PROJECT_MANAGER' ? 'ADMINISTRATOR' : 'ORG_MEMBER',
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

        await addMember({
          projectId,
          name: name.trim(),
          email: email.toLowerCase().trim(),
          designation: designation.trim() || undefined,
          password: password.trim(),
          teamBucket: functionalRole === 'PROJECT_MANAGER' ? 'ADMINISTRATOR' : 'ORG_MEMBER',
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

      {/* Role Picker */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
          Functional Role in This Project *
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'PROJECT_MANAGER' as const, label: 'Project Manager', desc: 'Full Authority', icon: ShieldAlert, color: 'indigo' },
            { id: 'SUPERVISOR' as const, label: 'Supervisor', desc: 'Verify & Mark', icon: ShieldCheck, color: 'cyan' },
            { id: 'FIELD_TEAM' as const, label: 'Field Team', desc: 'Upload Evidence', icon: Users, color: 'emerald' },
          ].map((r) => {
            const Icon = r.icon;
            const isSelected = functionalRole === r.id;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setFunctionalRole(r.id)}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  isSelected ? 'bg-indigo-50/80 border-indigo-300 ring-1 ring-indigo-500/20' : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                  <Icon className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span className="truncate">{r.label}</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">{r.desc}</div>
              </button>
            );
          })}
        </div>
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
