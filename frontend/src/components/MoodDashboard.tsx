import { useState, useEffect, useCallback } from 'react';
import { Heart, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
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

export function MoodDashboard() {
  const { accessToken, logout } = useAuth();
  const [moods, setMoods] = useState<MoodEntry[]>([]);
  const [moodValue, setMoodValue] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchMoods = useCallback(async () => {
    if (!accessToken) return;
    try {
      const data = await getMoods(accessToken);
      setMoods(data);
    } catch {
      setError('Failed to load mood history');
    }
  }, [accessToken]);

  useEffect(() => {
    fetchMoods();
  }, [fetchMoods]);

  const handleSubmit = async (e: React.FormEvent) => {
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

  const chartData = [...moods]
    .reverse()
    .slice(-14)
    .map((m) => ({
      date: new Date(m.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      mood: m.mood_value,
      full: m.created_at,
    }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e8f4f7] via-[#f8fafb] to-[#d4e9f0]">
      <header className="border-b border-border/50 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#4db8a8] to-[#2d7a8f] flex items-center justify-center text-white">
              <Heart className="h-5 w-5" fill="currentColor" />
            </div>
            <h1 className="text-lg font-semibold text-[#2d7a8f]">MindBridge</h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="text-[#2d7a8f] hover:bg-[#e8f4f7]"
          >
            <LogOut className="h-4 w-4 mr-1" />
            Log out
          </Button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <section className="bg-white rounded-xl shadow-lg p-5 md:p-6">
          <h2 className="text-base font-semibold text-[#2d7a8f] mb-4">
            How are you feeling?
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="text-sm text-muted-foreground mb-2 block">
                Select your mood (1–5)
              </Label>
              <div className="flex gap-2 flex-wrap">
                {([1, 2, 3, 4, 5] as const).map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setMoodValue(value)}
                    className={`flex-1 min-w-[4rem] py-2.5 rounded-lg text-sm font-medium transition-all ${
                      moodValue === value
                        ? 'bg-[#2d7a8f] text-white shadow-md'
                        : 'bg-[#f8fafb] text-muted-foreground hover:bg-[#e8f4f7] hover:text-[#2d7a8f]'
                    }`}
                  >
                    {value}
                    <span className="block text-xs opacity-80 mt-0.5">
                      {MOOD_LABELS[value]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="note" className="text-sm">
                Note (optional)
              </Label>
              <Input
                id="note"
                type="text"
                placeholder="What's on your mind?"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="bg-[#f8fafb] border-border"
              />
            </div>

            {error && (
              <p className="text-sm text-red-500 bg-red-50 p-2 rounded">{error}</p>
            )}

            <Button
              type="submit"
              disabled={isLoading || moodValue === null}
              className="w-full bg-[#2d7a8f] hover:bg-[#236272]"
            >
              {isLoading ? 'Saving...' : 'Log mood'}
            </Button>
          </form>
        </section>

        {chartData.length > 0 && (
          <section className="bg-white rounded-xl shadow-lg p-5 md:p-6">
            <h2 className="text-base font-semibold text-[#2d7a8f] mb-4">
              Mood over time
            </h2>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e8f4f7" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: '#5f7984' }}
                    stroke="#5f7984"
                  />
                  <YAxis
                    domain={[1, 5]}
                    ticks={[1, 2, 3, 4, 5]}
                    tick={{ fontSize: 11, fill: '#5f7984' }}
                    stroke="#5f7984"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e8f4f7',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number | undefined) =>
                      value != null ? [MOOD_LABELS[value], 'Mood'] : null
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="mood"
                    stroke="#2d7a8f"
                    strokeWidth={2}
                    dot={{ fill: '#2d7a8f', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>
        )}

        <section className="bg-white rounded-xl shadow-lg p-5 md:p-6">
          <h2 className="text-base font-semibold text-[#2d7a8f] mb-4">
            Recent entries
          </h2>
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
                    className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium bg-[#e8f4f7] text-[#2d7a8f]"
                    title={MOOD_LABELS[m.mood_value]}
                  >
                    {m.mood_value}
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
        </section>

        <div className="text-center text-xs text-muted-foreground pb-6">
          <p>
            In crisis? Call the National Suicide Prevention Lifeline:{' '}
            <a href="tel:988" className="text-[#2d7a8f] hover:underline">
              988
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
