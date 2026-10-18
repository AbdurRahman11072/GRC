'use client';

import React, { useState } from 'react';
import {
  Users,
  Shield,
  Building2,
  CheckCircle2,
  Copy,
  Check,
} from 'lucide-react';
import { Modal } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { AssignFirmStaffTab } from './assign/AssignFirmStaffTab';
import { AssignExternalContactTab } from './assign/AssignExternalContactTab';
import type { ProjectRole } from '../../../types/project.types';

export interface AssignMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  clientId?: string;
  auditeeId?: string;
  clientName?: string;
  auditeeName?: string;
  defaultRole?: ProjectRole;
  existingMemberUserIds?: string[];
}

export const AssignMemberModal: React.FC<AssignMemberModalProps> = ({
  isOpen,
  onClose,
  projectId,
  clientId,
  auditeeId,
  clientName,
  auditeeName,
  defaultRole = 'ORG_MEMBER',
  existingMemberUserIds = [],
}) => {
  const [activeTab, setActiveTab] = useState<'FIRM_STAFF' | 'CLIENT' | 'AUDITEE'>(
    defaultRole === 'CLIENT' ? 'CLIENT' : defaultRole === 'AUDITEE' ? 'AUDITEE' : 'FIRM_STAFF'
  );
  const [copied, setCopied] = useState(false);
  const [provisionedInfo, setProvisionedInfo] = useState<{
    name: string;
    email: string;
    password?: string;
    role: string;
  } | null>(null);

  const handleCopy = () => {
    if (!provisionedInfo) return;
    const text = `Zio Tech GRC Portal Access:\nName: ${provisionedInfo.name}\nEmail: ${provisionedInfo.email}\n${provisionedInfo.password ? `Temporary Password: ${provisionedInfo.password}\n` : ''}Role: ${provisionedInfo.role}\nLogin: ${window.location.origin}/login`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setProvisionedInfo(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={provisionedInfo ? 'Member Assigned to Project' : 'Add Project Member'}
      description={
        provisionedInfo
          ? 'Member has been successfully added to this workspace'
          : 'Assign auditors from your firm pool or external contacts from regulator / auditee'
      }
      size="md"
    >
      {provisionedInfo ? (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                <CheckCircle2 className="w-4 h-4" /> Successfully Assigned
              </span>
              <Badge variant="cyan" size="xs">{provisionedInfo.role}</Badge>
            </div>

            <div className="p-3 rounded-lg bg-white border border-emerald-200 space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-sans">Name:</span>
                <span className="text-slate-900 font-bold">{provisionedInfo.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-sans">Login Email:</span>
                <span className="text-cyan-700 font-bold">{provisionedInfo.email}</span>
              </div>
              {provisionedInfo.password && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-sans">Temporary Password:</span>
                  <span className="text-emerald-700 font-bold">{provisionedInfo.password}</span>
                </div>
              )}
            </div>
            {provisionedInfo.password && (
              <p className="text-[11px] text-slate-600">
                Share these login credentials with the user for their portal access.
              </p>
            )}
          </div>

          <div className="flex items-center justify-between pt-2">
            {provisionedInfo.password ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopy}
                leftIcon={copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              >
                {copied ? 'Copied to Clipboard!' : 'Copy Credentials'}
              </Button>
            ) : <div />}
            <Button type="button" variant="primary" size="sm" onClick={handleClose}>
              Done
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Top 3-Category Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {[
              { id: 'FIRM_STAFF' as const, label: 'Audit Team', icon: Users },
              { id: 'CLIENT' as const, label: 'Client (Regulator)', icon: Shield },
              { id: 'AUDITEE' as const, label: 'Auditee (Enterprise)', icon: Building2 },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-2 px-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    isActive ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab 1: Internal Firm Staff */}
          {activeTab === 'FIRM_STAFF' && (
            <AssignFirmStaffTab
              projectId={projectId}
              existingMemberUserIds={existingMemberUserIds}
              onSuccess={(info) => info && setProvisionedInfo(info)}
              onCancel={handleClose}
            />
          )}

          {/* Tab 2: Client Regulator */}
          {activeTab === 'CLIENT' && (
            <AssignExternalContactTab
              projectId={projectId}
              target="CLIENT"
              entityId={clientId}
              entityName={clientName}
              existingMemberUserIds={existingMemberUserIds}
              onSuccess={(info) => info && setProvisionedInfo(info)}
              onCancel={handleClose}
            />
          )}

          {/* Tab 3: Auditee Enterprise */}
          {activeTab === 'AUDITEE' && (
            <AssignExternalContactTab
              projectId={projectId}
              target="AUDITEE"
              entityId={auditeeId}
              entityName={auditeeName}
              existingMemberUserIds={existingMemberUserIds}
              onSuccess={(info) => info && setProvisionedInfo(info)}
              onCancel={handleClose}
            />
          )}
        </div>
      )}
    </Modal>
  );
};
