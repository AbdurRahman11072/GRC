'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  CalendarRange,
  Building,
  ShieldCheck,
  Layers,
  FileCheck,
  Users,
  Building2,
  BarChart3,
} from 'lucide-react';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import type { IProject } from '../../../types/project.types';

export type WorkspaceTab = 'overview' | 'entities' | 'tors' | 'drt' | 'team';

interface WorkspaceHeaderProps {
  project: IProject;
  activeTab: WorkspaceTab;
  onTabChange: (tab: WorkspaceTab) => void;
  isOrgAdmin?: boolean;
  canCreateTor?: boolean;
  userRole?: string | null;
}

export const WorkspaceHeader: React.FC<WorkspaceHeaderProps> = ({
  project,
  activeTab,
  onTabChange,
  isOrgAdmin = false,
  canCreateTor = false,
  userRole = null,
}) => {
  const tabs = React.useMemo(() => {
    const list: Array<{ id: WorkspaceTab; label: string; icon: React.ReactNode }> = [
      { id: 'overview', label: 'Overview & Stats', icon: <BarChart3 className="w-3.5 h-3.5" /> },
    ];

    // Administrators and Project Managers can manage client entities and ToR WBS hierarchy
    if (isOrgAdmin || canCreateTor) {
      list.push(
        { id: 'entities', label: 'Client & Auditee', icon: <Building2 className="w-3.5 h-3.5" /> },
        { id: 'tors', label: 'ToR WBS Tree', icon: <Layers className="w-3.5 h-3.5" /> }
      );
    }

    list.push(
      { id: 'drt', label: 'DRT Requests Hub', icon: <FileCheck className="w-3.5 h-3.5" /> },
      { id: 'team', label: 'Team Members', icon: <Users className="w-3.5 h-3.5" /> }
    );

    return list;
  }, [isOrgAdmin, canCreateTor]);

  return (
    <div className="space-y-4 pb-2 border-b border-slate-200">
      {/* Top Breadcrumb & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Link href="/projects">
            <Button variant="ghost" size="xs" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
              Projects
            </Button>
          </Link>
          <span className="text-slate-300">/</span>
          <Badge variant="cyan" size="xs" dot>
            {project.status}
          </Badge>
          <span className="text-xs text-slate-500 font-mono">
            {project.projectType}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
          {userRole && (
            <Badge variant="indigo" size="xs" className="font-semibold uppercase tracking-wider">
              {userRole.replace(/_/g, ' ')}
            </Badge>
          )}
          <span className="flex items-center gap-1.5 font-semibold text-slate-700">
            <Building className="w-3.5 h-3.5 text-indigo-600" />
            {project.client?.name || 'Regulator Body'}
          </span>
          <span className="text-slate-300">↔</span>
          <span className="flex items-center gap-1.5 font-semibold text-slate-700">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-600" />
            {project.auditee?.name || 'Auditee Enterprise'}
          </span>
        </div>
      </div>

      {/* Main Title & Scope Tag */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          {project.projectName}
        </h1>
        {project.projectScope && (
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-4xl line-clamp-2">
            {project.projectScope}
          </p>
        )}
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pt-2 border-t border-slate-200 no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};
