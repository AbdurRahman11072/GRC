'use client';

import React, { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { Sliders, CheckCircle2, AlertCircle, Building2 } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { FormField } from '../form/FormField';
import { Badge } from '../ui/Badge';
import { useUpdateTorMutation, useSetStreamWeightsMutation } from '../../store/api/torApi';
import type { ITorNode } from '../../types/tor.types';

export interface StreamWeightModalProps {
  isOpen: boolean;
  onClose: () => void;
  torNode: ITorNode;
}

export const StreamWeightModal: React.FC<StreamWeightModalProps> = ({
  isOpen,
  onClose,
  torNode,
}) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [updateTor, { isLoading: isUpdatingTor }] = useUpdateTorMutation();
  const [setStreamWeights, { isLoading: isSettingWeights }] = useSetStreamWeightsMutation();

  const existingTeam1 = torNode.streamWeights?.find((w) => w.streamBucket === 'ADMINISTRATOR');
  const existingTeam2 = torNode.streamWeights?.find((w) => w.streamBucket === 'ORG_MEMBER');

  const form = useForm({
    defaultValues: {
      auditeeWeight: torNode.auditeeWeight ?? 0,
      clientWeight: torNode.clientWeight ?? 0,
      team1Collection: existingTeam1?.dataCollectionAllocated ?? 5,
      team1Analysis: existingTeam1?.dataAnalysisAllocated ?? 10,
      team2Collection: existingTeam2?.dataCollectionAllocated ?? 5,
      team2Analysis: existingTeam2?.dataAnalysisAllocated ?? 10,
    },
    onSubmit: async ({ value }) => {
      setErrorMessage(null);
      try {
        await updateTor({
          id: torNode.id,
          auditeeWeight: Number(value.auditeeWeight) || 0,
          clientWeight: Number(value.clientWeight) || 0,
        }).unwrap();

        await setStreamWeights({
          torId: torNode.id,
          weights: [
            {
              streamBucket: 'ADMINISTRATOR',
              dataCollectionAllocated: Number(value.team1Collection) || 0,
              dataAnalysisAllocated: Number(value.team1Analysis) || 0,
            },
            {
              streamBucket: 'ORG_MEMBER',
              dataCollectionAllocated: Number(value.team2Collection) || 0,
              dataAnalysisAllocated: Number(value.team2Analysis) || 0,
            },
          ],
        }).unwrap();

        onClose();
      } catch (err: unknown) {
        const error = err as { data?: { message?: string }; message?: string };
        setErrorMessage(
          error.data?.message || error.message || 'Failed to update stream weights'
        );
      }
    },
  });

  const isLoading = isUpdatingTor || isSettingWeights;
  const totalEnvelopeWeight =
    Number(form.state.values.auditeeWeight || 0) + Number(form.state.values.clientWeight || 0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="ToR Dual-Stream Weights & Marks"
      description={`Allocate weights and review rollup marks for [${torNode.code}] ${torNode.title}`}
      size="md"
    >
      {errorMessage && (
        <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-start gap-2.5 text-xs text-rose-400">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
        className="space-y-4"
      >
        {/* Total Envelope Banner */}
        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300">
            Combined ToR Envelope Weight:
          </span>
          <Badge variant="indigo" size="md">
            {totalEnvelopeWeight.toFixed(2)}%
          </Badge>
        </div>

        {/* FHL (Auditee Stream) Weight */}
        <div className="p-3.5 rounded-lg border border-blue-500/20 bg-blue-950/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-400 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" />
              FHL (Auditee Stream)
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              Rolled Up: {(torNode.fhlCollectionAllocated ?? 0) + (torNode.fhlAnalysisAllocated ?? 0)} marks
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <form.Field name="auditeeWeight">
              {(field) => (
                <FormField
                  field={field}
                  type="number"
                  step="0.1"
                  label="Allocated Weight %"
                  placeholder="e.g. 5.5"
                />
              )}
            </form.Field>

            <form.Field name="team2Collection">
              {(field) => (
                <FormField
                  field={field}
                  type="number"
                  step="0.5"
                  label="Collection Base Marks"
                  placeholder="5.0"
                />
              )}
            </form.Field>
          </div>
        </div>

        {/* BTRC (Client Stream) Weight */}
        <div className="p-3.5 rounded-lg border border-violet-500/20 bg-violet-950/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-violet-400 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" />
              BTRC (Client Stream)
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              Rolled Up: {(torNode.btrcCollectionAllocated ?? 0) + (torNode.btrcAnalysisAllocated ?? 0)} marks
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <form.Field name="clientWeight">
              {(field) => (
                <FormField
                  field={field}
                  type="number"
                  step="0.1"
                  label="Allocated Weight %"
                  placeholder="e.g. 4.0"
                />
              )}
            </form.Field>

            <form.Field name="team1Collection">
              {(field) => (
                <FormField
                  field={field}
                  type="number"
                  step="0.5"
                  label="Collection Base Marks"
                  placeholder="5.0"
                />
              )}
            </form.Field>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isLoading}
            leftIcon={<CheckCircle2 className="w-4 h-4" />}
          >
            Save Weights
          </Button>
        </div>
      </form>
    </Modal>
  );
};
