'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, AlertCircle, Building2, Shield, Briefcase, CheckCircle2 } from 'lucide-react';
import { Modal } from '../../../ui/Modal';
import { Button } from '../../../ui/Button';
import { useGetProjectMembersQuery } from '../../../../store/api/projectApi';
import { useAssignTrioMembersMutation } from '../../../../store/api/torApi';
import type { ITorNode } from '../../../../types/tor.types';

export interface AssignTorMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  tor: ITorNode | null;
  projectId: string;
}

export const AssignTorMemberModal: React.FC<AssignTorMemberModalProps> = ({
  isOpen,
  onClose,
  tor,
  projectId,
}) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { data: membersData } = useGetProjectMembersQuery(projectId, { skip: !isOpen });
  const projectMembers = membersData?.data || [];

  const [orgMemberId, setOrgMemberId] = useState<string>('');
  const [clientMemberId, setClientMemberId] = useState<string>('');
  const [auditeeMemberId, setAuditeeMemberId] = useState<string>('');
  const [deadline, setDeadline] = useState<string>('');

  const [assignTrio, { isLoading: isSaving }] = useAssignTrioMembersMutation();

  useEffect(() => {
    if (!tor || !isOpen) return;
    setErrorMessage(null);
    setSuccessMessage(null);

    const assigned = tor.assignedMembers || [];
    const org = assigned.find(
      (m) => m.teamBucket === 'ORG_MEMBER' || m.teamBucket === 'ADMINISTRATOR'
    );
    const client = assigned.find((m) => m.teamBucket === 'CLIENT');
    const auditee = assigned.find((m) => m.teamBucket === 'AUDITEE');

    setOrgMemberId(org ? org.userId : '');
    setClientMemberId(client ? client.userId : '');
    setAuditeeMemberId(auditee ? auditee.userId : '');

    if (tor.submissionDeadline) {
      try {
        const d = new Date(tor.submissionDeadline);
        if (!isNaN(d.getTime())) {
          setDeadline(d.toISOString().split('T')[0]);
        } else {
          setDeadline('');
        }
      } catch {
        setDeadline('');
      }
    } else {
      setDeadline('');
    }
  }, [tor, isOpen]);

  if (!tor) return null;

  const orgMembers = projectMembers.filter(
    (m) => m.teamBucket === 'ORG_MEMBER' || m.teamBucket === 'ADMINISTRATOR'
  );
  const clientMembers = projectMembers.filter((m) => m.teamBucket === 'CLIENT');
  const auditeeMembers = projectMembers.filter((m) => m.teamBucket === 'AUDITEE');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await assignTrio({
        torId: tor.id,
        orgMemberId: orgMemberId || null,
        clientMemberId: clientMemberId || null,
        auditeeMemberId: auditeeMemberId || null,
        submissionDeadline: deadline ? new Date(deadline).toISOString() : null,
      }).unwrap();

      setSuccessMessage('Tri-party committee and deadline saved successfully!');
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err: unknown) {
      const error = err as { data?: { message?: string }; message?: string };
      setErrorMessage(error.data?.message || error.message || 'Failed to save DRT assignments');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="DRT Tri-Party Assignment & Deadline"
      description={`Assign the 3-party committee and submission deadline for [${tor.code}] ${tor.title}`}
      size="lg"
    >
      <form onSubmit={handleSave} className="space-y-4">
        {errorMessage && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-600">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-xs text-emerald-700">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Document Submission Deadline */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
          <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-indigo-600" />
            Document Submission Deadline
          </label>
          <p className="text-[11px] text-slate-500">
            Target date by which evidence files must be uploaded for regulatory verification.
          </p>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        {/* 3 Dedicated Committee Member Slots */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* 1. Org Member (Auditor / Upload Authority) */}
          <div className="p-3.5 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-900">
              <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
              1. Org Team Auditor
            </div>
            <p className="text-[11px] text-indigo-700/80 leading-snug">
              Sole member authorized to upload evidence documents.
            </p>
            <select
              value={orgMemberId}
              onChange={(e) => setOrgMemberId(e.target.value)}
              className="w-full text-xs bg-white border border-indigo-200 rounded-lg px-2.5 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="">-- Select Org Member --</option>
              {orgMembers.map((m) => (
                <option key={m.userId} value={m.userId}>
                  {m.user?.name || m.user?.email} ({m.teamBucket})
                </option>
              ))}
            </select>
          </div>

          {/* 2. Client Member (Regulator) */}
          <div className="p-3.5 bg-amber-50/50 border border-amber-100 rounded-xl space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-900">
              <Shield className="w-3.5 h-3.5 text-amber-600" />
              2. Client (Regulator)
            </div>
            <p className="text-[11px] text-amber-700/80 leading-snug">
              Regulatory compliance oversight & read-only tracking.
            </p>
            <select
              value={clientMemberId}
              onChange={(e) => setClientMemberId(e.target.value)}
              className="w-full text-xs bg-white border border-amber-200 rounded-lg px-2.5 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            >
              <option value="">-- Select Client Member --</option>
              {clientMembers.map((m) => (
                <option key={m.userId} value={m.userId}>
                  {m.user?.name || m.user?.email}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Auditee Member (Enterprise) */}
          <div className="p-3.5 bg-emerald-50/50 border border-emerald-100 rounded-xl space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-900">
              <Building2 className="w-3.5 h-3.5 text-emerald-600" />
              3. Auditee Enterprise
            </div>
            <p className="text-[11px] text-emerald-700/80 leading-snug">
              Auditee department focal point (read-only tracking).
            </p>
            <select
              value={auditeeMemberId}
              onChange={(e) => setAuditeeMemberId(e.target.value)}
              className="w-full text-xs bg-white border border-emerald-200 rounded-lg px-2.5 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            >
              <option value="">-- Select Auditee Member --</option>
              {auditeeMembers.map((m) => (
                <option key={m.userId} value={m.userId}>
                  {m.user?.name || m.user?.email}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isSaving}>
            Save DRT Assignment
          </Button>
        </div>
      </form>
    </Modal>
  );
};
