'use client';

import React from 'react';
import Link from 'next/link';
import {
  Shield,
  FileCheck,
  CheckCircle2,
  Eye,
  ArrowUpRight,
  FolderKanban,
  Building2,
  TrendingUp,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import type { IProject } from '../../types/project.types';

interface ClientDashboardViewProps {
  userName: string;
  projects: IProject[];
}

export const ClientDashboardView: React.FC<ClientDashboardViewProps> = ({
  userName,
  projects,
}) => {
  const activeProject = projects[0];

  return (
    <div className="space-y-6">
      {/* Role Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-amber-600 text-white shadow-md shadow-amber-600/20 shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                Regulator Portal
              </span>
              <Badge variant="neutral" size="xs">
                Client (Regulator)
              </Badge>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-0.5">
              Welcome, {userName}
            </h2>
            <p className="text-xs text-slate-600">
              Regulatory compliance oversight desk with read-only monitoring across telecom IS audits.
            </p>
          </div>
        </div>

        {activeProject && (
          <Link href={`/projects/${activeProject.id}?tab=tors`}>
            <Button variant="outline" size="sm" leftIcon={<Eye className="w-4 h-4 text-amber-700" />}>
              View ToR WBS Compliance
            </Button>
          </Link>
        )}
      </div>

      {/* Regulator KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-white border-slate-200">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Overall Compliance</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-600">84.2%</div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Weighted audit score</span>
          </div>
        </Card>

        <Card className="p-4 bg-white border-slate-200">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Verified Evidence</span>
            <FileCheck className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">42 / 48</div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
            <span>Accepted DRT documents</span>
          </div>
        </Card>

        <Card className="p-4 bg-white border-slate-200">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Regulated Entity</span>
            <Building2 className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-lg font-bold text-slate-900 truncate">
            {activeProject?.auditee?.name || 'Fiber@Home'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
            <Badge variant="cyan" size="xs">Nationwide Telecom</Badge>
          </div>
        </Card>

        <Card className="p-4 bg-white border-slate-200">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Audits</span>
            <FolderKanban className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{projects.length}</div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
            <span>Commission oversight</span>
          </div>
        </Card>
      </div>

      {/* Audit Projects Oversight List */}
      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Regulatory Audit Workspaces</h3>
          <p className="text-xs text-slate-500">
            Inspect Terms of Reference (ToR), Data Requests (DRT), and macro compliance scores.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.length > 0 ? (
            projects.map((project) => (
              <Card key={project.id} className="p-4 bg-white border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
                      Regulatory Scope
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 truncate">
                      {project.projectName}
                    </h4>
                  </div>
                  <Badge variant="neutral" size="xs">
                    Read-Only
                  </Badge>
                </div>

                <div className="text-xs text-slate-500 space-y-1">
                  <div>
                    <strong className="text-slate-700">Commission:</strong>{' '}
                    {project.client?.name || 'BTRC'}
                  </div>
                  <div>
                    <strong className="text-slate-700">Audited Operator:</strong>{' '}
                    {project.auditee?.name || 'Fiber@Home Ltd.'}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-500">
                    Audit Progress: <strong className="text-emerald-700">84% Complete</strong>
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Link href={`/projects/${project.id}?tab=tors`}>
                      <Button variant="outline" size="xs" rightIcon={<ArrowUpRight className="w-3 h-3" />}>
                        ToR WBS
                      </Button>
                    </Link>
                    <Link href={`/projects/${project.id}?tab=drt`}>
                      <Button variant="outline" size="xs" rightIcon={<ArrowUpRight className="w-3 h-3" />}>
                        DRT Status
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="col-span-2 py-8 text-center text-xs text-slate-400">
              No regulatory projects found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
