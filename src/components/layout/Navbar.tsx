'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Menu,
  Building,
  Check,
  ChevronDown,
  LogOut,
  User,
  ExternalLink,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setCurrentOrgId } from '../../store/slices/authSlice';
import { useLogoutUserMutation } from '../../store/api/authApi';
import { Badge } from '../ui/Badge';

interface NavbarProps {
  onToggleMobileSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleMobileSidebar }) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, organizations, currentOrgId } = useAppSelector((state) => state.auth);
  const [logoutUser] = useLogoutUserMutation();

  const [isOrgDropdownOpen, setIsOrgDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const orgDropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  const activeOrg = organizations.find((o) => o.orgId === currentOrgId) || organizations[0];

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (orgDropdownRef.current && !orgDropdownRef.current.contains(e.target as Node)) {
        setIsOrgDropdownOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOrgSwitch = (orgId: string) => {
    dispatch(setCurrentOrgId(orgId));
    setIsOrgDropdownOpen(false);
    // Optionally reload or refetch active project context
    router.refresh();
  };

  const handleSignOut = async () => {
    try {
      await logoutUser().unwrap();
    } catch {
      // Ignored
    } finally {
      router.push('/login');
    }
  };

  return (
    <header className="h-16 px-6 glass-panel border-b border-slate-800/80 sticky top-0 z-30 flex items-center justify-between">
      {/* Left Mobile Menu Toggle + Breadcrumbs */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          aria-label="Toggle navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Organization Switcher Dropdown */}
        <div className="relative" ref={orgDropdownRef}>
          <button
            onClick={() => setIsOrgDropdownOpen(!isOrgDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-200 transition-all select-none"
          >
            <Building className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="max-w-[140px] sm:max-w-[200px] truncate">
              {activeOrg?.orgName || 'Select Organization'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </button>

          {/* Org dropdown menu */}
          {isOrgDropdownOpen && (
            <div className="absolute left-0 mt-2 w-64 glass-panel bg-slate-900/98 border border-slate-750 rounded-xl shadow-2xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-2 border-b border-slate-800 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Switch Organization
              </div>
              <div className="max-h-56 overflow-y-auto p-1">
                {organizations.map((org) => {
                  const isSelected = org.orgId === currentOrgId;
                  return (
                    <button
                      key={org.orgId}
                      onClick={() => handleOrgSwitch(org.orgId)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-left transition-colors ${
                        isSelected
                          ? 'bg-indigo-600/20 text-indigo-300'
                          : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                      }`}
                    >
                      <div className="truncate pr-2">
                        <div className="truncate font-semibold">{org.orgName}</div>
                        <div className="text-[10px] text-slate-400">{org.orgRole}</div>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right User Navigation Actions */}
      <div className="flex items-center gap-3">
        {/* Pilot Badge */}
        <Badge variant="cyan" size="sm" className="hidden sm:inline-flex">
          BTRC & FHL Audit
        </Badge>

        {/* User Profile Avatar Dropdown */}
        <div className="relative" ref={userDropdownRef}>
          <button
            onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
            className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-800/60 transition-colors select-none"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-500 flex items-center justify-center font-bold text-xs text-white shadow-sm shadow-indigo-500/20">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="hidden md:block text-left text-xs">
              <div className="font-semibold text-slate-200 truncate max-w-[120px]">
                {user?.name || 'User Profile'}
              </div>
              <div className="text-[10px] text-slate-400">
                {activeOrg?.orgRole || 'Auditor'}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:block" />
          </button>

          {/* User menu dropdown */}
          {isUserDropdownOpen && (
            <div className="absolute right-0 mt-2 w-52 glass-panel bg-slate-900/98 border border-slate-750 rounded-xl shadow-2xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-2 border-b border-slate-800">
                <div className="text-xs font-semibold text-slate-200 truncate">
                  {user?.name || 'User'}
                </div>
                <div className="text-[11px] text-slate-400 truncate">{user?.email}</div>
              </div>

              <div className="p-1 space-y-0.5">
                <button
                  onClick={() => {
                    setIsUserDropdownOpen(false);
                    router.push('/settings/profile');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors text-left"
                >
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  Account Settings
                </button>
                <a
                  href="/api/v1/health"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors text-left"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  API Health
                </a>
              </div>

              <div className="p-1 border-t border-slate-800">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-colors text-left"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-400" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
