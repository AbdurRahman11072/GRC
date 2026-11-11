'use client';

import React from 'react';
import { Layers } from 'lucide-react';
import { DrtTableHeader } from './DrtTableHeader';
import { DrtTableRow } from './DrtTableRow';
import type { IDRTTicket, DRTPartySide } from '../../../../types/drt.types';
import { DEFAULT_AUDIT_YEARS } from './DrtTimeFrameGrid';
import { useHorizontalScroll } from '../../../../hooks/useHorizontalScroll';

export interface DrtTableProps {
  projectId: string;
  tickets: IDRTTicket[];
  clientName?: string;
  auditeeName?: string;
  auditYears?: string[];
  stream?: 'collection' | 'analysis';
  onManageSquad?: (ticket: IDRTTicket) => void;
  onManageTors?: (ticket: IDRTTicket) => void;
  onOpenPeriodModal: (ticket: IDRTTicket, periodLabel: string) => void;
  onOpenUploadModal: (ticket: IDRTTicket, partySide: DRTPartySide) => void;
  onOpenAnalysisModal?: (ticket: IDRTTicket, year?: string) => void;
}

export const DrtTable: React.FC<DrtTableProps> = ({
  projectId,
  tickets,
  clientName = 'BTRC',
  auditeeName = 'FHL',
  auditYears = DEFAULT_AUDIT_YEARS,
  stream = 'collection',
  onManageSquad,
  onManageTors,
  onOpenPeriodModal,
  onOpenUploadModal,
  onOpenAnalysisModal,
}) => {
  const totalColumns = 17 + auditYears.length;
  const tableContainerRef = useHorizontalScroll<HTMLDivElement>({
    speed: 1.2,
    allowVerticalAtBoundaries: true,
  });

  return (
    <div
      ref={tableContainerRef}
      className="overflow-x-auto rounded-xl border border-slate-300 bg-white shadow-2xs max-w-full"
    >
      <table className="w-full text-left border-collapse min-w-[1650px]">
        <DrtTableHeader auditYears={auditYears} stream={stream} />
        <tbody>
          {tickets.length > 0 ? (
            tickets.map((ticket, idx) => (
              <DrtTableRow
                key={ticket.id}
                projectId={projectId}
                ticket={ticket}
                index={idx}
                clientName={clientName}
                auditeeName={auditeeName}
                auditYears={auditYears}
                stream={stream}
                onManageSquad={onManageSquad}
                onManageTors={onManageTors}
                onOpenPeriodModal={onOpenPeriodModal}
                onOpenUploadModal={onOpenUploadModal}
                onOpenAnalysisModal={onOpenAnalysisModal}
              />
            ))
          ) : (
            <tr>
              <td
                colSpan={totalColumns}
                className="py-12 text-center text-xs text-slate-500"
              >
                <div className="flex flex-col items-center gap-2">
                  <Layers className="w-6 h-6 text-slate-400" />
                  <span>No DRT request tickets found matching your filter criteria.</span>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
