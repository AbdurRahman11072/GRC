'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShieldCheck,
  FolderKanban,
  Building2,
  Users,
  Settings,
  UserCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAppSelector } from '../../store/hooks';
import { Badge } from '../ui/Badge';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

const navItems = [
  {
    name: 'Audit Projects',
    href: '/projects',
    icon: FolderKanban,
  },
  {
    name: 'CRM Directory',
    href: '/crm/entities',
    icon: Building2,
  },
  {
    name: 'Staff & Members',
    href: '/organization/members',
    icon: Users,
  },
  {
    name: 'Organization',
    href: '/organization/settings',
    icon: Settings,
  },
  {
    name: 'My Profile',
    href: '/settings/profile',
    icon: UserCircle,
  },
];

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
}) => {
  const pathname = usePathname();
  const { user, organizations, currentOrgId } = useAppSelector((state) => state.auth);

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
        {/* Top Brand Header */}
        <div>
          <div className="h-16 px-4 border-b border-slate-800 flex items-center justify-between">
            <Link
              href="/projects"
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
            <div className="p-3 mx-3 my-3 rounded-xl bg-slate-850/60 border border-slate-800/80">
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                Active Tenant
              </div>
              <div className="text-xs font-semibold text-slate-200 truncate">
                {activeOrg.orgName}
              </div>
              <div className="mt-1.5 flex items-center gap-1.5">
                <Badge variant="cyan" size="xs">
                  {activeOrg.orgRole}
                </Badge>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== '/projects' && pathname.startsWith(item.href)) ||
                (item.href === '/projects' && pathname.startsWith('/projects'));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  title={isCollapsed ? item.name : undefined}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm shadow-indigo-600/10'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 border border-transparent'
                  } ${isCollapsed ? 'justify-center px-0' : ''}`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-400' : ''}`} />
                  {!isCollapsed && <span>{item.name}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Profile Section */}
        <div className="p-3 border-t border-slate-800">
          <Link
            href="/settings/profile"
            className={`flex items-center gap-3 p-2 rounded-xl hover:bg-slate-800/60 transition-colors ${
              isCollapsed ? 'justify-center' : ''
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-xs text-white shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            {!isCollapsed && (
              <div className="truncate">
                <div className="text-xs font-medium text-slate-200 truncate">
                  {user?.name || 'Authenticated User'}
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  {user?.email || 'user@firm.com'}
                </div>
              </div>
            )}
          </Link>
        </div>
      </aside>
    </>
  );
};
