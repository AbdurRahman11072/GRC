'use client';

import React, { useState } from 'react';
import { Shield, Building2, Save, AlertCircle } from 'lucide-react';
import { Button } from '../../../ui/Button';
import {
  useGetEntitiesQuery,
  useCreateEntityMutation,
  useUpdateEntityMutation,
} from '../../../../store/api/crmApi';
import { useUpdateProjectMutation } from '../../../../store/api/projectApi';
import { EntityFormFields } from './EntityFormFields';
import type { IProject } from '../../../../types/project.types';

interface EditStakeholdersFormProps {
  project: IProject;
  onCancel: () => void;
  onSuccess: () => void;
}

export const EditStakeholdersForm: React.FC<EditStakeholdersFormProps> = ({
  project,
  onCancel,
  onSuccess,
}) => {
  const { data: entitiesData } = useGetEntitiesQuery();
  const allEntities = entitiesData?.data || [];
  const clientOptions = allEntities.filter((e) => e.entityType === 'CLIENT');
  const auditeeOptions = allEntities.filter((e) => e.entityType === 'AUDITEE');

  const [createEntity] = useCreateEntityMutation();
  const [updateEntity] = useUpdateEntityMutation();
  const [updateProject, { isLoading: isUpdatingProject }] = useUpdateProjectMutation();

  // Client State
  const [selectedClientId, setSelectedClientId] = useState<string>(project.clientId || '');
  const [clientName, setClientName] = useState<string>(project.client?.name || '');
  const [clientPhone, setClientPhone] = useState<string>(project.client?.phone || '');
  const [clientWebsite, setClientWebsite] = useState<string>(project.client?.website || '');
  const [clientAddress, setClientAddress] = useState<string>(project.client?.address || '');

  // Auditee State
  const [selectedAuditeeId, setSelectedAuditeeId] = useState<string>(project.auditeeId || '');
  const [auditeeName, setAuditeeName] = useState<string>(project.auditee?.name || '');
  const [auditeePhone, setAuditeePhone] = useState<string>(project.auditee?.phone || '');
  const [auditeeWebsite, setAuditeeWebsite] = useState<string>(project.auditee?.website || '');
  const [auditeeAddress, setAuditeeAddress] = useState<string>(project.auditee?.address || '');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSelectClient = (id: string) => {
    setSelectedClientId(id);
    if (!id) return;
    const found = clientOptions.find((e) => e.id === id);
    if (found) {
      setClientName(found.name);
      setClientPhone(found.phone || '');
      setClientWebsite(found.website || '');
      setClientAddress(found.address || '');
    }
  };

  const handleSelectAuditee = (id: string) => {
    setSelectedAuditeeId(id);
    if (!id) return;
    const found = auditeeOptions.find((e) => e.id === id);
    if (found) {
      setAuditeeName(found.name);
      setAuditeePhone(found.phone || '');
      setAuditeeWebsite(found.website || '');
      setAuditeeAddress(found.address || '');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!clientName.trim() || !auditeeName.trim()) {
      setErrorMsg('Both Client and Auditee organization names are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      let resolvedClientId = selectedClientId;
      let resolvedAuditeeId = selectedAuditeeId;

      // 1. Process Client Entity
      if (resolvedClientId) {
        await updateEntity({
          id: resolvedClientId,
          body: {
            name: clientName.trim(),
            phone: clientPhone.trim() || undefined,
            website: clientWebsite.trim() || undefined,
            address: clientAddress.trim() || undefined,
          },
        }).unwrap();
      } else {
        const newClient = await createEntity({
          name: clientName.trim(),
          entityType: 'CLIENT',
          phone: clientPhone.trim() || undefined,
          website: clientWebsite.trim() || undefined,
          address: clientAddress.trim() || undefined,
        }).unwrap();
        resolvedClientId = newClient.data.id;
      }

      // 2. Process Auditee Entity
      if (resolvedAuditeeId) {
        await updateEntity({
          id: resolvedAuditeeId,
          body: {
            name: auditeeName.trim(),
            phone: auditeePhone.trim() || undefined,
            website: auditeeWebsite.trim() || undefined,
            address: auditeeAddress.trim() || undefined,
          },
        }).unwrap();
      } else {
        const newAuditee = await createEntity({
          name: auditeeName.trim(),
          entityType: 'AUDITEE',
          phone: auditeePhone.trim() || undefined,
          website: auditeeWebsite.trim() || undefined,
          address: auditeeAddress.trim() || undefined,
        }).unwrap();
        resolvedAuditeeId = newAuditee.data.id;
      }

      // 3. Update project binding
      await updateProject({
        id: project.id,
        body: {
          clientId: resolvedClientId,
          auditeeId: resolvedAuditeeId,
        },
      }).unwrap();

      onSuccess();
    } catch (err: unknown) {
      const error = err as { data?: { message?: string }; message?: string };
      setErrorMsg(error.data?.message || error.message || 'Failed to update stakeholders');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errorMsg && (
        <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-700">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <EntityFormFields
          title="Client (Regulator / Commission)"
          badgeText="CLIENT CONFIGURATION"
          badgeVariant="indigo"
          icon={<Shield className="w-4 h-4 text-indigo-600" />}
          options={clientOptions}
          selectedId={selectedClientId}
          name={clientName}
          phone={clientPhone}
          website={clientWebsite}
          address={clientAddress}
          namePlaceholder="e.g. Bangladesh Telecommunication Regulatory Commission"
          onSelectEntity={handleSelectClient}
          onChangeName={setClientName}
          onChangePhone={setClientPhone}
          onChangeWebsite={setClientWebsite}
          onChangeAddress={setClientAddress}
        />

        <EntityFormFields
          title="Auditee (Target Enterprise / Operator)"
          badgeText="AUDITEE CONFIGURATION"
          badgeVariant="cyan"
          icon={<Building2 className="w-4 h-4 text-cyan-600" />}
          options={auditeeOptions}
          selectedId={selectedAuditeeId}
          name={auditeeName}
          phone={auditeePhone}
          website={auditeeWebsite}
          address={auditeeAddress}
          namePlaceholder="e.g. Fiber@Home Limited"
          onSelectEntity={handleSelectAuditee}
          onChangeName={setAuditeeName}
          onChangePhone={setAuditeePhone}
          onChangeWebsite={setAuditeeWebsite}
          onChangeAddress={setAuditeeAddress}
        />
      </div>

      <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
        <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          size="sm"
          isLoading={isSubmitting || isUpdatingProject}
          leftIcon={<Save className="w-4 h-4" />}
        >
          Save Stakeholder Entities
        </Button>
      </div>
    </form>
  );
};
