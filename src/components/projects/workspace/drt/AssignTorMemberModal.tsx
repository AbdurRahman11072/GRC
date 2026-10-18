'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, AlertCircle, Building2, Shield, ShieldAlert, Users, CheckCircle2, Check } from 'lucide-react';
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

  const [supervisorIds, setSupervisorIds] = useState<string[]>([]);
  const [fieldMemberIds, setFieldMemberIds] = useState<string[]>([]);
  const [clientMemberId, setClientMemberId] = useState<string>('');
  const [auditeeMemberId, setAuditeeMemberId] = useState<string>('');
  const [deadline, setDeadline] = useState<string>('');

  const [assignTrio, { isLoading: isSaving }] = useAssignTrioMembersMutation();

  useEffect(() => {
    if (!tor || !isOpen) return;
    setErrorMessage(null);
    setSuccessMessage(null);

    const assigned = tor.assignedMembers || [];
    const supIds = assigned
      .filter((m) => m.assignmentRole === 'SUPERVISOR' || (!m.assignmentRole && m.projectRole === 'SUPERVISOR'))
      .map((m) => m.userId);
    const fieldIds = assigned
      .filter((m) => m.assignmentRole === 'FIELD_MEMBER' || (!m.assignmentRole && (m.teamBucket === 'ORG_MEMBER' || m.projectRole === 'FIELD_TEAM') && !supIds.includes(m.userId)))
      .map((m) => m.userId);

    const client = assigned.find((m) => m.assignmentRole === 'CLIENT_OBSERVER' || m.teamBucket === 'CLIENT');
    const auditee = assigned.find((m) => m.assignmentRole === 'AUDITEE_FOCAL' || m.teamBucket === 'AUDITEE');

    setSupervisorIds(supIds);
    setFieldMemberIds(fieldIds);
    setClientMemberId(client ? client.userId : '');
    setAuditeeMemberId(auditee ? auditee.userId : '');

    if (tor.submissionDeadline) {
      try {
        const d = new Date(tor.submissionDeadline);
        setDeadline(!isNaN(d.getTime()) ? d.toISOString().split('T')[0] : '');
      } catch {
        setDeadline('');
      }
    } else {
      setDeadline('');
    }
  }, [tor, isOpen]);

  if (!tor) return null;

  const orgMembers = projectMembers.filter((m) => m.teamBucket === 'ORG_MEMBER' || m.teamBucket === 'ADMINISTRATOR');
  const clientMembers = projectMembers.filter((m) => m.teamBucket === 'CLIENT');
  const auditeeMembers = projectMembers.filter((m) => m.teamBucket === 'AUDITEE');

  const toggleSupervisor = (userId: string) => {
    setSupervisorIds((prev) => prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]);
  };

  const toggleFieldMember = (userId: string) => {
    setFieldMemberIds((prev) => prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      await assignTrio({
        torId: tor.id,
        supervisorIds,
        fieldMemberIds,
        clientMemberId: clientMemberId || null,
        auditeeMemberId: auditeeMemberId || null,
        submissionDeadline: deadline ? new Date(deadline).toISOString() : null,
      }).unwrap();

      setSuccessMessage('DRT supervisory and field team assignments saved!');
      setTimeout(() => onClose(), 600);
    } catch (err: unknown) {
      const error = err as { data?: { message?: string }; message?: string };
      setErrorMessage(error.data?.message || error.message || 'Failed to save DRT assignments');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="DRT Team Assignment & Supervision"
      description={`Assign supervisor(s), field members, and target deadline for [${tor.code}] ${tor.title}`}
      size="xl"
    >
      <form onSubmit={handleSave} className="space-y-4">
        {errorMessage && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2 text-xs text-rose-600">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}
        {successMessage && (
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 flex items-start gap-2 text-xs text-emerald-700">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Submission Deadline */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
          <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-indigo-600" />
            Document Submission Deadline
          </label>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full text-xs bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        {/* 1. Supervisors (Multi-Select) */}
        <div className="p-3 bg-blue-50/30 border border-blue-200 rounded-xl space-y-2">
          <div className="flex items-center justify-between pb-1 border-b border-blue-100">
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
              <ShieldAlert className="w-3.5 h-3.5 text-blue-600" />
              1. Task Supervisor(s)
            </div>
            <span className="text-[10px] text-blue-600 font-medium">Verify documents & allocate marks</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-32 overflow-y-auto pr-1">
            {orgMembers.map((m) => {
              const isChecked = supervisorIds.includes(m.userId);
              return (
                <button
                  type="button"
                  key={`sup-${m.userId}`}
                  onClick={() => toggleSupervisor(m.userId)}
                  className={`flex items-center justify-between p-2 rounded-lg border text-left text-xs transition-all ${
                    isChecked ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300'
                  }`}
                >
                  <span className="truncate">{m.user?.name || m.user?.email}</span>
                  {isChecked && <Check className="w-3 h-3 shrink-0 ml-1" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Field Team Members (Multi-Select) */}
        <div className="p-3 bg-emerald-50/30 border border-emerald-200 rounded-xl space-y-2">
          <div className="flex items-center justify-between pb-1 border-b border-emerald-100">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
              <Users className="w-3.5 h-3.5 text-emerald-600" />
              2. Field Member(s)
            </div>
            <span className="text-[10px] text-emerald-600 font-medium">Collect & upload evidence files</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-32 overflow-y-auto pr-1">
            {orgMembers.map((m) => {
              const isChecked = fieldMemberIds.includes(m.userId);
              return (
                <button
                  type="button"
                  key={`fld-${m.userId}`}
                  onClick={() => toggleFieldMember(m.userId)}
                  className={`flex items-center justify-between p-2 rounded-lg border text-left text-xs transition-all ${
                    isChecked ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300'
                  }`}
                >
                  <span className="truncate">{m.user?.name || m.user?.email}</span>
                  {isChecked && <Check className="w-3 h-3 shrink-0 ml-1" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Client & Auditee Focal Points */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-2.5 bg-amber-50/40 border border-amber-200 rounded-xl space-y-1">
            <label className="text-[11px] font-semibold text-amber-900 flex items-center gap-1">
              <Shield className="w-3 h-3 text-amber-600" />
              Client Observer (Regulator)
            </label>
            <select
              value={clientMemberId}
              onChange={(e) => setClientMemberId(e.target.value)}
              className="w-full text-xs bg-white border border-amber-200 rounded-lg px-2 py-1.5 text-slate-800"
            >
              <option value="">-- Optional Client Observer --</option>
              {clientMembers.map((m) => (
                <option key={m.userId} value={m.userId}>{m.user?.name || m.user?.email}</option>
              ))}
            </select>
          </div>

          <div className="p-2.5 bg-purple-50/40 border border-purple-200 rounded-xl space-y-1">
            <label className="text-[11px] font-semibold text-purple-900 flex items-center gap-1">
              <Building2 className="w-3 h-3 text-purple-600" />
              Auditee Focal Point
            </label>
            <select
              value={auditeeMemberId}
              onChange={(e) => setAuditeeMemberId(e.target.value)}
              className="w-full text-xs bg-white border border-purple-200 rounded-lg px-2 py-1.5 text-slate-800"
            >
              <option value="">-- Optional Auditee Focal --</option>
              {auditeeMembers.map((m) => (
                <option key={m.userId} value={m.userId}>{m.user?.name || m.user?.email}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSaving}>Cancel</Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isSaving}>Save Assignments</Button>
        </div>
      </form>
    </Modal>
  );
};
