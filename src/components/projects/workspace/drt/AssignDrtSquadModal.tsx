'use client';

import React, { useState, useEffect } from 'react';
import { Users, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Modal } from '../../../ui/Modal';
import { Button } from '../../../ui/Button';
import { stripHtml } from '../../../../lib/utils';
import { useAssignSquadMutation } from '../../../../store/api/drtApi';
import { useGetProjectMembersQuery } from '../../../../store/api/projectApi';
import type { IDRTTicket } from '../../../../types/project.types';

export interface AssignDrtSquadModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: IDRTTicket | null;
  projectId: string;
}

export const AssignDrtSquadModal: React.FC<AssignDrtSquadModalProps> = ({
  isOpen,
  onClose,
  ticket,
  projectId,
}) => {
  const [supervisorId, setSupervisorId] = useState('');
  const [fieldMemberId, setFieldMemberId] = useState('');
  const [clientContactId, setClientContactId] = useState('');
  const [auditeeContactId, setAuditeeContactId] = useState('');
  const [expectedDateOfReceipt, setExpectedDateOfReceipt] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data: membersData } = useGetProjectMembersQuery(projectId, { skip: !isOpen });
  const [assignSquad, { isLoading }] = useAssignSquadMutation();

  const projectMembers = membersData?.data || [];
  const orgMembers = projectMembers.filter(
    (m) => m.teamBucket === 'ORG_MEMBER' || m.teamBucket === 'ADMINISTRATOR'
  );
  const clientMembers = projectMembers.filter((m) => m.teamBucket === 'CLIENT');
  const auditeeMembers = projectMembers.filter((m) => m.teamBucket === 'AUDITEE');

  useEffect(() => {
    if (ticket && isOpen) {
      setSupervisorId(ticket.supervisorId || '');
      setFieldMemberId(ticket.fieldMemberId || '');
      setClientContactId(ticket.clientContactId || '');
      setAuditeeContactId(ticket.auditeeContactId || '');
      setExpectedDateOfReceipt(
        ticket.expectedDateOfReceipt ? ticket.expectedDateOfReceipt.split('T')[0] : ''
      );
      setErrorMessage(null);
    }
  }, [ticket, isOpen]);

  if (!ticket) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    try {
      await assignSquad({
        id: ticket.id,
        supervisorId: supervisorId || null,
        fieldMemberId: fieldMemberId || null,
        clientContactId: clientContactId || null,
        auditeeContactId: auditeeContactId || null,
        expectedDateOfReceipt: expectedDateOfReceipt || null,
      }).unwrap();

      onClose();
    } catch (err: unknown) {
      const error = err as { data?: { message?: string }; message?: string };
      setErrorMessage(error.data?.message || error.message || 'Failed to update squad assignment');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Assign 4-Party Squad [${ticket.requestCode}]`}
      description={ticket.title || stripHtml(ticket.description)}
      size="md"
    >
      {errorMessage && (
        <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-start gap-2.5 text-xs text-rose-500">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Audit Supervisor (Firm)
            </label>
            <select
              value={supervisorId}
              onChange={(e) => setSupervisorId(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-white border border-slate-200 text-slate-800 focus:outline-none focus:border-indigo-600"
            >
              <option value="">-- Select Supervisor --</option>
              {orgMembers.map((m) => (
                <option key={m.userId} value={m.userId}>
                  {m.user?.name || m.user?.email}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Field Member (Uploader)
            </label>
            <select
              value={fieldMemberId}
              onChange={(e) => setFieldMemberId(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-white border border-slate-200 text-slate-800 focus:outline-none focus:border-indigo-600"
            >
              <option value="">-- Select Field Member --</option>
              {orgMembers.map((m) => (
                <option key={m.userId} value={m.userId}>
                  {m.user?.name || m.user?.email}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Client Focal (Regulator)
            </label>
            <select
              value={clientContactId}
              onChange={(e) => setClientContactId(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-white border border-slate-200 text-slate-800 focus:outline-none focus:border-indigo-600"
            >
              <option value="">-- Select Client Focal --</option>
              {clientMembers.map((m) => (
                <option key={m.userId} value={m.userId}>
                  {m.user?.name || m.user?.email}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Auditee Focal (Enterprise Dept)
            </label>
            <select
              value={auditeeContactId}
              onChange={(e) => setAuditeeContactId(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-white border border-slate-200 text-slate-800 focus:outline-none focus:border-indigo-600"
            >
              <option value="">-- Select Auditee Focal --</option>
              {auditeeMembers.map((m) => (
                <option key={m.userId} value={m.userId}>
                  {m.user?.name || m.user?.email}
                  {m.user?.designation ? ` (${m.user.designation})` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Expected Date of Receipt (SLA Target)
          </label>
          <input
            type="date"
            value={expectedDateOfReceipt}
            onChange={(e) => setExpectedDateOfReceipt(e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-xs bg-white border border-slate-200 text-slate-800 focus:outline-none focus:border-indigo-600"
          />
        </div>

        <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isLoading}
            leftIcon={<Users className="w-4 h-4" />}
          >
            Update Squad
          </Button>
        </div>
      </form>
    </Modal>
  );
};
