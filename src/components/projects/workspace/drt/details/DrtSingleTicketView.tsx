'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  FolderDown,
  FileCheck2,
  FileText,
  AlertCircle,
  MessageSquare,
  Sparkles,
  CalendarCheck,
} from 'lucide-react';
import { Button } from '../../../../ui/Button';
import { Badge } from '../../../../ui/Badge';
import { DrtTable } from '../DrtTable';
import { DrtModals } from '../DrtModals';
import { DrtDetailsHeader } from './DrtDetailsHeader';
import { DrtDetailsDocuments } from './DrtDetailsDocuments';
import { DrtDetailsMilestoneProgress } from './DrtDetailsMilestoneProgress';
import { ConfigureProgressCutoffsModal } from '../../../../tors/progress/ConfigureProgressCutoffsModal';
import { AddProgressReportModal } from '../../../../tors/progress/AddProgressReportModal';
import { getProjectAuditYears } from '../../../../../utils/projectTimeframe';
import { getShortEntityName, formatDate } from '../../../../../lib/utils';
import { getDrtStagePercentage, type DrtProgressPhase } from '../../../../../lib/drtProgressUtils';
import type {
  IDRTTicket,
  IDRTDocument,
  DRTPartySide,
  IProject,
} from '../../../../../types/project.types';

export interface DrtSingleTicketViewProps {
  projectId: string;
  ticket: IDRTTicket;
  project?: IProject | null;
  initialTab?: 'collection' | 'analysis' | 'progress';
}

