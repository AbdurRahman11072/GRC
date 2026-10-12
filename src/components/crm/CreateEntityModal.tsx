'use client';

import React, { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { Building2, Shield, AlertCircle, PlusCircle } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { FormField, FormTextarea } from '../form/FormField';
import { useCreateEntityMutation } from '../../store/api/crmApi';

export interface CreateEntityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (entityId: string) => void;
}

export const CreateEntityModal: React.FC<CreateEntityModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createEntity, { isLoading }] = useCreateEntityMutation();

  const form = useForm({
    defaultValues: {
      name: '',
      entityType: 'CLIENT' as 'CLIENT' | 'AUDITEE',
      phone: '',
      website: '',
      address: '',
    },
    onSubmit: async ({ value }) => {
      setErrorMessage(null);
      if (!value.name || value.name.trim().length < 2) {
        setErrorMessage('Corporate entity name must be at least 2 characters');
        return;
      }

      try {
        const res = await createEntity({
          name: value.name.trim(),
          entityType: value.entityType,
          phone: value.phone.trim() || undefined,
          website: value.website.trim() || undefined,
          address: value.address.trim() || undefined,
        }).unwrap();

        form.reset();
        onClose();
        if (onSuccess && res.data?.id) {
          onSuccess(res.data.id);
        }
      } catch (err: unknown) {
        const error = err as { data?: { message?: string }; message?: string };
        setErrorMessage(
          error.data?.message || error.message || 'Failed to create corporate entity'
        );
      }
    },
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Corporate Entity"
      description="Register a client regulator or auditee enterprise in the multi-tenant directory"
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
        {/* Entity Type Toggle */}
        <form.Field name="entityType">
          {(field) => (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Entity Category
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => field.handleChange('CLIENT')}
                  className={`p-3 rounded-lg border text-left flex items-start gap-2.5 transition-all ${
                    field.state.value === 'CLIENT'
                      ? 'border-indigo-500 bg-indigo-500/15 text-indigo-300 ring-1 ring-indigo-500/30'
                      : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Shield className="w-4 h-4 mt-0.5 text-indigo-400 shrink-0" />
                  <div>
                    <div className="text-xs font-semibold text-slate-200">Client (Regulator)</div>
                    <div className="text-[10px] text-slate-400">e.g. BTRC or Oversight Body</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => field.handleChange('AUDITEE')}
                  className={`p-3 rounded-lg border text-left flex items-start gap-2.5 transition-all ${
                    field.state.value === 'AUDITEE'
                      ? 'border-cyan-500 bg-cyan-500/15 text-cyan-300 ring-1 ring-cyan-500/30'
                      : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Building2 className="w-4 h-4 mt-0.5 text-cyan-400 shrink-0" />
                  <div>
                    <div className="text-xs font-semibold text-slate-200">Auditee (Operator)</div>
                    <div className="text-[10px] text-slate-400">e.g. Fiber@Home Ltd</div>
                  </div>
                </button>
              </div>
            </div>
          )}
        </form.Field>

        {/* Entity Name */}
        <form.Field name="name">
          {(field) => (
            <FormField
              field={field}
              label="Corporate Entity Name *"
              placeholder="e.g. Bangladesh Telecommunication Regulatory Commission"
              required
            />
          )}
        </form.Field>

        {/* Phone & Website Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <form.Field name="phone">
            {(field) => (
              <FormField
                field={field}
                label="Official Phone"
                placeholder="+880 2-22221111"
              />
            )}
          </form.Field>

          <form.Field name="website">
            {(field) => (
              <FormField
                field={field}
                label="Website URL"
                placeholder="https://btrc.gov.bd"
              />
            )}
          </form.Field>
        </div>

        {/* Physical Address */}
        <form.Field name="address">
          {(field) => (
            <FormTextarea
              field={field}
              label="Physical Headquarters Address"
              placeholder="Plot: E-5/A, Agargaon Administrative Area, Sher-e-Bangla Nagar, Dhaka-1207"
              rows={2}
            />
          )}
        </form.Field>

        {/* Modal Action Buttons */}
        <div className="pt-4 border-t border-slate-800/80 flex items-center justify-end gap-3">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isLoading}
            leftIcon={<PlusCircle className="w-4 h-4" />}
          >
            Create Entity
          </Button>
        </div>
      </form>
    </Modal>
  );
};
