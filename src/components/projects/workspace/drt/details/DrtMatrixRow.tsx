'use client';

import React from 'react';
import { Upload, ShieldCheck, Building2, History } from 'lucide-react';
import type { IDRTTicket, DRTPartySide, IDRTDocument, IDRTTicketPeriodStatus } from '../../../../../types/drt.types';
import type { IDRTRemarkVersion } from './DrtRemarkVersionModal';
import { periodColorMap, gDriveColorMap, auditeeStatusColorMap, statusBadgeStyles } from '../drtBadges';
import { formatDate } from '../../../../../lib/utils';

export interface DrtMatrixRowProps {
  ticket: IDRTTicket;
  partySide: DRTPartySide;
  stakeholderLabel: string;
  partySubLabel: string;
  auditYears: string[];
  auditorVersions: IDRTRemarkVersion[];
  auditeeVersions: IDRTRemarkVersion[];
  onOpenPeriodModal: (periodLabel: string) => void;
  onOpenUploadModal: (partySide: DRTPartySide) => void;
  onOpenRemarkModal: (type: 'AUDITOR' | 'AUDITEE') => void;
}

export const DrtMatrixRow: React.FC<DrtMatrixRowProps> = ({
  ticket,
  partySide,
  stakeholderLabel,
  partySubLabel,
  auditYears,
  auditorVersions,
  auditeeVersions,
  onOpenPeriodModal,
  onOpenUploadModal,
  onOpenRemarkModal,
}) => {
  const isClient = partySide === 'CLIENT';
  const gDrive = isClient ? ticket.clientGoogleDriveStatus || 'NOT_UPLOADED' : ticket.googleDriveStatus || 'NOT_UPLOADED';
  const collectStatus = isClient ? ticket.clientStatus || 'COLLECTING_DATA' : ticket.auditeeStatus || 'COLLECTING_DATA';
  const contact = isClient ? ticket.clientContact : ticket.auditeeContact;
  const reviewOutcomeKey = ticket.reviewOutcome || 'PENDING';
  const excessDays = ticket.excessDays ?? 0;

  const sideDocs = (ticket.drtDocuments || []).filter((d: IDRTDocument) => d.partySide === partySide);
  const latestDocDate = sideDocs[0]?.receivedDate || sideDocs[0]?.createdAt;
  const actualDateDisplay = latestDocDate ? formatDate(latestDocDate) : ticket.actualDateOfReceipt ? formatDate(ticket.actualDateOfReceipt) : '—';

  const latestAuditor = auditorVersions[0];
  const latestAuditee = auditeeVersions[0];

  const periodStatuses = ticket.periodStatuses || [];
  const validPeriods = auditYears.map((yr) => periodStatuses.find((p: IDRTTicketPeriodStatus) => p.periodLabel === yr));
  const completedCount = validPeriods.filter((p) => p?.evidenceStatus === 'COMPLETED' || p?.evidenceStatus === 'SHARED').length;
  const completeness = auditYears.length ? Math.round((completedCount / auditYears.length) * 100) : 0;

  return (
    <tr className="hover:bg-slate-50/70 transition-colors border-b border-slate-200 bg-white">
      {/* 1. Stakeholder Name & Party */}
      <td className="px-3.5 py-3.5 align-top whitespace-nowrap min-w-[150px] sticky left-0 bg-white z-10 border-r border-slate-200 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.06)]">
        <div className="flex items-start gap-2.5">
          <div
            className={`p-2 rounded-lg border shrink-0 ${
              isClient
                ? 'bg-sky-50 text-sky-700 border-sky-200'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}
          >
            {isClient ? <Building2 className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-xs text-slate-900">{stakeholderLabel}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                {partySide}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">{partySubLabel}</p>
            {contact && (
              <p className="text-[10px] text-slate-600 truncate max-w-[130px] mt-0.5">
                {contact.name}
              </p>
            )}
          </div>
        </div>
      </td>

      {/* 2. Date of Request */}
      <td className="px-3 py-3.5 align-top whitespace-nowrap text-xs text-slate-700 font-medium">
        {ticket.dateOfRequest ? formatDate(ticket.dateOfRequest) : '—'}
      </td>

      {/* 3. Expected Date */}
      <td className="px-3 py-3.5 align-top whitespace-nowrap text-xs text-slate-900 font-semibold">
        {ticket.expectedDateOfReceipt ? formatDate(ticket.expectedDateOfReceipt) : '—'}
      </td>

      {/* 4. Actual Date */}
      <td className="px-3 py-3.5 align-top whitespace-nowrap text-xs text-slate-700">
        {actualDateDisplay}
      </td>

      {/* 5. Status (Auditor) */}
      <td className="px-3 py-3.5 align-top whitespace-nowrap">
        <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-semibold border ${statusBadgeStyles[reviewOutcomeKey] || 'bg-slate-100 text-slate-700 border-slate-300'}`}>
          {reviewOutcomeKey.replace(/_/g, ' ')}
        </span>
      </td>

      {/* 6. Excess Days */}
      <td className="px-3 py-3.5 align-top whitespace-nowrap">
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold border ${
            excessDays > 0
              ? 'bg-rose-50 text-rose-700 border-rose-200'
              : excessDays === 0
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-sky-50 text-sky-700 border-sky-200'
          }`}
        >
          {excessDays > 0 ? `+${excessDays}d` : `${excessDays}d`}
        </span>
      </td>

      {/* 7. Google Drive */}
      <td className="px-3 py-3.5 align-top whitespace-nowrap">
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${gDriveColorMap[gDrive] || gDriveColorMap.NA}`}>
          {(gDrive || 'NOT_UPLOADED').replace(/_/g, ' ')}
        </span>
      </td>

      {/* 8. Data Collecting Status */}
      <td className="px-3 py-3.5 align-top whitespace-nowrap">
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${auditeeStatusColorMap[collectStatus] || auditeeStatusColorMap.COLLECTING_DATA}`}>
          {(collectStatus || 'COLLECTING_DATA').replace(/_/g, ' ')}
        </span>
      </td>

      {/* 9. Multi-Year Timeframe Grid */}
      <td className="px-3 py-3.5 align-top">
        <div className="flex items-center gap-1 flex-wrap max-w-[210px]">
          {auditYears.map((year) => {
            const match = periodStatuses.find((p: IDRTTicketPeriodStatus) => p.periodLabel === year);
            const statusKey = match?.evidenceStatus || 'IN_PROGRESS';
            return (
              <button
                key={year}
                type="button"
                onClick={() => onOpenPeriodModal(year)}
                title={`${year}: ${(statusKey || 'IN_PROGRESS').replace(/_/g, ' ')} (Click to update)`}
                className={`px-1.5 py-0.5 text-[10px] font-bold rounded border cursor-pointer hover:opacity-85 transition-opacity ${periodColorMap[statusKey] || 'bg-slate-100 text-slate-600 border-slate-200'}`}
              >
                {year.slice(-2)}
              </button>
            );
          })}
        </div>
      </td>

      {/* 10. Completeness */}
      <td className="px-3 py-3.5 align-top whitespace-nowrap min-w-[90px]">
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-800">
            <span>{completeness}%</span>
            <span className="text-[10px] text-slate-500 font-normal">{completedCount}/{auditYears.length}</span>
          </div>
          <div className="w-16 h-1.5 bg-slate-100 border border-slate-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${completeness === 100 ? 'bg-emerald-500' : completeness > 50 ? 'bg-sky-500' : 'bg-amber-500'}`}
              style={{ width: `${completeness}%` }}
            />
          </div>
        </div>
      </td>

      {/* 11. Auditor Remarks (Versioned) */}
      <td className="px-3 py-3.5 align-top max-w-[190px]">
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-1">
            <button
              type="button"
              onClick={() => onOpenRemarkModal('AUDITOR')}
              className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-colors cursor-pointer"
            >
              <History className="w-2.5 h-2.5" />
              <span>v{latestAuditor?.version || 1}</span>
            </button>
            <span className="text-[10px] text-slate-400 font-medium">{auditorVersions.length} ver</span>
          </div>
          <p
            className="text-[11px] text-slate-700 line-clamp-2 leading-tight cursor-pointer hover:text-indigo-600 transition-colors"
            onClick={() => onOpenRemarkModal('AUDITOR')}
            title="Click to view all versioned remarks"
          >
            {latestAuditor?.content || ticket.remarks || 'No auditor remark yet.'}
          </p>
        </div>
      </td>

      {/* 12. Auditee Remarks (Versioned) */}
      <td className="px-3 py-3.5 align-top max-w-[190px]">
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-1">
            <button
              type="button"
              onClick={() => onOpenRemarkModal('AUDITEE')}
              className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 transition-colors cursor-pointer"
            >
              <History className="w-2.5 h-2.5" />
              <span>v{latestAuditee?.version || 1}</span>
            </button>
            <span className="text-[10px] text-slate-400 font-medium">{auditeeVersions.length} ver</span>
          </div>
          <p
            className="text-[11px] text-slate-700 line-clamp-2 leading-tight cursor-pointer hover:text-teal-600 transition-colors"
            onClick={() => onOpenRemarkModal('AUDITEE')}
            title="Click to view all versioned remarks"
          >
            {latestAuditee?.content || ticket.currentRequirement || 'No auditee remark yet.'}
          </p>
        </div>
      </td>

      {/* 13. Data Upload Action */}
      <td className="px-3.5 py-3.5 align-top whitespace-nowrap text-right">
        <button
          type="button"
          onClick={() => onOpenUploadModal(partySide)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer ${
            isClient ? 'bg-sky-600 hover:bg-sky-700 text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload</span>
        </button>
      </td>
    </tr>
  );
};
