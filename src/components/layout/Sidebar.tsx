'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppSelector } from '../../store/hooks';
import { Badge } from '../ui/Badge';
import { SidebarNav } from './sidebar/SidebarNav';
import { SidebarUserProfile } from './sidebar/SidebarUserProfile';

export interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
}) => {
  const { organizations, currentOrgId } = useAppSelector((state) => state.auth);
  const activeOrg = organizations.find((o) => o.orgId === currentOrgId) || organizations[0];

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 bg-slate-900/95 border-r border-slate-800 transition-all duration-300 flex flex-col justify-between ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Top Brand Header */}
          <div className="h-16 px-4 border-b border-slate-800 flex items-center justify-between shrink-0">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 overflow-hidden select-none"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-600/20 shrink-0">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              {!isCollapsed && (
                <div className="truncate">
                  <div className="font-bold text-sm tracking-tight text-slate-100 truncate">
                    Zio Tech <span className="text-cyan-400">GRC</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium truncate">
                    Enterprise IS Audit
                  </div>
                </div>
              )}
            </Link>

            {/* Collapse toggle (desktop only) */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
              title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Current Organization Info (when expanded) */}
          {!isCollapsed && activeOrg && (
            <div className="p-3 mx-3 my-2.5 rounded-xl bg-slate-850/60 border border-slate-800/80 shrink-0">
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-0.5">
                Active Tenant
              </div>
              <div className="text-xs font-semibold text-slate-200 truncate">
                {activeOrg.orgName}
              </div>
              <div className="mt-1 flex items-center gap-1.5">
                <Badge variant="cyan" size="xs">
                  {activeOrg.orgRole}
                </Badge>
              </div>
            </div>
          )}

          {/* Nav links component */}
          <SidebarNav
            isCollapsed={isCollapsed}
            onItemClick={() => setIsMobileOpen(false)}
          />
        </div>

        {/* Bottom user profile component */}
        <SidebarUserProfile isCollapsed={isCollapsed} />
      </aside>
    </>
  );
};
