'use client';

import React, { useState } from 'react';
import { Users, UserPlus, ShieldCheck, UserCheck, Building2 } from 'lucide-react';
import { Shell } from '../../../components/layout/Shell';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Card } from '../../../components/ui/Card';
import { OrgMembersTable } from '../../../components/organization/OrgMembersTable';
import { AddOrgMemberModal } from '../../../components/organization/AddOrgMemberModal';
import { useAppSelector } from '../../../store/hooks';
import { useGetOrganizationMembersQuery } from '../../../store/api/organizationApi';

export default function OrganizationMembersPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user, organizations, currentOrgId } = useAppSelector((state) => state.auth);
  const activeOrg = organizations.find((o) => o.orgId === currentOrgId) || organizations[0];

  const isCallerAdmin =
    !!user?.isSuperAdmin || activeOrg?.orgRole === 'OWNER' || activeOrg?.orgRole === 'ADMIN';

  const { data: membersData } = useGetOrganizationMembersQuery(
    { orgId: activeOrg?.orgId || '' },
    { skip: !activeOrg?.orgId }
  );

  const members = membersData?.data || [];
  const totalStaff = members.length;
  const adminCount = members.filter((m) => m.orgRole === 'OWNER' || m.orgRole === 'ADMIN').length;
  const auditorCount = members.filter((m) => m.orgRole === 'AUDITOR' || m.orgRole === 'MEMBER').length;

  return (
    <Shell>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="indigo" size="sm">Firm Staffing</Badge>
              <Badge variant="cyan" size="sm">Auditor Pool</Badge>
              {activeOrg && (
                <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  {activeOrg.orgName}
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Organization Staff & Members
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              Manage your audit firm staff, provision login accounts, and maintain your auditor pool for project assignments.
            </p>
          </div>

          {isCallerAdmin && activeOrg && (
            <Button
              variant="primary"
              size="md"
              onClick={() => setIsModalOpen(true)}
              leftIcon={<UserPlus className="w-4 h-4" />}
            >
              Add Staff Member
            </Button>
          )}
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-4 bg-white border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Firm Staff</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{totalStaff}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Active team members</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-white border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Auditors</p>
                <p className="text-2xl font-bold text-cyan-600 mt-1">{auditorCount}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Eligible for project assignment</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
                <UserCheck className="w-5 h-5" />
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-white border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Administrators</p>
                <p className="text-2xl font-bold text-indigo-600 mt-1">{adminCount}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Firm Owners & Admins</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
          </Card>
        </div>

        {/* Member Table */}
        {activeOrg ? (
          <OrgMembersTable
            orgId={activeOrg.orgId}
            callerUserId={user?.id}
            isCallerAdmin={isCallerAdmin}
            callerOrgRole={activeOrg.orgRole}
          />
        ) : (
          <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-500 text-sm">
            No active organization selected.
          </div>
        )}

        {/* Provision Modal */}
        {activeOrg && (
          <AddOrgMemberModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            orgId={activeOrg.orgId}
          />
        )}
      </div>
    </Shell>
  );
}
