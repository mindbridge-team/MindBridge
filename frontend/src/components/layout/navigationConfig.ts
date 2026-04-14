import {
  LayoutDashboard,
  Heart,
  Calendar,
  BookOpen,
  Users,
  MessageCircle,
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
  const isPatient = role === 'patient';
  const canSeeCounsellorSessions = canViewCounsellorSessions(role);

  return [
    {
      id: 'dashboard',
      sidebarLabel: 'Dashboard',
      mobileLabel: 'Home',
      icon: LayoutDashboard,
      to: '/',
      isVisible: true,
    },
    {
      id: 'mood',
      sidebarLabel: 'Mood Tracker',
      mobileLabel: 'Mood',
      icon: Heart,
      to: '/mood',
      isVisible: isPatient,
    },
    {
      id: 'session',
      sidebarLabel: 'Book Session',
      mobileLabel: 'Book',
      icon: Calendar,
      to: '/appointments/book',
      isVisible: isPatient,
    },
    {
      id: 'counsellor-appointments',
      sidebarLabel: 'My Sessions',
      mobileLabel: 'Sessions',
      icon: Calendar,
      to: '/appointments/counsellor',
      isVisible: canSeeCounsellorSessions,
    },
    {
      id: 'resources',
      sidebarLabel: 'Resources',
      mobileLabel: 'Resources',
      icon: BookOpen,
      to: '/resources',
      isVisible: true,
    },
    {
      id: 'community',
      sidebarLabel: 'Community',
      mobileLabel: 'Community',
      icon: Users,
      isVisible: true,
      showInMobile: false,
    },
    {
      id: 'chatbot',
      sidebarLabel: 'Chatbot',
      mobileLabel: 'Chatbot',
      icon: MessageCircle,
      isVisible: true,
      showInMobile: false,
    },
    {
      id: 'profile',
      sidebarLabel: 'Profile',
      mobileLabel: 'Profile',
      icon: User,
      isVisible: true,
    },
  ];
}
