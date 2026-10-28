'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from '@tanstack/react-form';
import { FilePlus, AlertCircle } from 'lucide-react';
import { Drawer } from '../../ui/Drawer';
import { Button } from '../../ui/Button';
import { FormField } from '../../form/FormField';
import { RichTextEditor } from '../../ui/RichTextEditor';
import { useCreateTicketMutation } from '../../../store/api/drtApi';
import { useGetTorTreeQuery } from '../../../store/api/torApi';
import { useGetProjectMembersQuery } from '../../../store/api/projectApi';
import { DrtSquadFields } from './drt/DrtSquadFields';
import { DrtMarksFields } from './drt/DrtMarksFields';
import { DrtStatusFields } from './drt/DrtStatusFields';
import { DrtTimeFrameGrid, DEFAULT_AUDIT_YEARS, ITimeFrameStatusItem } from './drt/DrtTimeFrameGrid';
import type { ITorNode } from '../../../types/tor.types';

export interface CreateDrtDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  defaultTorId?: string | null;
  auditYears?: string[];
}

const deptSuggestions = [
  'IT & Infrastructure',
  'Transmission & Network Operations',
  'Billing & Revenue Assurance',
  'Legal & Regulatory Affairs',
  'Finance & Accounts',
  'Customer Care & Operations',
];

