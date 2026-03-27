import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  LogOut,
  Calendar,
  TrendingUp,
  MessageCircle,
  BookOpen,
  Users,
  Play,
  Headphones,
  Music,
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import { useAuth } from '../contexts/AuthContext';
import {
  getCounsellorAppointments,
  getCounsellors,
  getMoods,
  getMyAppointments,
  type Appointment,
  type Counsellor,
  type MoodEntry,
} from '../lib/api';
import {
  getDashboardFeaturedResources,
  type ResourceType,
} from '../data/resourcesData';
import { MOOD_EMOJI, MOOD_LABELS } from '../data/moodConstants';

function formatDayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function getTodaysLatestMood(moods: MoodEntry[]): MoodEntry | null {
  const today = new Date();
  const todays = moods.filter((m) => isSameDay(new Date(m.created_at), today));
  if (todays.length === 0) return null;
  return [...todays].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )[0];
}

function computeStreak(moods: MoodEntry[]): number {
  if (moods.length === 0) return 0;
  const daySet = new Set(
    moods.map((m) => formatDayKey(new Date(m.created_at)))
  );
  const today = new Date();
  const cursor = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const todayKey = formatDayKey(cursor);
  if (!daySet.has(todayKey)) {
    cursor.setDate(cursor.getDate() - 1);
  }
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const key = formatDayKey(cursor);
    if (daySet.has(key)) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

function parseApiDate(value: string): Date | null {
  const raw = value?.trim?.() ?? '';
  if (!raw) return null;
  const hasTz = /([zZ]|[+-]\d{2}:\d{2})$/.test(raw);
  const d = new Date(hasTz ? raw : `${raw}Z`);
  return Number.isFinite(d.getTime()) ? d : null;
}

function formatUtcDateTime(value: string): string {
  const d = parseApiDate(value);
  if (!d) return value;
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'UTC',
  });
}

function getResourceIcon(type: ResourceType) {
  switch (type) {
    case 'Article':
      return BookOpen;
    case 'Video':
      return Play;
    case 'Audio':
      return Headphones;
    case 'Music':
      return Music;
  }
}

