'use client';

import React from 'react';
import { Building2, Globe, Phone, MapPin, Shield, CheckCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import type { ICrmEntity } from '../../types/project.types';

interface EntityCardProps {
  entity: ICrmEntity;
  onManageContacts?: (entity: ICrmEntity) => void;
}

export const EntityCard: React.FC<EntityCardProps> = ({ entity, onManageContacts }) => {
  const isClient = entity.entityType === 'CLIENT';

  return (
    <Card hoverEffect className="flex flex-col justify-between border-slate-200 bg-white shadow-2xs">
      <CardHeader>
        <div className="flex items-center justify-between gap-2 mb-2">
          <Badge variant={isClient ? 'indigo' : 'cyan'} size="xs" dot>
            {isClient ? 'REGULATOR (CLIENT)' : 'OPERATOR (AUDITEE)'}
          </Badge>
          <span className="text-[11px] text-slate-500 font-mono">
            {new Date(entity.createdAt).toLocaleDateString()}
          </span>
        </div>

        <div className="flex items-start gap-3">
          <div
            className={`p-2.5 rounded-lg shrink-0 ${
              isClient ? 'bg-indigo-50 text-indigo-600 border border-indigo-200' : 'bg-cyan-50 text-cyan-600 border border-cyan-200'
            }`}
          >
            {isClient ? <Shield className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
          </div>
          <div className="min-w-0">
            <CardTitle className="text-base text-slate-900 font-semibold truncate">
              {entity.name}
            </CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              {isClient ? 'Overseeing Regulatory Authority' : 'Enterprise under IS Audit'}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-2.5 pt-0 text-xs text-slate-600 border-t border-slate-100 mt-3 pt-3">
        {entity.phone && (
          <div className="flex items-center gap-2 text-slate-700">
            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{entity.phone}</span>
          </div>
        )}

        {entity.website && (
          <div className="flex items-center gap-2 text-slate-700">
            <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <a
              href={entity.website.startsWith('http') ? entity.website : `https://${entity.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-700 hover:underline truncate"
            >
              {entity.website}
            </a>
          </div>
        )}

        {entity.address && (
          <div className="flex items-start gap-2 text-slate-700">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
            <span className="line-clamp-2">{entity.address}</span>
          </div>
        )}

        <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-100">
          <span className="flex items-center gap-1 font-mono text-[11px] text-slate-500">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            Active
          </span>
          {onManageContacts && (
            <button
              type="button"
              onClick={() => onManageContacts(entity)}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-md transition-colors"
            >
              Contacts & Team →
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
