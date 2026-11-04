'use client';

import React, { useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Shell } from '../../../components/layout/Shell';
import { WorkspaceHeader, WorkspaceTab } from '../../../components/projects/workspace/WorkspaceHeader';
import { TabOverview } from '../../../components/projects/workspace/TabOverview';
import { TabEntities } from '../../../components/projects/workspace/TabEntities';
import { TabToR } from '../../../components/projects/workspace/TabToR';
import { TabDRT } from '../../../components/projects/workspace/TabDRT';
import { TabTeam } from '../../../components/projects/workspace/TabTeam';
import { TabScorecard } from '../../../components/projects/workspace/TabScorecard';
import { useGetProjectByIdQuery, useGetMyProjectPermissionsQuery } from '../../../store/api/projectApi';
import { useAppSelector } from '../../../store/hooks';

export default function ProjectWorkspacePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const projectId = params?.id as string;

  const { user, organizations, currentOrgId } = useAppSelector((state) => state.auth);
  const activeOrg = organizations.find((o) => o.orgId === currentOrgId) || organizations[0];
  const isOrgAdmin =
    user?.isSuperAdmin || activeOrg?.orgRole === 'OWNER' || activeOrg?.orgRole === 'ADMIN';

  const { data: permData, isLoading: isPermsLoading } = useGetMyProjectPermissionsQuery(projectId, {
    skip: !projectId,
  });
  const permissions = permData?.data;
  const canAccessTors = isOrgAdmin || Boolean(permissions?.canAccessTors || permissions?.canCreateTor);
  const canAccessEntities = isOrgAdmin || Boolean(permissions?.canAccessEntities || permissions?.canCreateTor);
  const canAccessScorecard = isOrgAdmin || permissions?.canAccessScorecard !== false;

  const initialTab = (searchParams?.get('tab') as WorkspaceTab) || 'overview';
  const initialTorId = searchParams?.get('torId') || '';
  const [activeTab, setActiveTab] = useState<WorkspaceTab>(initialTab);
  const [selectedTorId, setSelectedTorId] = useState<string>(initialTorId);

  const handleNavigateToDrt = (torId: string) => {
    setSelectedTorId(torId);
    setActiveTab('drt');
  };

  // Guard: redirect to overview or drt if user tries to navigate to an unauthorized tab
  React.useEffect(() => {
    if (isPermsLoading) return;
    if (!canAccessEntities && activeTab === 'entities') setActiveTab('overview');
    if (!canAccessTors && activeTab === 'tors') setActiveTab('overview');
    if (!canAccessScorecard && activeTab === 'scorecard') setActiveTab('drt');
  }, [isPermsLoading, canAccessEntities, canAccessTors, canAccessScorecard, activeTab]);

  const { data: projectData, isLoading, error } = useGetProjectByIdQuery(projectId, {
    skip: !projectId,
  });
  const project = projectData?.data;

  return (
    <Shell>
      <div className="space-y-6 max-w-7xl mx-auto">
        {isLoading ? (
          <div className="py-20 text-center text-xs text-slate-500">
            Loading audit project workspace...
          </div>
        ) : error || !project ? (
          <div className="py-20 text-center space-y-2">
            <h2 className="text-base font-semibold text-slate-200">
              Audit Project Not Found
            </h2>
            <p className="text-xs text-slate-400">
              The requested audit project workspace does not exist or access is restricted.
            </p>
          </div>
        ) : (
          <>
            <WorkspaceHeader
              project={project}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              isOrgAdmin={isOrgAdmin}
              canCreateTor={permissions?.canCreateTor}
              canAccessTors={canAccessTors}
              canAccessScorecard={canAccessScorecard}
              canAccessEntities={canAccessEntities}
              userRole={permissions?.projectRole || (isOrgAdmin ? 'LEAD_AUDITOR' : null)}
            />

            <div className="pt-2">
              {activeTab === 'overview' && (
                <TabOverview project={project} onNavigateTab={setActiveTab} />
              )}
              {activeTab === 'scorecard' && canAccessScorecard && (
                <TabScorecard
                  projectId={projectId}
                  isManagerOrAdmin={isOrgAdmin || Boolean(permissions?.canCreateTor)}
                />
              )}
              {activeTab === 'entities' && canAccessEntities && <TabEntities project={project} />}
              {activeTab === 'tors' && canAccessTors && (
                <TabToR projectId={projectId} onNavigateToDrt={handleNavigateToDrt} />
              )}
              {activeTab === 'drt' && (
                <TabDRT
                  projectId={projectId}
                  project={project}
                  initialTorId={selectedTorId}
                  onClearTorFilter={() => setSelectedTorId('')}
                />
              )}
              {activeTab === 'team' && <TabTeam projectId={projectId} />}
            </div>
          </>
        )}
      </div>
    </Shell>
  );
}
