'use client';

import React, { useState } from 'react';
import { Building2, Edit3, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { StakeholderCards } from './entities/StakeholderCards';
import { EditStakeholdersForm } from './entities/EditStakeholdersForm';
import type { IProject } from '../../../types/project.types';

interface TabEntitiesProps {
  project: IProject;
}

export const TabEntities: React.FC<TabEntitiesProps> = ({ project }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  return (
    <div className="space-y-6">
      {/* Tab Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="indigo" size="sm">
              Regulatory Scope
            </Badge>
            <Badge variant="cyan" size="sm">
              4-Team Boundary
            </Badge>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Client & Auditee Stakeholders
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage the regulatory client (e.g. BTRC) and audited enterprise (e.g. Fiber@Home) bound to this audit engagement.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant={isEditing ? 'outline' : 'primary'}
            size="sm"
            onClick={() => {
              setIsEditing(!isEditing);
              setShowSuccess(false);
            }}
            leftIcon={isEditing ? <Building2 className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
          >
            {isEditing ? 'View Overview Cards' : 'Edit Stakeholders Form'}
          </Button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {showSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-800">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Stakeholder entities and project bindings updated successfully!</span>
          </div>
          <button
            type="button"
            onClick={() => setShowSuccess(false)}
            className="text-emerald-700 hover:text-emerald-900 font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main View: Edit Form vs Stakeholder Overview Cards */}
      {isEditing ? (
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-indigo-50/60 border border-indigo-200 text-xs text-indigo-900 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-indigo-600" />
            <span>
              <strong>Stakeholder Form:</strong> Select an existing corporate entity from your CRM directory or edit the name, official phone, website, and physical address below. Changes will immediately update this audit engagement.
            </span>
          </div>

          <EditStakeholdersForm
            project={project}
            onCancel={() => setIsEditing(false)}
            onSuccess={() => {
              setIsEditing(false);
              setShowSuccess(true);
            }}
          />
        </div>
      ) : (
        <StakeholderCards
          project={project}
          onEdit={() => {
            setIsEditing(true);
            setShowSuccess(false);
          }}
        />
      )}
    </div>
  );
};
