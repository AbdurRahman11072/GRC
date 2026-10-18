'use client';

import React from 'react';
import { Shell } from '../../../components/layout/Shell';
import { Badge } from '../../../components/ui/Badge';
import { useAppSelector } from '../../../store/hooks';
import { useGetMeQuery } from '../../../store/api/authApi';
import { ProfileInfoCard } from '../../../components/profile/ProfileInfoCard';
import { PasswordChangeCard } from '../../../components/profile/PasswordChangeCard';
import { ProfileMembershipsCard } from '../../../components/profile/ProfileMembershipsCard';
import { User, Shield, Calendar, Mail, Sparkles, Building2 } from 'lucide-react';

export default function ProfilePage() {
  // Trigger getMe to ensure up-to-date state
  useGetMeQuery();

  const { user, organizations, currentOrgId } = useAppSelector((state) => state.auth);
  const activeOrg = organizations.find((o) => o.orgId === currentOrgId) || organizations[0];

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      const parts = name.trim().split(' ');
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }
      return name.slice(0, 2).toUpperCase();
    }
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return 'U';
  };

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : null;

  return (
    <Shell>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Profile Hero Header Banner */}
        <div className="rounded-2xl p-6 md:p-8 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white relative overflow-hidden shadow-xl border border-slate-800">
          <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              {/* User Avatar Circle */}
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-500 to-cyan-400 p-0.5 shadow-xl shrink-0">
                <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-2xl font-bold tracking-tight text-white shadow-inner">
                  {getInitials(user?.name, user?.email)}
                </div>
              </div>

              {/* User Details */}
              <div className="space-y-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
                    {user?.name || 'User Profile'}
                  </h1>
                  {user?.isSuperAdmin && (
                    <Badge variant="indigo" size="xs">
                      <Sparkles className="w-3 h-3 mr-1 inline" />
                      SuperAdmin
                    </Badge>
                  )}
                  <Badge variant={user?.isActive ? 'success' : 'danger'} size="xs" dot>
                    {user?.isActive ? 'Active' : 'Suspended'}
                  </Badge>
                </div>

                <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{user?.email}</span>
                  </div>

                  {user?.designation && (
                    <div className="flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{user.designation}</span>
                    </div>
                  )}

                  {memberSince && (
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Joined {memberSince}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Current Workspace Quick Info */}
            {activeOrg && (
              <div className="bg-slate-800/70 border border-slate-700/80 rounded-xl px-4 py-3 shrink-0 backdrop-blur-sm shadow-sm">
                <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                  Active Workspace
                </div>
                <div className="text-sm font-semibold text-white">{activeOrg.orgName}</div>
                <div className="text-xs text-indigo-300 font-medium mt-0.5">Role: {activeOrg.orgRole}</div>
              </div>
            )}
          </div>
        </div>

        {/* Profile Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Column: Personal Info & Password Settings */}
          <div className="lg:col-span-7 space-y-6">
            <ProfileInfoCard user={user} />
            <PasswordChangeCard />
          </div>

          {/* Side Column: Organizations & Assigned Projects */}
          <div className="lg:col-span-5 space-y-6">
            <ProfileMembershipsCard
              user={user}
              organizations={organizations}
              currentOrgId={currentOrgId}
            />
          </div>
        </div>
      </div>
    </Shell>
  );
}
