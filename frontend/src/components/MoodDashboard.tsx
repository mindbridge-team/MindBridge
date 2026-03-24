import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  type FormEvent,
} from 'react';
import {
  Heart,
  LogOut,
  Calendar,
  TrendingUp,
  MessageCircle,
  BookOpen,
  Users,
  Wind,
  Brain,
} from 'lucide-react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import { useAuth } from '../contexts/AuthContext';
import { getMoods, createMood, type MoodEntry } from '../lib/api';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const MOOD_LABELS: Record<number, string> = {
  1: 'Very low',
  2: 'Low',
  3: 'Okay',
  4: 'Good',
  5: 'Great',
};

const MOOD_EMOJI: Record<number, string> = {
  1: '😭',
  2: '😟',
  3: '😐',
  4: '😊',
  5: '😄',
};

const MOOD_STRIP: { value: number; short: string }[] = [
  { value: 1, short: 'Very Bad' },
  { value: 2, short: 'Bad' },
  { value: 3, short: 'Okay' },
  { value: 4, short: 'Good' },
  { value: 5, short: 'Great' },
];

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

export function MoodDashboard() {
  const { accessToken, logout } = useAuth();
  const moodSectionRef = useRef<HTMLDivElement>(null);
  const [moods, setMoods] = useState<MoodEntry[]>([]);
  const [moodValue, setMoodValue] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadError, setLoadError] = useState('');
  const [moodsLoading, setMoodsLoading] = useState(true);

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

  const fetchMoods = useCallback(async () => {
    if (!accessToken) return;
    setMoodsLoading(true);
    setLoadError('');
    try {
      const data = await getMoods(accessToken);
      setMoods(data);
    } catch {
      setLoadError('Failed to load mood history');
    } finally {
      setMoodsLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    fetchMoods();
  }, [fetchMoods]);

  const todaysMood = useMemo(() => getTodaysLatestMood(moods), [moods]);
  const streak = useMemo(() => computeStreak(moods), [moods]);

  const chartData = useMemo(
    () =>
      [...moods]
        .reverse()
        .slice(-14)
        .map((m) => ({
          date: new Date(m.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          }),
          mood: m.mood_value,
          full: m.created_at,
        })),
    [moods]
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!accessToken || moodValue === null) return;
    setIsLoading(true);
    setError('');
    try {
      const newMood = await createMood(accessToken, moodValue, note.trim());
      setMoods((prev) => [newMood, ...prev]);
      setMoodValue(null);
      setNote('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save mood');
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToMood = () => {
    moodSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          <div
            ref={moodSectionRef}
            className="bg-card text-card-foreground rounded-xl border shadow-sm p-3 md:p-4"
          >
            <h3 className="text-sm font-medium text-foreground mb-3">How are you feeling today?</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="flex justify-between gap-1.5">
                {MOOD_STRIP.map(({ value, short }) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={moodValue === value}
                    onClick={() => setMoodValue(value)}
                    className={`flex flex-col items-center gap-1 p-1.5 rounded-lg transition-colors flex-1 min-w-0 ${
                      moodValue === value
                        ? 'bg-primary text-primary-foreground ring-2 ring-primary/30'
                        : 'hover:bg-muted text-muted-foreground'
                    }`}
                  >
                    <span className="text-xl md:text-2xl leading-none" aria-hidden>
                      {MOOD_EMOJI[value]}
                    </span>
                    <span className="text-[10px] md:text-xs leading-tight text-center">{short}</span>
                  </button>
                ))}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="mood-note" className="text-xs text-muted-foreground">
                  Add a note (optional)
                </Label>
                <textarea
                  id="mood-note"
                  placeholder="What's on your mind?"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  className="w-full min-h-[50px] rounded-lg border border-border bg-input-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-2 py-1.5">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                disabled={isLoading || moodValue === null}
                className="w-full h-9 text-xs md:text-sm"
              >
                {isLoading ? 'Saving…' : 'Log mood'}
              </Button>
            </form>
          </div>

          <div className="grid grid-cols-2 gap-2 md:gap-3">
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
                <div className="text-xl font-semibold text-foreground">0</div>
                <p className="text-xs text-muted-foreground mt-0.5">None scheduled</p>
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
                  {streak > 0 ? 'Keep it up!' : 'Log to start a streak'}
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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5">
          <div className="lg:col-span-2 space-y-4 md:space-y-5">
            <Card className="gap-0 shadow-sm">
              <CardHeader className="px-4 pt-4 pb-2 md:px-6 md:pt-6">
                <CardTitle className="text-sm md:text-base">Upcoming session</CardTitle>
                <CardDescription className="text-xs">Your next appointment</CardDescription>
              </CardHeader>
              <CardContent className="px-4 pb-4 md:px-6 md:pb-6">
                <p className="text-sm text-muted-foreground py-6 text-center border border-dashed border-border rounded-lg bg-muted/30">
                  You have no upcoming sessions. Booking will be available here soon.
                </p>
              </CardContent>
            </Card>

            {chartData.length > 0 && (
              <Card className="gap-0 shadow-sm">
                <CardHeader className="px-4 pt-4 pb-2 md:px-6 md:pt-6">
                  <CardTitle className="text-sm md:text-base text-primary">Mood over time</CardTitle>
                  <CardDescription className="text-xs">Last 14 entries</CardDescription>
                </CardHeader>
                <CardContent className="px-4 pb-4 md:px-6 md:pb-6">
                  <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 11 }}
                          className="text-muted-foreground"
                        />
                        <YAxis
                          domain={[1, 5]}
                          ticks={[1, 2, 3, 4, 5]}
                          tick={{ fontSize: 11 }}
                          className="text-muted-foreground"
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'var(--card)',
                            border: '1px solid var(--border)',
                            borderRadius: '8px',
                          }}
                          formatter={(value: number | undefined) =>
                            value != null ? [MOOD_LABELS[value], 'Mood'] : null
                          }
                        />
                        <Line
                          type="monotone"
                          dataKey="mood"
                          stroke="var(--primary)"
                          strokeWidth={2}
                          dot={{ fill: 'var(--primary)', r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}

            <div>
              <h3 className="text-sm md:text-base font-medium mb-3">Wellness resources</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {[
                  {
                    title: 'Managing anxiety',
                    blurb: 'Learn evidence-based techniques to reduce daily anxiety.',
                    meta: '5 min read',
                    icon: BookOpen,
                    img: 'https://images.unsplash.com/photo-1758876201548-ade1eff8b169?w=1080&q=80&fm=jpg',
                  },
                  {
                    title: 'Breathing exercise',
                    blurb: '4-7-8 breathing technique for instant calm.',
                    meta: '3 min practice',
                    icon: Wind,
                    img: 'https://images.unsplash.com/photo-1758599879787-03999f72d994?w=1080&q=80&fm=jpg',
                  },
                  {
                    title: 'Guided meditation',
                    blurb: 'Mindfulness practice for stress relief and focus.',
                    meta: '10 min audio',
                    icon: Brain,
                    img: 'https://images.unsplash.com/photo-1557929878-b358f3bdbdd7?w=1080&q=80&fm=jpg',
                  },
                ].map((item) => (
                  <Card
                    key={item.title}
                    className="gap-0 overflow-hidden cursor-default opacity-95 shadow-sm"
                  >
                    <div className="relative h-32 md:h-36 overflow-hidden bg-muted">
                      <img
                        src={item.img}
                        alt=""
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute top-2 right-2 w-8 h-8 rounded-lg bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm">
                        <item.icon className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                    <CardHeader className="px-3 pt-3 pb-0">
                      <CardTitle className="text-sm">{item.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="px-3 pb-3">
                      <p className="text-xs text-muted-foreground">{item.blurb}</p>
                      <p className="text-xs text-primary mt-1.5">{item.meta}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <Card className="gap-0 shadow-sm">
              <CardHeader className="px-4 pt-4 pb-2 md:px-6 md:pt-6">
                <CardTitle className="text-sm md:text-base text-primary">Recent entries</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 md:px-6 md:pb-6">
                {moods.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No mood entries yet. Log your first mood above!
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {moods.map((m) => (
                      <li
                        key={m.id}
                        className="flex items-start gap-3 py-2 border-b border-border/50 last:border-0"
                      >
                        <span
                          className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-lg bg-secondary text-primary"
                          title={MOOD_LABELS[m.mood_value]}
                          aria-hidden
                        >
                          {MOOD_EMOJI[m.mood_value]}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-foreground">
                            {MOOD_LABELS[m.mood_value]}
                            {m.note && (
                              <span className="text-muted-foreground">
                                {' — '}
                                {m.note}
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {new Date(m.created_at).toLocaleString()}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="gap-0 shadow-sm">
              <CardHeader className="px-4 pt-4 pb-2">
                <CardTitle className="text-base">Quick actions</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-2">
                <Button type="button" className="w-full h-9 text-sm" onClick={scrollToMood}>
                  <Heart className="h-3.5 w-3.5" />
                  Log today&apos;s mood
                </Button>
                <Button type="button" variant="outline" className="w-full h-9 text-sm" disabled>
                  <Calendar className="h-3.5 w-3.5" />
                  Book a session
                </Button>
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
