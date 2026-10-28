'use client';

import React from 'react';
import { HardDrive, CheckCircle2, ShieldCheck, Building2 } from 'lucide-react';

interface DrtStatusFieldsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any;
  clientName?: string;
  auditeeName?: string;
}

export const DrtStatusFields: React.FC<DrtStatusFieldsProps> = ({
  form,
  clientName = 'BTRC',
  auditeeName = 'FHL',
}) => {
  return (
    <div className="space-y-3">
      {/* Client Tracking Statuses */}
      <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
        <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-600" />
          Client Tracking Statuses ({clientName})
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Client Google Drive Status */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
              <HardDrive className="w-3 h-3 text-slate-500" />
              Google Drive Status as per {clientName}
            </label>
            <form.Field name="clientGoogleDriveStatus">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(field: any) => (
                <select
                  value={field.state.value || 'NA'}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-xs bg-white border border-slate-200 text-slate-800 focus:outline-none focus:border-indigo-600"
                >
                  <option value="NA">NA / Not Applicable</option>
                  <option value="UPLOADED">Uploaded</option>
                  <option value="NOT_UPLOADED">Not Uploaded</option>
                </select>
              )}
            </form.Field>
          </div>

          {/* Client Status */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-slate-500" />
              Status as per {clientName}
            </label>
            <form.Field name="clientStatus">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(field: any) => (
                <select
                  value={field.state.value || 'COLLECTING_DATA'}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-xs bg-white border border-slate-200 text-slate-800 focus:outline-none focus:border-indigo-600"
                >
                  <option value="COLLECTING_DATA">Collecting Data/Info</option>
                  <option value="SHARED">Shared</option>
                  <option value="PARTIALLY_SHARED">Partially Shared</option>
                  <option value="NOT_SHARED">Not Shared</option>
                </select>
              )}
            </form.Field>
          </div>
        </div>
      </div>

      {/* Auditee Tracking Statuses */}
      <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
        <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
          <Building2 className="w-3.5 h-3.5 text-purple-600" />
          Auditee Tracking Statuses ({auditeeName})
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Auditee Google Drive Status */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
              <HardDrive className="w-3 h-3 text-slate-500" />
              Google Drive Status as per {auditeeName}
            </label>
            <form.Field name="googleDriveStatus">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(field: any) => (
                <select
                  value={field.state.value || 'NA'}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-xs bg-white border border-slate-200 text-slate-800 focus:outline-none focus:border-indigo-600"
                >
                  <option value="NA">NA / Not Applicable</option>
                  <option value="UPLOADED">Uploaded</option>
                  <option value="NOT_UPLOADED">Not Uploaded</option>
                </select>
              )}
            </form.Field>
          </div>

          {/* Auditee Status */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-slate-500" />
              Status as per {auditeeName} FY
            </label>
            <form.Field name="auditeeStatus">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(field: any) => (
                <select
                  value={field.state.value || 'COLLECTING_DATA'}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-xs bg-white border border-slate-200 text-slate-800 focus:outline-none focus:border-indigo-600"
                >
                  <option value="COLLECTING_DATA">Collecting Data/Info</option>
                  <option value="SHARED">Shared</option>
                  <option value="PARTIALLY_SHARED">Partially Shared</option>
                  <option value="NOT_SHARED">Not Shared</option>
                </select>
              )}
            </form.Field>
          </div>
        </div>
      </div>
    </div>
  );
};