export const DrtSingleTicketView: React.FC<DrtSingleTicketViewProps> = ({
  projectId,
  ticket,
  project,
  initialTab = 'collection',
}) => {
  const [activeTab, setActiveTab] = useState<'collection' | 'analysis' | 'progress'>(initialTab);
  const [isConfigCutoffsOpen, setIsConfigCutoffsOpen] = useState(false);
  const [addReportPhase, setAddReportPhase] = useState<DrtProgressPhase | null>(null);

  // Modals state
  const [uploadTicket, setUploadTicket] = useState<{
    ticket: IDRTTicket;
    side: DRTPartySide;
    initialPeriodLabel?: string;
  } | null>(null);
  const [reviewTarget, setReviewTarget] = useState<{
    ticket: IDRTTicket;
    doc?: IDRTDocument;
  } | null>(null);
  const [squadTicket, setSquadTicket] = useState<IDRTTicket | null>(null);
  const [periodModal, setPeriodModal] = useState<{
    ticket: IDRTTicket;
    year: string;
  } | null>(null);
  const [torsTicket, setTorsTicket] = useState<IDRTTicket | null>(null);
  const [analysisTicket, setAnalysisTicket] = useState<{
    ticket: IDRTTicket;
    year?: string;
  } | null>(null);
  const [remarkModal, setRemarkModal] = useState<{
    ticket: IDRTTicket;
    side: 'AUDITOR' | 'AUDITEE';
  } | null>(null);

  const clientName = getShortEntityName(project?.client?.name, 'BTRC');
  const auditeeName = getShortEntityName(project?.auditee?.name, 'FHL');
  const auditYears = getProjectAuditYears(project);

  const colObt = ticket.collectionObtained ?? 0;
  const colAlc = ticket.collectionAllocated ?? 0;
  const anaObt = ticket.analysisObtained ?? 0;
  const anaAlc = ticket.analysisAllocated ?? 0;

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Top Navigation & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2.5 flex-wrap">
          <Link href={`/projects/${projectId}?tab=drt`}>
            <Button
              variant="ghost"
              size="xs"
              leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
            >
              Back to DRT Requests Hub
            </Button>
          </Link>
          <span className="text-slate-300">/</span>
          <Badge variant="neutral" size="xs">
            DRT Details
          </Badge>
          <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
            {ticket.requestCode}
          </span>
          {project?.projectName && (
            <span className="text-xs text-slate-500 truncate max-w-xs hidden md:inline">
              • {project.projectName}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/projects/${projectId}/tor-progress`}>
            <Button variant="outline" size="xs">
              ToR Progress Reports
            </Button>
          </Link>
          <Link href={`/projects/${projectId}?tab=tors`}>
            <Button variant="outline" size="xs">
              ToR WBS Tree
            </Button>
          </Link>
        </div>
      </div>

      {/* Hero Header Card */}
      <DrtDetailsHeader ticket={ticket} />

      {/* Dual Stream Tabs Switcher: Data Collection vs Data Analysis */}
      <div className="flex items-center justify-between gap-3 p-2 bg-white rounded-xl border border-slate-200 shadow-2xs flex-wrap">
        <div className="flex items-center gap-2">
          {/* Tab 1: Data Collection */}
          <button
            type="button"
            onClick={() => setActiveTab('collection')}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'collection'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/80'
            }`}
          >
            <FolderDown
              className={`w-4 h-4 ${
                activeTab === 'collection' ? 'text-white' : 'text-emerald-600'
              }`}
            />
            <div className="text-left">
              <span className="block leading-tight font-bold">Data Collection</span>
              <span
                className={`text-[10px] block font-mono ${
                  activeTab === 'collection'
                    ? 'text-emerald-100'
                    : 'text-slate-500'
                }`}
              >
                Marks: {colObt.toFixed(1)} / {colAlc.toFixed(1)}
              </span>
            </div>
          </button>

          {/* Tab 2: Data Analysis */}
          <button
            type="button"
            onClick={() => setActiveTab('analysis')}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'analysis'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/80'
            }`}
          >
            <FileCheck2
              className={`w-4 h-4 ${
                activeTab === 'analysis' ? 'text-white' : 'text-indigo-600'
              }`}
            />
            <div className="text-left">
              <span className="block leading-tight font-bold">Data Analysis</span>
              <span
                className={`text-[10px] block font-mono ${
                  activeTab === 'analysis'
                    ? 'text-indigo-100'
                    : 'text-slate-500'
                }`}
              >
                Marks: {anaObt.toFixed(1)} / {anaAlc.toFixed(1)}
              </span>
            </div>
          </button>

          {/* Tab 3: Milestone Progress Timeline */}
          <button
            type="button"
            onClick={() => setActiveTab('progress')}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'progress'
                ? 'bg-emerald-700 text-white shadow-2xs'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/80'
            }`}
          >
            <CalendarCheck
              className={`w-4 h-4 ${
                activeTab === 'progress' ? 'text-white' : 'text-emerald-600'
              }`}
            />
            <div className="text-left">
              <span className="block leading-tight font-bold">Milestone Progress</span>
              <span
                className={`text-[10px] block font-mono ${
                  activeTab === 'progress'
                    ? 'text-emerald-100'
                    : 'text-slate-500'
                }`}
              >
                1st &ndash; 5th Report Timeline
              </span>
            </div>
          </button>
        </div>

        <div className="text-xs text-slate-500 pr-2">
          {activeTab === 'collection' ? (
            <span>
              Showing <strong>Data Collection</strong> lifecycle, multi-year status, and evidence uploads.
            </span>
          ) : activeTab === 'analysis' ? (
            <span>
              Showing <strong>Data Analysis</strong> evaluation, multi-year verification, and findings.
            </span>
          ) : (
            <span>
              Showing <strong>Milestone Progress Timeline</strong> and evidence snapshots evaluated by cutoff deadline.
            </span>
          )}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'progress' ? (
        <DrtDetailsMilestoneProgress
          projectId={projectId}
          ticket={ticket}
          project={project}
          auditYears={auditYears}
          onOpenAddReport={(ph) => setAddReportPhase(ph || 'FIRST_PROGRESS')}
          onOpenConfigCutoffs={() => setIsConfigCutoffsOpen(true)}
        />
      ) : (
        <div className="space-y-4">
          <DrtTable
            projectId={projectId}
            tickets={[ticket]}
            clientName={clientName}
            auditeeName={auditeeName}
            auditYears={auditYears}
            stream={activeTab}
            onManageSquad={(t) => setSquadTicket(t)}
            onManageTors={(t) => setTorsTicket(t)}
            onOpenPeriodModal={(t, yr) => setPeriodModal({ ticket: t, year: yr })}
            onOpenUploadModal={(t, side) => setUploadTicket({ ticket: t, side })}
            onOpenAnalysisModal={(t, yr) => setAnalysisTicket({ ticket: t, year: yr })}
          />

          {/* Tab-Specific Supporting Panels */}
          {activeTab === 'collection' ? (
            /* Evidence Documents Panel */
            <DrtDetailsDocuments
              ticket={ticket}
              clientName={clientName}
              auditeeName={auditeeName}
              onOpenUpload={(side) => setUploadTicket({ ticket, side })}
            />
          ) : (
            /* Analysis Observations & Audit Findings Panel */
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-200">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Audit Examination Findings &amp; Observations
                    </h3>
                    <p className="text-xs text-slate-500">
                      Detailed observations recorded during operational and compliance data analysis
                    </p>
                  </div>
                </div>
                <Button
                  variant="primary"
                  size="xs"
                  onClick={() => setAnalysisTicket({ ticket })}
                  leftIcon={<Sparkles className="w-3.5 h-3.5" />}
                >
                  Examine &amp; Award Marks
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-indigo-600" />
                    Auditor Analysis Verdict
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {ticket.remarks || (
                      <span className="italic text-slate-400">
                        No analytical remarks recorded yet. Click &quot;Examine &amp; Award Marks&quot; to log audit findings.
                      </span>
                    )}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    Immediate Requirement / Gaps
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {ticket.currentRequirement || (
                      <span className="italic text-slate-400">
                        No outstanding requirement specified for this data request.
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Also show submitted evidence files for reference during analysis */}
              <div className="pt-2">
                <DrtDetailsDocuments
                  ticket={ticket}
                  clientName={clientName}
                  auditeeName={auditeeName}
                  onOpenUpload={(side) => setUploadTicket({ ticket, side })}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Progress Report Modal */}
      {addReportPhase && (
        <AddProgressReportModal
          isOpen={Boolean(addReportPhase)}
          onClose={() => setAddReportPhase(null)}
          projectId={projectId}
          currentCutoffs={project?.progressCutoffDates}
          auditYears={auditYears}
          allProjectTickets={[ticket]}
          initialPhase={addReportPhase}
        />
      )}

      {/* Configure Cutoffs Modal */}
      <ConfigureProgressCutoffsModal
        isOpen={isConfigCutoffsOpen}
        onClose={() => setIsConfigCutoffsOpen(false)}
        projectId={projectId}
        auditYears={auditYears}
        currentCutoffs={project?.progressCutoffDates}
        projectStartDate={project?.startDate}
        projectEndDate={project?.endDate}
      />

      {/* Unified Modals Mounted */}
      <DrtModals
        projectId={projectId}
        auditYears={auditYears}
        clientName={clientName}
        auditeeName={auditeeName}
        isCreateOpen={false}
        onCloseCreate={() => {}}
        uploadTicket={uploadTicket}
        onCloseUpload={() => setUploadTicket(null)}
        reviewTarget={reviewTarget}
        onCloseReview={() => setReviewTarget(null)}
        squadTicket={squadTicket}
        onCloseSquad={() => setSquadTicket(null)}
        periodModal={periodModal}
        onClosePeriod={() => setPeriodModal(null)}
        onOpenUploadFromPeriod={(t, yr) =>
          setUploadTicket({ ticket: t, side: 'AUDITEE', initialPeriodLabel: yr })
        }
        torsTicket={torsTicket}
        onCloseTors={() => setTorsTicket(null)}
        analysisTicket={analysisTicket}
        onCloseAnalysis={() => setAnalysisTicket(null)}
        remarkModal={remarkModal}
        onCloseRemark={() => setRemarkModal(null)}
      />
    </div>
  );
};