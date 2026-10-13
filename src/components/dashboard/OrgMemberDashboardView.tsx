'use client';

import React from 'react';
import Link from 'next/link';
import {
  Briefcase,
  FileCheck,
  Clock,
  Upload,
  ArrowUpRight,
  AlertTriangle,
  FolderKanban,
  CheckCircle2,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import type { IProject } from '../../types/project.types';

interface OrgMemberDashboardViewProps {
  userName: string;
  projects: IProject[];
}

export const OrgMemberDashboardView: React.FC<OrgMemberDashboardViewProps> = ({
  userName,
  projects,
}) => {
  const activeProject = projects[0];

  return (
    <div className="space-y-6">
      {/* Role Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-50 to-indigo-50 border border-cyan-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-600 text-white shadow-md shadow-cyan-600/20 shrink-0">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-cyan-800 uppercase tracking-wider">
                Auditor Desk
              </span>
              <Badge variant="cyan" size="xs">
                Org Team Auditor
              </Badge>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-0.5">
              Welcome back, {userName}
            </h2>
            <p className="text-xs text-slate-600">
              You have primary authority to upload audit workpapers and evaluate regulatory evidence.
            </p>
          </div>
        </div>

        {activeProject && (
          <Link href={`/projects/${activeProject.id}?tab=drt`}>
            <Button variant="primary" size="sm" leftIcon={<Upload className="w-4 h-4" />}>
              Open DRT Upload Desk
            </Button>
          </Link>
        )}
      </div>

      {/* Auditor KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-white border-slate-200">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Assigned Clauses</span>
            <FileCheck className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">8 Clauses</div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Assigned as Org Auditor</span>
          </div>
        </Card>

        <Card className="p-4 bg-white border-slate-200">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending Uploads</span>
            <Upload className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">3 Pending</div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>Due before deadline</span>
          </div>
        </Card>

        <Card className="p-4 bg-white border-slate-200">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">SLA Status</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600">On Track</div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
            <span>0 Overdue submissions</span>
          </div>
        </Card>

        <Card className="p-4 bg-white border-slate-200">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Projects</span>
            <FolderKanban className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{projects.length}</div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
            <Badge variant="cyan" size="xs">Audit Firm Unit</Badge>
          </div>
        </Card>
      </div>

      {/* Auditor Assigned Workspaces Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Your Audit Engagements</h3>
            <p className="text-xs text-slate-500">
              Projects where you conduct IS audits and upload verification files.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.length > 0 ? (
            projects.map((project) => (
              <Card key={project.id} className="p-4 bg-white border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span className="text-xs font-semibold text-cyan-600 uppercase tracking-wider">
                      {project.projectType || 'IS Audit'}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 truncate">
                      {project.projectName}
                    </h4>
                  </div>
                  <Badge variant="cyan" size="xs">
                    {project.status || 'ACTIVE'}
                  </Badge>
                </div>

                <div className="text-xs text-slate-500 space-y-1">
                  <div>
                    <strong className="text-slate-700">Client (Regulator):</strong>{' '}
                    {project.client?.name || 'BTRC'}
                  </div>
                  <div>
                    <strong className="text-slate-700">Auditee:</strong>{' '}
                    {project.auditee?.name || 'Fiber@Home'}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-indigo-600 font-medium">
                    ⚡ Upload Authority Active
                  </span>
                  <Link href={`/projects/${project.id}?tab=drt`}>
                    <Button variant="outline" size="xs" rightIcon={<ArrowUpRight className="w-3 h-3" />}>
                      DRT Requests
                    </Button>
                  </Link>
                </div>
              </Card>
            ))
          ) : (
            <div className="col-span-2 py-8 text-center text-xs text-slate-400">
              No audit projects assigned yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
