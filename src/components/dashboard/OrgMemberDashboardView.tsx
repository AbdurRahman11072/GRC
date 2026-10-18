'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  FolderKanban,
  CheckCircle2,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { OrgMemberProjectDetail } from './OrgMemberProjectDetail';
import type { IProject } from '../../types/project.types';

export interface OrgMemberDashboardViewProps {
  userName: string;
  projects: IProject[];
  currentUserId?: string;
  isOrgAdmin?: boolean;
}

export const OrgMemberDashboardView: React.FC<OrgMemberDashboardViewProps> = ({
  userName,
  projects,
  currentUserId,
  isOrgAdmin = false,
}) => {
  // 1. Organization member will only show all the projects they were assigned to
  const assignedProjects = useMemo(() => {
    if (isOrgAdmin) return projects;
    return projects.filter((p) => {
      if (!p.members || p.members.length === 0) return true;
      return p.members.some(
        (m) => m.userId === currentUserId || m.user?.id === currentUserId
      );
    });
  }, [projects, currentUserId, isOrgAdmin]);

  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    assignedProjects[0]?.id || ''
  );

  useEffect(() => {
    if (assignedProjects.length > 0 && !assignedProjects.some((p) => p.id === selectedProjectId)) {
      setSelectedProjectId(assignedProjects[0].id);
    }
  }, [assignedProjects, selectedProjectId]);

  const selectedProject =
    assignedProjects.find((p) => p.id === selectedProjectId) || assignedProjects[0];

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
              Assigned to {assignedProjects.length} audit project{assignedProjects.length === 1 ? '' : 's'}. Click any project to view its stats, assigned DRTs, and team members.
            </p>
          </div>
        </div>

        {selectedProject && (
          <Link href={`/projects/${selectedProject.id}`}>
            <Button variant="outline" size="sm" leftIcon={<FolderKanban className="w-4 h-4" />}>
              Open Project Workspace
            </Button>
          </Link>
        )}
      </div>

      {/* Assigned Projects Selector */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <FolderKanban className="w-4 h-4 text-cyan-600" />
            Your Assigned Audit Projects ({assignedProjects.length})
          </h3>
          <span className="text-[11px] text-slate-500">
            Click to view stats, DRTs, and team members
          </span>
        </div>

        {assignedProjects.length === 0 ? (
          <Card className="p-8 text-center text-xs text-slate-400 bg-white border-slate-200">
            You are not currently assigned to any audit projects in this organization. Contact your administrator for assignment.
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {assignedProjects.map((project) => {
              const isSelected = project.id === selectedProjectId;
              return (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => setSelectedProjectId(project.id)}
                  className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white border-indigo-600 shadow-md ring-2 ring-indigo-500/20'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[11px] font-bold text-cyan-700 uppercase tracking-wider">
                      {project.projectType || 'IS Audit'}
                    </span>
                    <Badge variant={isSelected ? 'indigo' : 'neutral'} size="xs">
                      {project.status || 'ACTIVE'}
                    </Badge>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 line-clamp-1 mb-2">
                    {project.projectName}
                  </h4>

                  <div className="text-[11px] text-slate-500 space-y-0.5">
                    <div>
                      <span className="text-slate-400">Client:</span>{' '}
                      <span className="text-slate-700 font-medium">{project.client?.name || 'BTRC'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Auditee:</span>{' '}
                      <span className="text-slate-700 font-medium">{project.auditee?.name || 'Fiber@Home'}</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className={isSelected ? 'text-indigo-600 font-semibold' : 'text-slate-400'}>
                      {isSelected ? '● Currently Selected' : 'Click to View'}
                    </span>
                    <span className="text-slate-400">
                      {project.members?.length || 0} Members
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected Project Full Details (Stats, Assigned DRTs, Team Members) */}
      {selectedProject && (
        <OrgMemberProjectDetail
          project={selectedProject}
          currentUserId={currentUserId}
        />
      )}
    </div>
  );
};
