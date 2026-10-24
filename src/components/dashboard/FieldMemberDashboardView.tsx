'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  Upload,
  Clock,
  AlertTriangle,
  Building2,
  ShieldCheck,
  CheckCircle2,
  ArrowUpRight,
  FileText,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { UploadDrtDocumentModal } from '../projects/workspace/drt/UploadDrtDocumentModal';
import { useGetTicketsQuery } from '../../store/api/drtApi';
import type { IProject, IDRTTicket, DRTPartySide } from '../../types/project.types';

export interface FieldMemberDashboardViewProps {
  userName: string;
  projects: IProject[];
  currentUserId?: string;
}

export const FieldMemberDashboardView: React.FC<FieldMemberDashboardViewProps> = ({
  userName,
  projects,
  currentUserId,
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');
  const [uploadTicket, setUploadTicket] = useState<{ ticket: IDRTTicket; side: DRTPartySide } | null>(null);

  const selectedProject = projects.find((p) => p.id === selectedProjectId) || projects[0];

  const { data: ticketsData } = useGetTicketsQuery(
    { projectId: selectedProject?.id || '' },
    { skip: !selectedProject?.id }
  );

  const allTickets = ticketsData?.data || [];

  // Filter tickets assigned to this field auditor
  const myTickets = useMemo(() => {
    if (!currentUserId) return allTickets;
    const assigned = allTickets.filter(
      (t) => t.fieldMemberId === currentUserId || t.supervisorId === currentUserId
    );
    return assigned.length > 0 ? assigned : allTickets;
  }, [allTickets, currentUserId]);

  const pendingClientUploads = myTickets.filter(
    (t) => !(t.drtDocuments || []).some((d) => d.partySide === 'CLIENT')
  );
  const pendingAuditeeUploads = myTickets.filter(
    (t) => !(t.drtDocuments || []).some((d) => d.partySide === 'AUDITEE')
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-teal-600 text-white shadow-md shadow-teal-600/20 shrink-0">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-teal-800 uppercase tracking-wider">Field Auditor Desk</span>
              <Badge variant="success" size="xs">Field Member / Uploader</Badge>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-0.5">Welcome, {userName}</h2>
            <p className="text-xs text-slate-600">
              Evidence collection task force: gather regulatory directives and enterprise data dumps, then record submissions.
            </p>
          </div>
        </div>

        {selectedProject && (
          <Link href={`/projects/${selectedProject.id}?tab=drt`}>
            <Button variant="outline" size="sm" rightIcon={<ArrowUpRight className="w-4 h-4" />}>
              DRT Evidence Desk
            </Button>
          </Link>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-4 bg-white border-slate-200">
          <div className="text-xs font-semibold text-slate-500 uppercase flex items-center justify-between">
            <span>My DRT Tasks</span>
            <FileText className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{myTickets.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">Assigned collection items</div>
        </Card>

        <Card className="p-4 bg-white border-slate-200">
          <div className="text-xs font-semibold text-slate-500 uppercase flex items-center justify-between">
            <span>Awaiting Client</span>
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-indigo-600 mt-1">{pendingClientUploads.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">Regulator copies pending</div>
        </Card>

        <Card className="p-4 bg-white border-slate-200">
          <div className="text-xs font-semibold text-slate-500 uppercase flex items-center justify-between">
            <span>Awaiting Auditee</span>
            <Building2 className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-600 mt-1">{pendingAuditeeUploads.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">Enterprise records pending</div>
        </Card>

        <Card className="p-4 bg-white border-slate-200">
          <div className="text-xs font-semibold text-slate-500 uppercase flex items-center justify-between">
            <span>Fully Uploaded</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">
            {myTickets.filter((t) => (t.drtDocuments || []).length >= 2).length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Both sides recorded</div>
        </Card>
      </div>

      {/* Field Collection Queue */}
      <Card className="p-4 bg-white border-slate-200 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
            <Upload className="w-4 h-4 text-teal-600" /> Active Evidence Collection Queue
          </h3>
          <span className="text-[11px] text-slate-500">Fast Upload Desk</span>
        </div>

        <div className="space-y-2.5">
          {myTickets.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">No DRT evidence requests assigned yet.</p>
          ) : (
            myTickets.slice(0, 8).map((ticket) => {
              const docs = ticket.drtDocuments || [];
              const hasClient = docs.some((d) => d.partySide === 'CLIENT');
              const hasAuditee = docs.some((d) => d.partySide === 'AUDITEE');

              return (
                <div key={ticket.id} className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-teal-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {ticket.requestCode}
                      </span>
                      {ticket.department && (
                        <span className="font-medium text-slate-600 bg-slate-200/70 px-2 py-0.5 rounded text-[11px]">
                          {ticket.department}
                        </span>
                      )}
                      <span className="font-semibold text-slate-900">{ticket.title || ticket.description}</span>
                    </div>
                    <span className="text-[11px] text-slate-500 block mt-1">
                      SLA Target: {ticket.expectedDateOfReceipt ? new Date(ticket.expectedDateOfReceipt).toLocaleDateString() : 'Flexible'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    {/* Client Side Button */}
                    <Button
                      size="xs"
                      variant={hasClient ? 'ghost' : 'outline'}
                      className={hasClient ? 'text-indigo-600 font-semibold' : 'border-indigo-300 text-indigo-700'}
                      onClick={() => setUploadTicket({ ticket, side: 'CLIENT' })}
                      leftIcon={<ShieldCheck className="w-3.5 h-3.5" />}
                    >
                      {hasClient ? '✓ Client Uploaded' : '+ Client Evidence'}
                    </Button>

                    {/* Auditee Side Button */}
                    <Button
                      size="xs"
                      variant={hasAuditee ? 'ghost' : 'primary'}
                      className={hasAuditee ? 'text-purple-600 font-semibold' : ''}
                      onClick={() => setUploadTicket({ ticket, side: 'AUDITEE' })}
                      leftIcon={<Building2 className="w-3.5 h-3.5" />}
                    >
                      {hasAuditee ? '✓ Auditee Uploaded' : '+ Auditee Evidence'}
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>

      <UploadDrtDocumentModal
        isOpen={Boolean(uploadTicket)}
        onClose={() => setUploadTicket(null)}
        ticket={uploadTicket?.ticket || null}
        defaultSide={uploadTicket?.side}
      />
    </div>
  );
};
