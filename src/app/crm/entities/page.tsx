'use client';

import React, { useState } from 'react';
import {
  Building2,
  PlusCircle,
  Search,
  Shield,
  Building,
  Filter,
} from 'lucide-react';
import { Shell } from '../../../components/layout/Shell';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Card } from '../../../components/ui/Card';
import { EntityCard } from '../../../components/crm/EntityCard';
import { CreateEntityModal } from '../../../components/crm/CreateEntityModal';
import { useGetEntitiesQuery } from '../../../store/api/crmApi';

export default function EntitiesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<'ALL' | 'CLIENT' | 'AUDITEE'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: entitiesData, isLoading } = useGetEntitiesQuery(
    filterType === 'ALL' ? undefined : { entityType: filterType }
  );

  const entities = entitiesData?.data || [];
  const filteredEntities = entities.filter((e) =>
    e.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const clientCount = entities.filter((e) => e.entityType === 'CLIENT').length;
  const auditeeCount = entities.filter((e) => e.entityType === 'AUDITEE').length;

  return (
    <Shell>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="indigo" size="sm">
                Corporate CRM
              </Badge>
              <Badge variant="cyan" size="sm">
                Multi-Tenant Registry
              </Badge>
            </div>
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
              Corporate Entity Directory
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Maintain regulatory clients (e.g. BTRC) and auditee operator enterprises (e.g. Fiber@Home) for IS audit compliance engagements.
            </p>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={() => setIsModalOpen(true)}
            leftIcon={<PlusCircle className="w-4 h-4" />}
          >
            + Add Corporate Entity
          </Button>
        </div>

        {/* Filter Controls Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Segmented Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-900/80 border border-slate-800/80 w-fit">
            <button
              type="button"
              onClick={() => setFilterType('ALL')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                filterType === 'ALL'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Entities ({entities.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('CLIENT')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                filterType === 'CLIENT'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-indigo-400" />
              Clients / Regulators ({clientCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('AUDITEE')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                filterType === 'AUDITEE'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-cyan-400" />
              Auditees / Operators ({auditeeCount})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search entities by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-slate-900/60 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30"
            />
          </div>
        </div>

        {/* Entities Grid */}
        {isLoading ? (
          <div className="py-12 text-center text-xs text-slate-500">
            Loading corporate entities directory...
          </div>
        ) : filteredEntities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredEntities.map((entity) => (
              <EntityCard key={entity.id} entity={entity} />
            ))}
          </div>
        ) : (
          /* Empty State */
          <Card className="p-8 text-center border-dashed border-slate-800 bg-slate-900/30 space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-slate-800/60 flex items-center justify-center text-slate-400">
              <Building className="w-6 h-6" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-sm font-semibold text-slate-200">No Corporate Entities Found</h3>
              <p className="text-xs text-slate-400">
                {searchQuery
                  ? `No entity matched the query "${searchQuery}".`
                  : 'Get started by creating your first regulator client (e.g. BTRC) or auditee operator (e.g. Fiber@Home Ltd).'}
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsModalOpen(true)}
              leftIcon={<PlusCircle className="w-4 h-4" />}
            >
              + Add Corporate Entity
            </Button>
          </Card>
        )}
      </div>

      {/* Creation Modal */}
      <CreateEntityModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </Shell>
  );
}
