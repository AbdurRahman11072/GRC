'use client';

import React, { useState, useMemo } from 'react';
import {
  Upload,
  UserPlus,
  Building,
  ChevronDown,
  ChevronRight,
  Lock,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { Card } from '../../../ui/Card';
import { Button } from '../../../ui/Button';
import { Badge } from '../../../ui/Badge';
import { DrtDocumentList } from './DrtDocumentList';
import type { ITorNode } from '../../../../types/tor.types';

export interface DrtTorRowProps {
  tor: ITorNode;
  currentUserId?: string;
  isOrgAdmin?: boolean;
  onOpenUpload: (tor: ITorNode) => void;
  onOpenAssign: (tor: ITorNode) => void;
}

export const DrtTorRow: React.FC<DrtTorRowProps> = ({
  tor,
  currentUserId,
  isOrgAdmin = false,
  onOpenUpload,
  onOpenAssign,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const docs = tor.documents || [];
  const assigned = tor.assignedMembers || [];

  // Identify Tri-Party assigned members
  const orgMember = assigned.find(
    (m) => m.teamBucket === 'ORG_MEMBER' || m.teamBucket === 'ADMINISTRATOR'
  );
  const clientMember = assigned.find((m) => m.teamBucket === 'CLIENT');
  const auditeeMember = assigned.find((m) => m.teamBucket === 'AUDITEE');

  // Rule: ONLY assigned Org team members (or Org Admins/Owners) can upload documents
  const isAssignedOrg = Boolean(
    currentUserId && orgMember && orgMember.userId === currentUserId
  );
  const canUpload = isOrgAdmin || isAssignedOrg;

  // Determine overall status
  const hasDocs = docs.length > 0;
  const isAccepted = hasDocs && docs.every((d) => d.status === 'ACCEPTED');
  const hasRevision = hasDocs && docs.some((d) => d.status === 'REVISION_REQUESTED');
  const statusLabel = isAccepted
    ? 'ACCEPTED'
    : hasRevision
      ? 'REVISION_REQUESTED'
      : hasDocs
        ? 'SUBMITTED'
        : 'NOT_SHARED';

  // Format submission deadline
  const deadlineInfo = useMemo(() => {
    if (!tor.submissionDeadline) return null;
    const d = new Date(tor.submissionDeadline);
    if (isNaN(d.getTime())) return null;
    const isPast = d.getTime() < Date.now();
    const dateStr = d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    return { dateStr, isPast };
  }, [tor.submissionDeadline]);

  return (
    <Card className="p-4 bg-white border-slate-200 transition-all hover:border-slate-300 shadow-2xs space-y-3">
      {/* Main Row Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setIsExpanded((prev) => !prev)}
              className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
            >
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>

            <Badge variant="cyan" size="xs">
              {tor.code}
            </Badge>

            <span className="text-sm font-bold text-slate-900 truncate">
              {tor.title}
            </span>

            <Badge
              variant={
                statusLabel === 'ACCEPTED'
                  ? 'success'
                  : statusLabel === 'REVISION_REQUESTED'
                    ? 'danger'
                    : statusLabel === 'SUBMITTED'
                      ? 'indigo'
                      : 'neutral'
              }
              size="xs"
              dot
            >
              {statusLabel}
            </Badge>

            {tor.department && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-purple-50 text-purple-700 border border-purple-200">
                <Building className="w-3 h-3" />
                Dept: {tor.department}
              </span>
            )}

            {/* Submission Deadline Chip */}
            {deadlineInfo && (
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium border ${deadlineInfo.isPast && statusLabel !== 'ACCEPTED'
                    ? 'bg-rose-50 text-rose-700 border-rose-200 font-semibold'
                    : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                title={`Submission Deadline: ${deadlineInfo.dateStr}`}
              >
                {deadlineInfo.isPast && statusLabel !== 'ACCEPTED' ? (
                  <AlertTriangle className="w-3 h-3 text-rose-600" />
                ) : (
                  <Clock className="w-3 h-3 text-slate-400" />
                )}
                {deadlineInfo.isPast && statusLabel !== 'ACCEPTED' ? 'Overdue: ' : 'Expected : '}
                {deadlineInfo.dateStr}
              </span>
            )}
          </div>

          {tor.description && (
            <p className="text-xs text-slate-500 line-clamp-1 pl-6">
              {tor.description}
            </p>
          )}
        </div>

        {/* Action Controls & Assigned Member Pills */}
        <div className="flex items-center gap-2.5 flex-wrap pl-6 lg:pl-0 shrink-0">
          {/* Tri-Party Assignee Chips */}
          <div className="flex items-center gap-1.5">
            <span
              title={`Org Auditor (Uploads): ${orgMember?.user?.name || orgMember?.user?.email || 'Unassigned'}`}
              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border truncate max-w-[100px] ${orgMember
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                  : 'bg-slate-50 text-slate-400 border-slate-200 border-dashed'
                }`}
            >
              Org: {orgMember?.user?.name?.split(' ')[0] || (orgMember ? 'Assigned' : 'None')}
            </span>

            <span
              title={`Client Regulator: ${clientMember?.user?.name || clientMember?.user?.email || 'Unassigned'}`}
              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border truncate max-w-[100px] ${clientMember
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-slate-50 text-slate-400 border-slate-200 border-dashed'
                }`}
            >
              Client: {clientMember?.user?.name?.split(' ')[0] || (clientMember ? 'Assigned' : 'None')}
            </span>

            <span
              title={`Auditee Focal: ${auditeeMember?.user?.name || auditeeMember?.user?.email || 'Unassigned'}`}
              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border truncate max-w-[100px] ${auditeeMember
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-slate-50 text-slate-400 border-slate-200 border-dashed'
                }`}
            >
              Auditee: {auditeeMember?.user?.name?.split(' ')[0] || (auditeeMember ? 'Assigned' : 'None')}
            </span>

            {isOrgAdmin && (
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={() => onOpenAssign(tor)}
                className="text-slate-600 hover:text-indigo-600 ml-1"
                leftIcon={<UserPlus className="w-3 h-3" />}
              >
                Assign
              </Button>
            )}
          </div>

          <div className="h-4 w-px bg-slate-200 hidden sm:block" />

          {/* Upload Document Action */}
          <div className="relative group">
            <Button
              type="button"
              variant={canUpload ? 'primary' : 'outline'}
              size="xs"
              onClick={() => canUpload && onOpenUpload(tor)}
              disabled={!canUpload}
              leftIcon={
                canUpload ? (
                  <Upload className="w-3 h-3" />
                ) : (
                  <Lock className="w-3 h-3 text-slate-400" />
                )
              }
            >
              {canUpload ? 'Upload Document' : 'Upload Restricted'}
            </Button>
            {!canUpload && (
              <div className="absolute right-0 bottom-full mb-1 hidden group-hover:block whitespace-nowrap px-2.5 py-1 bg-slate-900 text-slate-100 text-[10px] rounded border border-slate-700 shadow-lg z-20">
                Only assigned Org team members can upload evidence documents
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Expanded Document List */}
      {isExpanded && (
        <div className="pt-2 border-t border-slate-100">
          <DrtDocumentList
            torId={tor.id}
            documents={docs}
            canReview={isOrgAdmin}
          />
        </div>
      )}
    </Card>
  );
};
