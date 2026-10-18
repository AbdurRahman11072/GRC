'use client';

import React, { useState } from 'react';
import {
  Users,
  Search,
  Mail,
  Phone,
  Trash2,
  Calendar,
  AlertTriangle,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import {
  useGetOrganizationMembersQuery,
  useUpdateMemberRoleMutation,
  useRemoveMemberMutation,
} from '../../store/api/organizationApi';
import type { IOrgMemberRecord } from '../../types/auth.types';

export interface OrgMembersTableProps {
  orgId: string;
  callerUserId?: string;
  isCallerAdmin: boolean;
  callerOrgRole?: string;
}

export const OrgMembersTable: React.FC<OrgMembersTableProps> = ({
  orgId,
  callerUserId,
  isCallerAdmin,
  callerOrgRole,
}) => {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'ADMIN' | 'AUDITOR'>('ALL');
  const [memberToRemove, setMemberToRemove] = useState<IOrgMemberRecord | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const { data, isLoading } = useGetOrganizationMembersQuery({
    orgId,
    search: search.trim() || undefined,
    role: roleFilter !== 'ALL' ? roleFilter : undefined,
  });

  const [updateRole, { isLoading: isUpdatingRole }] = useUpdateMemberRoleMutation();
  const [removeMember, { isLoading: isRemoving }] = useRemoveMemberMutation();

  const members = data?.data || [];

  const handleRoleChange = async (member: IOrgMemberRecord, newRole: 'ADMIN' | 'AUDITOR') => {
    setActionError(null);
    try {
      await updateRole({ orgId, memberId: member.memberId, orgRole: newRole }).unwrap();
    } catch (err: unknown) {
      const error = err as { data?: { message?: string }; message?: string };
      setActionError(error.data?.message || error.message || 'Failed to update member role');
    }
  };

  const handleConfirmRemove = async () => {
    if (!memberToRemove) return;
    setActionError(null);
    try {
      await removeMember({ orgId, memberId: memberToRemove.memberId }).unwrap();
      setMemberToRemove(null);
    } catch (err: unknown) {
      const error = err as { data?: { message?: string }; message?: string };
      setActionError(error.data?.message || error.message || 'Failed to remove member');
    }
  };

  return (
    <div className="space-y-3.5">
      {actionError && (
        <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-600 flex items-center justify-between">
          <span>{actionError}</span>
          <button onClick={() => setActionError(null)} className="font-bold underline text-rose-700">Dismiss</button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white border border-slate-200 rounded-xl shadow-2xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search staff by name, email, or designation..."
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg shrink-0">
          {(['ALL', 'AUDITOR', 'ADMIN'] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1 rounded-md text-[11px] font-semibold transition-all ${
                roleFilter === r ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {r === 'ALL' ? 'All Roles' : r === 'ADMIN' ? 'Administrators' : 'Auditors'}
            </button>
          ))}
        </div>
      </div>

      {/* Members Table */}
      <Card className="bg-white border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Member Name</th>
                <th className="py-3 px-4">Contact Info</th>
                <th className="py-3 px-4">Firm Role</th>
                <th className="py-3 px-4">Date Joined</th>
                {isCallerAdmin && <th className="py-3 px-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={isCallerAdmin ? 5 : 4} className="py-12 text-center text-slate-400">Loading firm staff members...</td>
                </tr>
              ) : members.length > 0 ? (
                members.map((m) => {
                  const name = m.user.name || 'Unnamed Member';
                  const initials = name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
                  const isOwner = m.orgRole === 'OWNER';
                  const isSelf = m.user.id === callerUserId;
                  const canEditThisMember = isCallerAdmin && (!isOwner || callerOrgRole === 'OWNER') && !isSelf;

                  return (
                    <tr key={m.memberId} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs ${
                            isOwner ? 'bg-gradient-to-tr from-amber-500 to-orange-500' : 'bg-gradient-to-tr from-indigo-500 to-cyan-500'
                          }`}>
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-slate-900 truncate flex items-center gap-1.5">
                              <span>{name}</span>
                              {isSelf && <span className="text-[10px] text-slate-400 font-normal">(You)</span>}
                            </div>
                            <div className="text-[11px] text-slate-500 truncate">{m.user.designation || 'Firm Auditor'}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="font-mono text-[11px]">{m.user.email}</span>
                          </div>
                          {m.user.phone && (
                            <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                              <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>{m.user.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        {canEditThisMember && !isOwner ? (
                          <select
                            value={m.orgRole}
                            disabled={isUpdatingRole}
                            onChange={(e) => handleRoleChange(m, e.target.value as 'ADMIN' | 'AUDITOR')}
                            className="text-xs bg-slate-50 border border-slate-200 rounded-md px-2 py-1 font-semibold text-slate-700 cursor-pointer hover:bg-slate-100"
                          >
                            <option value="AUDITOR">Auditor</option>
                            <option value="ADMIN">Administrator</option>
                          </select>
                        ) : (
                          <Badge variant={isOwner ? 'neutral' : m.orgRole === 'ADMIN' ? 'indigo' : 'cyan'} size="xs">
                            {isOwner ? 'Firm Owner' : m.orgRole === 'ADMIN' ? 'Admin' : 'Auditor'}
                          </Badge>
                        )}
                      </td>

                      <td className="py-3 px-4 text-slate-500 text-[11px] whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{new Date(m.joinedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                      </td>

                      {isCallerAdmin && (
                        <td className="py-3 px-4 text-right">
                          {canEditThisMember && (
                            <button
                              type="button"
                              onClick={() => setMemberToRemove(m)}
                              title="Remove from organization"
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={isCallerAdmin ? 5 : 4} className="py-12 text-center">
                    <div className="max-w-sm mx-auto space-y-1.5">
                      <Users className="w-8 h-8 text-slate-300 mx-auto" />
                      <div className="text-xs font-bold text-slate-700">No staff members found</div>
                      <div className="text-[11px] text-slate-400">Try adjusting your search criteria or add a new member.</div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Remove Member Confirmation Modal */}
      <Modal
        isOpen={!!memberToRemove}
        onClose={() => setMemberToRemove(null)}
        title="Remove Staff Member"
        description="Are you sure you want to remove this member from the organization?"
        size="sm"
      >
        <div className="space-y-3">
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-700">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              This will revoke <strong>{memberToRemove?.user.name}</strong> ({memberToRemove?.user.email}) from all organization resources.
            </span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setMemberToRemove(null)}>
              Cancel
            </Button>
            <Button variant="destructive" size="sm" isLoading={isRemoving} onClick={handleConfirmRemove}>
              Remove Member
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
