import type { LucideIcon } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { BRAND_TEXT } from '../../lib/ui';

// Demo navigation:
// show the right sidebar and mobile links from one shared config.
type NavItem = {
  id: string;
  icon: LucideIcon;
  to: string;
  sidebarLabel: string;
  mobileLabel: string;
};

type NavigationProps = {
  navItems: NavItem[];
};

export function SidebarNavigation({ navItems }: NavigationProps) {
  return (
    <ul className="space-y-1">
      {navItems.map((item) => {
        const Icon = item.icon;
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
      })}
    </ul>
  );
}

export function MobileBottomNavigation({ navItems }: NavigationProps) {
  return (
    <div className="flex items-center justify-around py-2 px-1 max-w-lg mx-auto">
      {navItems.map((item) => {
        const Icon = item.icon;
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
            <span className="text-[10px] font-medium truncate w-full text-center">{item.mobileLabel}</span>
          </NavLink>
        );
      })}
    </div>
  );
}

export type { NavItem };
