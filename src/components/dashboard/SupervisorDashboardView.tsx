'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  FileCheck,
  RotateCcw,
  Clock,
  Award,
  ArrowUpRight,
  FileText,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ReviewDrtDocumentModal } from '../projects/workspace/drt/ReviewDrtDocumentModal';
import { TorAnalysisModal } from '../tors/TorAnalysisModal';
import { useGetTicketsQuery } from '../../store/api/drtApi';
import { useGetTorTreeQuery } from '../../store/api/torApi';
import type { IProject, IDRTDocument, IDRTTicket } from '../../types/project.types';
import type { ITorNode } from '../../types/tor.types';

export interface SupervisorDashboardViewProps {
  userName: string;
  projects: IProject[];
  currentUserId?: string;
}

export const SupervisorDashboardView: React.FC<SupervisorDashboardViewProps> = ({
  userName,
  projects,
  currentUserId,
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');
  const [reviewDoc, setReviewDoc] = useState<IDRTDocument | null>(null);
  const [evalTor, setEvalTor] = useState<ITorNode | null>(null);

  const selectedProject = projects.find((p) => p.id === selectedProjectId) || projects[0];

  const { data: ticketsData } = useGetTicketsQuery(
    { projectId: selectedProject?.id || '' },
    { skip: !selectedProject?.id }
  );
  const { data: treeData } = useGetTorTreeQuery(selectedProject?.id || '', {
    skip: !selectedProject?.id,
  });

  const tickets = ticketsData?.data || [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawTree = treeData?.data as any;
  const treeNodes: ITorNode[] = Array.isArray(rawTree) ? rawTree : rawTree?.tree || [];

  // Flatten ToR nodes
  const flatTors = useMemo(() => {
    const list: ITorNode[] = [];
    const walk = (nodes: ITorNode[]) => {
      nodes.forEach((n) => {
        list.push(n);
        if (n.children && n.children.length > 0) walk(n.children);
      });
    };
    walk(treeNodes);
    return list;
  }, [treeNodes]);

  // Documents awaiting supervisor review
  const pendingReviewDocs = useMemo(() => {
    const list: { doc: IDRTDocument; ticket: IDRTTicket }[] = [];
    tickets.forEach((t) => {
      (t.drtDocuments || []).forEach((d) => {
        if (d.status === 'SUBMITTED') {
          list.push({ doc: d, ticket: t });
        }
      });
    });
    return list;
  }, [tickets]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-600 text-white shadow-md shadow-cyan-600/20 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-cyan-800 uppercase tracking-wider">Supervisory Audit Desk</span>
              <Badge variant="cyan" size="xs">Audit Supervisor</Badge>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-0.5">Welcome, {userName}</h2>
            <p className="text-xs text-slate-600">
              Evidence verification and ToR scoring desk: verify field evidence uploads and award compliance analysis marks.
            </p>
          </div>
        </div>

        {selectedProject && (
          <Link href={`/projects/${selectedProject.id}`}>
            <Button variant="outline" size="sm" rightIcon={<ArrowUpRight className="w-4 h-4" />}>
              Open Project Workspace
            </Button>
          </Link>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-4 bg-white border-slate-200">
          <div className="text-xs font-semibold text-slate-500 uppercase flex items-center justify-between">
            <span>Awaiting Review</span>
            <FileText className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-2xl font-bold text-cyan-700 mt-1">{pendingReviewDocs.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">Field uploads to verify</div>
        </Card>

        <Card className="p-4 bg-white border-slate-200">
          <div className="text-xs font-semibold text-slate-500 uppercase flex items-center justify-between">
            <span>ToR Clauses</span>
            <Award className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-indigo-600 mt-1">{flatTors.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">Audit scope items</div>
        </Card>

        <Card className="p-4 bg-white border-slate-200">
          <div className="text-xs font-semibold text-slate-500 uppercase flex items-center justify-between">
            <span>Verified DRTs</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">
            {tickets.filter((t) => t.workflowStatus === 'ACCEPTED').length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Evidence sign-offs completed</div>
        </Card>

        <Card className="p-4 bg-white border-slate-200">
          <div className="text-xs font-semibold text-slate-500 uppercase flex items-center justify-between">
            <span>Revision Queue</span>
            <RotateCcw className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600 mt-1">
            {tickets.filter((t) => t.workflowStatus === 'REVISION_REQUESTED').length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Pending auditee fixes</div>
        </Card>
      </div>

      {/* Main Dual Grid: Verification Queue & ToR Analysis Sign-Off */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Verification Queue */}
        <Card className="p-4 bg-white border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-cyan-600" /> Pending Evidence Verification Queue
            </h3>
            <span className="text-[11px] text-slate-500">{pendingReviewDocs.length} Pending</span>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {pendingReviewDocs.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">
                ✓ No evidence documents waiting for your verification.
              </p>
            ) : (
              pendingReviewDocs.map(({ doc, ticket }) => (
                <div key={doc.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                      <span className="font-mono text-cyan-700">[{ticket.requestCode}]</span>
                      <span className="truncate max-w-[150px]">{doc.fileName}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      {doc.partySide === 'CLIENT' ? 'Client / Regulator Evidence' : 'Auditee Enterprise Evidence'} • Ref: {doc.referenceNumber || 'N/A'}
                    </span>
                  </div>
                  <Button
                    size="xs"
                    variant="primary"
                    onClick={() => setReviewDoc(doc)}
                    leftIcon={<ShieldCheck className="w-3.5 h-3.5" />}
                  >
                    Verify
                  </Button>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* ToR Analysis Scoring Desk */}
        <Card className="p-4 bg-white border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-indigo-600" /> ToR Compliance Evaluation Desk
            </h3>
            <span className="text-[11px] text-slate-500">Analysis Marks & Findings</span>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {flatTors.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No ToR clauses defined.</p>
            ) : (
              flatTors.slice(0, 6).map((tor) => (
                <div key={tor.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                      <span className="font-mono text-indigo-700">[{tor.code}]</span>
                      <span className="truncate max-w-[150px]">{tor.title}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      Collection: {(tor.dataCollectionObtained || 0).toFixed(1)} • Analysis: {(tor.dataAnalysisObtained || 0).toFixed(1)} / {(tor.dataAnalysisAllocated || 0).toFixed(1)}
                    </span>
                  </div>
                  <Button
                    size="xs"
                    variant="outline"
                    onClick={() => setEvalTor(tor)}
                    leftIcon={<Award className="w-3.5 h-3.5 text-indigo-600" />}
                  >
                    Score
                  </Button>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      <ReviewDrtDocumentModal
        isOpen={Boolean(reviewDoc)}
        onClose={() => setReviewDoc(null)}
        document={reviewDoc}
      />

      <TorAnalysisModal
        isOpen={Boolean(evalTor)}
        onClose={() => setEvalTor(null)}
        tor={evalTor}
      />
    </div>
  );
};
