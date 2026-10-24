'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  FolderKanban,
  AlertTriangle,
  Users,
  Building2,
  ArrowUpRight,
  FilePlus,
  ShieldAlert,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { CreateDrtDrawer } from '../projects/workspace/CreateDrtDrawer';
import { useGetTicketsQuery } from '../../store/api/drtApi';
import type { IProject } from '../../types/project.types';

export interface ProjectManagerDashboardViewProps {
  userName: string;
  projects: IProject[];
  currentUserId?: string;
}

export const ProjectManagerDashboardView: React.FC<ProjectManagerDashboardViewProps> = ({
  userName,
  projects,
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');
  const [isFireDrtOpen, setIsFireDrtOpen] = useState(false);

  const selectedProject = projects.find((p) => p.id === selectedProjectId) || projects[0];

  const { data: ticketsData } = useGetTicketsQuery(
    { projectId: selectedProject?.id || '' },
    { skip: !selectedProject?.id }
  );
  const tickets = ticketsData?.data || [];

  const totalTickets = tickets.length;
  const acceptedTickets = tickets.filter((t) => t.workflowStatus === 'ACCEPTED').length;
  const submittedTickets = tickets.filter((t) => t.workflowStatus === 'SUBMITTED').length;
  const overdueTickets = tickets.filter(
    (t) => t.expectedDateOfReceipt && new Date(t.expectedDateOfReceipt) < new Date() && t.workflowStatus !== 'ACCEPTED'
  );

  const deptBreakdown = useMemo(() => {
    const map: Record<string, { total: number; pending: number; overdue: number }> = {};
    tickets.forEach((t) => {
      const dept = t.department || 'General / Unassigned';
      if (!map[dept]) map[dept] = { total: 0, pending: 0, overdue: 0 };
      map[dept].total += 1;
      if (t.workflowStatus !== 'ACCEPTED') map[dept].pending += 1;
      if (t.expectedDateOfReceipt && new Date(t.expectedDateOfReceipt) < new Date() && t.workflowStatus !== 'ACCEPTED') {
        map[dept].overdue += 1;
      }
    });
    return Object.entries(map).sort((a, b) => b[1].overdue - a[1].overdue);
  }, [tickets]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-50 via-blue-50 to-cyan-50 border border-indigo-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20 shrink-0">
            <FolderKanban className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider">PM Command Center</span>
              <Badge variant="indigo" size="xs">Project Manager</Badge>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-0.5">Welcome, {userName}</h2>
            <p className="text-xs text-slate-600">
              Audit engagement leadership: track squad velocity, departmental SLA bottlenecks, and ToR governance.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {selectedProject && (
            <>
              <Button variant="primary" size="sm" onClick={() => setIsFireDrtOpen(true)} leftIcon={<FilePlus className="w-4 h-4" />}>
                Fire DRT
              </Button>
              <Link href={`/projects/${selectedProject.id}`}>
                <Button variant="outline" size="sm" rightIcon={<ArrowUpRight className="w-4 h-4" />}>
                  Full Workspace
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Project Selector Bar */}
      {projects.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs font-semibold text-slate-500 shrink-0">Active Project:</span>
          {projects.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedProjectId(p.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-all ${
                selectedProjectId === p.id
                  ? 'bg-indigo-600 text-white shadow-xs font-bold'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {p.projectName}
            </button>
          ))}
        </div>
      )}

      {/* Governance KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-4 bg-white border-slate-200">
          <div className="flex items-center justify-between text-slate-500 mb-1 text-xs font-semibold uppercase">
            <span>DRT Scope</span>
            <Layers className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums">{totalTickets}</div>
          <div className="text-[11px] text-slate-500 mt-1">{submittedTickets} awaiting review</div>
        </Card>

        <Card className="p-4 bg-white border-slate-200">
          <div className="flex items-center justify-between text-slate-500 mb-1 text-xs font-semibold uppercase">
            <span>Verified DRTs</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 tabular-nums">{acceptedTickets}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            {totalTickets > 0 ? `${((acceptedTickets / totalTickets) * 100).toFixed(0)}% completion` : '0%'}
          </div>
        </Card>

        <Card className="p-4 bg-white border-slate-200">
          <div className="flex items-center justify-between text-slate-500 mb-1 text-xs font-semibold uppercase">
            <span>Overdue SLAs</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-rose-600 tabular-nums">{overdueTickets.length}</div>
          <div className="text-[11px] text-rose-600 font-medium mt-1">Requires escalation</div>
        </Card>

        <Card className="p-4 bg-white border-slate-200">
          <div className="flex items-center justify-between text-slate-500 mb-1 text-xs font-semibold uppercase">
            <span>Team Squad</span>
            <Users className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums">{selectedProject?.members?.length || 0}</div>
          <div className="text-[11px] text-slate-500 mt-1">Cross-functional squad</div>
        </Card>
      </div>

      {/* Department Bottleneck & Overdue Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4 bg-white border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-indigo-600" /> Department SLA Bottlenecks
            </h3>
            <span className="text-[11px] text-slate-500">Pending Requests</span>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {deptBreakdown.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No departmental DRTs logged yet.</p>
            ) : (
              deptBreakdown.map(([dept, stats]) => (
                <div key={dept} className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-slate-800 block">{dept}</span>
                    <span className="text-[11px] text-slate-500">{stats.total} total • {stats.pending} open</span>
                  </div>
                  {stats.overdue > 0 ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700">{stats.overdue} Overdue</span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-700">On Track</span>
                  )}
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="p-4 bg-white border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-rose-500" /> Urgent Overdue Items Queue
            </h3>
            <span className="text-[11px] text-slate-500">{overdueTickets.length} Critical</span>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {overdueTickets.length === 0 ? (
              <p className="text-xs text-emerald-700 py-4 text-center font-medium">✓ All requests are within SLA receipt limits!</p>
            ) : (
              overdueTickets.slice(0, 5).map((t) => (
                <div key={t.id} className="p-2 rounded-lg bg-rose-50/60 border border-rose-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-mono font-bold text-slate-800">[{t.requestCode}] </span>
                    <span className="truncate max-w-[140px] text-slate-700">{t.title || t.description}</span>
                    <span className="text-[10px] text-rose-600 block">SLA: {t.expectedDateOfReceipt ? new Date(t.expectedDateOfReceipt).toLocaleDateString() : 'N/A'}</span>
                  </div>
                  <Link href={`/projects/${selectedProject?.id}?tab=drt`}>
                    <Button size="xs" variant="outline" className="border-rose-300 text-rose-700 hover:bg-rose-100">Intervene</Button>
                  </Link>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {selectedProject && (
        <CreateDrtDrawer isOpen={isFireDrtOpen} onClose={() => setIsFireDrtOpen(false)} projectId={selectedProject.id} />
      )}
    </div>
  );
};
