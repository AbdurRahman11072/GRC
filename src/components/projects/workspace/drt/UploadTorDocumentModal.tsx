'use client';

import React, { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { Upload, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';
import { Modal } from '../../../ui/Modal';
import { Button } from '../../../ui/Button';
import { FormField, FormTextarea } from '../../../form/FormField';
import { useSubmitTorDocumentMutation } from '../../../../store/api/torApi';
import type { ITorNode } from '../../../../types/tor.types';

export interface UploadTorDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  tor: ITorNode | null;
}

export const UploadTorDocumentModal: React.FC<UploadTorDocumentModalProps> = ({
  isOpen,
  onClose,
  tor,
}) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitTorDocument, { isLoading }] = useSubmitTorDocumentMutation();

  const form = useForm({
    defaultValues: {
      fileName: '',
      fileUrl: '',
      fileType: 'PDF Document (.pdf)',
      notes: '',
    },
    onSubmit: async ({ value }) => {
      if (!tor) return;
      setErrorMessage(null);

      if (!value.fileName || value.fileName.trim().length < 2) {
        setErrorMessage('Document title or file name is required');
        return;
      }

      try {
        await submitTorDocument({
          torId: tor.id,
          fileName: value.fileName.trim(),
          fileUrl: value.fileUrl.trim() || undefined,
          fileType: value.fileType.trim() || undefined,
          notes: value.notes.trim() || undefined,
        }).unwrap();

        form.reset();
        onClose();
      } catch (err: unknown) {
        const error = err as { data?: { message?: string }; message?: string };
        setErrorMessage(
          error.data?.message || error.message || 'Failed to submit document. Ensure you are assigned to this ToR.'
        );
      }
    },
  });

  if (!tor) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Submit Evidence Document"
      description={`Upload compliance data or document against [${tor.code}] ${tor.title}`}
      size="md"
    >
      {errorMessage && (
        <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-start gap-2.5 text-xs text-rose-400">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Target Department Indicator */}
      {tor.department && (
        <div className="mb-3 p-2.5 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-between text-xs text-purple-700">
          <span>Target Auditee Department:</span>
          <span className="font-semibold">{tor.department}</span>
        </div>
      )}

      <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit(); }} className="space-y-3.5">
        <form.Field name="fileName">
          {(field) => (
            <FormField
              field={field}
              label="Document / Evidence Name *"
              placeholder="e.g. Core_Router_Topology_Config_2026.pdf"
              required
            />
          )}
        </form.Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <form.Field name="fileType">
            {(field) => (
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Format Type
                </label>
                <select
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-xs bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-600"
                >
                  <option value="PDF Document (.pdf)">PDF Document (.pdf)</option>
                  <option value="Excel Spreadsheet (.xlsx)">Excel Spreadsheet (.xlsx)</option>
                  <option value="Word Document (.docx)">Word Document (.docx)</option>
                  <option value="Compressed Archive (.zip)">Compressed Archive (.zip)</option>
                  <option value="Configuration / Log Export (.txt)">Configuration / Log (.txt)</option>
                </select>
              </div>
            )}
          </form.Field>

          <form.Field name="fileUrl">
            {(field) => (
              <FormField
                field={field}
                label="Storage Link / File Path"
                placeholder="https://... or cloud storage URI"
              />
            )}
          </form.Field>
        </div>

        <form.Field name="notes">
          {(field) => (
            <FormTextarea
              field={field}
              label="Submission Notes & Evidence Remarks"
              placeholder="Provide context regarding which periods or requirements this evidence covers..."
              rows={3}
            />
          )}
        </form.Field>

        <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isLoading} leftIcon={<Upload className="w-4 h-4" />}>
            Submit Document
          </Button>
        </div>
      </form>
    </Modal>
  );
};
