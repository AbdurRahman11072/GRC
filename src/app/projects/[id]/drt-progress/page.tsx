'use client';

import React, { Suspense } from 'react';
import { useParams } from 'next/navigation';
import { Shell } from '../../../../components/layout/Shell';
import { DrtProgressPageView } from '../../../../components/projects/workspace/drt-progress/DrtProgressPageView';

function DrtProgressPageContent() {
  const params = useParams();
  const projectId = params?.id as string;

  return <DrtProgressPageView projectId={projectId} />;
}

export default function DrtProgressPage() {
  return (
    <Shell>
      <Suspense
        fallback={
          <div className="py-20 text-center text-xs text-slate-500">
            Loading DRT Progress Reports...
          </div>
        }
      >
        <DrtProgressPageContent />
      </Suspense>
    </Shell>
  );
}