export const CreateDrtDrawer: React.FC<CreateDrtDrawerProps> = ({
  isOpen,
  onClose,
  projectId,
  defaultTorId,
  auditYears,
}) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const effectiveYears = useMemo(() => {
    return auditYears && auditYears.length > 0 ? auditYears : DEFAULT_AUDIT_YEARS;
  }, [auditYears]);

  const [timeFrames, setTimeFrames] = useState<ITimeFrameStatusItem[]>(() =>
    effectiveYears.map((y) => ({ periodLabel: y, evidenceStatus: 'IN_PROGRESS', remark: '' }))
  );

  useEffect(() => {
    if (isOpen) {
      setTimeFrames(effectiveYears.map((y) => ({ periodLabel: y, evidenceStatus: 'IN_PROGRESS', remark: '' })));
      setErrorMessage(null);
    }
  }, [isOpen, effectiveYears]);

  const [createTicket, { isLoading }] = useCreateTicketMutation();
  const { data: treeData } = useGetTorTreeQuery(projectId, { skip: !isOpen });
  const { data: membersData } = useGetProjectMembersQuery(projectId, { skip: !isOpen });

  const projectMembers = membersData?.data || [];
  const orgMembers = projectMembers.filter((m) => m.teamBucket === 'ORG_MEMBER' || m.teamBucket === 'ADMINISTRATOR');
  const clientMembers = projectMembers.filter((m) => m.teamBucket === 'CLIENT');
  const auditeeMembers = projectMembers.filter((m) => m.teamBucket === 'AUDITEE');

  const flatTors: ITorNode[] = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tree: ITorNode[] = Array.isArray(treeData?.data) ? (treeData?.data as any) : (treeData?.data as any)?.tree || [];
    const flatten = (nodes: ITorNode[]): ITorNode[] =>
      nodes.flatMap((n) => [n, ...(n.children ? flatten(n.children) : [])]);
    return flatten(tree);
  }, [treeData]);

  const form = useForm({
    defaultValues: {
      torId: defaultTorId || '',
      requestCode: '',
      title: '',
      department: '',
      description: '',
      currentRequirement: '',
      remarks: '',
      supervisorId: '',
      fieldMemberId: '',
      clientContactId: '',
      auditeeContactId: '',
      assignedTeamBucket: 'AUDITEE',
      collectionAllocated: 1.0,
      analysisAllocated: 1.0,
      googleDriveStatus: 'NA' as any,
      auditeeStatus: 'COLLECTING_DATA' as any,
      expectedDateOfReceipt: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      allocatedWeight: 2.0,
    },
    onSubmit: async ({ value }) => {
      setErrorMessage(null);
      if (!value.requestCode?.trim()) return setErrorMessage('DRT ID / Request Code is required');
      if (!value.description?.trim()) return setErrorMessage('Request description is required');

      try {
        const col = Number(value.collectionAllocated) || 0;
        const ana = Number(value.analysisAllocated) || 0;
        await createTicket({
          projectId,
          torId: value.torId || undefined,
          requestCode: value.requestCode.trim(),
          title: value.title?.trim() || undefined,
          assignedTeamBucket: (value.assignedTeamBucket as any) || 'AUDITEE',
          department: value.department ? value.department.trim() : undefined,
          description: value.description.trim(),
          currentRequirement: value.currentRequirement ? value.currentRequirement.trim() : undefined,
          remarks: value.remarks ? value.remarks.trim() : undefined,
          supervisorId: value.supervisorId || undefined,
          fieldMemberId: value.fieldMemberId || undefined,
          clientContactId: value.clientContactId || undefined,
          auditeeContactId: value.auditeeContactId || undefined,
          dateOfRequest: new Date().toISOString(),
          expectedDateOfReceipt: value.expectedDateOfReceipt || undefined,
          collectionAllocated: col,
          analysisAllocated: ana,
          allocatedWeight: col + ana,
          googleDriveStatus: value.googleDriveStatus,
          auditeeStatus: value.auditeeStatus,
          periodStatuses: timeFrames.map((tf) => ({ periodLabel: tf.periodLabel, evidenceStatus: tf.evidenceStatus, remark: tf.remark || null })),
        }).unwrap();
        form.reset();
        onClose();
      } catch (err: unknown) {
        const error = err as { data?: { message?: string }; message?: string };
        setErrorMessage(error.data?.message || error.message || 'Failed to issue DRT request');
      }
    },
  });

  useEffect(() => {
    if (isOpen && defaultTorId) form.setFieldValue('torId', defaultTorId);
  }, [isOpen, defaultTorId, form]);

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Issue DRT Document Request"
      description="Issue a structured document request with multi-year audit status and assigned squad"
      size="lg"
    >
      {errorMessage && (
        <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-start gap-2.5 text-xs text-rose-500">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit(); }} className="space-y-4">
        <form.Field name="torId">
          {(field) => (
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Parent Terms of Reference (ToR) Clause
              </label>
              <select
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-xs bg-white border border-slate-200 text-slate-800 focus:outline-none focus:border-indigo-600"
              >
                <option value="">-- General Project Data Request (No ToR) --</option>
                {flatTors.map((t) => (
                  <option key={t.id} value={t.id}>[{t.code}] {t.title}</option>
                ))}
              </select>
            </div>
          )}
        </form.Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <form.Field name="requestCode">
            {(field) => <FormField field={field} label="DRT ID / Code *" placeholder="e.g. DRT-101, M1001" required />}
          </form.Field>
          <form.Field name="department">
            {(field) => (
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Target Department</label>
                <input
                  list="dept-suggestions"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="e.g. IT, Billing, Legal"
                  className="w-full px-3 py-2 rounded-lg text-xs bg-white border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600"
                />
                <datalist id="dept-suggestions">
                  {deptSuggestions.map((d) => <option key={d} value={d} />)}
                </datalist>
              </div>
            )}
          </form.Field>
        </div>

        <form.Field name="description">
          {(field) => (
            <RichTextEditor
              label="Request Description (Rich Text) *"
              value={field.state.value}
              onChange={(val) => field.handleChange(val)}
              placeholder="Specify the exact documentation, configuration exports, or log records required..."
            />
          )}
        </form.Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <form.Field name="currentRequirement">
            {(field) => <FormField field={field} label="Current Requirement" placeholder="Immediate deliverable needed..." />}
          </form.Field>
          <form.Field name="remarks">
            {(field) => <FormField field={field} label="Remarks (Field Team / Supervisor)" placeholder="Field observations..." />}
          </form.Field>
        </div>

        <DrtTimeFrameGrid value={timeFrames} onChange={setTimeFrames} />
        <DrtSquadFields form={form} orgMembers={orgMembers} clientMembers={clientMembers} auditeeMembers={auditeeMembers} />

        <DrtMarksFields form={form} />
        <DrtStatusFields form={form} />

        <form.Field name="expectedDateOfReceipt">
          {(field) => <FormField field={field} type="date" label="Expected Receipt Date (SLA)" />}
        </form.Field>

        <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isLoading}>Cancel</Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isLoading} leftIcon={<FilePlus className="w-4 h-4" />}>
            Issue DRT Ticket
          </Button>
        </div>
      </form>
    </Drawer>
  );
};
