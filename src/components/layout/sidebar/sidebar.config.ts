import React from 'react';
import {
  LayoutDashboard,
  FolderKanban,
  Building2,
  Layers,
  FileCheck,
  GitBranch,
  Network,
  Users,
  Settings,
  UserCircle,
} from 'lucide-react';

export interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const navSections: NavSection[] = [
  {
    title: 'Workspaces',
    items: [
      {
        name: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
      },
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
    ],
  },
  {
    title: 'Compliance Engine',
    items: [
      {
        name: 'ToR Management',
        href: '/tors',
        icon: Layers,
      },
      {
        name: 'DRT Requests',
        href: '/drt',
        icon: FileCheck,
      },
      {
        name: '4-Team Roster',
        href: '/team',
        icon: GitBranch,
      },
      {
        name: 'Departments',
        href: '/departments',
        icon: Network,
      },
    ],
  },
  {
    title: 'Administration',
    items: [
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
    ],
  },
];
