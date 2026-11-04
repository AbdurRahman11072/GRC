'use client';

import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Shield,
  Users,
  Building2,
  ChevronDown,
  Loader2,
} from 'lucide-react';
import { Badge } from '../../ui/Badge';
import { useUpdateProjectMemberMutation } from '../../../store/api/projectApi';
import type { ProjectFunctionalRole, ProjectRole } from '../../../types/project.types';

export const ALL_PROJECT_ROLES: Array<{
  value: ProjectFunctionalRole;
  label: string;
  badgeVariant: 'indigo' | 'cyan' | 'success' | 'neutral' | 'danger' | 'warning';
  icon: React.ReactNode;
  desc: string;
}> = [
  { value: 'PROJECT_MANAGER', label: 'Project Manager', badgeVariant: 'indigo', icon: <ShieldAlert className="w-3 h-3 text-indigo-600" />, desc: 'Full Authority (ToRs, DRTs, Marks)' },
  { value: 'SUPERVISOR', label: 'Supervisor', badgeVariant: 'cyan', icon: <ShieldCheck className="w-3 h-3 text-cyan-600" />, desc: 'Verify Documents & Marks' },
  { value: 'CLIENT', label: 'Client', badgeVariant: 'warning', icon: <Shield className="w-3 h-3 text-amber-600" />, desc: 'Regulatory Oversight & Scorecard' },
  { value: 'FIELD_MEMBER', label: 'Field Member', badgeVariant: 'success', icon: <Users className="w-3 h-3 text-emerald-600" />, desc: 'Evidence Upload & Progress' },
  { value: 'AUDITEE', label: 'Auditee', badgeVariant: 'neutral', icon: <Building2 className="w-3 h-3 text-slate-600" />, desc: 'Enterprise Submissions' },
  { value: 'ADMIN', label: 'Admin', badgeVariant: 'indigo', icon: <ShieldAlert className="w-3 h-3 text-indigo-700" />, desc: 'Project Administration' },
  { value: 'ADMINISTRATOR', label: 'Administrator', badgeVariant: 'danger', icon: <ShieldAlert className="w-3 h-3 text-rose-600" />, desc: 'Full Workspace Control' },
];

export const getCanonicalRole = (role?: ProjectFunctionalRole, bucket?: ProjectRole): ProjectFunctionalRole => {
  if (role === 'PROJECT_MANAGER' || role === 'SUPERVISOR' || role === 'CLIENT' || role === 'FIELD_MEMBER' || role === 'AUDITEE' || role === 'ADMIN' || role === 'ADMINISTRATOR') {
    return role;
  }
  if (role === 'FIELD_TEAM') return 'FIELD_MEMBER';
  if (role === 'CLIENT_REPRESENTATIVE') return 'CLIENT';
  if (role === 'AUDITEE_REPRESENTATIVE') return 'AUDITEE';
  if (bucket === 'ADMINISTRATOR') return 'PROJECT_MANAGER';
  if (bucket === 'CLIENT') return 'CLIENT';
  if (bucket === 'AUDITEE') return 'AUDITEE';
  return 'FIELD_MEMBER';
};

interface MemberRoleDropdownProps {
  projectId: string;
  memberId: string;
  currentRole?: ProjectFunctionalRole;
  currentBucket?: ProjectRole;
  canEdit: boolean;
}

export const MemberRoleDropdown: React.FC<MemberRoleDropdownProps> = ({
  projectId,
  memberId,
  currentRole,
  currentBucket,
  canEdit,
}) => {
  const [updateMember, { isLoading }] = useUpdateProjectMemberMutation();
  const canonicalRole = getCanonicalRole(currentRole, currentBucket);
  const activeMeta = ALL_PROJECT_ROLES.find((r) => r.value === canonicalRole) || ALL_PROJECT_ROLES[3];

  const handleRoleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value as ProjectFunctionalRole;
    if (newRole === canonicalRole) return;

    try {
      await updateMember({
        projectId,
        memberId,
        projectRole: newRole,
      }).unwrap();
    } catch (err) {
      console.error('Failed to update project member role:', err);
    }
  };

  if (!canEdit) {
    return (
      <div className="inline-flex items-center gap-1.5">
        {activeMeta.icon}
        <Badge variant={activeMeta.badgeVariant} size="xs">{activeMeta.label}</Badge>
      </div>
    );
  }

  return (
    <div className="relative inline-flex items-center group">
      <div className="flex items-center gap-1 bg-white border border-slate-200 hover:border-indigo-400 focus-within:border-indigo-500 rounded-lg pl-2 pr-1.5 py-1 shadow-2xs transition-all">
        {isLoading ? (
          <Loader2 className="w-3.5 h-3.5 text-indigo-600 animate-spin" />
        ) : (
          activeMeta.icon
        )}
        <select
          value={canonicalRole}
          onChange={handleRoleChange}
          disabled={isLoading}
          aria-label="Change Organization Role"
          className="text-xs font-semibold text-slate-800 bg-transparent border-0 cursor-pointer focus:outline-hidden focus:ring-0 pr-4 appearance-none"
        >
          {ALL_PROJECT_ROLES.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
        <ChevronDown className="w-3 h-3 text-slate-400 pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 group-hover:text-slate-600 transition-colors" />
      </div>
    </div>
  );
};
