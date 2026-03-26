import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Users } from 'lucide-react';

import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useAuth } from '../contexts/AuthContext';
import {
  createAppointment,
  getCounsellors,
  type Counsellor,
} from '../lib/api';

function toLocalInputValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function BookSession() {
  const navigate = useNavigate();
  const { accessToken, refreshToken, persistAccessToken } = useAuth();

  const [counsellors, setCounsellors] = useState<Counsellor[]>([]);
  const [loadingCounsellors, setLoadingCounsellors] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [counsellorId, setCounsellorId] = useState<number | null>(null);
  const [scheduledLocal, setScheduledLocal] = useState(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + 60);
    return toLocalInputValue(d);
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!accessToken) return;
      setLoadingCounsellors(true);
      setLoadError('');
      try {
        const data = await getCounsellors(accessToken, {
          refreshToken,
          onAccessToken: persistAccessToken,
        });
        if (cancelled) return;
        setCounsellors(data);
        setCounsellorId((prev) => prev ?? (data[0]?.id ?? null));
      } catch (err) {
        if (cancelled) return;
        setLoadError(err instanceof Error ? err.message : 'Failed to load counsellors');
      } finally {
        if (!cancelled) setLoadingCounsellors(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [accessToken, refreshToken, persistAccessToken]);

  const counsellorById = useMemo(() => {
    const m = new Map<number, Counsellor>();
    counsellors.forEach((c) => m.set(c.id, c));
    return m;
  }, [counsellors]);

  const selectedCounsellor = counsellorId ? counsellorById.get(counsellorId) : undefined;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;
    if (!counsellorId) {
      setSubmitError('Please select a counsellor.');
      return;
    }
    if (!scheduledLocal) {
      setSubmitError('Please choose a date and time.');
      return;
    }

    setSubmitting(true);
    setSubmitError('');
    try {
      const scheduledIso = new Date(scheduledLocal).toISOString();
      await createAppointment(
        accessToken,
        { counsellor: counsellorId, scheduled_time: scheduledIso },
        { refreshToken, onAccessToken: persistAccessToken }
      );
      navigate('/appointments/my');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to book session');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl mb-1 text-foreground">Book a Session</h2>
        <p className="text-sm text-muted-foreground">
          Choose a counsellor and a time that works for you.
        </p>
      </div>

      {loadError && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">
          {loadError}
        </p>
      )}

      <Card className="gap-0 shadow-sm">
        <CardHeader className="px-4 pt-4 pb-2 md:px-6 md:pt-6">
          <CardTitle className="text-sm md:text-base flex items-center gap-2">
            <Calendar className="h-4 w-4 text-[#2d7a8f]" />
            Session details
          </CardTitle>
          <CardDescription className="text-xs">
            Sessions are created as <span className="font-medium">pending</span> until accepted.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 pb-4 md:px-6 md:pb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="counsellor" className="text-xs text-muted-foreground">
                Counsellor
              </Label>
              <div className="relative">
                <Users className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <select
                  id="counsellor"
                  value={counsellorId ?? ''}
                  onChange={(e) => setCounsellorId(e.target.value ? Number(e.target.value) : null)}
                  disabled={loadingCounsellors || counsellors.length === 0}
                  className="w-full h-9 rounded-md border border-input bg-input-background pl-9 pr-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                >
                  {counsellors.length === 0 ? (
                    <option value="">
                      {loadingCounsellors ? 'Loading counsellors…' : 'No counsellors available'}
                    </option>
                  ) : (
                    counsellors.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.username} — {c.specialization} ({c.experience_years} yrs)
                      </option>
                    ))
                  )}
                </select>
              </div>
              {selectedCounsellor?.availability_text && (
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="font-medium text-foreground">Availability:</span>{' '}
                  {selectedCounsellor.availability_text}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="scheduled" className="text-xs text-muted-foreground">
                Date &amp; time
              </Label>
              <Input
                id="scheduled"
                type="datetime-local"
                value={scheduledLocal}
                onChange={(e) => setScheduledLocal(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Note: times are sent in ISO format and may display differently depending on server timezone.
              </p>
            </div>

            {submitError && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {submitError}
              </p>
            )}

            <div className="flex flex-wrap gap-2">
              <Button
                type="submit"
                disabled={submitting || loadingCounsellors || counsellors.length === 0}
                className="bg-[#2d7a8f] hover:bg-[#236272]"
              >
                {submitting ? 'Booking…' : 'Confirm booking'}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link to="/appointments/my">View my appointments</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

