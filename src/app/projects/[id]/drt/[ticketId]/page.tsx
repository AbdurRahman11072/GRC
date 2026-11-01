'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Shell } from '../../../../../components/layout/Shell';

export default function DrtTicketDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.id as string;

  useEffect(() => {
    if (projectId) {
      router.replace(`/projects/${projectId}?tab=drt`);
    }
  }, [projectId, router]);

  return (
    <Shell>
      <div className="p-12 text-center bg-white rounded-xl border border-slate-200 max-w-lg mx-auto my-12 space-y-2">
        <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-indigo-600 border-t-transparent" />
        <h3 className="text-sm font-semibold text-slate-800">Redirecting to DRT Table...</h3>
        <p className="text-xs text-slate-500">
          All ticket metrics and multi-year details are now integrated directly into the main DRT table.
        </p>
      </div>
    </Shell>
  );
}