export function MoodDashboard() {
  const { accessToken, refreshToken, persistAccessToken, me, logout } = useAuth();
  const [moods, setMoods] = useState<MoodEntry[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [counsellors, setCounsellors] = useState<Counsellor[]>([]);
  const [loadError, setLoadError] = useState('');
  const [appointmentsError, setAppointmentsError] = useState('');
  const [moodsLoading, setMoodsLoading] = useState(true);
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);

  const todayLine = useMemo(
    () =>
      new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    []
  );

  const dashboardFeaturedResources = useMemo(
    () => getDashboardFeaturedResources(3),
    []
  );

  const fetchMoods = useCallback(async () => {
    if (!accessToken) return;
    setMoodsLoading(true);
    setLoadError('');
    try {
      const data = await getMoods(accessToken, {
        refreshToken,
        onAccessToken: persistAccessToken,
      });
      setMoods(data);
    } catch {
      setLoadError('Failed to load mood history');
    } finally {
      setMoodsLoading(false);
    }
  }, [accessToken, refreshToken, persistAccessToken]);

  const fetchAppointments = useCallback(async () => {
    if (!accessToken || !me) return;
    setAppointmentsLoading(true);
    setAppointmentsError('');
    try {
      if (me.role === 'patient') {
        const [apps, cs] = await Promise.all([
          getMyAppointments(accessToken, { refreshToken, onAccessToken: persistAccessToken }),
          getCounsellors(accessToken, { refreshToken, onAccessToken: persistAccessToken }),
        ]);
        setAppointments(apps);
        setCounsellors(cs);
      } else if (me.role === 'counsellor' || me.role === 'admin') {
        const apps = await getCounsellorAppointments(accessToken, {
          refreshToken,
          onAccessToken: persistAccessToken,
        });
        setAppointments(apps);
        setCounsellors([]);
      } else {
        setAppointments([]);
        setCounsellors([]);
      }
    } catch (err) {
      setAppointmentsError(err instanceof Error ? err.message : 'Failed to load appointments');
      setAppointments([]);
      setCounsellors([]);
    } finally {
      setAppointmentsLoading(false);
    }
  }, [accessToken, me, refreshToken, persistAccessToken]);

  useEffect(() => {
    fetchMoods();
  }, [fetchMoods]);

  useEffect(() => {
    void fetchAppointments();
  }, [fetchAppointments]);

  const todaysMood = useMemo(() => getTodaysLatestMood(moods), [moods]);
  const streak = useMemo(() => computeStreak(moods), [moods]);

  const counsellorById = useMemo(() => {
    const m = new Map<number, Counsellor>();
    counsellors.forEach((c) => m.set(c.id, c));
    return m;
  }, [counsellors]);

  const upcomingAppointments = useMemo(() => {
    const now = Date.now();
    return [...appointments]
      .map((a) => ({ a, t: parseApiDate(a.scheduled_time)?.getTime() ?? Number.POSITIVE_INFINITY }))
      .filter(({ t }) => t >= now)
      .sort((x, y) => x.t - y.t)
      .map(({ a }) => a);
  }, [appointments]);

  const nextAppointment = upcomingAppointments[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e8f4f7] via-[#f8fafb] to-[#d4e9f0]">
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
            onClick={logout}
            className="text-primary hover:bg-secondary"
          >
            <LogOut className="h-4 w-4 mr-1" />
            Log out
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 pb-12 space-y-4 md:space-y-5">
        <div>
          <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-1">Welcome back</h2>
          <p className="text-xs md:text-sm text-muted-foreground">{todayLine}</p>
        </div>

        {loadError && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            {loadError}
          </p>
        )}

        {moodsLoading && (
          <p className="text-sm text-muted-foreground">Loading mood history…</p>
        )}

        {appointmentsError && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            {appointmentsError}
          </p>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
            <Card className="gap-0 border-l-4 border-l-[#4db8a8] shadow-sm">
              <CardHeader className="px-4 pt-4 pb-2 space-y-0">
                <CardTitle className="text-xs font-medium flex items-center justify-between gap-2">
                  Today&apos;s mood
                  <Heart className="h-3.5 w-3.5 text-[#4db8a8] shrink-0" />
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                {todaysMood ? (
                  <>
                    <div className="text-2xl leading-none" aria-hidden>
                      {MOOD_EMOJI[todaysMood.mood_value]}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 capitalize">
                      {MOOD_LABELS[todaysMood.mood_value]}
                    </p>
                  </>
                ) : (
                  <>
                    <div className="text-xl text-muted-foreground">—</div>
                    <p className="text-xs text-muted-foreground mt-1">No entry yet</p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="gap-0 border-l-4 border-l-[#74c9b9] shadow-sm">
              <CardHeader className="px-4 pt-4 pb-2 space-y-0">
                <CardTitle className="text-xs font-medium flex items-center justify-between gap-2">
                  Upcoming sessions
                  <Calendar className="h-3.5 w-3.5 text-[#74c9b9] shrink-0" />
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                {appointmentsLoading ? (
                  <p className="text-xs text-muted-foreground">Loading…</p>
                ) : (
                  <>
                    <div className="text-xl font-semibold text-foreground">
                      {upcomingAppointments.length}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {upcomingAppointments.length === 0 ? 'None scheduled' : 'Scheduled'}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="gap-0 border-l-4 border-l-primary shadow-sm">
              <CardHeader className="px-4 pt-4 pb-2 space-y-0">
                <CardTitle className="text-xs font-medium flex items-center justify-between gap-2">
                  Mood streak
                  <TrendingUp className="h-3.5 w-3.5 text-primary shrink-0" />
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="text-xl font-semibold text-foreground">
                  {streak} {streak === 1 ? 'day' : 'days'}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {streak > 0 ? 'Keep it up!' : 'Log on Mood Tracker to start'}
                </p>
              </CardContent>
            </Card>

            <Card className="gap-0 border-l-4 border-l-[#5ea8b9] shadow-sm">
              <CardHeader className="px-4 pt-4 pb-2 space-y-0">
                <CardTitle className="text-xs font-medium flex items-center justify-between gap-2">
                  AI support
                  <MessageCircle className="h-3.5 w-3.5 text-[#5ea8b9] shrink-0" />
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="text-xl font-semibold text-foreground">24/7</div>
                <p className="text-xs text-muted-foreground mt-0.5">Always available</p>
              </CardContent>
            </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5">
          <div className="lg:col-span-2 space-y-4 md:space-y-5">
            <Card className="gap-0 shadow-sm">
              <CardHeader className="px-4 pt-4 pb-2 md:px-6 md:pt-6">
                <CardTitle className="text-sm md:text-base">Upcoming session</CardTitle>
                <CardDescription className="text-xs">Your next appointment</CardDescription>
              </CardHeader>
              <CardContent className="px-4 pb-4 md:px-6 md:pb-6">
                {appointmentsLoading ? (
                  <p className="text-sm text-muted-foreground py-6 text-center border border-dashed border-border rounded-lg bg-muted/30">
                    Loading upcoming sessions…
                  </p>
                ) : nextAppointment ? (
                  <div className="border border-border rounded-lg bg-muted/30 p-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {me?.role === 'patient'
                          ? counsellorById.get(nextAppointment.counsellor)?.username ??
                            `Counsellor #${nextAppointment.counsellor}`
                          : nextAppointment.patient}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatUtcDateTime(nextAppointment.scheduled_time)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="capitalize">
                        {nextAppointment.status}
                      </Badge>
                      {me?.role === 'patient' ? (
                        <Button variant="outline" size="sm" asChild>
                          <Link to="/appointments/my">View all</Link>
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" asChild>
                          <Link to="/appointments/counsellor">View all</Link>
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground py-6 text-center border border-dashed border-border rounded-lg bg-muted/30">
                    You have no upcoming sessions.
                  </p>
                )}
              </CardContent>
            </Card>

            <div>
              <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
                <h3 className="text-sm md:text-base font-medium">Wellness resources</h3>
                <Link
                  to="/resources"
                  className="text-xs font-medium text-primary hover:underline"
                >
                  View all resources
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {dashboardFeaturedResources.map((item) => {
                  const Icon = getResourceIcon(item.type);
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
          </div>

          <div className="space-y-4">
            <Card className="gap-0 shadow-sm">
              <CardHeader className="px-4 pt-4 pb-2">
                <CardTitle className="text-base">Quick actions</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-2">
                {me?.role === 'patient' && (
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

            <Card className="gap-0 shadow-sm">
              <CardHeader className="px-4 pt-4 pb-2">
                <CardTitle className="text-base">Community support</CardTitle>
                <CardDescription className="text-xs">Discussion rooms (coming soon)</CardDescription>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-2">
                {[
                  { name: 'Stress management', count: '—' },
                  { name: 'Better sleep', count: '—' },
                  { name: 'College life', count: '—' },
                ].map((room) => (
                  <div
                    key={room.name}
                    className="flex items-center justify-between p-2 rounded-lg bg-muted/50 border border-border/50"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Users className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="text-xs truncate">{room.name}</span>
                    </div>
                    <Badge variant="secondary" className="text-[10px] py-0">
                      {room.count}
                    </Badge>
                  </div>
                ))}
                <Button type="button" variant="ghost" className="w-full h-8 text-xs text-primary" disabled>
                  Explore all rooms
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="text-center text-xs text-muted-foreground pt-2">
          <p>
            In crisis? Call the National Suicide Prevention Lifeline:{' '}
            <a href="tel:988" className="text-primary hover:underline">
              988
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
