'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  FileCheck2,
  ExternalLink,
  FileText,
  AlertCircle,
  CheckCircle2,
  Clock,
  Layers,
} from 'lucide-react';
import { Button } from '../../../ui/Button';
import { Badge } from '../../../ui/Badge';
import { useUpdateTicketMutation, useUpdatePeriodStatusesMutation } from '../../../../store/api/drtApi';
import type { IDRTTicket, IDRTTicketPeriodStatus, PeriodEvidenceStatus } from '../../../../types/drt.types';

export interface DrtAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: IDRTTicket | null;
  auditYears: string[];
  clientName?: string;
  auditeeName?: string;
  initialYear?: string | null;
}

export const DrtAnalysisModal: React.FC<DrtAnalysisModalProps> = ({
  isOpen,
  onClose,
  ticket,
  auditYears,
  clientName = 'BTRC',
  auditeeName = 'FHL',
  initialYear,
}) => {
  const [updateTicket, { isLoading: isUpdatingTicket }] = useUpdateTicketMutation();
  const [updatePeriodStatuses, { isLoading: isUpdatingPeriods }] = useUpdatePeriodStatusesMutation();

  const isClient = ticket?.assignedTeamBucket === 'CLIENT';
  const partyLabel = isClient ? `${clientName} (Client)` : `${auditeeName} (Auditee)`;

  // State for Overall Analysis Verdict & Marks
  const [reviewOutcome, setReviewOutcome] = useState<'PENDING' | 'PARTIAL' | 'DONE' | 'NOT_AVAILABLE' | 'NOT_APPLICABLE'>('PENDING');
  const [remarks, setRemarks] = useState<string>('');
  const [collectionAllocated, setCollectionAllocated] = useState<number>(0);
  const [collectionObtained, setCollectionObtained] = useState<number>(0);
  const [analysisAllocated, setAnalysisAllocated] = useState<number>(0);
  const [analysisObtained, setAnalysisObtained] = useState<number>(0);

  // State for Per-Year Examination Grid
  const [yearStatuses, setYearStatuses] = useState<
    Array<{
      periodLabel: string;
      evidenceStatus: PeriodEvidenceStatus;
      remark: string;
    }>
  >([]);

  useEffect(() => {
    if (!ticket) return;

    setReviewOutcome(ticket.reviewOutcome || 'PENDING');
    setRemarks(ticket.remarks || '');
    setCollectionAllocated(ticket.collectionAllocated ?? 0);
    setCollectionObtained(ticket.collectionObtained ?? 0);
    setAnalysisAllocated(ticket.analysisAllocated ?? 0);
    setAnalysisObtained(ticket.analysisObtained ?? 0);

    const existingMap = new Map<string, IDRTTicketPeriodStatus>();
    (ticket.periodStatuses || []).forEach((ps) => existingMap.set(ps.periodLabel, ps));

    const initialRows = auditYears.map((yr) => {
      const match = existingMap.get(yr);
      return {
        periodLabel: yr,
        evidenceStatus: match?.evidenceStatus || 'IN_PROGRESS',
        remark: match?.remark || '',
      };
    });
    setYearStatuses(initialRows);
  }, [ticket, auditYears]);

  if (!isOpen || !ticket) return null;

  const docs = ticket.drtDocuments || [];
  const driveDoc = docs.find(
    (d) =>
      d.fileUrl &&
      (d.fileType === 'google_drive' ||
        d.fileUrl.includes('drive.google.com') ||
        d.fileUrl.startsWith('http'))
  );

  const handleYearStatusChange = (
    year: string,
    field: 'evidenceStatus' | 'remark',
    val: string
  ) => {
    setYearStatuses((prev) =>
      prev.map((row) => (row.periodLabel === year ? { ...row, [field]: val } : row))
    );
  };

  const handleSave = async () => {
    try {
      // 1. Update DRT ticket overall remarks and marks
      await updateTicket({
        id: ticket.id,
        body: {
          remarks: remarks.trim() || null,
          collectionAllocated: Number(collectionAllocated) || 0,
          analysisAllocated: Number(analysisAllocated) || 0,
          allocatedWeight: (Number(collectionAllocated) || 0) + (Number(analysisAllocated) || 0),
        },
      }).unwrap();

      // 2. Update multi-year period statuses and auditor remarks
      await updatePeriodStatuses({
        ticketId: ticket.id,
        statuses: yearStatuses.map((ys) => ({
          periodLabel: ys.periodLabel,
          evidenceStatus: ys.evidenceStatus,
          remark: ys.remark.trim() || null,
        })),
      }).unwrap();

      onClose();
    } catch (err) {
      console.error('Failed to save DRT analysis examination:', err);
    }
  };

  const isSaving = isUpdatingTicket || isUpdatingPeriods;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-4xl rounded-2xl bg-white shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono font-bold text-sm px-2 py-0.5 rounded bg-indigo-600 text-white">
                  {ticket.requestCode}
                </span>
                <Badge variant={isClient ? 'indigo' : 'success'} size="xs">
                  {partyLabel}
                </Badge>
                {ticket.department && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    {ticket.department}
                  </span>
                )}
              </div>
              <h3 className="text-sm font-bold text-slate-900 mt-1 line-clamp-1">
                Audit Examination &amp; Evidence Analytics: {ticket.title || ticket.description}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto text-xs">
          {/* Section 1: Collected Evidence Summary */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span className="font-bold text-slate-800 text-xs">
                  Collected Evidence ({docs.length} Uploaded Documents)
                </span>
              </div>
              {driveDoc?.fileUrl && (
                <a
                  href={driveDoc.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Cloud Storage Link</span>
                </a>
              )}
            </div>

            {docs.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto pt-1">
                {docs.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-center gap-2 truncate max-w-[220px]">
                      <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-medium text-slate-800 truncate" title={doc.fileName}>
                        {doc.fileName}
                      </span>
                    </div>
                    {doc.fileUrl && (
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:underline inline-flex items-center gap-1 font-semibold text-[11px]"
                      >
                        <span>View</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 italic text-[11px]">
                No files uploaded yet. Examine external cloud folder or requested records.
              </p>
            )}
          </div>

          {/* Section 2: Multi-Year Audit Examination Grid */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span>Multi-Year Data Examination &amp; Verification Grid</span>
              </label>
              <span className="text-[11px] text-slate-500">
                Verify collected data completeness for each audit year
              </span>
            </div>

            <div className="w-full overflow-x-auto rounded-xl border border-slate-200 bg-white">
              <table className="w-full table-fixed border-collapse text-left text-xs min-w-[600px]">
                <thead>
                  <tr className="bg-slate-100/90 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                    <th className="py-2.5 px-3 border-r border-slate-200 w-24">Year</th>
                    <th className="py-2.5 px-3 border-r border-slate-200 w-44">Collection Status</th>
                    <th className="py-2.5 px-3 border-r border-slate-200 w-52">Examination Verdict</th>
                    <th className="py-2.5 px-3">Auditor Verification Remarks / Findings</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {yearStatuses.map((row) => {
                    const isTargetInitial = initialYear === row.periodLabel;
                    return (
                      <tr
                        key={row.periodLabel}
                        className={`hover:bg-slate-50/70 transition-colors ${
                          isTargetInitial ? 'bg-indigo-50/40' : ''
                        }`}
                      >
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-800 border-r border-slate-200 align-middle">
                          {row.periodLabel}
                          {isTargetInitial && (
                            <span className="ml-1.5 px-1 py-0.2 rounded text-[9px] bg-indigo-600 text-white">
                              Active
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 border-r border-slate-200 align-middle">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${
                              row.evidenceStatus === 'COMPLETED' || row.evidenceStatus === 'SHARED'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                : row.evidenceStatus === 'PARTIAL'
                                ? 'bg-amber-50 text-amber-700 border-amber-300'
                                : row.evidenceStatus === 'NOT_APPLICABLE'
                                ? 'bg-slate-100 text-slate-500 border-slate-300'
                                : 'bg-rose-50 text-rose-700 border-rose-300'
                            }`}
                          >
                            {row.evidenceStatus.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 border-r border-slate-200 align-middle">
                          <select
                            value={row.evidenceStatus}
                            onChange={(e) =>
                              handleYearStatusChange(
                                row.periodLabel,
                                'evidenceStatus',
                                e.target.value as PeriodEvidenceStatus
                              )
                            }
                            className="w-full px-2 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 text-xs focus:outline-none focus:border-indigo-600"
                          >
                            <option value="COMPLETED">Verified &amp; Shared (100%)</option>
                            <option value="PARTIAL">Partially Verified (50%)</option>
                            <option value="IN_PROGRESS">Under Audit / In Prog (0%)</option>
                            <option value="NOT_SHARED">Not Shared / Unverified (0%)</option>
                            <option value="NOT_APPLICABLE">Not Applicable (Excluded)</option>
                          </select>
                        </td>
                        <td className="py-2.5 px-3 align-middle">
                          <input
                            type="text"
                            value={row.remark}
                            onChange={(e) =>
                              handleYearStatusChange(row.periodLabel, 'remark', e.target.value)
                            }
                            placeholder={`Observation / finding for ${row.periodLabel}...`}
                            className="w-full px-2.5 py-1 rounded-md border border-slate-200 bg-white text-slate-800 text-xs focus:outline-none focus:border-indigo-600"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Allocated & Obtained Marks Evaluation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl border border-indigo-100 bg-indigo-50/30">
            {/* Collection Marks */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-800 block">
                Data Collection Marks (Allocated vs. Obtained)
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <span className="text-[10px] text-slate-500 block mb-0.5">Allocated</span>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={collectionAllocated}
                    onChange={(e) => setCollectionAllocated(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 text-xs focus:outline-none focus:border-indigo-600"
                  />
                </div>
                <span className="text-slate-400 font-bold mt-3">/</span>
                <div className="flex-1">
                  <span className="text-[10px] text-slate-500 block mb-0.5">Obtained</span>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={collectionObtained}
                    onChange={(e) => setCollectionObtained(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 text-xs focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>
            </div>

            {/* Analysis Marks */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-800 block">
                Data Analysis Marks (Allocated vs. Obtained)
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <span className="text-[10px] text-slate-500 block mb-0.5">Allocated</span>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={analysisAllocated}
                    onChange={(e) => setAnalysisAllocated(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 text-xs focus:outline-none focus:border-indigo-600"
                  />
                </div>
                <span className="text-slate-400 font-bold mt-3">/</span>
                <div className="flex-1">
                  <span className="text-[10px] text-slate-500 block mb-0.5">Obtained</span>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={analysisObtained}
                    onChange={(e) => setAnalysisObtained(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 text-xs focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Auditor Examination Remarks & Findings */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-800 block">
              Auditor Examination Verdict &amp; Analysis Notes
            </label>
            <textarea
              rows={4}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Record detailed auditor verification findings, cross-references with regulatory ToR clauses, discrepancies, or analytical validation outcome..."
              className="w-full p-3 rounded-lg border border-slate-200 bg-white text-slate-800 text-xs focus:outline-none focus:border-indigo-600 transition-all resize-none"
            />
          </div>

          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2 text-amber-800">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
            <p className="text-[11px] leading-relaxed">
              Evaluating this DRT updates both the Data Analysis score and the multi-year evidence logs. These marks feed into the corresponding ToR WBS clauses in the parent audit matrix.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-2.5 px-6 py-3.5 border-t border-slate-200 bg-slate-50/80">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            isLoading={isSaving}
            leftIcon={<CheckCircle2 className="w-4 h-4" />}
          >
            Save Audit Examination
          </Button>
        </div>
      </div>
    </div>
  );
};
