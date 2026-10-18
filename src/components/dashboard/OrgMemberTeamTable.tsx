'use client';

import React from 'react';
import { Users } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import type { IProjectMember } from '../../types/project.types';

interface OrgMemberTeamTableProps {
  members: IProjectMember[];
}

export const OrgMemberTeamTable: React.FC<OrgMemberTeamTableProps> = ({ members }) => {
  return (
    <Card className="p-4 bg-white border-slate-200 shadow-2xs space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-purple-600" />
          <h4 className="text-sm font-bold text-slate-900">
            Project Team & Stakeholders ({members.length})
          </h4>
        </div>
        <span className="text-[11px] text-slate-500">Cross-Team Collaboration</span>
      </div>

      {members.length === 0 ? (
        <p className="text-xs text-slate-400 py-3 text-center">No other members currently assigned.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 text-[11px] uppercase">
                <th className="py-2 pr-4 font-semibold">Stakeholder</th>
                <th className="py-2 pr-4 font-semibold">Role Bucket</th>
                <th className="py-2 pr-4 font-semibold">Designation</th>
                <th className="py-2 font-semibold">Contact Email</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {members.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/60">
                  <td className="py-2 pr-4 font-bold text-slate-900">
                    {m.user?.name || 'Unnamed Member'}
                  </td>
                  <td className="py-2 pr-4">
                    <Badge
                      variant={
                        m.teamBucket === 'ADMINISTRATOR'
                          ? 'indigo'
                          : m.teamBucket === 'ORG_MEMBER'
                          ? 'cyan'
                          : m.teamBucket === 'CLIENT'
                          ? 'neutral'
                          : 'success'
                      }
                      size="xs"
                    >
                      {m.teamBucket === 'ORG_MEMBER'
                        ? 'Org Auditor'
                        : m.teamBucket === 'CLIENT'
                        ? 'Client Regulator'
                        : m.teamBucket === 'AUDITEE'
                        ? 'Auditee Enterprise'
                        : 'Administrator'}
                    </Badge>
                  </td>
                  <td className="py-2 pr-4 text-slate-500">{m.user?.designation || 'Staff'}</td>
                  <td className="py-2 font-mono text-[11px] text-slate-600">{m.user?.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
};
