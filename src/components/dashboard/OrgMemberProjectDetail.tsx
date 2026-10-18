'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  FileCheck,
  Clock,
  Upload,
  ArrowUpRight,
  ShieldCheck,
  Building,
  Calendar,
  ExternalLink,
  Users,
  FileText,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { UploadTorDocumentModal } from '../projects/workspace/drt/UploadTorDocumentModal';
import { OrgMemberTeamTable } from './OrgMemberTeamTable';
import { useGetTorTreeQuery } from '../../store/api/torApi';
import type { IProject } from '../../types/project.types';
import type { ITorNode } from '../../types/tor.types';

interface OrgMemberProjectDetailProps {
  project: IProject;
  currentUserId?: string;
}

export const OrgMemberProjectDetail: React.FC<OrgMemberProjectDetailProps> = ({
  project,
  currentUserId,
}) => {
  const [activeUploadTor, setActiveUploadTor] = useState<ITorNode | null>(null);
  const { data: treeData, isLoading } = useGetTorTreeQuery(project.id);

  // Flatten recursive tree
  const flatNodes = useMemo(() => {
    const rawData = treeData?.data as any;
    const tree = Array.isArray(rawData) ? rawData : rawData?.tree || [];
    const result: ITorNode[] = [];
    const flatten = (nodes: ITorNode[]) => {
      nodes.forEach((n) => {
        result.push(n);
        if (n.children && n.children.length > 0) flatten(n.children);
      });
    };
    flatten(tree);
    return result;
  }, [treeData]);

  // Filter DRT tasks strictly assigned to this Org Member
  const assignedTors = useMemo(() => {
    if (!currentUserId) return [];
    return flatNodes.filter((n) =>
      n.assignedMembers?.some(
        (m) => m.userId === currentUserId || m.user?.id === currentUserId
      )
    );
  }, [flatNodes, currentUserId]);

  const completedDocsCount = assignedTors.filter(
    (t) => t.documents && t.documents.length > 0
  ).length;
  const pendingDocsCount = assignedTors.length - completedDocsCount;
  const members = project.members || [];

  return (
    <div className="space-y-6">
      {/* Selected Project Status & Stats Banner */}
      <Card className="p-5 bg-white border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <Badge variant="indigo" size="xs">
                {project.projectType || 'IS Audit'}
              </Badge>
              <Badge variant="cyan" size="xs">
                Status: {project.status}
              </Badge>
            </div>
            <h3 className="text-lg font-bold text-slate-900">{project.projectName}</h3>
            {project.projectObjective && (
              <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                <span className="font-semibold text-slate-700">Objective:</span> {project.projectObjective}
              </p>
            )}
          </div>

          <Link href={`/projects/${project.id}`}>
            <Button variant="primary" size="sm" rightIcon={<ArrowUpRight className="w-4 h-4" />}>
              Open Full Workspace
            </Button>
          </Link>
        </div>

        {/* Micro Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-slate-500 text-[11px] block">Assigned Tasks</span>
            <strong className="text-slate-900 text-sm">{assignedTors.length} Clauses</strong>
          </div>
          <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200">
            <span className="text-emerald-700 text-[11px] block">Submitted / Updated</span>
            <strong className="text-emerald-900 text-sm">{completedDocsCount} Done</strong>
          </div>
          <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200">
            <span className="text-amber-700 text-[11px] block">Pending Uploads</span>
            <strong className="text-amber-900 text-sm">{pendingDocsCount} Due</strong>
          </div>
          <div className="p-2.5 rounded-lg bg-purple-50 border border-purple-200">
            <span className="text-purple-700 text-[11px] block">Project Stakeholders</span>
            <strong className="text-purple-900 text-sm">{members.length} Members</strong>
          </div>
        </div>
      </Card>

      {/* DRT Tasks Assigned Section */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-cyan-600" />
              DRT Tasks Assigned to You ({assignedTors.length})
            </h4>
            <p className="text-xs text-slate-500">
              Upload compliance evidence against assigned clauses. You can update documents at any time.
            </p>
          </div>

          <div className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 flex items-center gap-1.5 self-start sm:self-auto">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
            Immutable Audit Trail (No Deletions Allowed)
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-500 bg-white rounded-lg border border-slate-200">
            Loading assigned DRT tasks...
          </div>
        ) : assignedTors.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 bg-white rounded-lg border border-slate-200">
            No DRT tasks currently assigned to you for this project.
          </div>
        ) : (
          <div className="space-y-3">
            {assignedTors.map((tor) => {
              const docs = tor.documents || [];
              const hasDocs = docs.length > 0;
              return (
                <Card key={tor.id} className="p-4 bg-white border-slate-200 hover:border-slate-300 transition-all shadow-2xs space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="cyan" size="xs">
                          {tor.code}
                        </Badge>
                        <span className="text-sm font-bold text-slate-900 truncate">
                          {tor.title}
                        </span>
                        {tor.department && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-purple-50 text-purple-700 border border-purple-200">
                            <Building className="w-3 h-3" />
                            Dept: {tor.department}
                          </span>
                        )}
                        <Badge variant={hasDocs ? 'success' : 'neutral'} size="xs" dot>
                          {hasDocs ? 'SUBMITTED' : 'PENDING'}
                        </Badge>
                      </div>
                      {tor.description && (
                        <p className="text-xs text-slate-500 line-clamp-1">{tor.description}</p>
                      )}
                    </div>

                    <Button
                      type="button"
                      variant={hasDocs ? 'outline' : 'primary'}
                      size="xs"
                      onClick={() => setActiveUploadTor(tor)}
                      leftIcon={<Upload className="w-3.5 h-3.5" />}
                    >
                      {hasDocs ? 'Update Document' : 'Upload Document'}
                    </Button>
                  </div>

                  {/* Document History List (No delete button allowed) */}
                  {hasDocs && (
                    <div className="pt-2 border-t border-slate-100 space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        Uploaded Evidence Records:
                      </span>
                      {docs.map((d) => (
                        <div key={d.id} className="p-2 rounded bg-slate-50 border border-slate-200 flex items-center justify-between gap-2 text-xs">
                          <div className="flex items-center gap-2 min-w-0">
                            <FileText className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                            <span className="font-semibold text-slate-800 truncate">{d.fileName}</span>
                            <Badge variant={d.status === 'ACCEPTED' ? 'success' : 'indigo'} size="xs">
                              {d.status}
                            </Badge>
                            <span className="text-[10px] text-slate-400">
                              {new Date(d.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          {d.fileUrl && (
                            <a href={d.fileUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 p-1">
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Project Team Members Overview */}
      <OrgMemberTeamTable members={members} />

      {/* Upload/Update Document Modal */}
      {activeUploadTor && (
        <UploadTorDocumentModal
          isOpen={Boolean(activeUploadTor)}
          onClose={() => setActiveUploadTor(null)}
          tor={activeUploadTor}
        />
      )}
    </div>
  );
};
