'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useForm } from '@tanstack/react-form';
import { ArrowRight, ArrowLeft, FolderPlus, AlertCircle } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useCreateProjectMutation } from '../../store/api/projectApi';
import { useGetEntitiesQuery, useCreateEntityMutation } from '../../store/api/crmApi';
import { StepScope } from './wizard/StepScope';
import { StepEntities } from './wizard/StepEntities';

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
  const [step, setStep] = useState<1 | 2>(1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const stepChangedAtRef = useRef<number>(0);

  // Reset wizard step and error state whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setErrorMessage(null);
      stepChangedAtRef.current = 0;
    }
  }, [isOpen]);

  const { data: entitiesData } = useGetEntitiesQuery();
  const entities = entitiesData?.data || [];

  const clientEntities = entities
    .filter((e) => e.entityType === 'CLIENT')
    .map((e) => ({ label: e.name, value: e.id }));

  const auditeeEntities = entities
    .filter((e) => e.entityType === 'AUDITEE')
    .map((e) => ({ label: e.name, value: e.id }));

  const [createProject, { isLoading: isCreating }] = useCreateProjectMutation();
  const [createEntity] = useCreateEntityMutation();

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
      // Guard: Strictly prevent project creation unless user is on final Step 2 and clicked submit
      if (step !== 2) {
        return;
      }
      if (Date.now() - stepChangedAtRef.current < 600) {
        return;
      }

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

        // Distinct separation: Audit Period Data Range is recorded in scope
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

        onClose();
        if (onSuccess && result.data?.id) onSuccess(result.data.id);
      } catch (err: unknown) {
        const error = err as { data?: { message?: string }; message?: string };
        setErrorMessage(error.data?.message || error.message || 'Failed to create project workspace');
      }
    },
  });

  const handleNextStep = () => {
    // Validate required project name before advancing
    if (!form.state.values.projectName?.trim()) {
      setErrorMessage('Project Workspace Title is required');
      return;
    }
    setErrorMessage(null);
    stepChangedAtRef.current = Date.now();
    setStep(2);
  };

  const handlePreviousStep = () => {
    stepChangedAtRef.current = Date.now();
    setStep(1);
  };

  const handleCreateWorkspace = async () => {
    if (step !== 2 || isCreating) return;
    if (Date.now() - stepChangedAtRef.current < 600) return;
    await form.handleSubmit();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Audit Project Workspace"
      description={`Step ${step} of 2: ${
        step === 1 ? 'Scope & Historical Data Period' : 'Client & Auditee Entities'
      }`}
      size="80%"
    >
      {errorMessage && (
        <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-start gap-2.5 text-xs text-rose-500">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Wizard Progress Pill Indicator */}
      <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-200 text-xs">
        <span className={step >= 1 ? 'text-indigo-600 font-semibold' : 'text-slate-400'}>
          1. Scope & Data Range
        </span>
        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
        <span className={step >= 2 ? 'text-indigo-600 font-semibold' : 'text-slate-400'}>
          2. Client & Auditee
        </span>
      </div>

      <div
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
          }
        }}
        className="space-y-4"
      >
        {/* Step 1: Retained in DOM to prevent value loss or remount triggers */}
        <div className={step === 1 ? 'space-y-4' : 'hidden'}>
          <StepScope
            form={form}
            auditStartYear={form.state.values.auditStartYear}
            auditEndYear={form.state.values.auditEndYear}
          />
        </div>

        {/* Step 2: Retained in DOM */}
        <div className={step === 2 ? 'space-y-4' : 'hidden'}>
          <StepEntities
            form={form}
            clientEntities={clientEntities}
            auditeeEntities={auditeeEntities}
          />
        </div>

        {/* Wizard Footer Controls */}
        <div className="pt-5 border-t border-slate-200 flex items-center justify-between">
          {step > 1 ? (
            <Button
              key="btn-step-previous"
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePreviousStep}
              leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
            >
              Previous
            </Button>
          ) : <div />}

          {step === 1 ? (
            <Button
              key="btn-step-next"
              type="button"
              variant="primary"
              size="sm"
              onClick={handleNextStep}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Next: Client & Auditee
            </Button>
          ) : (
            <Button
              key="btn-step-submit"
              type="button"
              variant="primary"
              size="sm"
              isLoading={isCreating}
              onClick={handleCreateWorkspace}
              leftIcon={<FolderPlus className="w-4 h-4" />}
            >
              Create Project Workspace
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};
