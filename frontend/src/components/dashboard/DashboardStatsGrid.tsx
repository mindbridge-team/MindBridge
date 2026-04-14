import type { ReactNode } from 'react';
import { Calendar, Heart, TrendingUp } from 'lucide-react';

import { MOOD_EMOJI, MOOD_LABELS } from '../../data/moodConstants';

// Demo stats cards:
// highlight today's mood, upcoming sessions, and streak progress.
function DashboardStatCard({
  title,
  borderClassName,
  icon,
  children,
}: {
  title: string;
  borderClassName: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className={`rounded-xl border bg-card text-card-foreground gap-0 border-l-4 shadow-sm ${borderClassName}`}>
      <div className="px-4 pt-4 pb-2 space-y-0">
        <p className="text-xs font-medium flex items-center justify-between gap-2">
          {title}
          {icon}
        </p>
      </div>
      <div className="px-4 pb-4">{children}</div>
    </div>
  );
}

type DashboardStatsGridProps = {
  todaysMoodValue: number | null;
  upcomingCount: number;
  appointmentsLoading: boolean;
  streak: number;
};

export function DashboardStatsGrid({
  todaysMoodValue,
  upcomingCount,
  appointmentsLoading,
  streak,
}: DashboardStatsGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
      <DashboardStatCard
        title="Today&apos;s mood"
        borderClassName="border-l-[#4db8a8]"
        icon={<Heart className="h-3.5 w-3.5 text-[#4db8a8] shrink-0" />}
      >
        {todaysMoodValue != null ? (
          <>
            <div className="text-2xl leading-none" aria-hidden>
              {MOOD_EMOJI[todaysMoodValue]}
            </div>
            <p className="text-xs text-muted-foreground mt-1 capitalize">
              {MOOD_LABELS[todaysMoodValue]}
            </p>
          </>
        ) : (
          <>
            <div className="text-xl text-muted-foreground">—</div>
            <p className="text-xs text-muted-foreground mt-1">No entry yet</p>
          </>
        )}
      </DashboardStatCard>

      <DashboardStatCard
        title="Upcoming sessions"
        borderClassName="border-l-[#74c9b9]"
        icon={<Calendar className="h-3.5 w-3.5 text-[#74c9b9] shrink-0" />}
      >
        {appointmentsLoading ? (
          <p className="text-xs text-muted-foreground">Loading…</p>
        ) : (
          <>
            <div className="text-xl font-semibold text-foreground">{upcomingCount}</div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {upcomingCount === 0 ? 'None scheduled' : 'Scheduled'}
            </p>
          </>
        )}
      </DashboardStatCard>

      <DashboardStatCard
        title="Mood streak"
        borderClassName="border-l-primary"
        icon={<TrendingUp className="h-3.5 w-3.5 text-primary shrink-0" />}
      >
        <div className="text-xl font-semibold text-foreground">
          {streak} {streak === 1 ? 'day' : 'days'}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          {streak > 0 ? 'Keep it up!' : 'Log on Mood Tracker to start'}
        </p>
      </DashboardStatCard>
    </div>
  );
}
