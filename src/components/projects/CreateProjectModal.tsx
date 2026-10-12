'use client';

import React, { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { ArrowRight, ArrowLeft, FolderPlus, AlertCircle } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useCreateProjectMutation, useBatchAddDepartmentsMutation } from '../../store/api/projectApi';
import { useGetEntitiesQuery, useCreateEntityMutation } from '../../store/api/crmApi';
import { StepScope } from './wizard/StepScope';
import { StepEntities } from './wizard/StepEntities';
import { StepDepartments, defaultDeptList } from './wizard/StepDepartments';

export interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (projectId: string) => void;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedDepts, setSelectedDepts] = useState<string[]>(['IT', 'ENG', 'LEGAL', 'FIN']);

  const { data: entitiesData } = useGetEntitiesQuery();
  const entities = entitiesData?.data || [];

  const clientEntities = entities
    .filter((e) => e.entityType === 'CLIENT')
    .map((e) => ({ label: `${e.name} (${e.code || 'CLIENT'})`, value: e.id }));

  const auditeeEntities = entities
    .filter((e) => e.entityType === 'AUDITEE')
    .map((e) => ({ label: `${e.name} (${e.code || 'AUDITEE'})`, value: e.id }));

  const [createProject, { isLoading: isCreating }] = useCreateProjectMutation();
  const [createEntity] = useCreateEntityMutation();
  const [batchAddDepartments] = useBatchAddDepartmentsMutation();

  const form = useForm({
    defaultValues: {
      projectName: 'BTRC & Fiber@Home IS Audit (2016–2026 Data)',
      projectType: 'Information Systems Audit',
      auditStartYear: '2016',
      auditEndYear: '2026',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      customClientName: 'Bangladesh Telecommunication Regulatory Commission',
      customAuditeeName: 'Fiber@Home Limited',
      selectedClientId: '',
      selectedAuditeeId: '',
      projectScope: 'Comprehensive IS audit covering operational, billing, and regulatory compliance.',
      projectObjective: 'Validate regulatory conformance and license compliance for BTRC.',
    },
    onSubmit: async ({ value }) => {
      setErrorMessage(null);
      try {
        let resolvedClientId = value.selectedClientId;
        let resolvedAuditeeId = value.selectedAuditeeId;

        // Resolve or create custom Client entity
        if (!resolvedClientId) {
          const clientRes = await createEntity({
            name: value.customClientName.trim() || 'Regulator Client',
            entityType: 'CLIENT',
          }).unwrap();
          resolvedClientId = clientRes.data.id;
        }

        // Resolve or create custom Auditee entity
        if (!resolvedAuditeeId) {
          const auditeeRes = await createEntity({
            name: value.customAuditeeName.trim() || 'Auditee Enterprise',
            entityType: 'AUDITEE',
          }).unwrap();
          resolvedAuditeeId = auditeeRes.data.id;
        }

        // Distinct separation: Audit Period Data Range is recorded in scope, while startDate/endDate track engagement execution
        const dataRangeScope = `Audit Data Coverage: ${value.auditStartYear}–${value.auditEndYear}. ${value.projectScope || ''}`;

        const result = await createProject({
          projectName: value.projectName,
          projectType: value.projectType,
          clientId: resolvedClientId,
          auditeeId: resolvedAuditeeId,
          startDate: value.startDate,
          endDate: value.endDate,
          projectScope: dataRangeScope,
          projectObjective: value.projectObjective,
          status: 'ACTIVE',
        }).unwrap();

        if (result.data?.id && selectedDepts.length > 0) {
          const deptsToAdd = defaultDeptList.filter((d) => selectedDepts.includes(d.code));
          await batchAddDepartments({
            projectId: result.data.id,
            departments: deptsToAdd,
          }).unwrap();
        }

        onClose();
        if (onSuccess && result.data?.id) onSuccess(result.data.id);
      } catch (err: unknown) {
        const error = err as { data?: { message?: string }; message?: string };
        setErrorMessage(error.data?.message || error.message || 'Failed to create project workspace');
      }
    },
  });

  const toggleDept = (code: string) => {
    setSelectedDepts((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Audit Project Workspace"
      description={`Step ${step} of 3: ${
        step === 1 ? 'Scope & Historical Data Period' : step === 2 ? 'Client & Auditee Entities' : 'Auditee Departments'
      }`}
      size="lg"
    >
      {errorMessage && (
        <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-start gap-2.5 text-xs text-rose-400">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Wizard Progress Pill Indicator */}
      <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-800 text-xs">
        <span className={step >= 1 ? 'text-indigo-400 font-semibold' : 'text-slate-500'}>
          1. Scope & Data Range
        </span>
        <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
        <span className={step >= 2 ? 'text-indigo-400 font-semibold' : 'text-slate-500'}>
          2. Client & Auditee
        </span>
        <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
        <span className={step >= 3 ? 'text-indigo-400 font-semibold' : 'text-slate-500'}>
          3. Departments
        </span>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit(); }} className="space-y-4">
        {step === 1 && (
          <StepScope
            form={form}
            auditStartYear={form.state.values.auditStartYear}
            auditEndYear={form.state.values.auditEndYear}
          />
        )}

        {step === 2 && (
          <StepEntities
            form={form}
            clientEntities={clientEntities}
            auditeeEntities={auditeeEntities}
          />
        )}

        {step === 3 && (
          <StepDepartments
            selectedDepts={selectedDepts}
            onToggleDept={toggleDept}
          />
        )}

        {/* Wizard Footer Controls */}
        <div className="pt-5 border-t border-slate-800/80 flex items-center justify-between">
          {step > 1 ? (
            <Button type="button" variant="outline" size="sm" onClick={() => setStep((s) => (s - 1) as 1 | 2)} leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
              Previous
            </Button>
          ) : <div />}

          {step < 3 ? (
            <Button type="button" variant="primary" size="sm" onClick={() => setStep((s) => (s + 1) as 2 | 3)} rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              Next Step
            </Button>
          ) : (
            <Button type="submit" variant="primary" size="sm" isLoading={isCreating} leftIcon={<FolderPlus className="w-4 h-4" />}>
              Create Project Workspace
            </Button>
          )}
        </div>
      </form>
    </Modal>
  );
};
