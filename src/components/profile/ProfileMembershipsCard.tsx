'use client';

import React from 'react';
import Link from 'next/link';
import { Building2, FolderKanban, ShieldCheck, ArrowRight, ExternalLink } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import type { IUserProfile, IUserOrgMembership } from '../../types/auth.types';

interface ProfileMembershipsCardProps {
  user: IUserProfile | null;
  organizations: IUserOrgMembership[];
  currentOrgId?: string | null;
}

export const ProfileMembershipsCard: React.FC<ProfileMembershipsCardProps> = ({
  user,
  organizations,
  currentOrgId,
}) => {
  const projectMemberships = user?.projectMemberships || [];

  const getTeamBucketBadge = (bucket: string) => {
    switch (bucket) {
      case 'ADMINISTRATOR':
        return <Badge variant="indigo" size="xs">Admin</Badge>;
      case 'ORG_MEMBER':
        return <Badge variant="cyan" size="xs">Auditor Team</Badge>;
      case 'CLIENT':
        return <Badge variant="neutral" size="xs">Client Unit</Badge>;
      case 'AUDITEE':
        return <Badge variant="warning" size="xs">Auditee Dept</Badge>;
      default:
        return <Badge variant="neutral" size="xs">{bucket}</Badge>;
    }
  };

  const getOrgRoleBadge = (role: string) => {
    switch (role) {
      case 'OWNER':
        return <Badge variant="indigo" size="xs">Owner</Badge>;
      case 'ADMIN':
        return <Badge variant="cyan" size="xs">Org Admin</Badge>;
      case 'AUDITOR':
        return <Badge variant="success" size="xs">Auditor</Badge>;
      default:
        return <Badge variant="neutral" size="xs">{role}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Organization Memberships */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-cyan-50 text-cyan-700 rounded-lg">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <CardTitle>Organization Memberships</CardTitle>
              <CardDescription>Organizations and workspaces you have access to</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {organizations.length === 0 ? (
            <p className="text-xs text-slate-500 py-3">No organizations associated yet.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {organizations.map((org) => {
                const isActive = org.orgId === currentOrgId;
                return (
                  <div key={org.orgId} className="py-3 flex items-center justify-between gap-3 first:pt-0 last:pb-0">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-slate-900 truncate">
                          {org.orgName}
                        </span>
                        {isActive && (
                          <Badge variant="cyan" size="xs" dot>
                            Active Workspace
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-slate-500">Tenant ID: {org.orgId.slice(0, 8)}...</span>
                    </div>
                    <div>{getOrgRoleBadge(org.orgRole)}</div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assigned Audit Projects */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <FolderKanban className="w-5 h-5" />
              </div>
              <div>
                <CardTitle>Assigned Audit Projects</CardTitle>
                <CardDescription>Audits where you hold an active roster assignment</CardDescription>
              </div>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {projectMemberships.length}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {projectMemberships.length === 0 ? (
            <div className="text-center py-6">
              <ShieldCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-medium text-slate-600">No projects currently assigned</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Your organization administrator will assign you to audit engagements
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {projectMemberships.map((pm) => (
                <div
                  key={pm.id}
                  className="p-3 rounded-lg border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        href={`/projects/${pm.projectId}`}
                        className="font-medium text-sm text-slate-900 hover:text-indigo-600 transition-colors truncate flex items-center gap-1"
                      >
                        {pm.project?.projectName || `Project ${pm.projectId.slice(0, 8)}`}
                        <ExternalLink className="w-3 h-3 inline text-slate-400" />
                      </Link>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                      <span>{pm.project?.projectType?.replace(/_/g, ' ') || 'Engagement'}</span>
                      <span>•</span>
                      <span className="uppercase text-[10px] tracking-wider font-semibold text-slate-600">
                        {pm.project?.status || 'ACTIVE'}
                      </span>
                    </div>
                  </div>
                  <div className="shrink-0">{getTeamBucketBadge(pm.teamBucket)}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
