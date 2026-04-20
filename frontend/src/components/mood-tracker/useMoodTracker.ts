import { useEffect, useMemo, useState, type FormEvent } from 'react';

import { useAuth } from '../../contexts/AuthContext';
import { createMood, getMoods, type MoodEntry } from '../../lib/api';
import { createApiAuth } from '../../lib/auth';

type MoodChartPoint = {
  date: string;
  mood: number;
};

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

export function useMoodTracker() {
  const { accessToken, refreshToken, persistAccessToken } = useAuth();
  const auth = useMemo(
    () => createApiAuth(refreshToken, persistAccessToken),
    [refreshToken, persistAccessToken]
  );

  const [moods, setMoods] = useState<MoodEntry[]>([]);
  const [moodValue, setMoodValue] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadError, setLoadError] = useState('');
  const [moodsLoading, setMoodsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadMoodHistory() {
      if (!accessToken) {
        setMoodsLoading(false);
        return;
      }
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
  }, [accessToken, auth]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!accessToken || moodValue === null) return;
    setIsLoading(true);
    setError('');
    try {
      const newMood = await createMood(accessToken, moodValue, note.trim(), auth);
      setMoods((prev) => [newMood, ...prev]);
      setMoodValue(null);
      setNote('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save mood');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    moods,
    chartData: toChartData(moods),
    moodValue,
    note,
    isLoading,
    error,
    loadError,
    moodsLoading,
    setMoodValue,
    setNote,
    handleSubmit,
  };
}
