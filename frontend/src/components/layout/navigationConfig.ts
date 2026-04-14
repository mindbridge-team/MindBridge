import {
  LayoutDashboard,
  Heart,
  Calendar,
  BookOpen,
} from 'lucide-react';
import { type NavItem } from './AppNavigation';

type AppRole = 'patient' | 'counsellor' | 'admin' | undefined;

export function getRoleBadgeLabel(role: AppRole): string {
  if (role === 'admin') return 'Admin';
  if (role === 'counsellor') return 'Counsellor';
  return '';
}

export function canViewCounsellorSessions(role: AppRole): boolean {
  return role === 'counsellor' || role === 'admin';
}

export function buildNavItems(role: AppRole): NavItem[] {
  const commonItems: NavItem[] = [
    {
      id: 'dashboard',
      sidebarLabel: 'Dashboard',
      mobileLabel: 'Home',
      icon: LayoutDashboard,
      to: '/',
    },
    {
      id: 'resources',
      sidebarLabel: 'Resources',
      mobileLabel: 'Resources',
      icon: BookOpen,
      to: '/resources',
    },
  ];

  if (role === 'patient') {
    return [
      ...commonItems,
      {
        id: 'mood',
        sidebarLabel: 'Mood Tracker',
        mobileLabel: 'Mood',
        icon: Heart,
        to: '/mood',
      },
      {
        id: 'session',
        sidebarLabel: 'Book Session',
        mobileLabel: 'Book',
        icon: Calendar,
        to: '/appointments/book',
      },
    ];
  }

  if (canViewCounsellorSessions(role)) {
    return [
      ...commonItems,
      {
        id: 'counsellor-appointments',
        sidebarLabel: 'My Sessions',
        mobileLabel: 'Sessions',
        icon: Calendar,
        to: '/appointments/counsellor',
      },
    ];
  }

  return commonItems;
}
