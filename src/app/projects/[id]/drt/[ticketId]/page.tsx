'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ChevronRight, AlertCircle, FileText, RefreshCw } from 'lucide-react';
import { Shell } from '../../../../../components/layout/Shell';
import { Button } from '../../../../../components/ui/Button';
import { DrtDetailsHeader } from '../../../../../components/projects/workspace/drt/details/DrtDetailsHeader';
import { DrtDetailsSquad } from '../../../../../components/projects/workspace/drt/details/DrtDetailsSquad';
import { DrtTwoRowMatrixTable } from '../../../../../components/projects/workspace/drt/details/DrtTwoRowMatrixTable';
import { DrtDetailsDocuments } from '../../../../../components/projects/workspace/drt/details/DrtDetailsDocuments';
import { AssignDrtSquadModal } from '../../../../../components/projects/workspace/drt/AssignDrtSquadModal';
import { UploadDrtDocumentModal } from '../../../../../components/projects/workspace/drt/UploadDrtDocumentModal';
import { useGetTicketByIdQuery } from '../../../../../store/api/drtApi';
import { useGetProjectByIdQuery } from '../../../../../store/api/projectApi';
import { getShortEntityName } from '../../../../../lib/utils';
import { getProjectAuditYears } from '../../../../../utils/projectTimeframe';
import type { DRTPartySide } from '../../../../../types/drt.types';

export default function DrtTicketDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.id as string;
  const ticketId = params?.ticketId as string;

  const { data: projData, isLoading: isProjectLoading } = useGetProjectByIdQuery(projectId, {
    skip: !projectId,
  });
  const project = projData?.data;

  const {
    data: ticketData,
    isLoading: isTicketLoading,
    error,
    refetch,
  } = useGetTicketByIdQuery(ticketId, {
    skip: !ticketId,
  });
  const ticket = ticketData?.data;

  const clientName = getShortEntityName(project?.client?.name, 'BTRC');
  const auditeeName = getShortEntityName(project?.auditee?.name, 'FHL');
  const auditYears = getProjectAuditYears(project);
  const [isSquadModalOpen, setIsSquadModalOpen] = useState(false);
  const [uploadSide, setUploadSide] = useState<DRTPartySide | null>(null);

  const isLoading = isProjectLoading || isTicketLoading;

  return (
    <Shell>
      <div className="space-y-5 max-w-7xl mx-auto pb-12 w-full min-w-0">
        {/* Navigation & Breadcrumbs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
            <Link href="/projects" className="hover:text-slate-800 transition-colors">
              Projects
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <Link
              href={`/projects/${projectId}`}
              className="hover:text-slate-800 transition-colors max-w-[150px] truncate"
              title={project?.projectName}
            >
              {project?.projectName || 'Project'}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <Link
              href={`/projects/${projectId}?tab=drt`}
              className="hover:text-slate-800 transition-colors"
            >
              DRT Requests
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded font-mono">
              {ticket?.requestCode || 'Ticket'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="xs"
              onClick={() => router.push(`/projects/${projectId}?tab=drt`)}
              leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
            >
              Back to DRT Table
            </Button>
            <Button
              variant="ghost"
              size="xs"
              onClick={() => refetch()}
              title="Refresh Ticket Data"
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Sync
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="p-12 text-center bg-white rounded-xl border border-slate-200 space-y-2">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-indigo-600 border-t-transparent" />
            <p className="text-xs text-slate-500">Loading ticket details & audit matrix...</p>
          </div>
        )}

        {/* Error State */}
        {!isLoading && (error || !ticket) && (
          <div className="p-8 text-center bg-white rounded-xl border border-rose-200 space-y-3">
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
            <h3 className="text-sm font-semibold text-slate-800">DRT Request Not Found</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Unable to locate ticket <span className="font-mono">{ticketId}</span>. It may have been
              removed or you do not have permission to view it.
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={() => router.push(`/projects/${projectId}?tab=drt`)}
            >
              Return to DRT Workspace
            </Button>
          </div>
        )}

        {/* Loaded Content */}
        {!isLoading && ticket && (
          <div className="space-y-5">
            {/* Ticket Header & Metrics */}
            <DrtDetailsHeader ticket={ticket} />

            {/* 4-Party Collaborative Squad */}
            <DrtDetailsSquad
              ticket={ticket}
              clientName={clientName}
              auditeeName={auditeeName}
              onManageSquad={() => setIsSquadModalOpen(true)}
            />

            {/* 2-Row Tracking Matrix: Client vs. Auditee */}
            <DrtTwoRowMatrixTable
              ticket={ticket}
              clientName={clientName}
              auditeeName={auditeeName}
              auditYears={auditYears}
            />

            {/* Evidence Documents List & History */}
            <DrtDetailsDocuments
              ticket={ticket}
              clientName={clientName}
              auditeeName={auditeeName}
              onOpenUpload={(side) => setUploadSide(side)}
            />
          </div>
        )}

        {/* Squad Management Modal */}
        <AssignDrtSquadModal
          isOpen={isSquadModalOpen}
          onClose={() => setIsSquadModalOpen(false)}
          ticket={ticket || null}
          projectId={projectId}
        />

        {/* Document Upload Modal */}
        {uploadSide && (
          <UploadDrtDocumentModal
            isOpen={Boolean(uploadSide)}
            onClose={() => setUploadSide(null)}
            ticket={ticket as any}
            defaultSide={uploadSide}
            clientName={clientName}
            auditeeName={auditeeName}
            auditYears={auditYears}
          />
        )}
      </div>
    </Shell>
  );
}
