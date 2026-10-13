'use client';

import React from 'react';
import {
  CalendarRange,
  Calendar,
  Layers,
  FileCheck,
  Users,
  Building,
  Target,
  ArrowRight,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import type { IProject } from '../../../types/project.types';
import type { WorkspaceTab } from './WorkspaceHeader';

interface TabOverviewProps {
  project: IProject;
  onNavigateTab: (tab: WorkspaceTab) => void;
}

const formatDate = (dateStr?: string | null) => {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr.split('T')[0];
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr.split('T')[0];
  }
};

export const TabOverview: React.FC<TabOverviewProps> = ({ project, onNavigateTab }) => {
  return (
    <div className="space-y-6">
      {/* 2-Column Core Metadata Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Historical Data Scope Card */}
        <Card className="border-indigo-100 bg-white p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-xs font-semibold text-indigo-700 uppercase tracking-wider">
              <CalendarRange className="w-4 h-4" />
              Audit Data Coverage Period
            </span>
            <Badge variant="indigo" size="xs">
              Subject of Audit
            </Badge>
          </div>
          <div className="text-xl font-bold text-slate-900">
            Historical Records Scope
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            All DRT data requests, audit evidence, and ToR compliance marks evaluate auditee data covering this exact historical period.
          </p>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 font-mono">
            {project.projectScope?.includes('Audit Data Coverage')
              ? project.projectScope
              : 'Audit Data Coverage: Multi-Year Scope (e.g. 2016–2026 records required)'}
          </div>
        </Card>

        {/* Engagement Execution Timeline Card */}
        <Card className="border-cyan-100 bg-white p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-xs font-semibold text-cyan-800 uppercase tracking-wider">
              <Calendar className="w-4 h-4" />
              Engagement Execution Period
            </span>
            <Badge variant="cyan" size="xs">
              Audit Team Lifecycle
            </Badge>
          </div>
          <div className="text-xl font-bold text-slate-900">
            {formatDate(project.startDate)} → {formatDate(project.endDate)}
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            The active timeframe in which the audit team conducts inspections, runs analysis, requests auditee documents, and submits progress reports.
          </p>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs text-slate-700">
            <span>Status: <strong className="text-cyan-700">{project.status}</strong></span>
            <span>Type: <strong className="text-slate-800">{project.projectType}</strong></span>
          </div>
        </Card>
      </div>

      {/* Audit Objective Card */}
      {project.projectObjective && (
        <Card className="p-5 border-slate-200 bg-white shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 uppercase tracking-wider">
            <Target className="w-4 h-4 text-emerald-600" />
            Audit Project Objective
          </div>
          <p className="text-sm text-slate-800 leading-relaxed">
            {project.projectObjective}
          </p>
        </Card>
      )}

      {/* Module Shortcuts Launchpad */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
        <Card hoverEffect className="p-4 bg-white border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="space-y-1">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2">
              <Layers className="w-4 h-4" />
            </div>
            <div className="text-sm font-semibold text-slate-900">Terms of Reference</div>
            <p className="text-xs text-slate-500">Hierarchical WBS clauses and stream weights.</p>
          </div>
          <Button
            variant="ghost"
            size="xs"
            onClick={() => onNavigateTab('tors')}
            className="mt-3 justify-between text-indigo-600"
            rightIcon={<ArrowRight className="w-3 h-3" />}
          >
            Manage ToR WBS
          </Button>
        </Card>

        <Card hoverEffect className="p-4 bg-white border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="space-y-1">
            <div className="w-8 h-8 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center mb-2">
              <FileCheck className="w-4 h-4" />
            </div>
            <div className="text-sm font-semibold text-slate-900">DRT Requests Hub</div>
            <p className="text-xs text-slate-500">Track data requests and auditee evidence SLAs.</p>
          </div>
          <Button
            variant="ghost"
            size="xs"
            onClick={() => onNavigateTab('drt')}
            className="mt-3 justify-between text-cyan-700"
            rightIcon={<ArrowRight className="w-3 h-3" />}
          >
            Open DRT Hub
          </Button>
        </Card>

        <Card hoverEffect className="p-4 bg-white border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="space-y-1">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
              <Users className="w-4 h-4" />
            </div>
            <div className="text-sm font-semibold text-slate-900">4-Team Roster</div>
            <p className="text-xs text-slate-500">Audit firm and client team assignments.</p>
          </div>
          <Button
            variant="ghost"
            size="xs"
            onClick={() => onNavigateTab('team')}
            className="mt-3 justify-between text-emerald-700"
            rightIcon={<ArrowRight className="w-3 h-3" />}
          >
            Manage Roster
          </Button>
        </Card>

        <Card hoverEffect className="p-4 bg-white border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="space-y-1">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
              <Building className="w-4 h-4" />
            </div>
            <div className="text-sm font-semibold text-slate-900">Client & Auditee</div>
            <p className="text-xs text-slate-500">Regulator client and target auditee enterprise.</p>
          </div>
          <Button
            variant="ghost"
            size="xs"
            onClick={() => onNavigateTab('entities')}
            className="mt-3 justify-between text-emerald-700"
            rightIcon={<ArrowRight className="w-3 h-3" />}
          >
            View Entities
          </Button>
        </Card>
      </div>
    </div>
  );
};
