'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  FolderKanban,
  PlusCircle,
  Calendar,
  CalendarRange,
  Layers,
  FileCheck,
  Building,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { Shell } from '../../components/layout/Shell';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { useRouter } from 'next/navigation';
import { CreateProjectModal } from '../../components/projects/CreateProjectModal';
import { useGetProjectsQuery } from '../../store/api/projectApi';
import { useAppSelector } from '../../store/hooks';

export default function ProjectsPage() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user, organizations, currentOrgId } = useAppSelector((state) => state.auth);
  const activeOrg = organizations.find((o) => o.orgId === currentOrgId) || organizations[0];
  const isOrgAdmin =
    user?.isSuperAdmin || activeOrg?.orgRole === 'OWNER' || activeOrg?.orgRole === 'ADMIN';

  const canCreateProject =
    user?.isSuperAdmin ||
    activeOrg?.orgRole === 'OWNER' ||
    activeOrg?.orgRole === 'ADMIN' ||
    activeOrg?.orgRole === 'AUDITOR';

  const { data: projectsData, isLoading } = useGetProjectsQuery();
  const projects = projectsData?.data || [];

  return (
    <Shell>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Page Header with Action Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="indigo" size="sm">
                Engagement Manager
              </Badge>
              <Badge variant="cyan" size="sm">
                Multi-Year Scope
              </Badge>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Audit Project Workspaces
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Manage multi-year IS audit engagements, define historical data periods (e.g. 2016–2026), and track execution timelines.
            </p>
          </div>

          {canCreateProject && (
            <Button
              variant="primary"
              size="md"
              onClick={() => setIsModalOpen(true)}
              leftIcon={<PlusCircle className="w-4 h-4" />}
            >
              New Audit Project
            </Button>
          )}
        </div>

        {/* Projects Grid or Empty State Card */}
        {isLoading ? (
          <div className="py-12 text-center text-xs text-slate-500">
            Loading project workspaces...
          </div>
        ) : projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((proj) => (
              <Card key={proj.id} hoverEffect className="flex flex-col justify-between">
                <CardHeader>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <Badge variant="cyan" size="xs">
                      {proj.status}
                    </Badge>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {proj.projectType}
                    </span>
                  </div>
                  <CardTitle className="text-base truncate">{proj.projectName}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {proj.projectScope || 'Multi-year IS audit engagement.'}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3 pt-0">
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center justify-between">
                      <span>Client (Regulator):</span>
                      <span className="font-semibold text-slate-800">
                        {proj.client?.name || 'Regulator Body'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Auditee (Operator):</span>
                      <span className="font-semibold text-slate-800">
                        {proj.auditee?.name || 'Auditee Enterprise'}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[11px] text-cyan-700 font-medium">
                      <CalendarRange className="w-3.5 h-3.5" />
                      <span>Data Coverage Scope</span>
                    </div>

                    <Link href={`/projects/${proj.id}`}>
                      <Button variant="secondary" size="xs" rightIcon={<ArrowRight className="w-3 h-3" />}>
                        Open Workspace
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 border-dashed border-slate-300 bg-white text-center shadow-2xs">
            <div className="max-w-md mx-auto space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto text-indigo-600 shadow-2xs">
                <FolderKanban className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-semibold text-slate-900">
                  No Audit Project Workspaces Found
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  There are no audit projects created for this organization yet. Click below to launch the wizard and create your first audit engagement workspace.
                </p>
              </div>
              {canCreateProject && (
                <div className="pt-2">
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => setIsModalOpen(true)}
                    leftIcon={<PlusCircle className="w-4 h-4" />}
                  >
                    Create Project Workspace
                  </Button>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>

      {/* Multi-Step Custom Modal */}
      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={(id) => router.push(`/projects/${id}`)}
      />
    </Shell>
  );
}
