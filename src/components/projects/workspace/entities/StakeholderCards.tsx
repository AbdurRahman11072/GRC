'use client';

import React from 'react';
import {
  Building2,
  Shield,
  Phone,
  Globe,
  MapPin,
  CheckCircle2,
  Edit3,
  Users,
  ExternalLink,
} from 'lucide-react';
import { Card } from '../../../ui/Card';
import { Badge } from '../../../ui/Badge';
import { Button } from '../../../ui/Button';
import type { IProject } from '../../../../types/project.types';

interface StakeholderCardsProps {
  project: IProject;
  onEdit: () => void;
}

export const StakeholderCards: React.FC<StakeholderCardsProps> = ({ project, onEdit }) => {
  const client = project.client;
  const auditee = project.auditee;
  const clientMembers = (project.members || []).filter((m) => m.teamBucket === 'CLIENT');
  const auditeeMembers = (project.members || []).filter((m) => m.teamBucket === 'AUDITEE');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            Active Stakeholder Boundaries
          </h3>
          <p className="text-xs text-slate-500">
            Assigned regulatory client and auditee enterprise currently bound to this audit.
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={onEdit} leftIcon={<Edit3 className="w-3.5 h-3.5" />}>
          Edit Stakeholders
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Client (Regulator) Organization Card */}
        <Card className="border-indigo-200 bg-white p-5 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <Badge variant="indigo" size="xs" dot>CLIENT (REGULATORY BODY)</Badge>
            <span className="text-[11px] text-slate-500 font-mono">Oversight Authority</span>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200 shrink-0">
              <Shield className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-bold text-slate-900 leading-snug">
                {client?.name || 'Bangladesh Telecommunication Regulatory Commission (BTRC)'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Commissioning regulatory authority holding statutory oversight over IS audit findings.
              </p>
            </div>
          </div>

          {/* Contact Details Grid */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Organization Contact & Location Profile
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1">
                  <Globe className="w-3 h-3 text-slate-500" /> Website
                </span>
                {client?.website ? (
                  <a
                    href={client.website.startsWith('http') ? client.website : `https://${client.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-700 font-medium hover:underline flex items-center gap-1 truncate"
                  >
                    {client.website} <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                  </a>
                ) : (
                  <span className="text-slate-400 italic text-[11px]">Not configured</span>
                )}
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1">
                  <Phone className="w-3 h-3 text-slate-500" /> Official Phone
                </span>
                <span className="text-slate-800 font-medium">{client?.phone || 'Not configured'}</span>
              </div>

              <div className="col-span-1 sm:col-span-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-500" /> Registered Headquarters
                </span>
                <span className="text-slate-800">{client?.address || 'No physical address recorded'}</span>
              </div>
            </div>
          </div>

          {/* Regulatory Representatives */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <Users className="w-3 h-3 text-indigo-600" /> Regulatory Representatives ({clientMembers.length})
            </div>
            {clientMembers.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {clientMembers.map((m) => (
                  <span key={m.id} className="px-2 py-0.5 rounded-md text-[11px] bg-indigo-50 text-indigo-700 border border-indigo-200 truncate max-w-[220px]">
                    {m.user?.name || m.user?.email} {m.user?.designation ? `• ${m.user.designation}` : ''}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-[11px] text-slate-400 italic">No representatives assigned yet.</span>
            )}
          </div>

          <div className="pt-2 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span className="font-mono text-[11px]">CRM ID: {project.clientId?.slice(0, 13)}...</span>
            <span className="flex items-center gap-1 text-emerald-600 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> Bound to Engagement
            </span>
          </div>
        </Card>

        {/* Auditee (Operator) Organization Card */}
        <Card className="border-cyan-200 bg-white p-5 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <Badge variant="cyan" size="xs" dot>AUDITEE (INSPECTED OPERATOR)</Badge>
            <span className="text-[11px] text-slate-500 font-mono">Target Enterprise</span>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-3 rounded-xl bg-cyan-50 text-cyan-700 border border-cyan-200 shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-bold text-slate-900 leading-snug">
                {auditee?.name || 'Fiber@Home Limited (FHL)'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Subject audited operator responsible for providing historical telecom, billing, and network records.
              </p>
            </div>
          </div>

          {/* Contact Details Grid */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Organization Contact & Location Profile
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1">
                  <Globe className="w-3 h-3 text-slate-500" /> Website
                </span>
                {auditee?.website ? (
                  <a
                    href={auditee.website.startsWith('http') ? auditee.website : `https://${auditee.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-700 font-medium hover:underline flex items-center gap-1 truncate"
                  >
                    {auditee.website} <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                  </a>
                ) : (
                  <span className="text-slate-400 italic text-[11px]">Not configured</span>
                )}
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1">
                  <Phone className="w-3 h-3 text-slate-500" /> Official Phone
                </span>
                <span className="text-slate-800 font-medium">{auditee?.phone || 'Not configured'}</span>
              </div>

              <div className="col-span-1 sm:col-span-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-500" /> Registered Headquarters
                </span>
                <span className="text-slate-800">{auditee?.address || 'No physical address recorded'}</span>
              </div>
            </div>
          </div>

          {/* Auditee Representatives */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <Users className="w-3 h-3 text-emerald-600" /> Auditee Representatives ({auditeeMembers.length})
            </div>
            {auditeeMembers.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {auditeeMembers.map((m) => (
                  <span key={m.id} className="px-2 py-0.5 rounded-md text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200 truncate max-w-[220px]">
                    {m.user?.name || m.user?.email} {m.user?.designation ? `• ${m.user.designation}` : ''}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-[11px] text-slate-400 italic">No representatives assigned yet.</span>
            )}
          </div>

          <div className="pt-2 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span className="font-mono text-[11px]">CRM ID: {project.auditeeId?.slice(0, 13)}...</span>
            <span className="flex items-center gap-1 text-emerald-600 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> Bound to Engagement
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
};
