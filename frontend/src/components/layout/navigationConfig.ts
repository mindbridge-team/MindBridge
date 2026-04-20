import {
  LayoutDashboard,
  Heart,
  Calendar,
  BookOpen,
  Users,
  User,
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
      id: 'community',
      sidebarLabel: 'Community',
      mobileLabel: 'Community',
      icon: Users,
      to: '/community',
    },
    {
      id: 'resources',
      sidebarLabel: 'Resources',
      mobileLabel: 'Resources',
      icon: BookOpen,
      to: '/resources',
    },
    {
      id: 'profile',
      sidebarLabel: 'Profile',
      mobileLabel: 'Profile',
      icon: User,
      to: '/profile',
    },
  ];

  if (role === 'patient') {
    return [
      commonItems[0],
      {
        id: 'session',
        sidebarLabel: 'Book Session',
        mobileLabel: 'Book',
        icon: Calendar,
        to: '/appointments/book',
      },
      {
        id: 'mood',
        sidebarLabel: 'Mood Tracker',
        mobileLabel: 'Mood',
        icon: Heart,
        to: '/mood',
      },
      ...commonItems.slice(1),
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
