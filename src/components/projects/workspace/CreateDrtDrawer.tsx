'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from '@tanstack/react-form';
import { FilePlus, AlertCircle, Layers } from 'lucide-react';
import { Drawer } from '../../ui/Drawer';
import { Button } from '../../ui/Button';
import { FormField } from '../../form/FormField';
import { useCreateDualTicketsMutation } from '../../../store/api/drtApi';
import { useGetTorTreeQuery } from '../../../store/api/torApi';
import { useGetProjectMembersQuery } from '../../../store/api/projectApi';
import { DrtSquadFields } from './drt/DrtSquadFields';
import { DrtMarksFields } from './drt/DrtMarksFields';
import { DrtStatusFields } from './drt/DrtStatusFields';
import { DrtTimeFrameGrid, DEFAULT_AUDIT_YEARS, ITimeFrameStatusItem } from './drt/DrtTimeFrameGrid';
import { DrtPartyTabs } from './drt/DrtPartyTabs';
import type { ITorNode } from '../../../types/tor.types';

export interface CreateDrtDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  defaultTorId?: string | null;
  auditYears?: string[];
  clientName?: string;
  auditeeName?: string;
}

export const CreateDrtDrawer: React.FC<CreateDrtDrawerProps> = ({
  isOpen, onClose, projectId, defaultTorId, auditYears, clientName = 'BTRC', auditeeName = 'FHL',
}) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'CLIENT' | 'AUDITEE'>('CLIENT');
  const [clientDept, setClientDept] = useState('');
  const [clientDesc, setClientDesc] = useState('');
  const [auditeeDept, setAuditeeDept] = useState('');
  const [auditeeDesc, setAuditeeDesc] = useState('');

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

  const [createDualTickets, { isLoading }] = useCreateDualTicketsMutation();
  const { data: treeData } = useGetTorTreeQuery(projectId, { skip: !isOpen });
  const { data: membersData } = useGetProjectMembersQuery(projectId, { skip: !isOpen });

  const projectMembers = membersData?.data || [];
  const orgMembers = projectMembers.filter((m) => m.teamBucket === 'ORG_MEMBER' || m.teamBucket === 'ADMINISTRATOR');
  const clientMembers = projectMembers.filter((m) => m.teamBucket === 'CLIENT');
  const auditeeMembers = projectMembers.filter((m) => m.teamBucket === 'AUDITEE');

  const eligibleTors: ITorNode[] = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tree: ITorNode[] = Array.isArray(treeData?.data) ? (treeData?.data as any) : (treeData?.data as any)?.tree || [];
    const flatten = (nodes: ITorNode[]): ITorNode[] =>
      nodes.flatMap((n) => [n, ...(n.children ? flatten(n.children) : [])]);
    return flatten(tree).filter((t) => !t.code || t.code.split('.').filter(Boolean).length <= 2);
  }, [treeData]);

  const form = useForm({
    defaultValues: {
      torId: defaultTorId || '',
      requestCode: '',
      title: '',
      supervisorId: '',
      fieldMemberId: '',
      clientContactId: '',
      auditeeContactId: '',
      collectionAllocated: 1.0,
      analysisAllocated: 1.0,
      clientGoogleDriveStatus: 'NA' as any,
      clientGoogleDriveLink: '',
      clientStatus: 'COLLECTING_DATA' as any,
      googleDriveStatus: 'NA' as any,
      googleDriveLink: '',
      auditeeStatus: 'COLLECTING_DATA' as any,
      expectedDateOfReceipt: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      allocatedWeight: 2.0,
    },
    onSubmit: async ({ value }) => {
      setErrorMessage(null);
      const code = value.requestCode?.trim();
      if (!code) return setErrorMessage('Base DRT Request Code is required (e.g. M1001)');
      if (!clientDesc.trim()) {
        setActiveTab('CLIENT');
        return setErrorMessage(`Please provide request description for Client (${clientName})`);
      }
      if (!auditeeDesc.trim()) {
        setActiveTab('AUDITEE');
        return setErrorMessage(`Please provide request description for Auditee (${auditeeName})`);
      }

      try {
        const col = Number(value.collectionAllocated) || 0;
        const ana = Number(value.analysisAllocated) || 0;
        await createDualTickets({
          projectId,
          torId: value.torId || undefined,
          requestCode: code,
          clientRequestCode: `${code}-C`,
          auditeeRequestCode: `${code}-A`,
          title: value.title?.trim() || undefined,
          clientDepartment: clientDept ? clientDept.trim() : undefined,
          clientDescription: clientDesc.trim(),
          auditeeDepartment: auditeeDept ? auditeeDept.trim() : undefined,
          auditeeDescription: auditeeDesc.trim(),
          supervisorId: value.supervisorId || undefined,
          fieldMemberId: value.fieldMemberId || undefined,
          clientContactId: value.clientContactId || undefined,
          auditeeContactId: value.auditeeContactId || undefined,
          dateOfRequest: new Date().toISOString(),
          expectedDateOfReceipt: value.expectedDateOfReceipt || undefined,
          collectionAllocated: col,
          analysisAllocated: ana,
          allocatedWeight: col + ana,
          clientGoogleDriveStatus: value.clientGoogleDriveStatus,
          clientGoogleDriveLink: value.clientGoogleDriveLink?.trim() || undefined,
          clientStatus: value.clientStatus,
          googleDriveStatus: value.googleDriveStatus,
          googleDriveLink: value.googleDriveLink?.trim() || undefined,
          auditeeStatus: value.auditeeStatus,
          periodStatuses: timeFrames.map((tf) => ({
            periodLabel: tf.periodLabel,
            evidenceStatus: tf.evidenceStatus,
            remark: tf.remark || null,
          })),
        }).unwrap();

        form.reset();
        setClientDesc(''); setClientDept('');
        setAuditeeDesc(''); setAuditeeDept('');
        onClose();
      } catch (err: unknown) {
        const error = err as { data?: { message?: string }; message?: string };
        setErrorMessage(error.data?.message || error.message || 'Failed to issue dual DRT requests');
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
      title="Issue Dual DRT Document Request"
      description={`Atomically issue 2 DRT tickets: one for ${clientName} (Client) and one for ${auditeeName} (Auditee)`}
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
                Parent Terms of Reference (ToR) Clause (1.1)
              </label>
              <select
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-xs bg-white border border-slate-200 text-slate-800 focus:outline-none focus:border-indigo-600"
              >
                <option value="">-- General Project Data Request (No ToR) --</option>
                {eligibleTors.map((t) => (
                  <option key={t.id} value={t.id}>[{t.code}] {t.title}</option>
                ))}
              </select>
            </div>
          )}
        </form.Field>

        <form.Field name="requestCode">
          {(field) => (
            <div className="space-y-1">
              <FormField field={field} label="Base DRT ID / Code *" placeholder="e.g. M1001, DRT-101" required />
              {field.state.value && (
                <div className="flex items-center gap-2 pt-0.5 text-[11px]">
                  <span className="text-slate-500">Generates:</span>
                  <span className="px-1.5 py-0.5 rounded font-mono font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">{field.state.value.trim()}-C (Client)</span>
                  <span className="px-1.5 py-0.5 rounded font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">{field.state.value.trim()}-A (Auditee)</span>
                </div>
              )}
            </div>
          )}
        </form.Field>

        {/* Client & Auditee Tabs */}
        <DrtPartyTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          clientName={clientName}
          auditeeName={auditeeName}
          clientDepartment={clientDept}
          setClientDepartment={setClientDept}
          clientDescription={clientDesc}
          setClientDescription={setClientDesc}
          auditeeDepartment={auditeeDept}
          setAuditeeDepartment={setAuditeeDept}
          auditeeDescription={auditeeDesc}
          setAuditeeDescription={setAuditeeDesc}
        />

        <DrtTimeFrameGrid value={timeFrames} onChange={setTimeFrames} />
        <DrtSquadFields form={form} orgMembers={orgMembers} clientMembers={clientMembers} auditeeMembers={auditeeMembers} />
        <DrtMarksFields form={form} />
        <DrtStatusFields form={form} clientName={clientName} auditeeName={auditeeName} />

        <form.Field name="expectedDateOfReceipt">
          {(field) => <FormField field={field} type="date" label="Expected Receipt Date (SLA)" />}
        </form.Field>

        <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isLoading}>Cancel</Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isLoading} leftIcon={<FilePlus className="w-4 h-4" />}>
            Issue Dual DRT Tickets
          </Button>
        </div>
      </form>
    </Drawer>
  );
};
