'use client';

import React, { useState, useMemo } from 'react';
import {
  Users,
  UserPlus,
  Mail,
  Search,
  Briefcase,
  ShieldAlert,
  Building2,
  Calendar,
  Shield,
} from 'lucide-react';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { AssignMemberModal } from './AssignMemberModal';
import { useGetProjectMembersQuery } from '../../../store/api/projectApi';
import type { ProjectRole, IProjectMember } from '../../../types/project.types';

interface TabTeamProps {
  projectId: string;
}

const roleMeta: Record<
  ProjectRole,
  {
    label: string;
    variant: 'indigo' | 'cyan' | 'neutral' | 'success';
    permissions: string;
    icon: React.ReactNode;
  }
> = {
  ADMINISTRATOR: {
    label: 'Administrator',
    variant: 'indigo',
    permissions: 'Full Admin & Management',
    icon: <ShieldAlert className="w-3.5 h-3.5 text-indigo-600" />,
  },
  ORG_MEMBER: {
    label: 'Org Member',
    variant: 'cyan',
    permissions: 'Evidence Upload & Analysis',
    icon: <Briefcase className="w-3.5 h-3.5 text-cyan-700" />,
  },
  CLIENT: {
    label: 'Client (Regulator)',
    variant: 'neutral',
    permissions: 'Read-Only Regulatory Oversight',
    icon: <Shield className="w-3.5 h-3.5 text-amber-700" />,
  },
  AUDITEE: {
    label: 'Auditee Enterprise',
    variant: 'success',
    permissions: 'Read-Only SLA Tracking',
    icon: <Building2 className="w-3.5 h-3.5 text-emerald-700" />,
  },
};

export const TabTeam: React.FC<TabTeamProps> = ({ projectId }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<ProjectRole>('ORG_MEMBER');
  const [filterRole, setFilterRole] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: membersData, isLoading } = useGetProjectMembersQuery(projectId);
  const members = membersData?.data || [];

  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const matchesRole = filterRole === 'ALL' || m.teamBucket === filterRole;
      const name = m.user?.name?.toLowerCase() || '';
      const email = m.user?.email?.toLowerCase() || '';
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = !query || name.includes(query) || email.includes(query);
      return matchesRole && matchesSearch;
    });
  }, [members, filterRole, searchQuery]);

  const handleOpenAssign = (role: ProjectRole = 'ORG_MEMBER') => {
    setSelectedRole(role);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Action and Filter Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search member or email..."
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-48 sm:w-56"
            />
          </div>

          {/* Role Filter Pills */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            {(['ALL', 'ADMINISTRATOR', 'ORG_MEMBER', 'CLIENT', 'AUDITEE'] as const).map((r) => {
              const count = r === 'ALL' ? members.length : members.filter((m) => m.teamBucket === r).length;
              const label =
                r === 'ALL'
                  ? 'All'
                  : r === 'ADMINISTRATOR'
                  ? 'Admin'
                  : r === 'ORG_MEMBER'
                  ? 'Org'
                  : r === 'CLIENT'
                  ? 'Client'
                  : 'Auditee';
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => setFilterRole(r)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                    filterRole === r
                      ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {label} ({count})
                </button>
              );
            })}
          </div>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => handleOpenAssign('ORG_MEMBER')}
          leftIcon={<UserPlus className="w-4 h-4" />}
        >
          + Add Project Member
        </Button>
      </div>

      {/* Member Table */}
      <Card className="bg-white border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Member</th>
                <th className="py-3 px-4">Official Email</th>
                <th className="py-3 px-4">Role Bucket</th>
                <th className="py-3 px-4">Permissions & Authority</th>
                <th className="py-3 px-4">Date Assigned</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    Loading project members...
                  </td>
                </tr>
              ) : filteredMembers.length > 0 ? (
                filteredMembers.map((m: IProjectMember) => {
                  const meta = roleMeta[m.teamBucket] || roleMeta.ORG_MEMBER;
                  const name = m.user?.name || m.user?.email || 'Unnamed Member';
                  const initials = name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2);

                  const dateStr = m.createdAt
                    ? new Date(m.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : '—';

                  return (
                    <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Name & Initials */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-500 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-slate-900 truncate">
                              {name}
                            </div>
                            <div className="text-[11px] text-slate-500 truncate">
                              {m.user?.designation || 'Team Representative'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Official Email */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-mono text-[11px] truncate">{m.user?.email || '—'}</span>
                        </div>
                      </td>

                      {/* Team Bucket Badge */}
                      <td className="py-3 px-4">
                        <div className="inline-flex items-center gap-1.5">
                          {meta.icon}
                          <Badge variant={meta.variant} size="xs">
                            {meta.label}
                          </Badge>
                        </div>
                      </td>

                      {/* Permissions Description */}
                      <td className="py-3 px-4 text-slate-600 text-[11px]">
                        {meta.permissions}
                      </td>

                      {/* Date Assigned */}
                      <td className="py-3 px-4 text-slate-500 text-[11px] whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{dateStr}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-14 text-center">
                    <div className="max-w-sm mx-auto space-y-2">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                        <Users className="w-5 h-5" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">
                        {searchQuery || filterRole !== 'ALL'
                          ? 'No matching members found'
                          : 'No project members assigned yet'}
                      </h4>
                      <p className="text-xs text-slate-500">
                        {searchQuery || filterRole !== 'ALL'
                          ? 'Try adjusting your search query or role filter.'
                          : 'Add administrators, audit firm auditors, regulators, or auditee staff to this workspace.'}
                      </p>
                      <div className="pt-2">
                        <Button
                          variant="primary"
                          size="xs"
                          onClick={() => handleOpenAssign('ORG_MEMBER')}
                          leftIcon={<UserPlus className="w-3.5 h-3.5" />}
                        >
                          + Add First Member
                        </Button>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Member Assignment Modal */}
      <AssignMemberModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        projectId={projectId}
        defaultRole={selectedRole}
      />
    </div>
  );
};
