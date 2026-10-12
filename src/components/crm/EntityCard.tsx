'use client';

import React from 'react';
import { Building2, Globe, Phone, MapPin, Shield, CheckCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import type { ICrmEntity } from '../../types/project.types';

interface EntityCardProps {
  entity: ICrmEntity;
}

export const EntityCard: React.FC<EntityCardProps> = ({ entity }) => {
  const isClient = entity.entityType === 'CLIENT';

  return (
    <Card hoverEffect className="flex flex-col justify-between border-slate-800/80 bg-slate-900/60">
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
              isClient ? 'bg-indigo-500/10 text-indigo-400' : 'bg-cyan-500/10 text-cyan-400'
            }`}
          >
            {isClient ? <Shield className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
          </div>
          <div className="min-w-0">
            <CardTitle className="text-base text-slate-100 font-semibold truncate">
              {entity.name}
            </CardTitle>
            <p className="text-xs text-slate-400 mt-0.5">
              {isClient ? 'Overseeing Regulatory Authority' : 'Enterprise under IS Audit'}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-2.5 pt-0 text-xs text-slate-400 border-t border-slate-800/60 mt-3 pt-3">
        {entity.phone && (
          <div className="flex items-center gap-2 text-slate-300">
            <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="truncate">{entity.phone}</span>
          </div>
        )}

        {entity.website && (
          <div className="flex items-center gap-2 text-slate-300">
            <Globe className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <a
              href={entity.website.startsWith('http') ? entity.website : `https://${entity.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:underline truncate"
            >
              {entity.website}
            </a>
          </div>
        )}

        {entity.address && (
          <div className="flex items-start gap-2 text-slate-300">
            <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
            <span className="line-clamp-2">{entity.address}</span>
          </div>
        )}

        <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1 font-mono">
            <CheckCircle className="w-3 h-3 text-emerald-400" />
            Active Entity
          </span>
          <span className="font-mono text-[10px] text-slate-600 truncate max-w-[140px]">
            {entity.id}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
