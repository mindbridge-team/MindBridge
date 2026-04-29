import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  Heart,
  MessageCircle,
  LogOut,
} from 'lucide-react';

import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ChatBubble } from './ChatBubble';
import { useAuth } from '../contexts/AuthContext';
import { BRAND_GRADIENT, BRAND_SURFACE_BADGE, BRAND_TEXT, PRIMARY_BUTTON_COLORS } from '../lib/ui';
import {
  MobileBottomNavigation,
  SidebarNavigation,
} from './layout/AppNavigation';
import {
  buildNavItems,
  getRoleBadgeLabel,
} from './layout/navigationConfig';

const PRIMARY_BUTTON_CLASSES = `${PRIMARY_BUTTON_COLORS} h-8 text-xs`;

type AppRole = 'patient' | 'counsellor' | 'admin';

function normalizeRole(role?: string): AppRole {
  if (role === 'counsellor' || role === 'counselor') {
    return 'counsellor';
  }

  if (role === 'admin') {
    return 'admin';
  }

  return 'patient';
}

export function MainLayout() {
  const { logout, me } = useAuth();
  const [chatOpen, setChatOpen] = useState(false);
  const userRole: AppRole = normalizeRole(me?.role);

  const roleBadgeLabel = getRoleBadgeLabel(userRole);
  const navItems = buildNavItems(userRole);

  return (
    <div className="flex h-[100dvh] min-h-0 w-full bg-background">
      <aside className="hidden md:flex w-56 shrink-0 bg-sidebar border-r border-sidebar-border flex-col">
        <div className="p-4 border-b border-sidebar-border">
          <NavLink
            to="/"
            className="flex items-center gap-2 rounded-lg outline-none hover:opacity-90 transition-opacity focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div className={`w-7 h-7 rounded-lg ${BRAND_GRADIENT} flex items-center justify-center text-white shrink-0`}>
              <Heart className="h-4 w-4" fill="currentColor" />
            </div>
            <span className={`text-lg font-semibold ${BRAND_TEXT}`}>MindBridge</span>
          </NavLink>

          {me?.username && (
            <div className="mt-3 flex items-center gap-2">
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground leading-none">Signed in as</p>
                <p className="text-sm font-medium text-foreground truncate">{me.username}</p>
              </div>
              {roleBadgeLabel && (
                <Badge variant="secondary" className={BRAND_SURFACE_BADGE}>
                  {roleBadgeLabel}
                </Badge>
              )}
            </div>
          )}
        </div>

        <nav className="flex-1 p-3 overflow-y-auto">
          <SidebarNavigation navItems={navItems} />
        </nav>

        <div className="p-3 border-t border-sidebar-border mt-auto">
          <div className="bg-[#e8f4f7] rounded-lg p-3 mb-2">
            <p className="text-xs mb-1 font-medium">Need immediate support?</p>
            <p className="text-xs text-muted-foreground mb-2">
              Our 24/7 chatbot is here to help
            </p>
            <Button
              size="sm"
              className={`w-full ${PRIMARY_BUTTON_CLASSES}`}
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

      <div className="flex-1 flex flex-col min-h-0 min-w-0">
        <div className="md:hidden sticky top-0 z-30 flex justify-between items-center gap-3 px-3 py-2.5 bg-white/90 backdrop-blur-sm border-b border-border/60">
          {me?.username ? (
            <div className="min-w-0 flex items-center gap-2">
              <p className="text-xs font-medium text-foreground truncate">{me.username}</p>
              {roleBadgeLabel && (
                <Badge variant="secondary" className={BRAND_SURFACE_BADGE}>
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
            className={`${BRAND_TEXT} h-8 text-xs`}
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

        <nav
          className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-border shadow-[0_-4px_12px_rgba(0,0,0,0.06)] pb-[max(0.5rem,env(safe-area-inset-bottom))]"
          aria-label="Primary"
        >
          <MobileBottomNavigation navItems={navItems} />
        </nav>

        <ChatBubble
          open={chatOpen}
          onOpenChange={setChatOpen}
          role={userRole}
        />
      </div>
    </div>
  );
}
