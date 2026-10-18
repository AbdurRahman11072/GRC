'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FolderKanban,
  Shield,
  Briefcase,
  Building2,
  Crown,
} from 'lucide-react';
import { Shell } from '../../components/layout/Shell';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useAppSelector } from '../../store/hooks';
import { useGetProjectsQuery } from '../../store/api/projectApi';
import { AdminDashboardView } from '../../components/dashboard/AdminDashboardView';
import { OrgMemberDashboardView } from '../../components/dashboard/OrgMemberDashboardView';
import { ClientDashboardView } from '../../components/dashboard/ClientDashboardView';
import { AuditeeDashboardView } from '../../components/dashboard/AuditeeDashboardView';

type DashboardRoleView = 'ADMINISTRATOR' | 'ORG_MEMBER' | 'CLIENT' | 'AUDITEE';

export default function DashboardPage() {
  const { user, organizations, currentOrgId } = useAppSelector((state) => state.auth);
  const activeOrg = organizations.find((o) => o.orgId === currentOrgId) || organizations[0];
  const { data: projectsData } = useGetProjectsQuery();
  const projects = projectsData?.data || [];

  // Determine user's native role
  const isOrgAdmin = activeOrg?.orgRole === 'OWNER' || activeOrg?.orgRole === 'ADMIN';
  const primaryProjectRole = user?.projectMemberships?.[0]?.teamBucket;

  const defaultView: DashboardRoleView = isOrgAdmin
    ? 'ADMINISTRATOR'
    : primaryProjectRole === 'CLIENT'
    ? 'CLIENT'
    : primaryProjectRole === 'AUDITEE'
    ? 'AUDITEE'
    : 'ORG_MEMBER';

  const [activeRoleView, setActiveRoleView] = useState<DashboardRoleView>(defaultView);

  useEffect(() => {
    setActiveRoleView(defaultView);
  }, [defaultView]);

  const userName = user?.name || user?.email?.split('@')[0] || 'User';

  return (
    <Shell>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <Badge variant="cyan" size="sm" dot>
                {activeOrg?.orgName || 'Active Workspace'}
              </Badge>
              <Badge
                variant={
                  activeRoleView === 'ADMINISTRATOR'
                    ? 'indigo'
                    : activeRoleView === 'ORG_MEMBER'
                    ? 'cyan'
                    : activeRoleView === 'CLIENT'
                    ? 'neutral'
                    : 'success'
                }
                size="sm"
              >
                {activeRoleView === 'ADMINISTRATOR'
                  ? 'Administrator'
                  : activeRoleView === 'ORG_MEMBER'
                  ? 'Audit Firm Auditor'
                  : activeRoleView === 'CLIENT'
                  ? 'Client (Regulator)'
                  : 'Auditee Enterprise'}
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {activeRoleView === 'ADMINISTRATOR'
                ? 'Executive GRC Overview'
                : activeRoleView === 'ORG_MEMBER'
                ? 'Auditor Task & Evidence Desk'
                : activeRoleView === 'CLIENT'
                ? 'Regulator Oversight Portal'
                : 'Auditee Department Action Center'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              Role-tailored workspace for {userName} ({user?.email}).
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link href="/projects">
              <Button
                variant="primary"
                size="sm"
                leftIcon={<FolderKanban className="w-4 h-4" />}
              >
                Launch Projects
              </Button>
            </Link>
          </div>
        </div>

        {/* Role View Switcher (Permits Admins/Auditors to switch perspectives) */}
        <div className="flex items-center justify-between flex-wrap gap-2.5 p-2 bg-slate-100/80 rounded-xl border border-slate-200/80">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 pl-2">
            <span>Role Perspective:</span>
          </div>

          <div className="flex items-center gap-1 flex-wrap">
            <button
              type="button"
              onClick={() => setActiveRoleView('ADMINISTRATOR')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                activeRoleView === 'ADMINISTRATOR'
                  ? 'bg-white text-indigo-700 shadow-xs font-bold border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Crown className="w-3.5 h-3.5 text-indigo-600" />
              Admin
            </button>

            <button
              type="button"
              onClick={() => setActiveRoleView('ORG_MEMBER')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                activeRoleView === 'ORG_MEMBER'
                  ? 'bg-white text-cyan-700 shadow-xs font-bold border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5 text-cyan-600" />
              Org Auditor
            </button>

            <button
              type="button"
              onClick={() => setActiveRoleView('CLIENT')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                activeRoleView === 'CLIENT'
                  ? 'bg-white text-amber-700 shadow-xs font-bold border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-amber-600" />
              Client (Regulator)
            </button>

            <button
              type="button"
              onClick={() => setActiveRoleView('AUDITEE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                activeRoleView === 'AUDITEE'
                  ? 'bg-white text-emerald-700 shadow-xs font-bold border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-emerald-600" />
              Auditee (Enterprise)
            </button>
          </div>
        </div>

        {/* Dynamic Role-Based View Render */}
        {activeRoleView === 'ADMINISTRATOR' && (
          <AdminDashboardView projects={projects} />
        )}
        {activeRoleView === 'ORG_MEMBER' && (
          <OrgMemberDashboardView
            userName={userName}
            projects={projects}
            currentUserId={user?.id}
            isOrgAdmin={isOrgAdmin}
          />
        )}
        {activeRoleView === 'CLIENT' && (
          <ClientDashboardView userName={userName} projects={projects} />
        )}
        {activeRoleView === 'AUDITEE' && (
          <AuditeeDashboardView userName={userName} projects={projects} />
        )}
      </div>
    </Shell>
  );
}
