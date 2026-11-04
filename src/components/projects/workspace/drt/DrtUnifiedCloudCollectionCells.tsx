'use client';

import React from 'react';
import { ExternalLink } from 'lucide-react';
import type { IDRTTicket } from '../../../../types/drt.types';
import { gDriveColorMap, auditeeStatusColorMap } from './drtBadges';

export interface DrtUnifiedCloudCollectionCellsProps {
  ticket: IDRTTicket;
}

export const DrtUnifiedCloudCollectionCells: React.FC<DrtUnifiedCloudCollectionCellsProps> = ({
  ticket,
}) => {
  const isClient = ticket.assignedTeamBucket === 'CLIENT';
  const gDriveStatus = isClient
    ? ticket.clientGoogleDriveStatus || 'NOT_UPLOADED'
    : ticket.googleDriveStatus || 'NOT_UPLOADED';

  const collectionStatus = isClient
    ? ticket.clientStatus || 'COLLECTING_DATA'
    : ticket.auditeeStatus || 'COLLECTING_DATA';

  const driveDoc = ticket.drtDocuments?.find(
    (d) =>
      d.fileUrl &&
      (d.fileType === 'google_drive' ||
        d.fileUrl.includes('drive.google.com') ||
        d.fileUrl.startsWith('http'))
  );

  return (
    <>
      {/* Unified Cloud Link */}
      <td
        className={`px-3 py-2.5 align-middle whitespace-nowrap border-r border-slate-200 ${
          isClient ? 'bg-sky-50/20' : 'bg-emerald-50/20'
        }`}
      >
        {driveDoc?.fileUrl ? (
          <a
            href={driveDoc.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-800 border border-indigo-200 transition-colors shadow-2xs group"
            title={driveDoc.fileUrl}
          >
            <ExternalLink className="w-3 h-3 text-indigo-500 group-hover:text-indigo-700" />
            <span>Drive Link</span>
          </a>
        ) : (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${
              gDriveColorMap[gDriveStatus] || gDriveColorMap.NA
            }`}
          >
            {gDriveStatus.replace(/_/g, ' ')}
          </span>
        )}
      </td>

      {/* Unified Collection Status */}
      <td
        className={`px-3 py-2.5 align-middle whitespace-nowrap border-r border-slate-200 ${
          isClient ? 'bg-sky-50/20' : 'bg-emerald-50/20'
        }`}
      >
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${
            auditeeStatusColorMap[collectionStatus] || auditeeStatusColorMap.COLLECTING_DATA
          }`}
        >
          {collectionStatus.replace(/_/g, ' ')}
        </span>
      </td>
    </>
  );
};
