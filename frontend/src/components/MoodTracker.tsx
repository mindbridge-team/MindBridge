import { useState, useEffect, type FormEvent } from 'react';
import { Heart } from 'lucide-react';

import { Button } from './ui/button';
import { Label } from './ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from './ui/card';
import { ErrorMessage, LoadingMessage } from './ui/feedback';
import { useAuth } from '../contexts/AuthContext';
import { createMood, getMoods, type MoodEntry } from '../lib/api';
import { createApiAuth } from '../lib/auth';
import { MOOD_EMOJI, MOOD_LABELS, MOOD_STRIP } from '../data/moodConstants';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// Demo mood page:
// log a mood, review recent entries, and see mood trends.
type MoodChartPoint = {
  date: string;
  mood: number;
};

function formatMoodTimestamp(isoDate: string): string {
  return new Date(isoDate).toLocaleString();
}

function toChartData(moods: MoodEntry[]): MoodChartPoint[] {
  return moods
    .slice(0, 14)
    .reverse()
    .map((moodEntry) => ({
      date: new Date(moodEntry.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      mood: moodEntry.mood_value,
    }));
}

type MoodLogFormProps = {
  moodValue: number | null;
  note: string;
  isLoading: boolean;
  error: string;
  onMoodChange: (value: number) => void;
  onNoteChange: (value: string) => void;
  onSubmit: (e: FormEvent) => Promise<void>;
};

function MoodLogForm({
  moodValue,
  note,
  isLoading,
  error,
  onMoodChange,
  onNoteChange,
  onSubmit,
}: MoodLogFormProps) {
  return (
    <div className="bg-card text-card-foreground rounded-xl border shadow-sm p-3 md:p-4">
      <h3 className="text-sm font-medium text-foreground mb-3">How are you feeling today?</h3>
      <form onSubmit={onSubmit} className="space-y-3">
        <div className="flex justify-between gap-1.5">
          {MOOD_STRIP.map(({ value, short }) => (
            <button
              key={value}
              type="button"
              aria-pressed={moodValue === value}
              onClick={() => onMoodChange(value)}
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
          <Label htmlFor="mood-note-tracker" className="text-xs text-muted-foreground">
            Add a note (optional)
          </Label>
          <textarea
            id="mood-note-tracker"
            placeholder="What's on your mind?"
            value={note}
            onChange={(e) => onNoteChange(e.target.value)}
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
  );
}

function MoodEntriesCard({ moods }: { moods: MoodEntry[] }) {
  return (
    <Card className="gap-0 shadow-sm">
      <CardHeader className="px-4 pt-4 pb-2 md:px-6 md:pt-6">
        <CardTitle className="text-sm md:text-base text-primary">Recent entries</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 md:px-6 md:pb-6">
        {moods.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No mood entries yet. Log your first mood on the left.
          </p>
        ) : (
          <ul className="space-y-3 max-h-[min(60vh,28rem)] overflow-y-auto pr-1">
            {moods.map((moodEntry) => (
              <li
                key={moodEntry.id}
                className="flex items-start gap-3 py-2 border-b border-border/50 last:border-0"
              >
                <span
                  className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-lg bg-secondary text-primary"
                  title={MOOD_LABELS[moodEntry.mood_value]}
                  aria-hidden
                >
                  {MOOD_EMOJI[moodEntry.mood_value]}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-foreground">
                    {MOOD_LABELS[moodEntry.mood_value]}
                    {moodEntry.note && (
                      <span className="text-muted-foreground">
                        {' — '}
                        {moodEntry.note}
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatMoodTimestamp(moodEntry.created_at)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function MoodChartCard({ chartData }: { chartData: MoodChartPoint[] }) {
  if (chartData.length === 0) return null;

  return (
    <Card className="gap-0 shadow-sm">
      <CardHeader className="px-4 pt-4 pb-2 md:px-6 md:pt-6">
        <CardTitle className="text-sm md:text-base text-primary">Mood over time</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 md:px-6 md:pb-6">
        <div className="h-56 w-full">
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
  );
}

export function MoodTracker() {
  const { accessToken, refreshToken, persistAccessToken } = useAuth();
  const [moods, setMoods] = useState<MoodEntry[]>([]);
  const [moodValue, setMoodValue] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadError, setLoadError] = useState('');
  const [moodsLoading, setMoodsLoading] = useState(true);
  const auth = createApiAuth(refreshToken, persistAccessToken);

  useEffect(() => {
    let cancelled = false;

    async function loadMoodHistory() {
      if (!accessToken) return;
      setMoodsLoading(true);
      setLoadError('');
      try {
        const moodHistory = await getMoods(accessToken, auth);
        if (!cancelled) setMoods(moodHistory);
      } catch {
        if (!cancelled) setLoadError('Failed to load mood history');
      } finally {
        if (!cancelled) setMoodsLoading(false);
      }
    }

    void loadMoodHistory();
    return () => {
      cancelled = true;
    };
  }, [accessToken, refreshToken]);

  const chartData = toChartData(moods);

  const resetMoodForm = () => {
    setMoodValue(null);
    setNote('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!accessToken || moodValue === null) return;
    setIsLoading(true);
    setError('');
    try {
      const newMood = await createMood(accessToken, moodValue, note.trim(), auth);
      setMoods((prev) => [newMood, ...prev]);
      resetMoodForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save mood');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 md:space-y-5">
      <div>
        <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-1 flex items-center gap-2">
          <Heart className="h-6 w-6 text-[#4db8a8]" fill="currentColor" />
          Mood Tracker
        </h2>
        <p className="text-xs md:text-sm text-muted-foreground">
          Log how you&apos;re feeling and review your recent entries.
        </p>
      </div>

      {loadError && <ErrorMessage>{loadError}</ErrorMessage>}

      {moodsLoading && <LoadingMessage>Loading mood history…</LoadingMessage>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5">
        <MoodLogForm
          moodValue={moodValue}
          note={note}
          isLoading={isLoading}
          error={error}
          onMoodChange={setMoodValue}
          onNoteChange={setNote}
          onSubmit={handleSubmit}
        />
        <MoodEntriesCard moods={moods} />
      </div>

      <MoodChartCard chartData={chartData} />
    </div>
  );
}
