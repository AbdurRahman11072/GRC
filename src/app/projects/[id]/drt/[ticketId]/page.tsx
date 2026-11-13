'use client';

import React from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { Shell } from '../../../../../components/layout/Shell';
import { Button } from '../../../../../components/ui/Button';
import { DrtSingleTicketView } from '../../../../../components/projects/workspace/drt/details/DrtSingleTicketView';
import { useGetProjectByIdQuery } from '../../../../../store/api/projectApi';
import { useGetTicketByIdQuery } from '../../../../../store/api/drtApi';
import { ArrowLeft, AlertCircle } from 'lucide-react';

export default function DrtTicketDetailsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const projectId = (params?.id as string) || '';
  const ticketId = (params?.ticketId as string) || '';
  const initialStream = searchParams?.get('stream')?.toLowerCase();
  const initialTab = initialStream === 'analysis' ? 'analysis' : 'collection';

  const {
    data: projectData,
    isLoading: isProjectLoading,
  } = useGetProjectByIdQuery(projectId, { skip: !projectId });

  const {
    data: ticketData,
    isLoading: isTicketLoading,
    isError: isTicketError,
  } = useGetTicketByIdQuery(ticketId, { skip: !ticketId });

  const project = projectData?.data;
  const ticket = ticketData?.data;

  const isLoading = isProjectLoading || isTicketLoading;

  return (
    <Shell>
      {isLoading ? (
        <div className="py-24 text-center space-y-3">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent" />
          <p className="text-xs font-semibold text-slate-600">
            Loading DRT Request Details...
          </p>
        </div>
      ) : isTicketError || !ticket ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 max-w-lg mx-auto my-12 space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              DRT Request Ticket Not Found
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              The requested DRT ticket may have been removed or you do not have permission to access it.
            </p>
          </div>
          <Link href={`/projects/${projectId}?tab=drt`}>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Back to DRT Requests Hub
            </Button>
          </Link>
        </div>
      ) : (
        <DrtSingleTicketView
          projectId={projectId}
          ticket={ticket}
          project={project}
          initialTab={initialTab}
        />
      )}
    </Shell>
  );
}