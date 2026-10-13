'use client';

import React from 'react';
import Link from 'next/link';
import {
  FolderKanban,
  FileCheck,
  Building2,
  Users,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import type { IProject } from '../../types/project.types';

interface AdminDashboardViewProps {
  projects: IProject[];
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ projects }) => {
  const projectCount = projects.length;
  const activeProject = projects[0];

  return (
    <div className="space-y-6">
      {/* Quick Launchpad Action Buttons */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs uppercase font-bold tracking-wider text-slate-600">
            Executive Launchpad
          </h2>
          <span className="text-[11px] text-slate-500">Audit Management Workflows</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: '/projects', label: '+ New Project', sub: 'Start Audit Scope', icon: FolderKanban, border: 'border-indigo-200', bg: 'bg-indigo-50', text: 'text-indigo-600' },
            { href: '/drt', label: '+ New DRT Ticket', sub: 'Request Evidence', icon: FileCheck, border: 'border-cyan-200', bg: 'bg-cyan-50', text: 'text-cyan-700' },
            { href: '/crm/entities', label: '+ Add CRM Entity', sub: 'Regulator / Auditee', icon: Building2, border: 'border-emerald-200', bg: 'bg-emerald-50', text: 'text-emerald-700' },
            { href: '/organization/members', label: '+ Invite Staff', sub: 'Team Provisioning', icon: Users, border: 'border-purple-200', bg: 'bg-purple-50', text: 'text-purple-700' },
          ].map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.href} href={action.href} className="group">
                <Card hoverEffect className={`p-4 flex flex-col justify-between h-28 ${action.border} bg-white shadow-2xs`}>
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-lg ${action.bg} ${action.text} group-hover:scale-110 transition-transform`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 transition-colors" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-900">{action.label}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{action.sub}</div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Macro KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 bg-white border-slate-200">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Audit Projects</span>
            <FolderKanban className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums">{projectCount}</div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
            {projectCount > 0 ? (
              <>
                <Badge variant="cyan" size="xs">{activeProject?.status || 'ACTIVE'}</Badge>
                <span className="truncate max-w-[120px]">{activeProject?.projectName}</span>
              </>
            ) : (
              <span>No active projects</span>
            )}
          </div>
        </Card>

        <Card className="p-5 bg-white border-slate-200">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">DRT Requests</span>
            <FileCheck className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums">
            {projectCount > 0 ? '48' : '0'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>{projectCount > 0 ? 'SLA tracking enabled' : 'No pending tickets'}</span>
          </div>
        </Card>

        <Card className="p-5 bg-white border-slate-200">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">ToR WBS Nodes</span>
            <Layers className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums">
            {projectCount > 0 ? '12' : '0'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>{projectCount > 0 ? 'Hierarchical tree' : 'No clauses created'}</span>
          </div>
        </Card>

        <Card className="p-5 bg-white border-slate-200">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">4-Team Model</span>
            <ShieldCheck className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums">4</div>
          <div className="text-[11px] text-slate-500 mt-1">
            <span>Org, Client & Auditee Teams</span>
          </div>
        </Card>
      </div>

      {/* Active Engagement Card */}
      {activeProject ? (
        <Card className="p-6 border-indigo-200 bg-gradient-to-r from-indigo-50/60 via-white to-cyan-50/40 shadow-2xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1 max-w-2xl">
              <div className="text-xs font-bold text-indigo-700 uppercase tracking-wider">
                Active Engagement Scope
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                {activeProject.projectName}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {activeProject.projectScope || 'Multi-year IS audit engagement workspace.'}
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Link href={`/projects/${activeProject.id}`}>
                <Button variant="primary" size="md">
                  View Workspace
                </Button>
              </Link>
              <Link href="/tors">
                <Button variant="outline" size="md">
                  ToR Tree
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="p-6 border-slate-200 bg-white shadow-2xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1 max-w-2xl">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Getting Started
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Set Up Your First Audit Engagement
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                No active project workspaces found. Create a project to start configuring Terms of Reference, tracking DRTs, and collaborating across teams.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Link href="/projects">
                <Button variant="primary" size="md" leftIcon={<FolderKanban className="w-4 h-4" />}>
                  Go to Projects
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
