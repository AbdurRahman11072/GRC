'use client';

import React, { useState, useMemo } from 'react';
import {
  Users,
  UserPlus,
  Mail,
  Search,
  Calendar,
} from 'lucide-react';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { AssignMemberModal } from './AssignMemberModal';
import { MemberRoleDropdown, getCanonicalRole } from './MemberRoleDropdown';
import {
  useGetProjectMembersQuery,
  useGetProjectByIdQuery,
  useGetMyProjectPermissionsQuery,
} from '../../../store/api/projectApi';
import { useAppSelector } from '../../../store/hooks';
import type { ProjectRole, IProjectMember, ProjectFunctionalRole } from '../../../types/project.types';

interface TabTeamProps {
  projectId: string;
}

const ROLE_PERMISSIONS_TEXT: Record<ProjectFunctionalRole, string> = {
  PROJECT_MANAGER: 'Full Authority (ToRs, DRTs, Marks, Checks)',
  SUPERVISOR: 'Verify Documents & Award Marks',
  CLIENT: 'Regulatory Oversight & Macro Scorecard',
  FIELD_MEMBER: 'Evidence Upload & Progress Tracking',
  AUDITEE: 'Auditee Submissions & SLA Tracking',
  ADMIN: 'Project Administration & Configuration',
  ADMINISTRATOR: 'Full Workspace Control & User Access',
  FIELD_TEAM: 'Evidence Upload & Progress Tracking',
  CLIENT_REPRESENTATIVE: 'Regulatory Oversight & Macro Scorecard',
  AUDITEE_REPRESENTATIVE: 'Auditee Submissions & SLA Tracking',
};

const FILTER_TABS = [
  { id: 'ALL', label: 'All Roles' },
  { id: 'PROJECT_MANAGER', label: 'Project Manager' },
  { id: 'SUPERVISOR', label: 'Supervisor' },
  { id: 'CLIENT', label: 'Client' },
  { id: 'FIELD_MEMBER', label: 'Field Member' },
  { id: 'AUDITEE', label: 'Auditee' },
  { id: 'ADMIN', label: 'Admin' },
  { id: 'ADMINISTRATOR', label: 'Administrator' },
];

export const TabTeam: React.FC<TabTeamProps> = ({ projectId }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<ProjectRole>('ORG_MEMBER');
  const [filterRole, setFilterRole] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const { user, organizations, currentOrgId } = useAppSelector((state) => state.auth);
  const activeOrg = organizations.find((o) => o.orgId === currentOrgId) || organizations[0];
  const isOrgAdmin = user?.isSuperAdmin || activeOrg?.orgRole === 'OWNER' || activeOrg?.orgRole === 'ADMIN';

  const { data: membersData, isLoading } = useGetProjectMembersQuery(projectId);
  const { data: projectData } = useGetProjectByIdQuery(projectId);
  const { data: permData } = useGetMyProjectPermissionsQuery(projectId);

  const canManageTeam = isOrgAdmin || Boolean(permData?.data?.canManageTeam || permData?.data?.canCreateTor);
  const members = membersData?.data || [];
  const project = projectData?.data;

  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const canonical = getCanonicalRole(m.projectRole, m.teamBucket);
      if (filterRole !== 'ALL' && canonical !== filterRole) return false;

      const name = m.user?.name?.toLowerCase() || '';
      const email = m.user?.email?.toLowerCase() || '';
      const query = searchQuery.toLowerCase().trim();
      return !query || name.includes(query) || email.includes(query);
    });
  }, [members, filterRole, searchQuery]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search member or email..."
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-44 sm:w-52"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg overflow-x-auto max-w-full">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterRole(tab.id)}
                className={`px-2 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-all ${
                  filterRole === tab.id ? 'bg-white text-indigo-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {canManageTeam && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setSelectedRole('ORG_MEMBER');
              setIsModalOpen(true);
            }}
            leftIcon={<UserPlus className="w-4 h-4" />}
          >
            + Add Project Member
          </Button>
        )}
      </div>

      <Card className="bg-white border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Member</th>
                <th className="py-3 px-4">Official Email</th>
                <th className="py-3 px-4">Organization Role (Dropdown)</th>
                <th className="py-3 px-4">Permissions & Access</th>
                <th className="py-3 px-4">Date Assigned</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">Loading project members...</td>
                </tr>
              ) : filteredMembers.length > 0 ? (
                filteredMembers.map((m: IProjectMember) => {
                  const canonical = getCanonicalRole(m.projectRole, m.teamBucket);
                  const name = m.user?.name || m.user?.email || 'Unnamed Member';
                  const initials = name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
                  const dateStr = m.createdAt ? new Date(m.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

                  return (
                    <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-500 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-slate-900 truncate">{name}</div>
                            <div className="text-[11px] text-slate-500 truncate">{m.user?.designation || 'Project Member'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-mono text-[11px] truncate">{m.user?.email || '—'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <MemberRoleDropdown
                          projectId={projectId}
                          memberId={m.id}
                          currentRole={m.projectRole}
                          currentBucket={m.teamBucket}
                          canEdit={canManageTeam}
                        />
                      </td>
                      <td className="py-3 px-4 text-slate-600 text-[11px]">
                        {ROLE_PERMISSIONS_TEXT[canonical] || 'Custom Access'}
                      </td>
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
                        {searchQuery || filterRole !== 'ALL' ? 'No matching members found' : 'No project members assigned yet'}
                      </h4>
                      <p className="text-xs text-slate-500">
                        {searchQuery || filterRole !== 'ALL' ? 'Try adjusting your search query or role filter.' : 'Members assigned to this workspace will appear here.'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {canManageTeam && (
        <AssignMemberModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          projectId={projectId}
          clientId={project?.clientId}
          auditeeId={project?.auditeeId}
          clientName={project?.client?.name}
          auditeeName={project?.auditee?.name}
          defaultRole={selectedRole}
          existingMemberUserIds={members.map((m) => m.userId)}
        />
      )}
    </div>
  );
};
