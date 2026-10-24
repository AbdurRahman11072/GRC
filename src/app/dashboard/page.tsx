'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  FolderKanban,
  Shield,
  Briefcase,
  Building2,
  Crown,
  ShieldCheck,
} from 'lucide-react';
import { Shell } from '../../components/layout/Shell';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useAppSelector } from '../../store/hooks';
import { useGetProjectsQuery } from '../../store/api/projectApi';
import { AdminDashboardView } from '../../components/dashboard/AdminDashboardView';
import { ProjectManagerDashboardView } from '../../components/dashboard/ProjectManagerDashboardView';
import { SupervisorDashboardView } from '../../components/dashboard/SupervisorDashboardView';
import { FieldMemberDashboardView } from '../../components/dashboard/FieldMemberDashboardView';
import { ClientDashboardView } from '../../components/dashboard/ClientDashboardView';
import { AuditeeDashboardView } from '../../components/dashboard/AuditeeDashboardView';

export type DashboardRoleView =
  | 'ADMINISTRATOR'
  | 'PROJECT_MANAGER'
  | 'SUPERVISOR'
  | 'FIELD_TEAM'
  | 'CLIENT'
  | 'AUDITEE';

const roleMeta: Record<DashboardRoleView, { label: string; title: string; badge: string; icon: any }> = {
  ADMINISTRATOR: { label: 'Admin', title: 'Executive GRC Overview', badge: 'Administrator', icon: Crown },
  PROJECT_MANAGER: { label: 'PM', title: 'Project Manager Command Center', badge: 'Project Manager', icon: FolderKanban },
  SUPERVISOR: { label: 'Supervisor', title: 'Supervisory Evidence & Scoring Desk', badge: 'Audit Supervisor', icon: ShieldCheck },
  FIELD_TEAM: { label: 'Field Auditor', title: 'Field Evidence Collection Desk', badge: 'Field Member', icon: Briefcase },
  CLIENT: { label: 'Client (Regulator)', title: 'Regulator Oversight Portal', badge: 'Client (Regulator)', icon: Shield },
  AUDITEE: { label: 'Auditee Enterprise', title: 'Auditee Department Action Center', badge: 'Auditee Enterprise', icon: Building2 },
};

export default function DashboardPage() {
  const { user, organizations, currentOrgId } = useAppSelector((state) => state.auth);
  const activeOrg = organizations.find((o) => o.orgId === currentOrgId) || organizations[0];
  const { data: projectsData } = useGetProjectsQuery();
  const projects = projectsData?.data || [];

  const isOrgAdmin = activeOrg?.orgRole === 'OWNER' || activeOrg?.orgRole === 'ADMIN';
  const firstMembership = user?.projectMemberships?.[0];

  const defaultView: DashboardRoleView = useMemo(() => {
    if (isOrgAdmin) return 'ADMINISTRATOR';
    if (firstMembership?.projectRole === 'PROJECT_MANAGER') return 'PROJECT_MANAGER';
    if (firstMembership?.projectRole === 'SUPERVISOR') return 'SUPERVISOR';
    if (firstMembership?.projectRole === 'FIELD_TEAM') return 'FIELD_TEAM';
    if (firstMembership?.teamBucket === 'CLIENT') return 'CLIENT';
    if (firstMembership?.teamBucket === 'AUDITEE') return 'AUDITEE';
    return 'PROJECT_MANAGER';
  }, [isOrgAdmin, firstMembership]);

  const [activeRoleView, setActiveRoleView] = useState<DashboardRoleView | null>(null);

  useEffect(() => {
    if (!activeRoleView) {
      setActiveRoleView(defaultView);
    }
  }, [defaultView, activeRoleView]);

  const currentView = activeRoleView || defaultView;
  const userName = user?.name || user?.email?.split('@')[0] || 'User';
  const currentMeta = roleMeta[currentView];

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
              <Badge variant="indigo" size="sm">
                {currentMeta.badge}
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {currentMeta.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              Role-tailored workspace for {userName} ({user?.email}).
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link href="/projects">
              <Button variant="primary" size="sm" leftIcon={<FolderKanban className="w-4 h-4" />}>
                Launch Projects
              </Button>
            </Link>
          </div>
        </div>

        {/* Role View Switcher */}
        <div className="flex items-center justify-between flex-wrap gap-2.5 p-2 bg-slate-100/80 rounded-xl border border-slate-200/80">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 pl-2">
            <span>Role Perspective:</span>
          </div>

          <div className="flex items-center gap-1 flex-wrap">
            {(Object.keys(roleMeta) as DashboardRoleView[]).map((rKey) => {
              const meta = roleMeta[rKey];
              const Icon = meta.icon;
              const isActive = currentView === rKey;
              return (
                <button
                  key={rKey}
                  type="button"
                  onClick={() => setActiveRoleView(rKey)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white text-indigo-700 shadow-xs font-bold border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {meta.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Role-Based View Render */}
        {currentView === 'ADMINISTRATOR' && <AdminDashboardView projects={projects} />}
        {currentView === 'PROJECT_MANAGER' && (
          <ProjectManagerDashboardView userName={userName} projects={projects} currentUserId={user?.id} />
        )}
        {currentView === 'SUPERVISOR' && (
          <SupervisorDashboardView userName={userName} projects={projects} currentUserId={user?.id} />
        )}
        {currentView === 'FIELD_TEAM' && (
          <FieldMemberDashboardView userName={userName} projects={projects} currentUserId={user?.id} />
        )}
        {currentView === 'CLIENT' && <ClientDashboardView userName={userName} projects={projects} />}
        {currentView === 'AUDITEE' && <AuditeeDashboardView userName={userName} projects={projects} />}
      </div>
    </Shell>
  );
}
