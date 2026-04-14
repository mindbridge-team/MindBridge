import type { LucideIcon } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { BRAND_TEXT } from '../../lib/ui';

// Demo navigation:
// show the right sidebar and mobile links from one shared config.
type NavItem = {
  id: string;
  icon: LucideIcon;
  to?: string;
  sidebarLabel: string;
  mobileLabel: string;
  isVisible: boolean;
  showInSidebar?: boolean;
  showInMobile?: boolean;
};

type NavigationProps = {
  navItems: NavItem[];
};

export function SidebarNavigation({ navItems }: NavigationProps) {
  const visibleSidebarItems = navItems.filter((item) => item.isVisible && item.showInSidebar !== false);

  return (
    <ul className="space-y-1">
      {visibleSidebarItems.map((item) => {
        const Icon = item.icon;
        if (item.to) {
          return (
            <li key={item.id}>
              <NavLink
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-colors text-sm ${
                    isActive ? 'bg-[#2d7a8f] text-white' : 'text-sidebar-foreground hover:bg-sidebar-accent'
                  }`
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.sidebarLabel}</span>
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
              <span>{item.sidebarLabel}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export function MobileBottomNavigation({ navItems }: NavigationProps) {
  const visibleMobileItems = navItems.filter((item) => item.isVisible && item.showInMobile !== false);
  return (
    <div className="flex items-center justify-around py-2 px-1 max-w-lg mx-auto">
      {visibleMobileItems.map((item) => {
        const Icon = item.icon;
        if (item.to) {
          return (
            <NavLink
              key={item.id}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 py-2 px-2 rounded-lg min-w-0 flex-1 transition-colors ${
                  isActive ? BRAND_TEXT : 'text-gray-500'
                }`
              }
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="text-[10px] font-medium truncate w-full text-center">
                {item.mobileLabel}
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
            <span className="text-[10px] font-medium truncate w-full text-center">{item.mobileLabel}</span>
          </button>
        );
      })}
    </div>
  );
}

export type { NavItem };
