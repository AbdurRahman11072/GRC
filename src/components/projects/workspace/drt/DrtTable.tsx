'use client';

import React from 'react';
import { Layers } from 'lucide-react';
import { DrtTableHeader } from './DrtTableHeader';
import { DrtTableRow } from './DrtTableRow';
import type { IDRTTicket, DRTPartySide } from '../../../../types/drt.types';
import type { DrtProgressPhase } from '../../../../lib/drtProgressUtils';
import { DEFAULT_AUDIT_YEARS } from './DrtTimeFrameGrid';
import { useHorizontalScroll } from '../../../../hooks/useHorizontalScroll';

export interface DrtTableProps {
  projectId: string;
  tickets: IDRTTicket[];
  clientName?: string;
  auditeeName?: string;
  auditYears?: string[];
  onManageSquad?: (ticket: IDRTTicket) => void;
  onManageTors?: (ticket: IDRTTicket) => void;
  onOpenPeriodModal: (ticket: IDRTTicket, periodLabel: string) => void;
  onOpenUploadModal: (ticket: IDRTTicket, partySide: DRTPartySide) => void;
  onOpenProgressModal: (ticket: IDRTTicket, phase: DrtProgressPhase) => void;
}

export const DrtTable: React.FC<DrtTableProps> = ({
  projectId,
  tickets,
  clientName = 'BTRC',
  auditeeName = 'FHL',
  auditYears = DEFAULT_AUDIT_YEARS,
  onManageSquad,
  onManageTors,
  onOpenPeriodModal,
  onOpenUploadModal,
  onOpenProgressModal,
}) => {
  const totalColumns = 26 + auditYears.length;
  const tableContainerRef = useHorizontalScroll<HTMLDivElement>({
    speed: 1.2,
    allowVerticalAtBoundaries: true,
  });

  return (
    <div
      ref={tableContainerRef}
      className="overflow-x-auto rounded-xl border border-slate-300 bg-white shadow-2xs max-w-full"
    >
      <table className="w-full text-left border-collapse min-w-[2600px]">
        <DrtTableHeader auditYears={auditYears} />
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
                onManageSquad={onManageSquad}
                onManageTors={onManageTors}
                onOpenPeriodModal={onOpenPeriodModal}
                onOpenUploadModal={onOpenUploadModal}
                onOpenProgressModal={onOpenProgressModal}
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
