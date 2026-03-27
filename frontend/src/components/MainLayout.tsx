import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Heart,
  Calendar,
  BookOpen,
  Users,
  MessageCircle,
  User,
  LogOut,
} from 'lucide-react';

import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ChatBubble } from './ChatBubble';
import { useAuth } from '../contexts/AuthContext';

export function MainLayout() {
  const { logout, me } = useAuth();
  const [chatOpen, setChatOpen] = useState(false);
  const isCounsellor = me?.role === 'counsellor';
  const isAdmin = me?.role === 'admin';
  const isPatient = me?.role === 'patient';
  const roleBadgeLabel =
    me?.role === 'admin' ? 'Admin' : me?.role === 'counsellor' ? 'Counsellor' : '';

  const sidebarNav: {
    id: string;
    label: string;
    icon: typeof LayoutDashboard;
    to?: string;
  }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, to: '/' },
    ...(isPatient
      ? [{ id: 'mood', label: 'Mood Tracker', icon: Heart, to: '/mood' } as const]
      : []),
    ...(isPatient
      ? [{ id: 'session', label: 'Book Session', icon: Calendar, to: '/appointments/book' } as const]
      : []),
    ...(isCounsellor || isAdmin
      ? [
          {
            id: 'counsellor-appointments',
            label: 'My Sessions',
            icon: Calendar,
            to: '/appointments/counsellor',
          } as const,
        ]
      : []),
    { id: 'resources', label: 'Resources', icon: BookOpen, to: '/resources' },
    { id: 'community', label: 'Community', icon: Users },
    { id: 'chatbot', label: 'Chatbot', icon: MessageCircle },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const mobileBottomNav: {
    id: string;
    label: string;
    icon: typeof LayoutDashboard;
    to?: string;
  }[] = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard, to: '/' },
    ...(isPatient ? [{ id: 'mood', label: 'Mood', icon: Heart, to: '/mood' } as const] : []),
    ...(isPatient ? [{ id: 'session', label: 'Book', icon: Calendar, to: '/appointments/book' } as const] : []),
    ...(isCounsellor || isAdmin
      ? [
          {
            id: 'counsellor-appointments',
            label: 'Sessions',
            icon: Calendar,
            to: '/appointments/counsellor',
          } as const,
        ]
      : []),
    { id: 'resources', label: 'Resources', icon: BookOpen, to: '/resources' },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="flex h-[100dvh] min-h-0 w-full bg-background">
      {/* Desktop sidebar — matches MindBridge Dashboard Design */}
      <aside className="hidden md:flex w-56 shrink-0 bg-sidebar border-r border-sidebar-border flex-col">
        <div className="p-4 border-b border-sidebar-border">
          <NavLink
            to="/"
            className="flex items-center gap-2 rounded-lg outline-none hover:opacity-90 transition-opacity focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#4db8a8] to-[#2d7a8f] flex items-center justify-center text-white shrink-0">
              <Heart className="h-4 w-4" fill="currentColor" />
            </div>
            <span className="text-lg font-semibold text-[#2d7a8f]">MindBridge</span>
          </NavLink>

          {me?.username && (
            <div className="mt-3 flex items-center gap-2">
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground leading-none">Signed in as</p>
                <p className="text-sm font-medium text-foreground truncate">{me.username}</p>
              </div>
              {roleBadgeLabel && (
                <Badge variant="secondary" className="bg-[#e8f4f7] text-[#236272] border-[#cfe7ee]">
                  {roleBadgeLabel}
                </Badge>
              )}
            </div>
          )}
        </div>

        <nav className="flex-1 p-3 overflow-y-auto">
          <ul className="space-y-1">
            {sidebarNav.map((item) => {
              const Icon = item.icon;
              if (item.to) {
                return (
                  <li key={item.id}>
                    <NavLink
                      to={item.to}
                      end={item.to === '/'}
                      className={({ isActive }) =>
                        `w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-colors text-sm ${
                          isActive
                            ? 'bg-[#2d7a8f] text-white'
                            : 'text-sidebar-foreground hover:bg-sidebar-accent'
                        }`
                      }
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{item.label}</span>
                    </NavLink>
                  </li>
                );
              }
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    disabled
                    title="Coming soon"
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-muted-foreground opacity-60 cursor-not-allowed text-left"
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-3 border-t border-sidebar-border mt-auto">
          <div className="bg-[#e8f4f7] rounded-lg p-3 mb-2">
            <p className="text-xs mb-1 font-medium">Need immediate support?</p>
            <p className="text-xs text-muted-foreground mb-2">
              Our 24/7 chatbot is here to help
            </p>
            <Button
              size="sm"
              className="w-full bg-[#2d7a8f] hover:bg-[#236272] h-8 text-xs"
              type="button"
              onClick={() => setChatOpen(true)}
            >
              <MessageCircle className="h-3.5 w-3.5" />
              Start Chat
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full h-8 text-xs"
            onClick={logout}
          >
            <LogOut className="h-3.5 w-3.5" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main scroll area */}
      <div className="flex-1 flex flex-col min-h-0 min-w-0">
        {/* Mobile: logout (design puts it in sidebar / hamburger; we use a slim top bar) */}
        <div className="md:hidden sticky top-0 z-30 flex justify-between items-center gap-3 px-3 py-2.5 bg-white/90 backdrop-blur-sm border-b border-border/60">
          {me?.username ? (
            <div className="min-w-0 flex items-center gap-2">
              <p className="text-xs font-medium text-foreground truncate">{me.username}</p>
              {roleBadgeLabel && (
                <Badge variant="secondary" className="bg-[#e8f4f7] text-[#236272] border-[#cfe7ee]">
                  {roleBadgeLabel}
                </Badge>
              )}
            </div>
          ) : (
            <span />
          )}
          <Button
            variant="ghost"
            size="sm"
            className="text-[#2d7a8f] h-8 text-xs"
            onClick={logout}
          >
            <LogOut className="h-3.5 w-3.5" />
            Log out
          </Button>
        </div>
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-[#e8f4f7] via-[#f8fafb] to-[#d4e9f0] min-h-0">
          <div className="max-w-7xl mx-auto px-4 md:px-6 pt-3 md:pt-6 pb-24 md:pb-6 min-h-full">
            <Outlet />
          </div>
        </main>

        {/* Mobile bottom navigation — matches design (Home, Mood, Book, Resources, Profile) */}
        <nav
          className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-border shadow-[0_-4px_12px_rgba(0,0,0,0.06)] pb-[max(0.5rem,env(safe-area-inset-bottom))]"
          aria-label="Primary"
        >
          <div className="flex items-center justify-around py-2 px-1 max-w-lg mx-auto">
            {mobileBottomNav.map((item) => {
              const Icon = item.icon;
              if (item.to) {
                return (
                  <NavLink
                    key={item.id}
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) =>
                      `flex flex-col items-center gap-0.5 py-2 px-2 rounded-lg min-w-0 flex-1 transition-colors ${
                        isActive ? 'text-[#2d7a8f]' : 'text-gray-500'
                      }`
                    }
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    <span className="text-[10px] font-medium truncate w-full text-center">
                      {item.label}
                    </span>
                  </NavLink>
                );
              }
              return (
                <button
                  key={item.id}
                  type="button"
                  disabled
                  title="Coming soon"
                  className="flex flex-col items-center gap-0.5 py-2 px-2 rounded-lg min-w-0 flex-1 text-gray-400 opacity-60 cursor-not-allowed"
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span className="text-[10px] font-medium truncate w-full text-center">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>

        <ChatBubble open={chatOpen} onOpenChange={setChatOpen} />
      </div>
    </div>
  );
}
