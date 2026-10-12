'use client';

import React from 'react';
import Link from 'next/link';
import {
  FolderKanban,
  FileCheck,
  Building2,
  Users,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Shell } from '../../components/layout/Shell';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { useAppSelector } from '../../store/hooks';

export default function DashboardPage() {
  const { user, organizations, currentOrgId } = useAppSelector((state) => state.auth);
  const activeOrg = organizations.find((o) => o.orgId === currentOrgId) || organizations[0];

  return (
    <Shell>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="cyan" size="sm" dot>
                {activeOrg?.orgName || 'Active Workspace'}
              </Badge>
              <Badge variant="indigo" size="sm">
                IS Audit Platform
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
              Executive GRC Overview
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Welcome back, <span className="text-slate-200 font-medium">{user?.name || 'Lead Auditor'}</span>. Monitor multi-year telecom compliance and manage team workflows.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link href="/projects">
              <Button
                variant="primary"
                size="sm"
                leftIcon={<FolderKanban className="w-4 h-4" />}
              >
                Launch Projects
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Launchpad Action Buttons */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs uppercase font-bold tracking-wider text-slate-400">
              Quick Action Launchpad
            </h2>
            <span className="text-[11px] text-slate-500">Fast Workflow Access</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Link href="/projects" className="group">
              <Card hoverEffect className="p-4 flex flex-col justify-between h-28 border-indigo-500/20 bg-indigo-950/10">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400 group-hover:scale-110 transition-transform">
                    <FolderKanban className="w-4 h-4" />
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-200">+ New Project</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Start Audit Scope</div>
                </div>
              </Card>
            </Link>

            <Link href="/drt" className="group">
              <Card hoverEffect className="p-4 flex flex-col justify-between h-28 border-cyan-500/20 bg-cyan-950/10">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-lg bg-cyan-600/20 text-cyan-400 group-hover:scale-110 transition-transform">
                    <FileCheck className="w-4 h-4" />
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-200">+ New DRT Ticket</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Request Evidence</div>
                </div>
              </Card>
            </Link>

            <Link href="/crm/entities" className="group">
              <Card hoverEffect className="p-4 flex flex-col justify-between h-28 border-emerald-500/20 bg-emerald-950/10">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-lg bg-emerald-600/20 text-emerald-400 group-hover:scale-110 transition-transform">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-200">+ Add CRM Entity</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Regulator / Auditee</div>
                </div>
              </Card>
            </Link>

            <Link href="/organization/members" className="group">
              <Card hoverEffect className="p-4 flex flex-col justify-between h-28 border-purple-500/20 bg-purple-950/10">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-lg bg-purple-600/20 text-purple-400 group-hover:scale-110 transition-transform">
                    <Users className="w-4 h-4" />
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-purple-400 transition-colors" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-200">+ Invite Staff</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Team Provisioning</div>
                </div>
              </Card>
            </Link>
          </div>
        </div>

        {/* Macro KPI Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Audit Projects</span>
              <FolderKanban className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-bold text-slate-100 tabular-nums">1</div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
              <Badge variant="cyan" size="xs">ACTIVE</Badge>
              <span>BTRC & FHL Audit</span>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">DRT Requests</span>
              <FileCheck className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-bold text-slate-100 tabular-nums">48</div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>SLA tracking enabled</span>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">ToR WBS Nodes</span>
              <Layers className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-slate-100 tabular-nums">12</div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Hierarchical tree</span>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">4-Team Model</span>
              <ShieldCheck className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-slate-100 tabular-nums">4</div>
            <div className="text-[11px] text-slate-400 mt-1">
              <span>ORG_1,2 & CLIENT_1,2</span>
            </div>
          </Card>
        </div>

        {/* Operational Focus Banner */}
        <Card className="p-6 border-indigo-500/20 bg-gradient-to-r from-slate-900/90 via-slate-900/80 to-indigo-950/30">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1 max-w-2xl">
              <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                Pilot Engagement Scope
              </div>
              <h3 className="text-lg font-bold text-slate-100">
                BTRC & Fiber@Home Limited IS Audit (2009–2024)
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Active regulatory boundary between Org Team 1 (Regulatory Unit) and Client Team 1 (Regulator/BTRC), and operational auditing between Org Team 2 and Client Team 2 (Auditee/FHL departments).
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Link href="/projects">
                <Button variant="primary" size="md">
                  View Workspace
                </Button>
              </Link>
              <Link href="/tors">
                <Button variant="outline" size="md">
                  ToR Tree
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </Shell>
  );
}
