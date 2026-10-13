'use client';

import React, { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { Sliders, CheckCircle2, AlertCircle, Percent } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { FormField } from '../form/FormField';
import { Badge } from '../ui/Badge';
import { useSetStreamWeightsMutation } from '../../store/api/torApi';
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
  const [setStreamWeights, { isLoading }] = useSetStreamWeightsMutation();

  const existingTeam1 = torNode.streamWeights?.find((w) => w.streamBucket === 'ADMINISTRATOR');
  const existingTeam2 = torNode.streamWeights?.find((w) => w.streamBucket === 'ORG_MEMBER');

  const form = useForm({
    defaultValues: {
      team1Collection: existingTeam1?.dataCollectionAllocated ?? 5,
      team1Analysis: existingTeam1?.dataAnalysisAllocated ?? 10,
      team2Collection: existingTeam2?.dataCollectionAllocated ?? 5,
      team2Analysis: existingTeam2?.dataAnalysisAllocated ?? 10,
    },
    onSubmit: async ({ value }) => {
      setErrorMessage(null);
      try {
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
          error.data?.message || error.message || 'Failed to update stream marks'
        );
      }
    },
  });

  const totalMarks =
    Number(form.state.values.team1Collection || 0) +
    Number(form.state.values.team1Analysis || 0) +
    Number(form.state.values.team2Collection || 0) +
    Number(form.state.values.team2Analysis || 0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Stream Marks & Weight Allocation"
      description={`Allocate audit marks for [${torNode.code}] ${torNode.title}`}
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
        {/* Total Marks Banner */}
        <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-700">
            Total Allocated Marks for this ToR:
          </span>
          <Badge variant="indigo" size="md">
            {totalMarks.toFixed(1)} Marks
          </Badge>
        </div>

        {/* Stream 1: Administrator (Regulatory / Oversight Unit) */}
        <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/70 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-indigo-700">
              Stream 1 — Regulatory Unit (BTRC Focus)
            </span>
            <Badge variant="indigo" size="xs">ADMINISTRATOR</Badge>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <form.Field name="team1Collection">
              {(field) => (
                <FormField
                  field={field}
                  type="number"
                  step="0.5"
                  label="Data Collection Marks"
                  placeholder="5.0"
                />
              )}
            </form.Field>

            <form.Field name="team1Analysis">
              {(field) => (
                <FormField
                  field={field}
                  type="number"
                  step="0.5"
                  label="Data Analysis Marks"
                  placeholder="10.0"
                />
              )}
            </form.Field>
          </div>
        </div>

        {/* Stream 2: Org Member (Operational Unit) */}
        <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/70 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-cyan-800">
              Stream 2 — Operational Unit (FHL Focus)
            </span>
            <Badge variant="cyan" size="xs">ORG_MEMBER</Badge>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <form.Field name="team2Collection">
              {(field) => (
                <FormField
                  field={field}
                  type="number"
                  step="0.5"
                  label="Data Collection Marks"
                  placeholder="5.0"
                />
              )}
            </form.Field>

            <form.Field name="team2Analysis">
              {(field) => (
                <FormField
                  field={field}
                  type="number"
                  step="0.5"
                  label="Data Analysis Marks"
                  placeholder="10.0"
                />
              )}
            </form.Field>
          </div>
        </div>

        {/* Modal Action Controls */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
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
            Save Weight Allocation
          </Button>
        </div>
      </form>
    </Modal>
  );
};
