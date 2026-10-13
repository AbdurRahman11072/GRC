'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../ui/Card';
import { Badge } from '../../../ui/Badge';
import type { ICrmEntity } from '../../../../types/project.types';

interface EntityFormFieldsProps {
  title: string;
  badgeText: string;
  badgeVariant: 'indigo' | 'cyan';
  icon: React.ReactNode;
  options: ICrmEntity[];
  selectedId: string;
  name: string;
  phone: string;
  website: string;
  address: string;
  namePlaceholder: string;
  onSelectEntity: (id: string) => void;
  onChangeName: (v: string) => void;
  onChangePhone: (v: string) => void;
  onChangeWebsite: (v: string) => void;
  onChangeAddress: (v: string) => void;
}

export const EntityFormFields: React.FC<EntityFormFieldsProps> = ({
  title,
  badgeText,
  badgeVariant,
  icon,
  options,
  selectedId,
  name,
  phone,
  website,
  address,
  namePlaceholder,
  onSelectEntity,
  onChangeName,
  onChangePhone,
  onChangeWebsite,
  onChangeAddress,
}) => {
  return (
    <Card className={`border-${badgeVariant}-200 bg-white shadow-2xs`}>
      <CardHeader className="pb-3 border-b border-slate-100">
        <div className="flex items-center justify-between mb-1">
          <Badge variant={badgeVariant} size="xs" dot>
            {badgeText}
          </Badge>
          <span className="text-[11px] text-slate-500 font-mono">Engagement Boundary</span>
        </div>
        <CardTitle className="text-base text-slate-900 flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3 pt-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Link Existing CRM Entity (Optional)
          </label>
          <select
            value={selectedId}
            onChange={(e) => onSelectEntity(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-600"
          >
            <option value="">-- Create New / Custom Entity --</option>
            {options.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Organization Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => onChangeName(e.target.value)}
            placeholder={namePlaceholder}
            required
            className="w-full px-3 py-2 text-xs rounded-lg bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-600"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => onChangePhone(e.target.value)}
              placeholder="+880 2-22221111"
              className="w-full px-3 py-2 text-xs rounded-lg bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-600"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Website</label>
            <input
              type="text"
              value={website}
              onChange={(e) => onChangeWebsite(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-3 py-2 text-xs rounded-lg bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-600"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Headquarters Address</label>
          <textarea
            value={address}
            onChange={(e) => onChangeAddress(e.target.value)}
            placeholder="Official physical address / headquarters..."
            rows={2}
            className="w-full px-3 py-2 text-xs rounded-lg bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-600"
          />
        </div>
      </CardContent>
    </Card>
  );
};
