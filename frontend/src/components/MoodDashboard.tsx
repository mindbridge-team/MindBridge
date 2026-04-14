import { Link } from 'react-router-dom';
import {
  Heart,
  Calendar,
  BookOpen,
  Play,
  Headphones,
  Music,
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from './ui/card';
import { ErrorMessage, LoadingMessage } from './ui/feedback';
import { useAuth } from '../contexts/AuthContext';
import {
  getDashboardFeaturedResources,
  type ResourceType,
} from '../data/resourcesData';
import { formatUtcDateTime } from '../lib/dateTime';
import { mapCounsellorsById } from '../lib/appointments';
import { DashboardStatsGrid } from './dashboard/DashboardStatsGrid';
import { UpcomingSessionCard } from './dashboard/UpcomingSessionCard';
import { useDashboardData } from './dashboard/useDashboardData';
import {
  computeStreak,
  getNextAppointmentPersonLabel,
  getTodaysLatestMood,
  getUpcomingAppointments,
} from './dashboard/dashboardUtils';
import { DashboardTopBar } from './dashboard/DashboardTopBar';
import { DashboardWelcome } from './dashboard/DashboardWelcome';
import { CrisisSupportNote } from './dashboard/CrisisSupportNote';

// Demo home screen:
// quick mood summary, next session, actions, and featured resources.
const RESOURCE_TYPE_ICON: Record<ResourceType, typeof BookOpen> = {
  Article: BookOpen,
  Video: Play,
  Audio: Headphones,
  Music,
};

type WellnessResourcesSectionProps = {
  items: ReturnType<typeof getDashboardFeaturedResources>;
};

function WellnessResourcesSection({ items }: WellnessResourcesSectionProps) {
  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
        <h3 className="text-sm md:text-base font-medium">Featured resources</h3>
        <Link
          to="/resources"
          className="text-xs font-medium text-primary hover:underline"
        >
          View all resources
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {items.map((item) => {
          const Icon = RESOURCE_TYPE_ICON[item.type];
          return (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <Card className="gap-0 overflow-hidden h-full opacity-95 shadow-sm transition-shadow group-hover:shadow-md">
                <div className="relative h-32 md:h-36 overflow-hidden bg-muted">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute top-2 right-2 w-8 h-8 rounded-lg bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm">
                    <Icon className="h-4 w-4 text-primary" aria-hidden />
                  </div>
                  <div className="absolute bottom-2 left-2">
                    <Badge
                      variant="secondary"
                      className="bg-black/55 text-white border-0 text-[10px] py-0"
                    >
                      {item.type}
                    </Badge>
                  </div>
                </div>
                <CardHeader className="px-3 pt-3 pb-0">
                  <CardTitle className="text-sm group-hover:text-primary transition-colors">
                    {item.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-3 pb-3">
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {item.description}
                  </p>
                  <p className="text-xs text-primary mt-1.5">{item.duration}</p>
                </CardContent>
              </Card>
            </a>
          );
        })}
      </div>
    </div>
  );
}

function QuickActionsCard({ isPatient }: { isPatient: boolean }) {
  return (
    <Card className="gap-0 shadow-sm">
      <CardHeader className="px-4 pt-4 pb-2">
        <CardTitle className="text-base">Quick links</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-2">
        {isPatient && (
          <>
            <Button type="button" className="w-full h-9 text-sm" asChild>
              <Link to="/mood">
                <Heart className="h-3.5 w-3.5" />
                Log today&apos;s mood
              </Link>
            </Button>
            <Button type="button" variant="outline" className="w-full h-9 text-sm" asChild>
              <Link to="/appointments/book">
                <Calendar className="h-3.5 w-3.5" />
                Book a session
              </Link>
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export function MoodDashboard() {
  const { accessToken, refreshToken, persistAccessToken, me, logout } = useAuth();
  const {
    moods,
    appointments,
    counsellors,
    loadError,
    appointmentsError,
    moodsLoading,
    appointmentsLoading,
  } = useDashboardData({
    accessToken,
    refreshToken,
    persistAccessToken,
    me,
  });

  const todayLine = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const dashboardFeaturedResources = getDashboardFeaturedResources(3);

  const todaysMood = getTodaysLatestMood(moods);
  const streak = computeStreak(moods);
  const counsellorById = mapCounsellorsById(counsellors);
  const upcomingAppointments = getUpcomingAppointments(appointments);

  const nextAppointment = upcomingAppointments[0];
  const nextAppointmentsRoute =
    me?.role === 'patient' ? '/appointments/my' : '/appointments/counsellor';
  const nextAppointmentPerson = getNextAppointmentPersonLabel(
    me?.role,
    nextAppointment,
    counsellorById
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e8f4f7] via-[#f8fafb] to-[#d4e9f0]">
      <DashboardTopBar onLogout={logout} />

      <main className="max-w-7xl mx-auto px-4 py-6 pb-12 space-y-4 md:space-y-5">
        <DashboardWelcome todayLine={todayLine} />

        {loadError && <ErrorMessage>{loadError}</ErrorMessage>}

        {moodsLoading && <LoadingMessage>Loading mood history…</LoadingMessage>}

        {appointmentsError && <ErrorMessage>{appointmentsError}</ErrorMessage>}

        <DashboardStatsGrid
          todaysMoodValue={todaysMood?.mood_value ?? null}
          upcomingCount={upcomingAppointments.length}
          appointmentsLoading={appointmentsLoading}
          streak={streak}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5">
          <div className="lg:col-span-2 space-y-4 md:space-y-5">
            <UpcomingSessionCard
              loading={appointmentsLoading}
              person={nextAppointmentPerson}
              dateTimeLabel={nextAppointment ? formatUtcDateTime(nextAppointment.scheduled_time) : null}
              status={nextAppointment?.status ?? null}
              routeToAll={nextAppointmentsRoute}
            />

            <WellnessResourcesSection items={dashboardFeaturedResources} />
          </div>

          <div className="space-y-4">
            <QuickActionsCard isPatient={me?.role === 'patient'} />
          </div>
        </div>

        <CrisisSupportNote />
      </main>
    </div>
  );
}
