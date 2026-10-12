'use client';

import React from 'react';
import Link from 'next/link';
import { useAppSelector } from '../../../store/hooks';

interface SidebarUserProfileProps {
  isCollapsed: boolean;
}

export const SidebarUserProfile: React.FC<SidebarUserProfileProps> = ({ isCollapsed }) => {
  const { user } = useAppSelector((state) => state.auth);

  return (
    <div className="p-3 border-t border-slate-800 shrink-0">
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
  );
};
