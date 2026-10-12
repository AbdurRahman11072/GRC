'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { navSections } from './sidebar.config';

interface SidebarNavProps {
  isCollapsed: boolean;
  onItemClick?: () => void;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  isCollapsed,
  onItemClick,
}) => {
  const pathname = usePathname();

  return (
    <nav className="p-3 space-y-4 overflow-y-auto flex-1">
      {navSections.map((section, idx) => (
        <div key={section.title} className="space-y-1">
          {!isCollapsed ? (
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-3 py-1">
              {section.title}
            </div>
          ) : idx > 0 ? (
            <div className="border-t border-slate-800/80 my-2" />
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
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm shadow-indigo-600/10'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 border border-transparent'
                } ${isCollapsed ? 'justify-center px-0' : ''}`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-400' : ''}`} />
                {!isCollapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
};
