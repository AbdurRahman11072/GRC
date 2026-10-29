'use client';

import React from 'react';
import { Users, Shield, UserCheck, Building2, Mail, Briefcase, UserPlus } from 'lucide-react';
import { Button } from '../../../../ui/Button';
import type { IDRTTicket } from '../../../../../types/project.types';

export interface DrtDetailsSquadProps {
  ticket: IDRTTicket;
  clientName?: string;
  auditeeName?: string;
  onManageSquad?: () => void;
}

export const DrtDetailsSquad: React.FC<DrtDetailsSquadProps> = ({
  ticket,
  clientName = 'BTRC',
  auditeeName = 'FHL',
  onManageSquad,
}) => {
  const squadMembers = [
    {
      role: 'Lead Supervisor',
      user: ticket.supervisor,
      color: 'border-purple-200 bg-purple-50/40 text-purple-700',
      badgeBg: 'bg-purple-100 text-purple-800',
      icon: Shield,
      fallbackText: 'Assign Supervisor',
    },
    {
      role: 'Field Member (Auditor)',
      user: ticket.fieldMember,
      color: 'border-blue-200 bg-blue-50/40 text-blue-700',
      badgeBg: 'bg-blue-100 text-blue-800',
      icon: UserCheck,
      fallbackText: 'Assign Field Auditor',
    },
    {
      role: `Client Focal (${clientName})`,
      user: ticket.clientContact,
      color: 'border-cyan-200 bg-cyan-50/40 text-cyan-700',
      badgeBg: 'bg-cyan-100 text-cyan-800',
      icon: Building2,
      fallbackText: `Assign ${clientName} Contact`,
    },
    {
      role: `Auditee Focal (${auditeeName})`,
      user: ticket.auditeeContact,
      color: 'border-amber-200 bg-amber-50/40 text-amber-700',
      badgeBg: 'bg-amber-100 text-amber-800',
      icon: Building2,
      fallbackText: `Assign ${auditeeName} Contact`,
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-indigo-600" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            4-Party Collaborative Squad
          </h2>
        </div>
        {onManageSquad && (
          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={onManageSquad}
            leftIcon={<UserPlus className="w-3.5 h-3.5" />}
          >
            Manage Squad
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {squadMembers.map((member) => {
          const Icon = member.icon;
          return (
            <div
              key={member.role}
              className={`p-3 rounded-lg border flex flex-col justify-between space-y-2.5 transition-colors ${member.color}`}
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${member.badgeBg}`}>
                    {member.role}
                  </span>
                  <Icon className="w-3.5 h-3.5 opacity-70" />
                </div>

                {member.user ? (
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-900 truncate" title={member.user.name}>
                      {member.user.name}
                    </p>
                    <div className="flex items-center gap-1 text-[11px] text-slate-500 truncate" title={member.user.email}>
                      <Mail className="w-3 h-3 shrink-0 text-slate-400" />
                      <span className="truncate">{member.user.email}</span>
                    </div>
                    {member.user.designation && (
                      <div className="flex items-center gap-1 text-[10px] text-slate-500 truncate">
                        <Briefcase className="w-3 h-3 shrink-0 text-slate-400" />
                        <span className="truncate">{member.user.designation}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-2 text-center">
                    <span className="text-[11px] text-slate-400 italic block">
                      {member.fallbackText}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
