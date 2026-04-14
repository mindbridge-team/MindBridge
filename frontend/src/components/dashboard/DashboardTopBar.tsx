import { Heart, LogOut } from 'lucide-react';

import { Button } from '../ui/button';

type DashboardTopBarProps = {
  onLogout: () => void;
};

export function DashboardTopBar({ onLogout }: DashboardTopBarProps) {
  return (
    <header className="border-b border-border/50 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#4db8a8] to-[#2d7a8f] flex items-center justify-center text-white">
            <Heart className="h-5 w-5" fill="currentColor" />
          </div>
          <h1 className="text-lg font-semibold text-primary">MindBridge</h1>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onLogout}
          className="text-primary hover:bg-secondary"
        >
          <LogOut className="h-4 w-4 mr-1" />
          Log out
        </Button>
      </div>
    </header>
  );
}
