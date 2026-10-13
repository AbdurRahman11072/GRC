'use client';

import React from 'react';
import Link from 'next/link';
import {
  Building2,
  Clock,
  AlertTriangle,
  FileText,
  RotateCcw,
  CheckCircle2,
  ArrowUpRight,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import type { IProject } from '../../types/project.types';

interface AuditeeDashboardViewProps {
  userName: string;
  projects: IProject[];
}

export const AuditeeDashboardView: React.FC<AuditeeDashboardViewProps> = ({
  userName,
  projects,
}) => {
  const activeProject = projects[0];

  return (
    <div className="space-y-6">
      {/* Role Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20 shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                Auditee Operations Desk
              </span>
              <Badge variant="success" size="xs">
                Auditee Enterprise
              </Badge>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-0.5">
              Welcome, {userName}
            </h2>
            <p className="text-xs text-slate-600">
              Department action hub for tracking DRT evidence requests and submission SLA deadlines.
            </p>
          </div>
        </div>

        {activeProject && (
          <Link href={`/projects/${activeProject.id}?tab=drt`}>
            <Button variant="primary" size="sm" leftIcon={<FileText className="w-4 h-4" />}>
              Review Department DRTs
            </Button>
          </Link>
        )}
      </div>

      {/* Auditee Action Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-white border-slate-200">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Action Required</span>
            <FileText className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">5 DRTs</div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>Awaiting department response</span>
          </div>
        </Card>

        <Card className="p-4 bg-white border-slate-200">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Upcoming Deadlines</span>
            <Clock className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-indigo-600">3 Due Soon</div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
            <span>Next deadline in 4 days</span>
          </div>
        </Card>

        <Card className="p-4 bg-white border-slate-200">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Revisions Requested</span>
            <RotateCcw className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-rose-600">1 Item</div>
          <div className="text-[11px] text-rose-500 mt-1 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
            <span>Auditor requested updated file</span>
          </div>
        </Card>

        <Card className="p-4 bg-white border-slate-200">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Accepted Submissions</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-600">38 Completed</div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
            <span>Verified by IS Auditors</span>
          </div>
        </Card>
      </div>

      {/* Auditee Engagements Section */}
      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Active Audit Inquiries</h3>
          <p className="text-xs text-slate-500">
            Audit workspaces requiring evidence and documentation from your enterprise.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.length > 0 ? (
            projects.map((project) => (
              <Card key={project.id} className="p-4 bg-white border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
                      Audit Scope: 2016–2026
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 truncate">
                      {project.projectName}
                    </h4>
                  </div>
                  <Badge variant="success" size="xs">
                    Auditee Enterprise
                  </Badge>
                </div>

                <div className="text-xs text-slate-500 space-y-1">
                  <div>
                    <strong className="text-slate-700">Audit Scope:</strong>{' '}
                    {project.projectScope || 'Multi-year infrastructure and billing conformance'}
                  </div>
                  <div>
                    <strong className="text-slate-700">Client / Commission:</strong>{' '}
                    {project.client?.name || 'BTRC'}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-amber-700 font-medium">
                    ⚠️ SLA Tracking Enabled
                  </span>
                  <Link href={`/projects/${project.id}?tab=drt`}>
                    <Button variant="outline" size="xs" rightIcon={<ArrowUpRight className="w-3 h-3" />}>
                      View DRTs & Deadlines
                    </Button>
                  </Link>
                </div>
              </Card>
            ))
          ) : (
            <div className="col-span-2 py-8 text-center text-xs text-slate-400">
              No audit projects found for this enterprise.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
