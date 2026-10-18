'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { navSections } from './sidebar.config';
import { useAppSelector } from '../../../store/hooks';

interface SidebarNavProps {
  isCollapsed: boolean;
  onItemClick?: () => void;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  isCollapsed,
  onItemClick,
}) => {
  const pathname = usePathname();
  const { user, organizations, currentOrgId } = useAppSelector((state) => state.auth);
  const activeOrg = organizations.find((o) => o.orgId === currentOrgId) || organizations[0];
  const isOrgAdmin =
    user?.isSuperAdmin || activeOrg?.orgRole === 'OWNER' || activeOrg?.orgRole === 'ADMIN';

  const visibleSections = React.useMemo(() => {
    if (isOrgAdmin) return navSections;
    return navSections
      .map((section) => ({
        ...section,
        items: section.items.filter((item) => {
          // Hide admin-only routes for non-admin members
          if (item.href === '/crm/entities') return false;
          if (item.href === '/organization/members') return false;
          if (item.href === '/organization/settings') return false;
          return true;
        }),
      }))
      .filter((section) => section.items.length > 0);
  }, [isOrgAdmin]);

  return (
    <nav className="p-3 space-y-4 overflow-y-auto flex-1">
      {visibleSections.map((section, idx) => (
        <div key={section.title} className="space-y-1">
          {!isCollapsed ? (
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-3 py-1">
              {section.title}
            </div>
          ) : idx > 0 ? (
            <div className="border-t border-slate-200 my-2" />
          ) : null}

          {section.items.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onItemClick}
                title={isCollapsed ? item.name : undefined}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
                } ${isCollapsed ? 'justify-center px-0' : ''}`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-600' : 'text-slate-500'}`} />
                {!isCollapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
};
