'use client';

import React from 'react';
import type { IDRTTicket } from '../../../../types/drt.types';
import { gDriveColorMap, auditeeStatusColorMap } from './drtBadges';

export interface DrtCloudAndCollectionCellsProps {
  ticket: IDRTTicket;
}

export const DrtCloudAndCollectionCells: React.FC<DrtCloudAndCollectionCellsProps> = ({
  ticket,
}) => {
  const clientGDrive = ticket.clientGoogleDriveStatus || 'NOT_UPLOADED';
  const auditeeGDrive = ticket.googleDriveStatus || 'NOT_UPLOADED';
  const clientCollectStatus = ticket.clientStatus || 'COLLECTING_DATA';
  const auditeeCollectStatus = ticket.auditeeStatus || 'COLLECTING_DATA';

  return (
    <>
      {/* 12. Client Cloud Link */}
      <td className="px-3 py-2.5 align-middle whitespace-nowrap border-r border-slate-200 bg-sky-50/20">
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${gDriveColorMap[clientGDrive] || gDriveColorMap.NA
            }`}
        >
          {(clientGDrive || 'NOT_UPLOADED').replace(/_/g, ' ')}
        </span>
      </td>
      {/* 13. Client Collection Status */}
      <td className="px-3 py-2.5 align-middle whitespace-nowrap border-r border-slate-200 bg-sky-50/20">
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${auditeeStatusColorMap[clientCollectStatus] || auditeeStatusColorMap.COLLECTING_DATA
            }`}
        >
          {(clientCollectStatus || 'COLLECTING_DATA').replace(/_/g, ' ')}
        </span>
      </td>

      {/* 14. Auditee Cloud Link */}
      <td className="px-3 py-2.5 align-middle whitespace-nowrap border-r border-slate-200 bg-emerald-50/20">
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${gDriveColorMap[auditeeGDrive] || gDriveColorMap.NA
            }`}
        >
          {(auditeeGDrive || 'NOT_UPLOADED').replace(/_/g, ' ')}
        </span>
      </td>



      {/* 15. Auditee Collection Status */}
      <td className="px-3 py-2.5 align-middle whitespace-nowrap border-r border-slate-200 bg-emerald-50/20">
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${auditeeStatusColorMap[auditeeCollectStatus] || auditeeStatusColorMap.COLLECTING_DATA
            }`}
        >
          {(auditeeCollectStatus || 'COLLECTING_DATA').replace(/_/g, ' ')}
        </span>
      </td>
    </>
  );
};
