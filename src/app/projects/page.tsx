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
import { CreateProjectModal } from '../../components/projects/CreateProjectModal';
import { useGetProjectsQuery } from '../../store/api/projectApi';

export default function ProjectsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: projectsData, isLoading } = useGetProjectsQuery();
  const projects = projectsData?.data || [];

  return (
    <Shell>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Page Header with Action Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="indigo" size="sm">
                Engagement Manager
              </Badge>
              <Badge variant="cyan" size="sm">
                Multi-Year Scope
              </Badge>
            </div>
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
              Audit Project Workspaces
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Manage multi-year IS audit engagements, define historical data periods (e.g. 2016–2026), and track execution timelines.
            </p>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={() => setIsModalOpen(true)}
            leftIcon={<PlusCircle className="w-4 h-4" />}
          >
            + New Project Wizard
          </Button>
        </div>

        {/* Projects Grid or Pilot Workspace Card */}
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
                  <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 space-y-1.5 text-xs text-slate-400">
                    <div className="flex items-center justify-between">
                      <span>Client (Regulator):</span>
                      <span className="font-semibold text-slate-200">
                        {proj.client?.name || 'Regulator Body'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Auditee (Operator):</span>
                      <span className="font-semibold text-slate-200">
                        {proj.auditee?.name || 'Auditee Enterprise'}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[11px] text-cyan-400 font-medium">
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
          /* Pilot Featured Engagement Card when no DB projects yet */
          <Card className="p-6 border-indigo-500/20 bg-slate-900/60">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <div className="flex items-center gap-2">
                  <Badge variant="cyan" size="sm" dot>
                    ACTIVE WORKSPACE
                  </Badge>
                  <Badge variant="neutral" size="sm">
                    Audit Period Coverage: 2016–2026 Data
                  </Badge>
                </div>

                <h3 className="text-xl font-bold text-slate-100">
                  BTRC & Fiber@Home Limited IS Audit
                </h3>

                <p className="text-xs text-slate-400 leading-relaxed">
                  Information Systems Audit workspace. Distinguishes engagement lifecycle dates from the historical data coverage range that auditee departments must provide records for.
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                  <span className="flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-indigo-400" />
                    Client: BTRC (Regulator)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                    Auditee: Fiber@Home Limited
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CalendarRange className="w-3.5 h-3.5 text-cyan-400" />
                    Historical Data Scope: 2016–2026
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Engagement: 2024–2025
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setIsModalOpen(true)}
                  leftIcon={<PlusCircle className="w-4 h-4" />}
                >
                  Launch Project Wizard
                </Button>
                <Link href="/tors">
                  <Button variant="outline" size="md" className="w-full">
                    View ToR WBS
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Multi-Step Custom Modal */}
      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </Shell>
  );
}
