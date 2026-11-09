'use client';

import React, { Suspense } from 'react';
import { useParams } from 'next/navigation';
import { Shell } from '../../../../components/layout/Shell';
import { TorProgressPageView } from '../../../../components/tors/progress/TorProgressPageView';

function TorProgressPageContent() {
  const params = useParams();
  const projectId = params?.id as string;

  return <TorProgressPageView projectId={projectId} />;
}

export default function TorProgressPage() {
  return (
    <Shell>
      <Suspense
        fallback={
          <div className="py-20 text-center text-xs text-slate-500">
            Loading ToR Progress &amp; DRT Rollup Reports...
          </div>
        }
      >
        <TorProgressPageContent />
      </Suspense>
    </Shell>
  );
}
